// ==========================================================================
// QUEUELESS — OFFICIAL GOOGLE AUTHENTICATION & BACKEND DATABASE SYNC
// Opens Google's official OAuth Account Picker popup, fetches real Gmail & Name.
// Sends payload { fullname, email, google_id } to:
// POST https://queueless-backend-b2qh.onrender.com/user/google
// Handles BOTH: registering brand new Google users, and logging in existing users!
// ==========================================================================

export const GOOGLE_AUTH_API_URL =
  import.meta.env.VITE_GOOGLE_AUTH_API_URL ||
  "https://queueless-backend-b2qh.onrender.com/user/google";

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

  try {
    // 1. Call official backend Google Auth endpoint: POST /user/google
    // Handles BOTH: registering brand new Google users, and logging in existing Google users!
    const res = await fetch(GOOGLE_AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname,
        email,
        google_id: googleId,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.status === "success" && (data.access_token || data.token)) {
      const token = data.access_token || data.token;
      const user = {
        ...googleUser,
        user_id: data.user_id,
        user_role: data.user_role,
        google_id: googleId,
        email,
        fullname,
        role: data.user_role === 1 ? "admin" : (data.user_role === 3 ? "owner" : "user"),
        refresh_token: data.refresh_token,
      };
      const isNew = Boolean(
        data.message?.toLowerCase().includes("registered") ||
        data.message?.toLowerCase().includes("new") ||
        data.message?.toLowerCase().includes("created")
      );

      return {
        ok: true,
        user,
        token,
        isNew,
        message: data.message || "Login successful.",
      };
    }

    // 2. If the backend returned an explicit error message
    const errorMsg =
      data.message ||
      (Array.isArray(data.detail) ? data.detail.map((d) => d.msg || d).join(", ") : data.detail) ||
      data.error ||
      "Google authentication failed. Please try again or use your password.";

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

            // Check database & sync: logs in or registers via POST /user/google with google_id
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

