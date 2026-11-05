// ==========================================================================
// QUEUELESS — OFFICIAL HTTP API CLIENT WITH AUTOMATIC TOKEN REFRESH
// Features:
// 1. Axios client with automatic Bearer token injection.
// 2. Axios Interceptor: On 401 Unauthorized, automatically calls
//    POST /user/refresh, saves the new access_token, and retries the original request!
// 3. Concurrency-safe queue: Prevents multiple simultaneous refresh calls.
// 4. Drop-in authFetch() wrapper for seamless fetch() backwards compatibility.
// ==========================================================================

import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://queueless-backend-b2qh.onrender.com";

export const REFRESH_TOKEN_URL = `${API_BASE_URL}/user/refresh`;

/**
 * Retrieve the current access token from storage.
 */
export function getAccessToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("ql_admin_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

/**
 * Retrieve the current refresh token from storage.
 */
export function getRefreshToken() {
  return (
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token") ||
    ""
  );
}

/**
 * Save new tokens to storage.
 */
export function setTokens({ accessToken, refreshToken }) {
  const isLocalStorage =
    localStorage.getItem("token") !== null ||
    localStorage.getItem("ql_admin_token") !== null ||
    localStorage.getItem("refresh_token") !== null;

  if (accessToken) {
    if (isLocalStorage) {
      localStorage.setItem("token", accessToken);
      if (localStorage.getItem("ql_admin_token")) {
        localStorage.setItem("ql_admin_token", accessToken);
      }
    } else {
      sessionStorage.setItem("token", accessToken);
    }
  }

  if (refreshToken) {
    if (isLocalStorage) {
      localStorage.setItem("refresh_token", refreshToken);
    } else {
      sessionStorage.setItem("refresh_token", refreshToken);
    }
  }
}

/**
 * Clear all authentication tokens on session logout/expiry.
 */
export function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("ql_admin_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refresh_token");
}

/**
 * Core Axios instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// State for handling concurrent requests during refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR:
 * Automatically injects the latest access token as Bearer authorization header.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (
      token &&
      token !== "ql_admin_session" &&
      token !== "admin_session" &&
      !config.headers.Authorization &&
      !config.headers.authorization
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR:
 * Catches 401 Unauthorized (15-min token expiration),
 * calls POST /user/refresh behind the scenes, and transparently retries the failed call!
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response object or status is not 401, reject normally
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints to prevent loops
    const requestUrl = originalRequest.url || "";
    if (requestUrl.includes("/user/refresh") || requestUrl.includes("/user/login")) {
      return Promise.reject(error);
    }

    // Do not retry more than once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request until the refresh completes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
      isRefreshing = false;
      processQueue(new Error("No refresh token available"));
      clearTokens();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?session_expired=true";
      }
      return Promise.reject(error);
    }

    try {
      // Call POST /user/refresh directly with plain axios
      const response = await axios.post(
        REFRESH_TOKEN_URL,
        { refresh_token: currentRefreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data || {};
      const newAccessToken =
        data.access_token ||
        data.token ||
        data.accessToken ||
        data.data?.access_token ||
        data.data?.token;

      const newRefreshToken =
        data.refresh_token ||
        data.refreshToken ||
        data.data?.refresh_token;

      if (!newAccessToken) {
        throw new Error("No access_token returned by /user/refresh endpoint.");
      }

      // Save refreshed tokens
      setTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || currentRefreshToken,
      });

      // Update default axios Authorization header
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

      // Notify and resolve all queued requests with the new token
      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      // Refresh token expired or revoked -> user must re-login
      processQueue(refreshErr, null);
      isRefreshing = false;
      clearTokens();

      console.warn("🔒 Session expired. Redirecting to login page...");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?session_expired=true";
      }
      return Promise.reject(refreshErr);
    }
  }
);

/**
 * Drop-in wrapper around window.fetch with automatic 401 token refresh.
 * Allows any fetch() call to automatically benefit from token auto-refresh!
 */
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };

  if (
    token &&
    token !== "ql_admin_session" &&
    token !== "admin_session" &&
    !headers["Authorization"] &&
    !headers["authorization"]
  ) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 token expiration
  if (response.status === 401 && !url.includes("/user/refresh") && !url.includes("/user/login")) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(REFRESH_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken =
            refreshData.access_token ||
            refreshData.token ||
            refreshData.accessToken;

          if (newAccessToken) {
            setTokens({
              accessToken: newAccessToken,
              refreshToken: refreshData.refresh_token || refreshToken,
            });

            headers["Authorization"] = `Bearer ${newAccessToken}`;
            // Retry the request with the refreshed token!
            response = await fetch(url, { ...options, headers });
          }
        } else {
          clearTokens();
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login?session_expired=true";
          }
        }
      } catch (err) {
        console.error("Auto-refresh fetch failed:", err);
      }
    }
  }

  return response;
}

export default apiClient;
