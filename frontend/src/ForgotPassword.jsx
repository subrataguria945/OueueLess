import { useState } from "react";
import "./ForgotPassword.css";

/* ---------- Small icon components ---------- */
const MailIcon = () => (
  <svg className="fp-icon" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3,7 12,13 21,7" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="fp-icon" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LockIcon = () => (
  <svg className="fp-icon" viewBox="0 0 24 24">
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const EyeIcon = () => (
  <svg className="fp-icon" viewBox="0 0 24 24">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="fp-icon" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const LogoIcon = () => (
  <div className="fp-logo-box">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </div>
);

/* ---------- Reusable password field ---------- */
function PasswordField({ id, label, placeholder, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="fp-group">
      <label htmlFor={id}>{label}</label>
      <div className="fp-input">
        <LockIcon />
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="fp-eye"
          onClick={() => setShow(!show)}
          aria-label="Toggle password visibility"
        >
          {show ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
    </div>
  );
}

/* ---------- Main component ---------- */
export function ForgotPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    // TODO: call your FastAPI reset-password endpoint here
    console.log("Reset details:", {
      email,
      mobile: `${countryCode}${mobile}`,
      newPassword,
    });
    alert("Password reset successfully!");
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        {/* Brand */}
        <div className="fp-brand">
          <LogoIcon />
          <h1 className="fp-brand-name">QueueLess</h1>
          <p className="fp-tagline">Smart Queue Management System</p>
        </div>

        {/* Heading */}
        <div className="fp-heading">
          <h2>Reset Password</h2>
          <p>Enter your details to create a new password</p>
        </div>

        {/* Form */}
        <form className="fp-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="fp-group">
            <label htmlFor="fp-email">Email Address</label>
            <div className="fp-input">
              <MailIcon />
              <input
                id="fp-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="fp-group">
            <label htmlFor="fp-mobile">Mobile Number</label>
            <div className="fp-input">
              <PhoneIcon />
              <select
                className="fp-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label="Country code"
              >
                <option value="+91">+91</option>
                <option value="+880">+880</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <span className="fp-sep" />
              <input
                id="fp-mobile"
                type="tel"
                placeholder="Enter your registered mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Passwords */}
          <PasswordField
            id="fp-new"
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordField
            id="fp-confirm"
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="fp-error">{error}</p>}

          <button type="submit" className="fp-submit">
            <span>Reset Password</span>
            <span>&rarr;</span>
          </button>
        </form>

        {/* Divider */}
        <div className="fp-divider">or</div>

        {/* Back to login */}
        <p className="fp-back">
          <svg viewBox="0 0 24 24">
            <line x1="20" y1="12" x2="4" y2="12" />
            <polyline points="10,6 4,12 10,18" />
          </svg>
          <span>
            Back to{" "}
            <a
              href="/login"
              onClick={(e) => {
                if (onSwitchToLogin) {
                  e.preventDefault();
                  onSwitchToLogin();
                }
              }}
            >
              Login
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}