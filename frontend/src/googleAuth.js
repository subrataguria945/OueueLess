// ==========================================================================
// QUEUELESS — OFFICIAL GOOGLE AUTHENTICATION & SUPABASE DATABASE SYNC
// Opens Google's official OAuth Account Picker popup, fetches real Gmail & Name,
// prompts new users for their real mobile number, and saves to PostgreSQL.
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
 * Synchronizes REAL Google user profile with the backend Supabase PostgreSQL database
 * @param {Object} googleUser - { name, email, picture, sub }
 * @param {string} [phone] - Optional real phone number for new registration
 * @returns {Promise<{ ok?: boolean, needsPhone?: boolean, user?: Object, token?: string, isNew?: boolean }>}
 */
export async function syncGoogleUserWithDatabase(googleUser, phone = "") {
  const email = (googleUser.email || "").trim().toLowerCase();
  const fullname = (googleUser.name || "Google User").trim();

  try {
    // 1. First, check if user is ALREADY registered in the database
    const loginRes = await fetch(`${BACKEND_BASE_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: GOOGLE_AUTH_PASSWORD,
      }),
    });
    const loginData = await loginRes.json().catch(() => ({}));

    // If user already exists in database, log in directly without prompting for phone!
    if (loginRes.ok && (loginData.status === "success" || loginData.access_token)) {
      const token = loginData.access_token || loginData.token;
      const user = {
        ...googleUser,
        user_id: loginData.user_id,
        email,
        fullname,
      };
      return { ok: true, user, token, isNew: false };
    }

    // 2. If user is NOT registered yet, they need a phone number for registration
    const cleanPhone = (phone || googleUser.phone || "").trim();
    if (!cleanPhone) {
      return { needsPhone: true, googleUser };
    }

    // 3. Register the new user with their REAL Google Email, Name, and REAL Phone number
    const regRes = await fetch(`${BACKEND_BASE_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname,
        email,
        phone: cleanPhone,
        password: GOOGLE_AUTH_PASSWORD,
        confirm_password: GOOGLE_AUTH_PASSWORD,
        user_role: 1,
      }),
    });
    const regData = await regRes.json().catch(() => ({}));

    if (regRes.ok && (regData.status === "success" || regData.access_token)) {
      const token = regData.access_token || regData.token;
      const user = {
        ...googleUser,
        user_id: regData.user_id,
        email,
        fullname,
        phone: cleanPhone,
      };
      return { ok: true, user, token, isNew: true };
    }

    // If registration returned error (e.g. duplicate or validation), try logging in
    if (regData.access_token) {
      return {
        ok: true,
        user: { ...googleUser, user_id: regData.user_id, email, fullname, phone: cleanPhone },
        token: regData.access_token,
        isNew: true,
      };
    }

    throw new Error(regData.message || regData.detail || "Registration failed.");
  } catch (err) {
    console.error("Backend database sync error:", err);
    throw new Error(err?.message || "Could not connect to database backend. Please check network connection.");
  }
}

/**
 * Triggers Official Google Sign-In Popup (Account Picker)
 * @param {Object} options
 * @param {Function} options.onSuccess - Callback with (userData, token, isNew)
 * @param {Function} options.onError - Callback with (errorMessage)
 * @param {Function} [options.onPhoneRequired] - Callback when a new user needs to provide mobile number
 */
export async function triggerGoogleSignIn({ onSuccess, onError, onPhoneRequired, onCancel }) {
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
          if (tokenResponse.error === "popup_closed_by_user" || tokenResponse.error === "user_closed_popup") {
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
            // Fetch REAL Google user profile
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userData = await res.json();

            if (!userData || !userData.email) {
              onError?.("Failed to retrieve your Google account details.");
              return;
            }

            const realGoogleUser = {
              name: userData.name || userData.given_name || "Google User",
              email: userData.email,
              picture: userData.picture,
              sub: userData.sub,
              provider: "google",
            };

            // Check database status
            const syncResult = await syncGoogleUserWithDatabase(realGoogleUser);

            // If user is brand new and needs mobile number
            if (syncResult.needsPhone) {
              if (onPhoneRequired) {
                onPhoneRequired({
                  googleUser: realGoogleUser,
                  onComplete: async (enteredPhone) => {
                    const finalResult = await syncGoogleUserWithDatabase(realGoogleUser, enteredPhone);
                    localStorage.setItem("user", JSON.stringify(finalResult.user));
                    localStorage.setItem("token", finalResult.token);
                    onSuccess?.(finalResult.user, finalResult.token, true);
                  },
                  onCancel: () => {
                    // User closed the prompt
                  },
                });
                return;
              }

              // Fallback if no modal handler provided
              const fallbackResult = await syncGoogleUserWithDatabase(realGoogleUser, "9876543210");
              localStorage.setItem("user", JSON.stringify(fallbackResult.user));
              localStorage.setItem("token", fallbackResult.token);
              onSuccess?.(fallbackResult.user, fallbackResult.token, true);
              return;
            }

            // User was already registered, logged in directly!
            localStorage.setItem("user", JSON.stringify(syncResult.user));
            localStorage.setItem("token", syncResult.token);
            onSuccess?.(syncResult.user, syncResult.token, syncResult.isNew);
          } catch (err) {
            onError?.(err.message || "Failed to save Google account to database.");
          }
        }
      },
    });

    client.requestAccessToken({ prompt: "select_account" });
  } catch (err) {
    onError?.(err.message || "Failed to open Google Sign-In window.");
  }
}
