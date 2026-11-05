import { useState, useEffect } from "react";
import "./Login.css";
import { RegisterPanel } from "./register";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { triggerGoogleSignIn } from "./googleAuth";

const LOGIN_API_URL =
  import.meta.env.VITE_LOGIN_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://queueless-backend-b2qh.onrender.com/user/login";

const FORGOT_PASSWORD_API_URL =
  import.meta.env.VITE_FORGOT_PASSWORD_API_URL ||
  "https://queueless-backend-b2qh.onrender.com/user/password/forget";

export function Login({ initialMode = "login", initialForgotOpen = false, onSwitchToRegister, onSwitchToLogin, onSwitchToForgot }) {
  const [mode, setMode] = useState(initialMode === "forgot" ? "login" : initialMode); // "login" | "register"
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(initialForgotOpen || initialMode === "forgot");

  /* ── Login State ──────────────────────────────────── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      document.title = "Login — QueueLess";
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

    // Check if email is entered on login page
    if (!cleanEmail) {
      setLoginError("Please enter your email address first to reset password.");
      const emailInput = document.getElementById("ql-login-email");
      if (emailInput) {
        emailInput.focus();
      }
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
        setLoginError(data?.message || data?.error || "User does not exist or failed to send reset link.");
        return;
      }

      setLoginSuccess(data?.message || "Reset password link sent to your email! Please check your inbox.");
      if (onSwitchToForgot) onSwitchToForgot();
    } catch {
      setIsForgotLoading(false);
      setLoginError("Unable to connect to the server. Please try again.");
    }
  };

  const handleGoogleSuccess = (user, token, isNew, message) => {
    setLoginError("");
    setLoginSuccess("");
    if (token) {
      rememberMe ? localStorage.setItem("token", token) : sessionStorage.setItem("token", token);
    }
    if (user) localStorage.setItem("user", JSON.stringify(user));

    const rawRole = user?.role ?? user?.user_role;
    const isAdmin = Number(rawRole) === 1 || String(rawRole).trim() === "1" || String(rawRole).toLowerCase() === "admin" || String(rawRole).toLowerCase() === "super admin";

    if (isAdmin) {
      localStorage.setItem("ql_admin_token", token || "admin_session");
      localStorage.setItem("role", "admin");
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
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
          if (str.includes("cancel") || str.includes("closed")) {
            // Cancelled cleanly without error alert
          } else {
            setLoginError(err || "Unable to sign in with Google. Please try again or use your email and password.");
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

      // Backend returns HTTP 200 with status: 'Login Failed' and message: 'ERR_INVALID_CREDENTIALS'
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

        if (token) {
          rememberMe ? localStorage.setItem("token", token) : sessionStorage.setItem("token", token);
        }

        const userObj = data.user || data.data?.user || (data.email ? data : {});
        if (userObj && Object.keys(userObj).length > 0) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }

        // Backend response role: role 1 means admin
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
          String(rawRole).toLowerCase() === "admin";

        if (isAdmin) {
          localStorage.setItem("ql_admin_token", token || "ql_admin_session");
          localStorage.setItem("role", "admin");
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        const rawError =
          data.message ||
          (Array.isArray(data.detail) ? data.detail.map((d) => d.msg || d).join(", ") : data.detail) ||
          data.error ||
          "";

        const lower = String(rawError).toLowerCase().trim();
        let formattedMessage = "Incorrect email or password. Please try again or use 'Forgot password'.";

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

  /* ── Reusable Input Styles (Scoped & Collision-Proof) ─ */
  const loginInputStyle = {
    width: "100%",
    height: "48px",
    backgroundColor: "#ffffff",
    background: "#ffffff",
    border: "1.5px solid #dde4f0",
    borderRadius: "12px",
    padding: "0 44px 0 44px",
    fontSize: "14.5px",
    fontFamily: "inherit",
    fontWeight: "450",
    color: "#0d1b35",
    outline: "none",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const isAnyLoading = isLoginLoading || isGoogleLoading;

  return (
    <div className={`ql-root ql-mode-${mode}${isAnyLoading ? " ql-loading-active" : ""}`}>

      {/* ── FORM STAGE (SLIDES LEFT <-> RIGHT) ───────────── */}
      <div className="ql-forms-stage">

        {/* ── 1. LOGIN FORM PANEL ─────────────────────────── */}
        <div className="ql-panel ql-panel-login">
          <div className="ql-inner">

          {/* Brand Logo */}
          <div className="ql-brand">
            <img
              src="/logo-transparent.png"
              alt="Queueless - Smart Queue Management for a Smoother Tomorrow"
              className="ql-brand-img"
            />
          </div>

          {/* Login Card */}
          <div className="ql-card">
            <div className="ql-card-head">
              <h2 className="ql-card-title">Welcome Back</h2>
              <p className="ql-card-sub">Login to continue to QueueLess</p>
            </div>

            {loginError && (
              <div className="ql-alert ql-alert-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{loginError}</span>
              </div>
            )}
            {loginSuccess && (
              <div className="ql-alert ql-alert-success" role="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="ql-form">
              {/* Email */}
              <div className="ql-field">
                <span className="ql-field-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  id="ql-login-email"
                  type="email"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  style={loginInputStyle}
                  onFocus={e => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Password */}
              <div className="ql-field">
                <span className="ql-field-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="ql-login-password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{ ...loginInputStyle, paddingRight: "46px" }}
                  onFocus={e => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" className="ql-eye-btn" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label="Toggle password">
                  {showLoginPassword ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Options */}
              <div className="ql-row-options">
                <label className="ql-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="ql-cb-box" style={{
                    backgroundColor: rememberMe ? "#1960f7" : "#ffffff",
                    borderColor: rememberMe ? "#1960f7" : "#cbd5e1",
                  }}>
                    {rememberMe && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="ql-remember-text">Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="ql-forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isForgotLoading) handleSwitchToForgot();
                  }}
                  style={{
                    opacity: isForgotLoading ? 0.7 : 1,
                    pointerEvents: isForgotLoading ? "none" : "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isForgotLoading ? (
                    <>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid #1960f7",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "qlModalSpin 0.7s linear infinite",
                        }}
                      />
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Forgot password?"
                  )}
                </a>
              </div>

              {/* Submit */}
              <button type="submit" className="ql-submit" disabled={isLoginLoading}>
                {isLoginLoading ? (
                  <><span className="ql-spin"></span>Logging in...</>
                ) : (
                  <>Login&nbsp;
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="ql-divider">
              <span className="ql-divider-line"/>
              <span className="ql-divider-text">Or continue with</span>
              <span className="ql-divider-line"/>
            </div>

            {/* Google */}
            <button
              type="button"
              className="ql-google"
              onClick={handleGoogleClick}
              disabled={isGoogleLoading}
              style={{ opacity: isGoogleLoading ? 0.75 : 1, cursor: isGoogleLoading ? "wait" : "pointer" }}
            >
              {isGoogleLoading ? (
                <>
                  <span className="ql-spin" />
                  <span>Checking Google account...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.15C3.33 21.35 7.4 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.33 2.65 1.36 6.58l3.96 3.15c.94-2.83 3.57-4.98 6.68-4.98z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Footer switch to Register */}
            <p className="ql-footer">
              Don&apos;t have an account?{" "}
              <button type="button" className="ql-signup" onClick={handleSwitchToRegister}>
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

        {/* ── 2. REGISTER FORM PANEL (RIGHT) ────────────────── */}
        <div className="ql-panel ql-panel-register">
          <RegisterPanel onSwitchToLogin={handleSwitchToLogin} />
        </div>
      </div>

      {/* ── 3. SLIDING HERO OVERLAY (RIGHT <-> LEFT) ────── */}
      <div className="ql-hero-overlay">
        {/* Active on Right edge in Login mode */}
        <img
          src="/hero-right.png?v=5"
          alt="Queueless — Less Waiting, More Doing."
          className="ql-hero-img ql-hero-login"
        />

        {/* Active on Left edge in Register mode */}
        <img
          src="/hero-left.png?v=5"
          alt="Queueless — Be a Part of a Smarter Tomorrow."
          className="ql-hero-img ql-hero-register"
        />
      </div>

      {/* ── 4. FORGOT PASSWORD POPUP MODAL ────────────────── */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        email={loginEmail}
      />

      {/* ── 5. FULL-PAGE BLURRED LOADING OVERLAY ─────────── */}
      {isAnyLoading && (
        <div className="ql-loading-overlay" aria-label="Loading" role="status">
          <div className="ql-loader-card">
            <div className="ql-spinner-disc">
              <div className="ql-spinner-inner"></div>
              <div className="ql-spinner-core"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}