import { useState, useEffect } from "react";
import "./Login.css";
import { RegisterPanel } from "./register";
import { ForgotPasswordPanel } from "./ForgotPassword";

const LOGIN_API_URL = import.meta.env.VITE_API_URL || "";

export function Login({ initialMode = "login", onSwitchToRegister, onSwitchToLogin, onSwitchToForgot }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register" | "forgot"

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (mode === "register") {
      document.title = "Create Account — QueueLess";
    } else if (mode === "forgot") {
      document.title = "Reset Password — QueueLess";
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

  const handleSwitchToForgot = () => {
    setMode("forgot");
    window.history.replaceState(null, "", "/forgot-password");
    if (onSwitchToForgot) onSwitchToForgot();
  };

  /* ── Login State ──────────────────────────────────── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError("");
    setLoginSuccess("");
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword, rememberMe }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setLoginSuccess(data.message || "Login successful! Redirecting...");
        const token = data.token || data.accessToken;
        if (token) {
          rememberMe ? localStorage.setItem("token", token) : sessionStorage.setItem("token", token);
        }
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setLoginError(data.message || data.error || "Invalid email or password.");
      }
    } catch {
      setLoginError("Could not connect to the server.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  /* ── Reusable Input Styles (Scoped & Collision-Proof) ─ */
  const loginInputStyle = {
    width: "100%",
    height: "46px",
    backgroundColor: "#ffffff",
    background: "#ffffff",
    border: "1.5px solid #dde4f0",
    borderRadius: "11px",
    padding: "0 44px 0 44px",
    fontSize: "14px",
    fontFamily: "inherit",
    fontWeight: "450",
    color: "#0d1b35",
    outline: "none",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div className={`ql-root ql-mode-${mode}`}>

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
              <p className="ql-card-sub">Login to continue to Queelless</p>
            </div>

            {loginError && (
              <div className="ql-alert ql-alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {loginError}
              </div>
            )}
            {loginSuccess && (
              <div className="ql-alert ql-alert-success">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {loginSuccess}
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
                    handleSwitchToForgot();
                  }}
                >
                  Forgot password?
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
            <button type="button" className="ql-google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.15C3.33 21.35 7.4 24 12 24z"/>
                <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.33 2.65 1.36 6.58l3.96 3.15c.94-2.83 3.57-4.98 6.68-4.98z"/>
              </svg>
              Continue with Google
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

      {/* ── 3. FORGOT PASSWORD FORM PANEL ────────────────── */}
      <div className="ql-panel ql-panel-forgot">
        <ForgotPasswordPanel onSwitchToLogin={handleSwitchToLogin} />
      </div>

    </div>

      {/* ── 4. SLIDING HERO OVERLAY (RIGHT <-> LEFT) ────── */}
      <div className="ql-hero-overlay">
        {/* Active on Right edge in Login mode */}
        <img
          src="/hero-right.png?v=5"
          alt="Queueless — Less Waiting, More Doing."
          className="ql-hero-img ql-hero-login"
        />

        {/* Active on Left edge in Register & Forgot mode */}
        <img
          src="/hero-left.png?v=5"
          alt="Queueless — Be a Part of a Smarter Tomorrow."
          className="ql-hero-img ql-hero-register"
        />
      </div>

    </div>
  );
}