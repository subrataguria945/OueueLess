import { useState } from "react";
import "./Register.css";


const REGISTER_API_URL = import.meta.env.VITE_REGISTER_API_URL || "";

export function Register({ onSwitchToLogin }) {

  const [formData, setFormData] = useState({

    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");


    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!formData.terms) {
      setErrorMessage("Please accept the Terms & Conditions.");
      return;
    }

    if (!REGISTER_API_URL) {
      console.log("Registration Data:", formData);
      setSuccessMessage("Account created successfully! (API URL not set yet)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccessMessage(data.message || "Account created successfully!");

        if (onSwitchToLogin) {
          setTimeout(() => onSwitchToLogin(), 1500);
        }
      } else {
        setErrorMessage(data.message || data.error || "Failed to create account.");
      }
    } catch (err) {
      console.error("Register Error:", err);
      setErrorMessage("Could not connect to server. Check your connection or API URL.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="signup-card">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">
            <span className="person person-1" />
            <span className="person person-2" />
            <span className="person person-3" />
          </div>
          <h1 className="logo">
            Queue<span>Less</span>
          </h1>
        </div>

        {/* Heading */}
        <div className="heading">
          <h2>Create Account</h2>
          <p>Sign up to start managing queues smartly</p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && <div className="alert-box error-alert">{errorMessage}</div>}
        {successMessage && <div className="alert-box success-alert">{successMessage}</div>}

        {/* Form */}
        <form id="signupForm" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx={12} cy={7} r={4} />
              </svg>
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x={3} y={5} width={18} height={14} rx={2} />
                <polyline points="3,7 12,13 21,7" />
              </svg>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z" />
              </svg>
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x={5} y={10} width={14} height={11} rx={2} />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx={12} cy={12} r={3} />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x={5} y={10} width={14} height={11} rx={2} />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label="Toggle confirm password"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showConfirmPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx={12} cy={12} r={3} />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="terms">
            <label className="checkbox-container">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <span className="checkmark" />
            </label>
            <p>
              I agree to the{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>
            </p>
          </div>

          {/* Sign Up Button */}
          <button type="submit" className="signup-btn" disabled={isLoading}>
            <span>{isLoading ? "Creating Account..." : "Sign Up"}</span>
            <span className="arrow">→</span>
          </button>
        </form>

        {/* Login Switch */}
        <div className="login-section">
          <div className="line" />
          <p>
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
            >
              Sign In
            </a>
          </p>
          <div className="line" />
        </div>
      </div>
    </div>
  );
}