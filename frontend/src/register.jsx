import { useState } from "react";
import "./register.css";
import { initiateSignup, verifySignupOtp } from "./authApi";
import { EmailOtpModal } from "./EmailOtpModal";

/* ── Register Panel Component (Modular & Reusable) ────────── */
export function RegisterPanel({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [signupToken, setSignupToken] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthInfo = (() => {
    if (!password) return { label: "", color: "#e2e8f0" };
    if (strengthScore <= 1) return { label: "Weak", color: "#ef4444" };
    if (strengthScore === 2) return { label: "Fair", color: "#f97316" };
    if (strengthScore === 3) return { label: "Good", color: "#eab308" };
    return { label: "Strong", color: "#10b981" };
  })();

  /* ── 1. CLICK 'CREATE ACCOUNT' -> INITIATE OTP & OPEN MODAL ─ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service & Privacy Policy.");
      return;
    }

    setIsLoading(true);
    try {
      // Calls POST /user/register/initiate to send real OTP to user's Gmail
      const result = await initiateSignup({
        fullname: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        user_role: 2,
      });

      setSignupToken(result.signup_token);
      setIsOtpModalOpen(true);
    } catch (err) {
      setError(err?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── 2. SUBMIT OTP IN MODAL -> VERIFY & REGISTER IN DB ────── */
  const handleVerifyOtp = async (otpCode) => {
    if (!signupToken) {
      throw new Error("Registration session expired. Please click Create Account again.");
    }

    // Calls POST /user/register/verify to verify OTP and register user in database
    await verifySignupOtp({
      signup_token: signupToken,
      otp: otpCode,
      password,
    });

    // Verification and database account creation succeeded!
    setIsOtpModalOpen(false);
    setSuccess("Account created successfully! Switching to login...");

    // Clear form
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setSignupToken("");

    // Redirect to login page
    setTimeout(() => {
      if (onSwitchToLogin) onSwitchToLogin();
      else window.location.href = "/login";
    }, 1400);
  };

  /* ── 3. RESEND OTP ────────────────────────────────────────── */
  const handleResendOtp = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    const result = await initiateSignup({
      fullname: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      user_role: 2,
    });

    setSignupToken(result.signup_token);
  };

  const regInputStyle = {
    width: "100%",
    height: "43px",
    backgroundColor: "#ffffff",
    background: "#ffffff",
    border: "1.5px solid #dde4f0",
    borderRadius: "10px",
    padding: "0 42px 0 42px",
    fontSize: "13.5px",
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
    <div className="ql-inner">
      {/* Brand Logo */}
      <div className="ql-brand">
        <img
          src="/logo-transparent.png"
          alt="Queueless - Smart Queue Management for a Smoother Tomorrow"
          className="ql-brand-img"
        />
      </div>

      {/* Register Card */}
      <div className="ql-card">
        <div className="ql-card-head">
          <h2 className="ql-card-title">Create Your Account</h2>
          <p className="ql-card-sub">Join Queueless and manage queues smarter.</p>
        </div>

        {error && (
          <div className="ql-alert ql-alert-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="ql-alert ql-alert-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ql-form">
          {/* Full Name */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              id="ql-reg-name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={regInputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Email */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              id="ql-reg-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={regInputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Phone number (mandatory) */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <input
              id="ql-reg-phone"
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              maxLength={10}
              style={regInputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="ql-reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...regInputStyle, paddingRight: "46px" }}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" className="ql-eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
              {showPassword ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div style={{ marginTop: "-2px", marginBottom: "3px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>Password Strength:</span>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: strengthInfo.color }}>
                  {strengthInfo.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px", height: "3.5px", marginBottom: "5px" }}>
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    style={{
                      flex: 1,
                      borderRadius: "2px",
                      background: seg <= strengthScore ? strengthInfo.color : "#e2e8f0",
                      transition: "background 0.2s ease",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {[
                  { label: "8+ chars", met: hasMinLength },
                  { label: "Uppercase", met: hasUppercase },
                  { label: "Number", met: hasNumber },
                  { label: "Symbol", met: hasSpecial },
                ].map((req) => (
                  <span
                    key={req.label}
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      padding: "1.5px 6px",
                      borderRadius: "5px",
                      background: req.met ? "#dcfce7" : "#f1f5f9",
                      color: req.met ? "#15803d" : "#94a3b8",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{req.met ? "✓" : "○"}</span>
                    <span>{req.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confirm password */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="ql-reg-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ ...regInputStyle, paddingRight: "46px" }}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" className="ql-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle confirm password">
              {showConfirmPassword ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Terms Checkbox */}
          <label className="ql-terms-label">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
            <span
              className="ql-cb-box"
              style={{
                backgroundColor: agreeTerms ? "#1960f7" : "#ffffff",
                borderColor: agreeTerms ? "#1960f7" : "#cbd5e1",
              }}
            >
              {agreeTerms && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="ql-terms-text">
              I agree to the <a href="/terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> &amp; <a href="/privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            </span>
          </label>

          {/* Submit Button */}
          <button type="submit" className="ql-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="ql-spin"></span>
                Sending verification code...
              </>
            ) : (
              <>
                Create Account&nbsp;
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Login */}
        <p className="ql-footer">
          Already have an account?{" "}
          <button type="button" className="ql-signup" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </div>

      {/* 6-Digit Email OTP Verification Modal */}
      <EmailOtpModal
        isOpen={isOtpModalOpen}
        email={email}
        onVerifyOtp={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        onCancel={() => setIsOtpModalOpen(false)}
      />
    </div>
  );
}

/* ── Standalone Register Page Component ──────────────────── */
export function Register({ onSwitchToLogin }) {
  return (
    <div className="ql-root ql-mode-register">
      <div className="ql-forms-stage">
        <div className="ql-panel ql-panel-register" style={{ opacity: 1, pointerEvents: "auto", transform: "none" }}>
          <RegisterPanel onSwitchToLogin={onSwitchToLogin} />
        </div>
      </div>

      <div className="ql-hero-overlay" style={{ transform: "translateX(0)" }}>
        <img
          src="/hero-left.png?v=5"
          alt="Queueless — Be a Part of a Smarter Tomorrow."
          className="ql-hero-img ql-hero-register"
          style={{ opacity: 1, transform: "none" }}
        />
      </div>

    </div>
  );
}

export default Register;