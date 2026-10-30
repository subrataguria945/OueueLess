// ==========================================================================
// QUEUELESS — OFFICIAL GOOGLE AUTHENTICATION & BACKEND DATABASE SYNC
// Opens Google's official OAuth Account Picker popup, fetches real Gmail & Name.
// 1. Checks if the user already exists via /user/login.
// 2. If exists -> logs in directly with email & password.
// 3. If user does NOT exist -> registers automatically via /user/register/google.
// (No mobile number required).
// ==========================================================================

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://queueless-backend-b2qh.onrender.com";

const GOOGLE_AUTH_PASSWORD = "GoogleOAuth@Pass123";

/**
 * Retrieves the configured Google OAuth Client ID
 */
export function getGoogleClientId() {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem("ql_google_client_id") ||
    "593494515643-v614uahv68g7992rtub0mh20mo9tcasp.apps.googleusercontent.com"
  );
}

/**
 * Saves Google Client ID into local storage for seamless future logins
 */
export function saveGoogleClientId(clientId) {
  if (clientId && clientId.trim()) {
    localStorage.setItem("ql_google_client_id", clientId.trim());
  }
}

/**
 * Synchronizes REAL Google user profile with the backend database.
 * First checks if user already exists in the database.
 * If user exists -> logs them in directly with their credentials.
 * If user does not exist -> registers them via /user/register/google without requiring mobile number.
 *
 * @param {Object} googleUser - { name, email, picture, sub }
 * @returns {Promise<{ ok: boolean, user: Object, token: string, isNew: boolean, message: string }>}
 */
export async function syncGoogleUserWithDatabase(googleUser) {
  const email = (googleUser.email || "").trim().toLowerCase();
  const fullname = (googleUser.name || "Google User").trim();
  const googleId = (
    googleUser.google_id ||
    googleUser.sub ||
    googleUser.id ||
    ""
  ).trim();

  // Primary password for Google user: their unique Google ID (sub). Fallback to standard Google OAuth pass
  const primaryPassword = googleId || GOOGLE_AUTH_PASSWORD;

  try {
    // 1. First attempt: Call /user/register/google with google_id
    // If user is brand new -> registers them with google_id and returns access_token!
    // If user already exists -> logs them in and returns access_token!
    const regPayload = {
      fullname,
      email,
      password: primaryPassword,
      confirm_password: primaryPassword,
      user_role: 3,
      google_id: googleId,
    };

    const regRes = await fetch(`${BACKEND_BASE_URL}/user/register/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regPayload),
    });

    const regData = await regRes.json().catch(() => ({}));

    const isRegSuccess =
      regRes.ok &&
      regData.status !== "failed" &&
      regData.status !== "error" &&
      regData.status !== "Login Failed" &&
      (regData.status === "success" || Boolean(regData.access_token || regData.token));

    if (isRegSuccess) {
      const token = regData.access_token || regData.token;
      const user = {
        ...googleUser,
        user_id: regData.user_id,
        user_role: regData.user_role,
        google_id: googleId,
        email,
        fullname,
      };
      const isNew = Boolean(
        regData.message?.toLowerCase().includes("registered") ||
        regData.message?.toLowerCase().includes("created")
      );

      return {
        ok: true,
        user,
        token,
        isNew,
        message: regData.message || (isNew ? "User registered successfully." : "Login successful."),
      };
    }

    // 2. If register with googleId failed, try with GOOGLE_AUTH_PASSWORD (for accounts created earlier)
    if (primaryPassword !== GOOGLE_AUTH_PASSWORD) {
      const fallbackRes = await fetch(`${BACKEND_BASE_URL}/user/register/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          email,
          password: GOOGLE_AUTH_PASSWORD,
          confirm_password: GOOGLE_AUTH_PASSWORD,
          user_role: 3,
          google_id: googleId,
        }),
      });
      const fallbackData = await fallbackRes.json().catch(() => ({}));

      if (
        fallbackRes.ok &&
        fallbackData.status !== "failed" &&
        fallbackData.status !== "error" &&
        fallbackData.status !== "Login Failed" &&
        (fallbackData.status === "success" || Boolean(fallbackData.access_token || fallbackData.token))
      ) {
        const token = fallbackData.access_token || fallbackData.token;
        const user = {
          ...googleUser,
          user_id: fallbackData.user_id,
          user_role: fallbackData.user_role,
          google_id: googleId,
          email,
          fullname,
        };
        return {
          ok: true,
          user,
          token,
          isNew: false,
          message: fallbackData.message || "Login successful.",
        };
      }
    }

    // 3. Fallback check: try standard /user/login with primaryPassword or GOOGLE_AUTH_PASSWORD
    for (const pass of [primaryPassword, GOOGLE_AUTH_PASSWORD]) {
      try {
        const loginRes = await fetch(`${BACKEND_BASE_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });
        const loginData = await loginRes.json().catch(() => ({}));

        if (
          loginRes.ok &&
          loginData.status !== "Login Failed" &&
          loginData.status !== "failed" &&
          (loginData.status === "success" || Boolean(loginData.access_token || loginData.token))
        ) {
          const token = loginData.access_token || loginData.token;
          const user = {
            ...googleUser,
            user_id: loginData.user_id,
            user_role: loginData.user_role,
            google_id: googleId,
            email,
            fullname,
          };
          return {
            ok: true,
            user,
            token,
            isNew: false,
            message: loginData.message || "Login successful.",
          };
        }
      } catch {
        // Continue to error formatting
      }
    }

    // If account already exists with a manual password
    if (regData.message === "ERR_INVALID_CREDENTIALS" || regData.status === "Login Failed") {
      throw new Error(
        "An account with this email already exists with a password. Please log in using your email and password, or use 'Forgot password'."
      );
    }

    // Registration failed or returned validation error
    const errorMsg =
      (Array.isArray(regData.detail)
        ? regData.detail.map((d) => d.msg).join(", ")
        : regData.detail) ||
      regData.message ||
      regData.error ||
      "Google registration failed. Please try again.";

    throw new Error(errorMsg);
  } catch (err) {
    console.error("Backend Google auth error:", err);
    throw new Error(
      err?.message || "Unable to reach the server. Please check your internet connection."
    );
  }
}

/**
 * Triggers Official Google Sign-In Popup (Account Picker)
 * @param {Object} options
 * @param {Function} options.onSuccess - Callback with (userData, token, isNew, message)
 * @param {Function} options.onError - Callback with (errorMessage)
 * @param {Function} [options.onCancel] - Callback when user closes the popup
 */
export async function triggerGoogleSignIn({ onSuccess, onError, onCancel }) {
  const clientId = getGoogleClientId();

  if (!clientId) {
    onError?.("Google Sign-In requires VITE_GOOGLE_CLIENT_ID to be configured.");
    return;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    onError?.("Google Identity Service is loading. Please refresh and try again.");
    return;
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "email profile openid",
      prompt: "select_account",
      error_callback: (err) => {
        if (err?.type === "popup_closed" || err?.type === "popup_closed_by_user") {
          if (onCancel) {
            onCancel();
          } else {
            onError?.(null);
          }
        } else {
          onError?.(err?.message || "Google Sign-In was closed or interrupted.");
        }
      },
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          if (
            tokenResponse.error === "popup_closed_by_user" ||
            tokenResponse.error === "user_closed_popup"
          ) {
            if (onCancel) {
              onCancel();
            } else {
              onError?.(null);
            }
          } else {
            onError?.(
              tokenResponse.error_description ||
              tokenResponse.error ||
              "Google Sign-In was cancelled."
            );
          }
          return;
        }

        if (tokenResponse.access_token) {
          try {
            // Fetch REAL Google user profile (email, name, picture, sub)
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userData = await res.json();

            if (!userData || !userData.email) {
              onError?.("Failed to retrieve your Google account details.");
              return;
            }

            const googleId = (userData.sub || userData.id || "").trim();
            const realGoogleUser = {
              name: userData.name || userData.given_name || "Google User",
              email: userData.email,
              picture: userData.picture,
              sub: userData.sub,
              google_id: googleId,
              id: googleId,
              provider: "google",
            };

            // Check database & sync: logs in if exists, registers via /user/register/google with google_id
            const syncResult = await syncGoogleUserWithDatabase(realGoogleUser);

            if (syncResult.ok) {
              localStorage.setItem("user", JSON.stringify(syncResult.user));
              if (syncResult.token) {
                localStorage.setItem("token", syncResult.token);
              }
              onSuccess?.(syncResult.user, syncResult.token, syncResult.isNew, syncResult.message);
            } else {
              onError?.(syncResult.message || "Failed to authenticate with Google.");
            }
          } catch (err) {
            onError?.(err?.message || "Unable to sync your Google account. Please try again.");
          }
        }
      },
    });

    client.requestAccessToken({ prompt: "select_account" });
  } catch (err) {
    onError?.(err?.message || "Unable to open Google Sign-In popup. Please allow popups for this site.");
  }
}

