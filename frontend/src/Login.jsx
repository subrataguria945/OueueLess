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
  const [mode, setMode] = useState(initialMode === "forgot" ? "login" : initialMode); // "login" | "register"
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

  // Auto-dismiss helper for messages
  const showTemporaryError = (msg, duration = 4500) => {
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
      document.title = "Create Merchant Account — QueueLess";
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

    // Check if email is entered on login page
    if (!cleanEmail) {
      showTemporaryError("Please enter your email address above to receive a password reset link.", 4000);
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
        showTemporaryError(data?.message || data?.error || "Account not found or failed to send reset link.", 4500);
        return;
      }

      showTemporarySuccess(data?.message || "Password reset link sent to your email! Please check your inbox.", 5500);
      if (onSwitchToForgot) onSwitchToForgot();
    } catch {
      setIsForgotLoading(false);
      showTemporaryError("Unable to connect to the authentication server. Please try again.", 4000);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_expired") === "true") {
      showTemporaryError("Your session has expired. Please sign in again.");
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
        let formattedMessage = "Incorrect email or password. Please try again or use 'Forgot password'.";

        if (
          lower.includes("not_found") ||
          lower.includes("not found") ||
          lower.includes("doesn't exist") ||
          lower.includes("no user") ||
          lower.includes("unregistered") ||
          lower.includes("user_not_found")
        ) {
          formattedMessage = "No account found with this email. Please create an account first.";
        } else if (
          lower.includes("invalid_credentials") ||
          lower.includes("invalid") ||
          lower.includes("incorrect") ||
          lower.includes("credential") ||
          lower.includes("password")
        ) {
          formattedMessage = "Incorrect email or password. Please try again or use 'Forgot password'.";
        } else if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("connect")) {
          formattedMessage = "Unable to connect to the authentication server. Please check your internet connection.";
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

  const isAnyLoading = isLoginLoading || isGoogleLoading;

  return (
    <div className={`ql-auth-page ql-mode-${mode}`}>
      {/* ── LEFT SHOWCASE HERO (DESKTOP ONLY) ────────────────── */}
      <div className="ql-auth-showcase" aria-hidden="true">
        {/* Ambient Glows */}
        <div className="ql-showcase-glow ql-glow-1" />
        <div className="ql-showcase-glow ql-glow-2" />

        {/* Top Header */}
        <div className="ql-showcase-top">
          <div className="ql-showcase-brand">
            <img
              src="/logo-transparent.png"
              alt="QueueLess"
              className="ql-showcase-logo-img"
            />
          </div>
          <div className="ql-status-pill">
            <span className="ql-status-dot" />
            <span>Systems Normal • 99.9% Uptime</span>
          </div>
        </div>

        {/* Center Main Message */}
        <div className="ql-showcase-body">
          <div className="ql-showcase-tag">
            <span className="ql-tag-sparkle">✦</span>
            <span>SMART QUEUE MANAGEMENT SYSTEM</span>
          </div>

          <h1 className="ql-showcase-heading">
            Eliminate Long Lines.<br />
            <span className="ql-text-gradient">Delight Every Customer.</span>
          </h1>

          <p className="ql-showcase-desc">
            Empower your stores, counters, and branch clinics with real-time digital queuing, automated SMS notifications, and intelligent staff throughput analytics.
          </p>

          {/* Interactive Live Queue Telemetry Widget Card */}
          <div className="ql-telemetry-card">
            <div className="ql-telemetry-header">
              <div className="ql-telemetry-title">
                <span className="ql-live-radar-dot" />
                <span>COUNTER #03 • ACTIVE SERVICE</span>
              </div>
              <span className="ql-telemetry-badge">Rush Hour Mode</span>
            </div>

            <div className="ql-token-spotlight">
              <div className="ql-token-meta">NOW CALLING</div>
              <div className="ql-token-digits">TOKEN #A-142</div>
              <div className="ql-token-sub">Counter 03 • Desk Express Checkout</div>
            </div>

            <div className="ql-queue-preview-row">
              <span className="ql-queue-label">Next in line:</span>
              <div className="ql-queue-tokens">
                <span className="ql-queue-chip">#A-143</span>
                <span className="ql-queue-chip">#A-144</span>
                <span className="ql-queue-chip">#A-145</span>
              </div>
            </div>

            <div className="ql-telemetry-metrics">
              <div className="ql-telemetry-stat">
                <span className="ql-metric-val">3.2m</span>
                <span className="ql-metric-lbl">Avg. Wait Time</span>
                <span className="ql-metric-trend">↓ 64% faster</span>
              </div>
              <div className="ql-telemetry-stat">
                <span className="ql-metric-val">1,840+</span>
                <span className="ql-metric-lbl">Served Today</span>
                <span className="ql-metric-trend">↑ 22% throughput</span>
              </div>
              <div className="ql-telemetry-stat">
                <span className="ql-metric-val">99.8%</span>
                <span className="ql-metric-lbl">Satisfaction</span>
                <span className="ql-metric-trend">★★★★★ 4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial / Social Proof */}
        <div className="ql-showcase-footer">
          <div className="ql-testimonial-box">
            <div className="ql-stars">★★★★★</div>
            <p className="ql-testimonial-quote">
              &ldquo;QueueLess completely transformed our store rush hours. Customer waiting frustration dropped to zero and our counter speed doubled.&rdquo;
            </p>
            <div className="ql-testimonial-author">
              <div className="ql-author-avatar">PS</div>
              <div>
                <div className="ql-author-name">Priya Sen</div>
                <div className="ql-author-role">Operations Lead, Metro Retail Hub</div>
              </div>
            </div>
          </div>

          <div className="ql-showcase-security-line">
            <span>🔒 Enterprise Grade 256-Bit SSL</span>
            <span>•</span>
            <span>SOC-2 Type II Certified</span>
            <span>•</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT AUTH CARD CONTAINER ────────────────────────── */}
      <div className="ql-auth-form-column">
        <div className="ql-auth-card-wrapper">

          {/* Mobile-Only Brand Header */}
          <div className="ql-mobile-brand">
            <img
              src="/logo-transparent.png"
              alt="QueueLess"
              className="ql-mobile-logo"
            />
            <p className="ql-mobile-sub">Smart Queue Management for a Smoother Tomorrow</p>
          </div>

          {mode === "login" ? (
            <div className="ql-auth-card">
              {/* Card Header */}
              <div className="ql-card-header">
                <h2 className="ql-auth-title">Welcome back</h2>
                <p className="ql-auth-subtitle">
                  Sign in with your merchant credentials or Google account
                </p>
              </div>

              {/* Alert Feedback */}
              {loginError && (
                <div
                  className="ql-banner-alert ql-alert-danger"
                  role="alert"
                  onClick={() => setLoginError("")}
                >
                  <div className="ql-alert-content">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="ql-alert-icon">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{loginError}</span>
                  </div>
                  <button type="button" className="ql-alert-close" aria-label="Close error alert">✕</button>
                </div>
              )}

              {loginSuccess && (
                <div
                  className="ql-banner-alert ql-alert-success"
                  role="status"
                  onClick={() => setLoginSuccess("")}
                >
                  <div className="ql-alert-content">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="ql-alert-icon">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>{loginSuccess}</span>
                  </div>
                  <button type="button" className="ql-alert-close" aria-label="Close success alert">✕</button>
                </div>
              )}

              {/* Google One-Click CTA */}
              <button
                type="button"
                className="ql-google-cta"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <span className="ql-btn-spinner" />
                    <span>Connecting Google account...</span>
                  </>
                ) : (
                  <>
                    <svg className="ql-google-icon" width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.15C3.33 21.35 7.4 24 12 24z" />
                      <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.33 2.65 1.36 6.58l3.96 3.15c.94-2.83 3.57-4.98 6.68-4.98z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="ql-auth-divider">
                <span className="ql-auth-divider-line" />
                <span className="ql-auth-divider-text">or sign in with email</span>
                <span className="ql-auth-divider-line" />
              </div>

              {/* Traditional Form */}
              <form onSubmit={handleLoginSubmit} className="ql-modern-form" noValidate>
                {/* Email Field */}
                <div className="ql-input-group">
                  <label htmlFor="ql-login-email" className="ql-input-label">
                    Email address
                  </label>
                  <div className="ql-input-wrapper">
                    <span className="ql-input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="ql-login-email"
                      type="email"
                      autoComplete="username email"
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="ql-modern-input"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="ql-input-group">
                  <div className="ql-label-row">
                    <label htmlFor="ql-login-password" className="ql-input-label">
                      Password
                    </label>
                    <button
                      type="button"
                      className="ql-link-btn"
                      onClick={handleSwitchToForgot}
                      disabled={isForgotLoading}
                    >
                      {isForgotLoading ? "Sending reset link..." : "Forgot password?"}
                    </button>
                  </div>
                  <div className="ql-input-wrapper">
                    <span className="ql-input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="ql-login-password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="ql-modern-input ql-input-with-trailing"
                    />
                    <button
                      type="button"
                      className="ql-password-eye-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="ql-options-row">
                  <label className="ql-custom-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="ql-sr-only"
                    />
                    <span className={`ql-checkbox-box ${rememberMe ? "is-checked" : ""}`}>
                      {rememberMe && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="ql-checkbox-label">Keep me signed in for 30 days</span>
                  </label>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  className="ql-primary-submit-btn"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? (
                    <>
                      <span className="ql-btn-spinner" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to Dashboard</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer: Switch to Register */}
              <div className="ql-auth-footer-prompt">
                <span>New to QueueLess?</span>{" "}
                <button
                  type="button"
                  className="ql-inline-switch-btn"
                  onClick={handleSwitchToRegister}
                >
                  Create an account
                </button>
              </div>

              {/* Trust Badge */}
              <div className="ql-security-guarantee">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>256-bit encrypted SSL checkout security</span>
              </div>
            </div>
          ) : (
            /* ── REGISTER EMBEDDED MODE ──────────────────────────── */
            <div className="ql-register-embed-container">
              <RegisterPanel onSwitchToLogin={handleSwitchToLogin} />
            </div>
          )}

        </div>
      </div>

      {/* ── FORGOT PASSWORD POPUP MODAL ───────────────────────── */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        email={loginEmail}
      />

      {/* ── FULL-PAGE LOADING OVERLAY ─────────────────────────── */}
      {isAnyLoading && (
        <div className="ql-loading-backdrop" aria-label="Loading" role="status">
          <div className="ql-loader-card">
            <div className="ql-spinner-pulse" />
            <p className="ql-loader-text">Connecting securely to QueueLess...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
