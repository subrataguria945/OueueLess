import { useState } from "react";
import "./register.css";

const REGISTER_API_URL = import.meta.env.VITE_REGISTER_API_URL || import.meta.env.VITE_API_URL || "";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSuccess(data.message || "Account created successfully! Switching to login...");
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, 1400);
      } else {
        setError(data.message || data.error || "Failed to create account.");
      }
    } catch {
      setError("Could not connect to server. Check connection or API URL.");
    } finally {
      setIsLoading(false);
    }
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

          {/* Phone number (optional) */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <input
              id="ql-reg-phone"
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>
              I agree to the{" "}
              <a href="#terms" className="ql-terms-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
              {" "}and{" "}
              <a href="#privacy" className="ql-terms-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" className="ql-submit" disabled={isLoading}>
            {isLoading ? (
              <><span className="ql-spin"></span>Creating account...</>
            ) : (
              <>Create Account&nbsp;
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="ql-divider">
          <span className="ql-divider-line" />
          <span className="ql-divider-text">Or continue with</span>
          <span className="ql-divider-line" />
        </div>

        {/* Google */}
        <button type="button" className="ql-google">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.36v3.15C3.33 21.35 7.4 24 12 24z" />
            <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.36 5.42l3.96-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.4 0 3.33 2.65 1.36 6.58l3.96 3.15c.94-2.83 3.57-4.98 6.68-4.98z" />
          </svg>
          Continue with Google
        </button>

        {/* Footer switch to Login */}
        <p className="ql-footer">
          Already have an account?{" "}
          <button type="button" className="ql-signup" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

/* ── Standalone Register Page Component ──────────────────── */
export function Register({ onSwitchToLogin }) {
  return (
    <div className="ql-root ql-mode-register">
      <div className="ql-panel ql-panel-register" style={{ opacity: 1, pointerEvents: "auto", transform: "none" }}>
        <RegisterPanel onSwitchToLogin={onSwitchToLogin} />
      </div>

      <div className="ql-hero-overlay" style={{ transform: "none" }}>
        <img
          src="/hero-left.png?v=3"
          alt="Queueless — Be a Part of a Smarter Tomorrow."
          className="ql-hero-img ql-hero-register"
          style={{ opacity: 1, transform: "none" }}
        />
      </div>
    </div>
  );
}

export default Register;