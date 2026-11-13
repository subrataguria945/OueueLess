import { useState, useEffect, useRef } from "react";
import "./Login.css";
import { RegisterPanel } from "./register";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { triggerGoogleSignIn } from "./googleAuth";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://queueless-backend-b2qh.onrender.com"
).replace(/\/+$/, "");

const LOGIN_API_URL =
  import.meta.env.VITE_LOGIN_API_URL ||
  `${API_BASE}/user/login`;

export function Login({
  initialMode = "login",
  initialForgotOpen = false,
  onSwitchToRegister,
  onSwitchToLogin,
  onSwitchToForgot,
}) {
  const [mode, setMode] = useState(initialMode === "forgot" ? "login" : initialMode);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(
    initialForgotOpen || initialMode === "forgot"
  );

  /* ── Form State ────────────────────────────────────── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const forgotTimerRef = useRef(null);

  const showTemporaryError = (msg, duration = 4000) => {
    if (forgotTimerRef.current) clearTimeout(forgotTimerRef.current);
    setLoginError(msg);
    forgotTimerRef.current = setTimeout(() => {
      setLoginError("");
    }, duration);
  };

  const showTemporarySuccess = (msg, duration = 5000) => {
    if (forgotTimerRef.current) clearTimeout(forgotTimerRef.current);
    setLoginSuccess(msg);
    forgotTimerRef.current = setTimeout(() => {
      setLoginSuccess("");
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (forgotTimerRef.current) clearTimeout(forgotTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialMode === "forgot") {
      setMode("login");
      setIsForgotModalOpen(true);
    } else if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialForgotOpen) {
      setIsForgotModalOpen(true);
    }
  }, [initialForgotOpen]);

  useEffect(() => {
    if (mode === "register") {
      document.title = "Create Account — QueueLess";
    } else {
      document.title = "Log In — QueueLess Smart Queue Management";
    }
  }, [mode]);

  /* ── Mode Switching ───────────────────────────────── */
  const handleSwitchToRegister = () => {
    setMode("register");
    window.history.replaceState(null, "", "/register");
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const handleSwitchToLogin = () => {
    setMode("login");
    window.history.replaceState(null, "", "/login");
    if (onSwitchToLogin) onSwitchToLogin();
  };

  const handleSwitchToForgot = () => {
    setIsForgotModalOpen(true);
    if (onSwitchToForgot) onSwitchToForgot();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_expired") === "true") {
      showTemporaryError("Your session has expired. Please sign in again.");
      return;
    }
    // If arriving from explicit logout, purge all tokens and prevent auto-redirect
    if (params.get("logout") === "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("ql_admin_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();
      return;
    }
    // Auto-redirect if user already has an active session
    const existingToken =
      localStorage.getItem("token") ||
      localStorage.getItem("ql_admin_token") ||
      sessionStorage.getItem("token");

    if (existingToken && window.location.pathname === "/login") {
      window.location.href = "/admin";
    }
  }, []);

  const handleGoogleSuccess = (user, token, isNew, message) => {
    setLoginError("");
    setLoginSuccess("");
    if (token) {
      rememberMe ? localStorage.setItem("token", token) : sessionStorage.setItem("token", token);
      localStorage.setItem("ql_admin_token", token);
    }
    const googleRefreshToken = user?.refresh_token || (typeof token === "object" ? token?.refresh_token : null);
    if (googleRefreshToken) {
      rememberMe ? localStorage.setItem("refresh_token", googleRefreshToken) : sessionStorage.setItem("refresh_token", googleRefreshToken);
    }
    if (user) localStorage.setItem("user", JSON.stringify(user));

    const rawRole = user?.role ?? user?.user_role;
    const isAdmin = Number(rawRole) === 1 || String(rawRole).trim() === "1" || String(rawRole).toLowerCase() === "admin" || String(rawRole).toLowerCase() === "super admin";

    localStorage.setItem("role", isAdmin ? "admin" : (Number(rawRole) === 3 ? "owner" : "user"));
    window.location.href = "/admin";
  };

  const handleGoogleClick = () => {
    setLoginError("");
    setLoginSuccess("");
    setIsGoogleLoading(true);
    triggerGoogleSignIn({
      onSuccess: (user, token, isNew, message) => {
        setIsGoogleLoading(false);
        handleGoogleSuccess(user, token, isNew, message);
      },
      onError: (err) => {
        setIsGoogleLoading(false);
        if (err) {
          const str = String(err).toLowerCase();
          if (!str.includes("cancel") && !str.includes("closed")) {
            setLoginError(err || "Unable to sign in with Google. Please try again.");
          }
        }
      },
      onCancel: () => {
        setIsGoogleLoading(false);
      },
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError("");
    setLoginSuccess("");

    const trimmedEmail = loginEmail.trim().toLowerCase();

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: loginPassword }),
      });
      const data = await response.json().catch(() => ({}));

      const isFailed =
        !response.ok ||
        data.status === "Login Failed" ||
        data.status === "error" ||
        data.status === "failed" ||
        (!data.token && !data.accessToken && !data.access_token && !data.data?.token);

      if (!isFailed) {
        const token =
          data.token ||
          data.accessToken ||
          data.access_token ||
          data.data?.token ||
          data.data?.accessToken;

        const refreshToken =
          data.refresh_token ||
          data.refreshToken ||
          data.data?.refresh_token ||
          data.data?.refreshToken;

        if (token) {
          rememberMe ? localStorage.setItem("token", token) : sessionStorage.setItem("token", token);
          localStorage.setItem("ql_admin_token", token);
        }

        if (refreshToken) {
          rememberMe ? localStorage.setItem("refresh_token", refreshToken) : sessionStorage.setItem("refresh_token", refreshToken);
        }

        const userObj = data.user || data.data?.user || {
          user_id: data.user_id,
          email: data.email || trimmedEmail,
          fullname: data.fullname || data.name || trimmedEmail.split("@")[0],
          user_role: data.user_role ?? data.role ?? 3,
        };
        if (userObj && Object.keys(userObj).length > 0) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }

        const rawRole =
          userObj.role ??
          userObj.user_role ??
          data.role ??
          data.user_role ??
          data.data?.role ??
          data.data?.user_role;

        const isAdmin =
          Number(rawRole) === 1 ||
          String(rawRole).trim() === "1" ||
          String(rawRole).toLowerCase() === "admin" ||
          String(rawRole).toLowerCase() === "super admin";

        localStorage.setItem("role", isAdmin ? "admin" : (Number(rawRole) === 3 ? "owner" : "user"));
        window.location.href = "/admin";
      } else {
        const rawError =
          data.message ||
          (Array.isArray(data.detail) ? data.detail.map((d) => d.msg || d).join(", ") : data.detail) ||
          data.error ||
          "";

        const lower = String(rawError).toLowerCase().trim();
        let formattedMessage = "Incorrect email or password. Please try again.";

        if (
          lower.includes("not_found") ||
          lower.includes("not found") ||
          lower.includes("doesn't exist") ||
          lower.includes("no user") ||
          lower.includes("unregistered") ||
          lower.includes("user_not_found")
        ) {
          formattedMessage = "No account found with this email. Please sign up first.";
        } else if (
          lower.includes("invalid_credentials") ||
          lower.includes("invalid") ||
          lower.includes("incorrect") ||
          lower.includes("credential") ||
          lower.includes("password")
        ) {
          formattedMessage = "Incorrect email or password. Please try again or use 'Forgot password?'.";
        } else if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("connect")) {
          formattedMessage = "Unable to connect to the server. Please check your internet connection.";
        } else if (rawError && !rawError.startsWith("ERR_")) {
          formattedMessage = rawError;
        }

        setLoginError(formattedMessage);
      }
    } catch {
      setLoginError("Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <div className="ql-split-auth-page">
      {/* ── LEFT PANEL: CLEAN WHITE LOG IN FORM ── */}
      <div className="ql-auth-form-panel">
        <div className="ql-form-content-box">
          {/* Brand Logo */}
          <div className="ql-brand-logo-wrap">
            <img
              src="/queueless-logo-card.png"
              alt="QueueLess"
              className="ql-brand-logo-img"
            />
          </div>

          {mode === "register" ? (
            <div className="ql-register-wrapper">
              <RegisterPanel onSwitchToLogin={handleSwitchToLogin} />
            </div>
          ) : (
            <>
              {/* Heading & Subtitle */}
              <h1 className="ql-form-title">Log In</h1>
              <p className="ql-form-subtitle">Access your QueueLess account</p>

              {/* Alerts */}
              {loginError && (
                <div className="ql-alert-banner ql-alert-error" role="alert" onClick={() => setLoginError("")}>
                  <span>{loginError}</span>
                  <button type="button" className="ql-alert-dismiss">✕</button>
                </div>
              )}
              {loginSuccess && (
                <div className="ql-alert-banner ql-alert-success" role="status" onClick={() => setLoginSuccess("")}>
                  <span>{loginSuccess}</span>
                  <button type="button" className="ql-alert-dismiss">✕</button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="ql-login-form" noValidate>
                {/* Email Address Input */}
                <div className="ql-input-box">
                  <span className="ql-box-icon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="ql-input-email"
                    type="email"
                    autoComplete="username email"
                    placeholder="Email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="ql-input-box">
                  <span className="ql-box-icon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="ql-input-password"
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="ql-box-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Log In Button */}
                <button
                  type="submit"
                  className="ql-btn-login-submit"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? (
                    <>
                      <span className="ql-spinner-circle" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Log In &rarr;</span>
                  )}
                </button>

                {/* Forgot Password Link (Below button, right-aligned) */}
                <div className="ql-forgot-row">
                  <button
                    type="button"
                    className="ql-forgot-link-btn"
                    onClick={handleSwitchToForgot}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="ql-or-divider-row">
                <span className="ql-or-bar" />
                <span className="ql-or-tag">or</span>
                <span className="ql-or-bar" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                className="ql-btn-google-auth"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <span className="ql-spinner-circle ql-spinner-dark" />
                    <span>Connecting Google...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.15C3.33 21.35 7.4 24 12 24z" />
                      <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.33 2.65 1.36 6.58l3.96 3.15c.94-2.83 3.57-4.98 6.68-4.98z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Sign Up Footer */}
              <div className="ql-signup-prompt">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  className="ql-signup-action"
                  onClick={handleSwitchToRegister}
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: SMARTER QUEUE MANAGEMENT HERO ── */}
      <div className="ql-auth-hero-panel">
        <div className="ql-hero-content-wrap">
          <img
            src="/ql-right-hero-clean.png"
            alt="Smarter Queue Management"
            className="ql-right-hero-graphic"
          />
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
