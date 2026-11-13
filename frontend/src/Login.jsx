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

const FORGOT_PASSWORD_API_URL =
  import.meta.env.VITE_FORGOT_PASSWORD_API_URL ||
  `${API_BASE}/user/password/forget`;

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
  const [isForgotLoading, setIsForgotLoading] = useState(false);
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
      document.title = "Sign In — QueueLess Smart Queue Management";
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

  const handleSwitchToForgot = async () => {
    const cleanEmail = (loginEmail || "").trim().toLowerCase();

    if (!cleanEmail) {
      showTemporaryError("Please enter your email above to receive a reset link.", 3500);
      const emailInput = document.getElementById("ql-pill-email-input");
      if (emailInput) emailInput.focus();
      return;
    }

    setLoginError("");
    setLoginSuccess("");
    setIsForgotLoading(true);

    try {
      const response = await fetch(FORGOT_PASSWORD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json().catch(() => ({}));
      setIsForgotLoading(false);

      if (!response.ok || data?.status === "failed" || data?.status === "error") {
        showTemporaryError(data?.message || data?.error || "Account not found or failed to send reset link.", 4000);
        return;
      }

      showTemporarySuccess(data?.message || "Password reset link sent to your email! Please check your inbox.", 5000);
      if (onSwitchToForgot) onSwitchToForgot();
    } catch {
      setIsForgotLoading(false);
      showTemporaryError("Unable to reach the server. Please check your internet connection.", 3500);
    }
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
          formattedMessage = "Incorrect email or password. Please try again or use 'Forgot password'.";
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
    <div className="ql-mockup-wrapper">
      {/* ── CARD CONTAINER (AS DISPLAYED IN REFERENCE IMAGE) ── */}
      <div className={`ql-mockup-card ${mode === "register" ? "is-register" : ""}`}>

        {/* ── 1. LEFT HERO SECTION (GREEN ORGANIC WAVE) ────────── */}
        <div className="ql-hero-side">
          {/* Seamless SVG Organic Wave Background */}
          <svg
            className="ql-hero-svg-layer"
            viewBox="0 0 440 520"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="qlGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="45%" stopColor="#047857" />
                <stop offset="85%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {/* Organic curved body bulging to the right */}
            <path
              d="M 0,0 L 330,0 C 430,150 430,370 330,520 L 0,520 Z"
              fill="url(#qlGreenGradient)"
            />
            {/* Bottom-left white quarter arc peeking in */}
            <circle cx="0" cy="520" r="85" fill="#ffffff" />
            {/* Top-left subtle darker shadow arc */}
            <circle cx="0" cy="0" r="95" fill="rgba(0, 0, 0, 0.08)" />
          </svg>

          {/* Hero Foreground Content */}
          <div className="ql-hero-inner">
            {/* Flame/App Logo White Circle Badge */}
            <div className="ql-hero-flame-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C9.5 6 6 8.5 6 13C6 16.31 8.69 19 12 19C15.31 19 18 16.31 18 13C18 9 14 6 12 2Z"
                  fill="#059669"
                />
                <path
                  d="M12 8C10.5 10.5 9 12 9 14.5C9 16.16 10.34 17.5 12 17.5C13.66 17.5 15 16.16 15 14.5C15 12 13.5 10 12 8Z"
                  fill="#10b981"
                />
              </svg>
            </div>

            <div className="ql-hero-brand-title">QueueLess</div>

            <h2 className="ql-hero-main-title">
              {mode === "login" ? "Welcome Back!" : "Hello, Friend!"}
            </h2>

            <p className="ql-hero-text">
              {mode === "login"
                ? "To stay connected with us please login with your personal info"
                : "Enter your personal details and start your journey with us"}
            </p>

            {/* Outline Pill Button */}
            <button
              type="button"
              className="ql-hero-outline-pill"
              onClick={mode === "login" ? handleSwitchToRegister : handleSwitchToLogin}
            >
              {mode === "login" ? "SIGN UP" : "SIGN IN"}
            </button>

            <div className="ql-hero-credits">
              <span>SMART QUEUE MANAGEMENT</span>
              <span>•</span>
              <span>ENTERPRISE</span>
            </div>
          </div>
        </div>

        {/* ── 2. RIGHT FORM SECTION (WHITE CANVAS + PILL FORM) ──── */}
        <div className="ql-form-side">
          {/* Top-Right Decorative Green Wave Arc */}
          <svg
            className="ql-top-right-arc"
            viewBox="0 0 160 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 160,0 L 0,0 C 0,88 72,160 160,160 Z"
              fill="url(#qlGreenGradient)"
            />
          </svg>

          {mode === "login" ? (
            <div className="ql-form-stack">
              {/* Heading */}
              <div className="ql-title-group">
                <h1 className="ql-green-welcome">welcome</h1>
                <p className="ql-green-sub">Login in to your account to continue</p>
              </div>

              {/* Feedback Alert Banners */}
              {loginError && (
                <div className="ql-pill-alert ql-pill-alert-error" role="alert" onClick={() => setLoginError("")}>
                  <span>{loginError}</span>
                  <button type="button" className="ql-alert-x">✕</button>
                </div>
              )}
              {loginSuccess && (
                <div className="ql-pill-alert ql-pill-alert-success" role="status" onClick={() => setLoginSuccess("")}>
                  <span>{loginSuccess}</span>
                  <button type="button" className="ql-alert-x">✕</button>
                </div>
              )}

              {/* Pill Inputs Form */}
              <form onSubmit={handleLoginSubmit} className="ql-pill-form" noValidate>
                {/* Email Pill Input */}
                <div className="ql-input-pill-container">
                  <input
                    id="ql-pill-email-input"
                    type="email"
                    autoComplete="username email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="ql-soft-pill-input"
                  />
                </div>

                {/* Password Pill Input */}
                <div className="ql-input-pill-container ql-pwd-container">
                  <input
                    id="ql-pill-password-input"
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="ql-soft-pill-input ql-soft-pwd-input"
                  />
                  <button
                    type="button"
                    className="ql-pill-toggle-eye"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Centered Forgot Password Link */}
                <div className="ql-pill-forgot-wrap">
                  <button
                    type="button"
                    className="ql-pill-forgot-link"
                    onClick={handleSwitchToForgot}
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? "Sending reset link..." : "Forgot your password?"}
                  </button>
                </div>

                {/* Compact Green Pill Button: LOG IN */}
                <div className="ql-pill-btn-center">
                  <button
                    type="submit"
                    className="ql-green-login-pill"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <span className="ql-pill-spinner" />
                    ) : (
                      "LOG IN"
                    )}
                  </button>
                </div>
              </form>

              {/* Google Sign-In Pill Button */}
              <div className="ql-pill-google-center">
                <button
                  type="button"
                  className="ql-pill-google-cta"
                  onClick={handleGoogleClick}
                  disabled={isGoogleLoading}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.15C3.33 21.35 7.4 24 12 24z" />
                    <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.33 2.65 1.36 6.58l3.96 3.15c.94-2.83 3.57-4.98 6.68-4.98z" />
                  </svg>
                  <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
                </button>
              </div>

              {/* Footer Switch */}
              <div className="ql-pill-signup-prompt">
                <span>Don&apos;t have an account?</span>{" "}
                <button
                  type="button"
                  className="ql-pill-green-link"
                  onClick={handleSwitchToRegister}
                >
                  sign up
                </button>
              </div>
            </div>
          ) : (
            /* Register mode embedded */
            <div className="ql-form-stack ql-reg-embed">
              <RegisterPanel onSwitchToLogin={handleSwitchToLogin} />
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Popup Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        email={loginEmail}
      />
    </div>
  );
}

export default Login;
