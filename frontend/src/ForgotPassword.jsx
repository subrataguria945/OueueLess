import { useState } from "react";
import "./ForgotPassword.css";

/* ── Forgot Password Panel Component (Modular & Reusable) ── */
export function ForgotPasswordPanel({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthInfo = (() => {
    if (!newPassword) return { label: "", color: "#e2e8f0" };
    if (strengthScore <= 1) return { label: "Weak", color: "#ef4444" };
    if (strengthScore === 2) return { label: "Fair", color: "#f97316" };
    if (strengthScore === 3) return { label: "Good", color: "#eab308" };
    return { label: "Strong", color: "#10b981" };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!hasUppercase || !hasNumber || !hasSpecial) {
      setError("Password must include at least one uppercase letter, one number, and one symbol.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const resetUrl = import.meta.env.VITE_RESET_PASSWORD_API_URL || import.meta.env.VITE_API_URL || "";
      if (resetUrl) {
        const res = await fetch(`${resetUrl.replace(/\/+$/, "")}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            mobile: mobile.trim(),
            new_password: newPassword,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || data.error || "Failed to reset password. Please check your details.");
          setIsLoading(false);
          return;
        }
      }

      setTimeout(() => {
        setIsLoading(false);
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
        }, 1400);
      }, 600);
    } catch {
      setIsLoading(false);
      setError("Could not reset password. Please try again.");
    }
  };

  const inputStyle = {
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
    <div className="ql-inner ql-inner-forgot">
      {/* Brand Logo */}
      <div className="ql-brand">
        <img
          src="/logo-transparent.png"
          alt="Queueless - Smart Queue Management for a Smoother Tomorrow"
          className="ql-brand-img"
        />
      </div>

      {/* Reset Password Card */}
      <div className="ql-card">
        <div className="ql-card-head">
          <h2 className="ql-card-title">Reset Your Password</h2>
          <p className="ql-card-sub">Enter your details and create a new password for your account.</p>
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
          {/* Email Address */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              id="ql-forgot-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Mobile Number */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <input
              id="ql-forgot-mobile"
              type="tel"
              placeholder="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* New Password */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="ql-forgot-new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: "46px" }}
              onFocus={(e) => { e.target.style.borderColor = "#1960f7"; e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#dde4f0"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" className="ql-eye-btn" onClick={() => setShowNewPassword(!showNewPassword)} aria-label="Toggle password">
              {showNewPassword ? (
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
          {newPassword && (
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

          {/* Confirm New Password */}
          <div className="ql-field">
            <span className="ql-field-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="ql-forgot-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: "46px" }}
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

          {/* Submit */}
          <button type="submit" className="ql-submit" disabled={isLoading}>
            {isLoading ? (
              <><span className="ql-spin"></span>Resetting password...</>
            ) : (
              <>Reset Password&nbsp;
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>



        {/* Back to Login */}
        <button type="button" className="ql-back-btn" onClick={onSwitchToLogin}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Login
        </button>
      </div>


    </div>
  );
}

/* ── Standalone Forgot Password Page ─────────────────────── */
export function ForgotPassword({ onSwitchToLogin }) {
  return (
    <div className="ql-root ql-mode-forgot">
      <div className="ql-forms-stage">
        <div className="ql-panel ql-panel-forgot" style={{ opacity: 1, pointerEvents: "auto", transform: "none" }}>
          <ForgotPasswordPanel onSwitchToLogin={onSwitchToLogin} />
        </div>
      </div>

      <div className="ql-hero-overlay" style={{ transform: "translateX(0)" }}>
        <img
          src="/hero-left.png?v=5"
          alt="Queueless — Less Waiting, More Doing."
          className="ql-hero-img ql-hero-register"
          style={{ opacity: 1, transform: "none" }}
        />
      </div>
    </div>
  );
}

export default ForgotPassword;