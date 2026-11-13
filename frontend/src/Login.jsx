import { useState, useEffect, useRef } from "react";
import "./Login.css";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { EmailOtpModal } from "./EmailOtpModal";
import { initiateSignup, verifySignupOtp } from "./authApi";
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

  /* ── Login Form State ──────────────────────────────── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const forgotTimerRef = useRef(null);

  /* ── Register Form State ───────────────────────────── */
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [signupToken, setSignupToken] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [sendingError, setSendingError] = useState("");
  const pendingInitiateRef = useRef(null);

  /* ── Password Strength & Match Calculations ─────────── */
  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(regPassword);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthInfo = (() => {
    if (!regPassword) return { label: "", color: "#e2e8f0" };
    if (strengthScore <= 1) return { label: "Weak", color: "#ef4444" };
    if (strengthScore === 2) return { label: "Fair", color: "#f97316" };
    if (strengthScore === 3) return { label: "Good", color: "#eab308" };
    return { label: "Strong", color: "#10b981" };
  })();

  const isPasswordMatched =
    regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const isPasswordMismatch =
    regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

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
    setRegError("");
    setRegSuccess("");
    window.history.replaceState(null, "", "/register");
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const handleSwitchToLogin = () => {
    setMode("login");
    setLoginError("");
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
    if (params.get("logout") === "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("ql_admin_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.clear();
      return;
    }
    const existingToken =
      localStorage.getItem("token") ||
      localStorage.getItem("ql_admin_token") ||
      sessionStorage.getItem("token");

    if (existingToken && window.location.pathname === "/login") {
      window.location.href = "/admin";
    }
  }, []);

  /* ── Google Sign-In ────────────────────────────────── */
  const handleGoogleSuccess = (user, token, isNew, message) => {
    setIsGoogleLoading(false);
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("ql_admin_token", token);
      sessionStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role) localStorage.setItem("role", user.role);
    }
    setLoginSuccess(message || "Signed in with Google successfully! Redirecting...");
    setTimeout(() => {
      window.location.href = "/admin";
    }, 800);
  };

  const handleGoogleError = (errorMsg) => {
    setIsGoogleLoading(false);
    showTemporaryError(errorMsg || "Google sign-in failed. Please try again.");
  };

  const handleGoogleClick = () => {
    setLoginError("");
    setLoginSuccess("");
    setIsGoogleLoading(true);

    triggerGoogleSignIn({
      onSuccess: handleGoogleSuccess,
      onError: handleGoogleError,
      onClose: () => setIsGoogleLoading(false),
    });
  };

  /* ── Regular Email/Password Login ──────────────────── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError("Please enter your email address.");
      return;
    }
    if (!loginPassword) {
      setLoginError("Please enter your password.");
      return;
    }

    setIsLoginLoading(true);

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const token =
          data.token ||
          data.accessToken ||
          data.access_token ||
          data.jwt ||
          data.data?.token;

        const user = data.user || data.data?.user || {
          email: cleanEmail,
          name: data.name || cleanEmail.split("@")[0],
          role: data.role || data.user_role || "ADMIN",
        };

        if (token) {
          if (rememberMe) {
            localStorage.setItem("token", token);
            localStorage.setItem("ql_admin_token", token);
          } else {
            sessionStorage.setItem("token", token);
          }
        }

        if (user) {
          const userPayload = JSON.stringify(user);
          if (rememberMe) {
            localStorage.setItem("user", userPayload);
            localStorage.setItem("role", user.role || "ADMIN");
          } else {
            sessionStorage.setItem("user", userPayload);
            sessionStorage.setItem("role", user.role || "ADMIN");
          }
        }

        setLoginSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 600);
      } else {
        const rawError = data.error || data.message || data.detail || "";
        const lower = String(rawError).toLowerCase();
        let formattedMessage = "Unable to sign in. Please verify your email and password.";

        if (
          response.status === 401 ||
          lower.includes("invalid") ||
          lower.includes("incorrect") ||
          lower.includes("not found") ||
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

  /* ── Register Submit -> Open OTP Modal ────────────── */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    setSendingError("");

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim().replace(/\D/g, "");

    if (!cleanName) {
      setRegError("Please enter your full name.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setRegError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters long.");
      return;
    }
    if (strengthScore < 2) {
      setRegError("Password is too weak. Please include numbers, uppercase or special characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match!");
      return;
    }

    // Instantly open the OTP modal
    setIsOtpModalOpen(true);
    setIsSendingCode(true);
    setSendingError("");

    const initiatePromise = initiateSignup({
      fullname: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      user_role: 3,
    })
      .then((result) => {
        setSignupToken(result.signup_token);
        setIsSendingCode(false);
        return result.signup_token;
      })
      .catch((err) => {
        const msg = err?.message || "Failed to send verification code. Please check your details.";
        setSendingError(msg);
        setIsSendingCode(false);
        throw err;
      });

    pendingInitiateRef.current = initiatePromise;
  };

  /* ── Verify OTP and Create Account ────────────────── */
  const handleVerifyOtp = async (otpCode) => {
    let tokenToUse = signupToken;
    if (!tokenToUse && pendingInitiateRef.current) {
      tokenToUse = await pendingInitiateRef.current.catch(() => null);
    }

    if (!tokenToUse) {
      throw new Error(sendingError || "Sending code failed. Please click Resend Code.");
    }

    await verifySignupOtp({
      signup_token: tokenToUse,
      otp: otpCode,
      password: regPassword,
    });

    setIsOtpModalOpen(false);
    setLoginSuccess("Account created successfully! Please log in.");
    setLoginEmail(regEmail);

    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
    setRegConfirmPassword("");
    setSignupToken("");
    pendingInitiateRef.current = null;

    setTimeout(() => {
      handleSwitchToLogin();
    }, 1000);
  };

  /* ── Resend OTP ────────────────────────────────────── */
  const handleResendOtp = async () => {
    setSendingError("");
    setIsSendingCode(true);
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim().replace(/\D/g, "");

    try {
      const result = await initiateSignup({
        fullname: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        user_role: 3,
      });

      setSignupToken(result.signup_token);
      return result;
    } catch (err) {
      setSendingError(err?.message || "Failed to resend verification code.");
      throw err;
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <div className={`ql-login-page ${mode === "register" ? "ql-signup-active" : "ql-login-active"}`}>
      <div className="ql-login-split">
        {/* ── FORM COLUMN (LEFT ON LOGIN, SLIDES TO RIGHT ON SIGNUP) ── */}
        <div className="ql-login-left">
          <div className="ql-login-form-wrap">
            {/* Brand Logo */}
            <div className="ql-logo-box">
              <img
                src="/queueless-logo-card.png"
                alt="QueueLess"
                className="ql-brand-logo"
              />
            </div>

            {mode === "register" ? (
              /* ── REGISTER / CREATE ACCOUNT VIEW ── */
              <div className="ql-pane-fade" key="register-pane">
                <h1 className="ql-title">Create Account</h1>
                <p className="ql-subtitle">Join QueueLess and get started</p>

                {/* Alerts */}
                {regError && (
                  <div className="ql-alert-banner ql-alert-error" role="alert" onClick={() => setRegError("")}>
                    <span>{regError}</span>
                    <button type="button" className="ql-alert-dismiss">✕</button>
                  </div>
                )}
                {regSuccess && (
                  <div className="ql-alert-banner ql-alert-success" role="status" onClick={() => setRegSuccess("")}>
                    <span>{regSuccess}</span>
                    <button type="button" className="ql-alert-dismiss">✕</button>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="ql-form" noValidate>
                  {/* Full Name */}
                  <div className="ql-input-group">
                    <span className="ql-input-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="ql-reg-name"
                      type="text"
                      placeholder="Full Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div className="ql-input-group">
                    <span className="ql-input-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="ql-reg-email"
                      type="email"
                      autoComplete="username email"
                      placeholder="Email Address"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="ql-input-group">
                    <span className="ql-input-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      id="ql-reg-phone"
                      type="tel"
                      placeholder="Phone Number"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="ql-input-group">
                    <span className="ql-input-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="ql-reg-password"
                      type={showRegPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ql-eye-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? (
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

                  {/* Password Strength Indicator */}
                  {regPassword && (
                    <div className="ql-strength-box">
                      <div className="ql-strength-header">
                        <span className="ql-strength-text">Password Strength:</span>
                        <span className="ql-strength-badge" style={{ color: strengthInfo.color }}>
                          {strengthInfo.label}
                        </span>
                      </div>
                      <div className="ql-strength-bars">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className="ql-strength-seg"
                            style={{
                              background: seg <= strengthScore ? strengthInfo.color : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>
                      <div className="ql-strength-reqs">
                        <span className={`ql-req-chip ${hasMinLength ? "ql-req-met" : ""}`}>
                          {hasMinLength ? "✓" : "○"} 8+ chars
                        </span>
                        <span className={`ql-req-chip ${hasUppercase ? "ql-req-met" : ""}`}>
                          {hasUppercase ? "✓" : "○"} Uppercase
                        </span>
                        <span className={`ql-req-chip ${hasNumber ? "ql-req-met" : ""}`}>
                          {hasNumber ? "✓" : "○"} Number
                        </span>
                        <span className={`ql-req-chip ${hasSpecial ? "ql-req-met" : ""}`}>
                          {hasSpecial ? "✓" : "○"} Symbol
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className={`ql-input-group ${regConfirmPassword ? (isPasswordMatched ? "ql-input-match" : "ql-input-mismatch") : ""}`}>
                    <span className="ql-input-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="ql-reg-confirm-password"
                      type={showRegConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm Password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ql-eye-btn"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showRegConfirmPassword ? (
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

                  {/* Password Match Indicator */}
                  {regConfirmPassword && (
                    <div className={`ql-match-indicator ${isPasswordMatched ? "ql-matched" : "ql-mismatched"}`}>
                      {isPasswordMatched ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="ql-btn-primary"
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? (
                      <>
                        <span className="ql-spinner-circle" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Sign Up &rarr;</span>
                    )}
                  </button>
                </form>

                {/* Footer Switch to Login */}
                <div className="ql-footer-prompt">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    className="ql-signup-btn"
                    onClick={handleSwitchToLogin}
                  >
                    Log In
                  </button>
                </div>
              </div>
            ) : (
              /* ── LOG IN VIEW ── */
              <div className="ql-pane-fade" key="login-pane">
                <h1 className="ql-title">Log In</h1>
                <p className="ql-subtitle">Access your QueueLess account</p>

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
                <form onSubmit={handleLoginSubmit} className="ql-form" noValidate>
                  {/* Email Field */}
                  <div className="ql-input-group">
                    <span className="ql-input-icon">
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

                  {/* Password Field */}
                  <div className="ql-input-group">
                    <span className="ql-input-icon">
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
                      className="ql-eye-btn"
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
                    className="ql-btn-primary"
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
                  <div className="ql-forgot-wrap">
                    <button
                      type="button"
                      className="ql-forgot-btn"
                      onClick={handleSwitchToForgot}
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="ql-divider">
                  <span className="ql-div-line" />
                  <span className="ql-div-text">or</span>
                  <span className="ql-div-line" />
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  className="ql-btn-google"
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
                <div className="ql-footer-prompt">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="ql-signup-btn"
                    onClick={handleSwitchToRegister}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── HERO SCENE COLUMN (RIGHT ON LOGIN, SLIDES TO LEFT ON SIGNUP) ── */}
        <div className="ql-login-right">
          <div className="ql-hero-scene-wrap">
            <div className="ql-hero-headline-wrap" key={mode}>
              <h2 className="ql-hero-heading">
                {mode === "register" ? (
                  <>
                    Get Started with <span className="ql-hero-brand-blue">QueueLess</span>
                  </>
                ) : (
                  <>
                    Smarter <span className="ql-hero-brand-blue">Queue</span> Management
                  </>
                )}
              </h2>
              <div className="ql-hero-accent-bar" />
            </div>

            <img
              src="/queueless-login-scene-feathered.png"
              alt="QueueLess Smart Queue Display Token A-042"
              className="ql-hero-artwork"
            />
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />

      {/* Email OTP Verification Modal for Registration */}
      <EmailOtpModal
        isOpen={isOtpModalOpen}
        email={regEmail}
        isSendingCode={isSendingCode}
        sendingError={sendingError}
        onVerifyOtp={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        onCancel={() => {
          setIsOtpModalOpen(false);
          setIsSendingCode(false);
        }}
      />
    </div>
  );
}
