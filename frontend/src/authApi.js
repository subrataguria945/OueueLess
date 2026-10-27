// ==========================================================================
// QUEUELESS — OFFICIAL BACKEND AUTHENTICATION API SERVICE
// Connects to FastAPI backend endpoints on Render:
// - POST /user/register/initiate (Sends OTP to Gmail & returns signup_token)
// - POST /user/register/verify   (Verifies OTP & creates user in database)
// ==========================================================================

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://queueless-backend-b2qh.onrender.com";

/**
 * Wakes up Render backend immediately when application opens.
 * Prevents cold-start delays when user registers or performs actions.
 */
export function warmupBackendServer() {
  try {
    fetch(`${BACKEND_BASE_URL}/`, { method: "GET", mode: "cors" })
      .then((res) => res.json())
      .then((data) => {
        console.log("⚡ QueueLess Backend Server Active:", data?.message || "Awake");
      })
      .catch((err) => {
        console.log("⚡ QueueLess Backend warming up in background...", err?.message || "");
      });
  } catch {
    // Silent catch
  }
}

/**
 * Step 1: Initiate signup, send OTP to user's Gmail, and obtain signup_token.
 * Does NOT create user in database yet.
 * @param {Object} payload
 * @param {string} payload.fullname
 * @param {string} payload.email
 * @param {string} payload.phone
 * @param {number} [payload.user_role=2] - 2: Customer/User, 3: Shop Owner
 * @returns {Promise<{ status: string, message: string, signup_token: string }>}
 */
export async function initiateSignup({ fullname, email, phone, user_role = 2 }) {
  const cleanFullname = (fullname || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = (phone || "").trim().replace(/\D/g, "");

  if (!cleanFullname) throw new Error("Please enter your full name.");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Please enter a valid email address.");
  if (!cleanPhone || cleanPhone.length !== 10) throw new Error("Please enter a valid 10-digit phone number.");

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/user/register/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname: cleanFullname,
        email: cleanEmail,
        phone: cleanPhone,
        user_role: Number(user_role) || 2,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status === "failed" || data.status === "error") {
      const errorMsg =
        (Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(", ") : data.detail) ||
        data.message ||
        data.error ||
        "Failed to send verification code. Please check your details.";
      throw new Error(errorMsg);
    }

    const signupToken = data.token || data.signup_token;
    if (!signupToken) {
      throw new Error("No signup verification token returned by the server.");
    }

    return {
      status: data.status || "success",
      message: data.message || "OTP sent to your email. Please verify within 5 minutes.",
      signup_token: signupToken,
    };
  } catch (err) {
    if (err.message && !err.message.includes("Failed to fetch")) {
      throw err;
    }
    throw new Error("Unable to connect to the server. Please check your internet connection.");
  }
}

/**
 * Step 2: Verify OTP and complete account creation in database.
 * Only creates the user after the backend verifies the OTP.
 * @param {Object} payload
 * @param {string} payload.signup_token - Token returned by initiate API
 * @param {string} payload.otp - 6-digit OTP entered by user
 * @param {string} payload.password - User's chosen password
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function verifySignupOtp({ signup_token, otp, password }) {
  const cleanToken = (signup_token || "").trim();
  const cleanOtp = (otp || "").trim().replace(/\D/g, "");

  if (!cleanToken) {
    throw new Error("Verification session expired. Please submit the registration form again.");
  }
  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error("Please enter all 6 digits of the verification code.");
  }
  if (!password) {
    throw new Error("Password is required to complete registration.");
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/user/register/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signup_token: cleanToken,
        otp: cleanOtp,
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status === "failed" || data.status === "error") {
      const errorMsg =
        (Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(", ") : data.detail) ||
        data.message ||
        data.error ||
        "Invalid or expired OTP. Please try again.";
      throw new Error(errorMsg);
    }

    return {
      status: data.status || "success",
      message: data.message || "Account created successfully! Switching to login...",
    };
  } catch (err) {
    if (err.message && !err.message.includes("Failed to fetch")) {
      throw err;
    }
    throw new Error("Unable to connect to the server. Please check your internet connection.");
  }
}
