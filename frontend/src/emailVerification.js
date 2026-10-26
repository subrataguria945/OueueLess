// ==========================================================================
// QUEUELESS — GMAIL OTP VERIFICATION SERVICE (SUPABASE AUTH)
// Sends a real 6-digit verification code directly to user's Gmail inbox.
// The OTP code is NEVER exposed on the screen or frontend for security.
// ==========================================================================

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://bgohgnumfdhqzbuqbutu.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2hnbnVtZmRocXpidXFidXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNDk5NjMsImV4cCI6MjEwNjYyNTk2M30.0yqmat1UDyNoWfWUUfGSwHaQDJ_jyyNu95vle6sLat0";

/**
 * Sends a 6-digit OTP directly to user's Gmail inbox via Supabase Auth.
 * The OTP is sent strictly to the email and NOT displayed in the UI.
 * @param {string} email
 * @returns {Promise<{ ok: boolean }>}
 */
export async function sendEmailOtp(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        create_user: true,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (
      res.status === 429 ||
      data.error_code === "over_email_send_rate_limit" ||
      data.msg?.includes("rate limit")
    ) {
      throw new Error(
        "Too many verification requests. Please check your Gmail inbox (or spam folder) for the code already sent, or wait a few minutes before requesting another."
      );
    }

    if (!res.ok) {
      throw new Error(
        data.msg ||
        data.message ||
        data.error_description ||
        "Failed to send verification email. Please check your email address."
      );
    }

    return { ok: true };
  } catch (err) {
    console.error("sendEmailOtp error:", err);
    throw err;
  }
}

/**
 * Validates the 6-digit OTP code entered by the user against Supabase Auth.
 * @param {string} email
 * @param {string} otpToken - 6-digit code
 * @returns {Promise<{ ok: boolean }>}
 */
export async function verifyEmailOtp(email, otpToken) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanToken = (otpToken || "").trim();

  if (!cleanToken || cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    throw new Error("Please enter the complete 6-digit verification code.");
  }

  try {
    // Try verification with 'email' type
    let res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        token: cleanToken,
        type: "email",
      }),
    });

    let data = await res.json().catch(() => ({}));

    // If 'email' type fails, try 'signup' type
    if (!res.ok) {
      res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          token: cleanToken,
          type: "signup",
        }),
      });
      data = await res.json().catch(() => ({}));
    }

    // If 'signup' fails, try 'magiclink' type
    if (!res.ok) {
      res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          token: cleanToken,
          type: "magiclink",
        }),
      });
      data = await res.json().catch(() => ({}));
    }

    if (!res.ok) {
      const msg = data.msg || data.message || data.error_description || "";
      if (
        msg.includes("expired") ||
        msg.includes("invalid") ||
        data.error_code === "otp_expired"
      ) {
        throw new Error(
          "Invalid or expired verification code. Please check your Gmail or click Resend."
        );
      }
      throw new Error(msg || "Verification failed. Please check the code and try again.");
    }

    return { ok: true };
  } catch (err) {
    console.error("verifyEmailOtp error:", err);
    throw err;
  }
}
