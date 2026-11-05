import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FORGOT_PASSWORD_API_URL =
  import.meta.env.VITE_FORGOT_PASSWORD_API_URL ||
  "https://queueless-backend-b2qh.onrender.com/user/password/forget";

const RESET_PASSWORD_API_URL =
  import.meta.env.VITE_RESET_PASSWORD_API_URL ||
  "https://queueless-backend-b2qh.onrender.com/user/password/reset";

export function ForgotPasswordModal({ isOpen, onClose }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const newPasswordRef = useRef(null);

  // Read reset token from URL if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get("token") || searchParams.get("reset_token") || "";
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, [isOpen]);

  // Strong password checks
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

  // Auto-focus and reset state when opening
  useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError("");
      setSuccess("");
      setIsLoading(false);
      const timer = setTimeout(() => {
        newPasswordRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !newPassword.trim()) {
      setError("New password is required. Please fill in this field.");
      return;
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      setError("Please confirm your new password.");
      return;
    }

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!hasUppercase) {
      setError("Password must include at least one uppercase letter (A-Z).");
      return;
    }

    if (!hasNumber) {
      setError("Password must include at least one number (0-9).");
      return;
    }

    if (!hasSpecial) {
      setError("Password must include at least one special symbol (!@#$%^&*...).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const effectiveToken = (token || searchParams?.get("token") || searchParams?.get("reset_token") || "").trim();

      const res = await fetch(RESET_PASSWORD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: effectiveToken,
          newpassword: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.status === "failed" || data?.status === "error") {
        const errorMsg =
          (Array.isArray(data?.detail) ? data.detail.map((d) => d.msg).join(", ") : data?.detail) ||
          data?.message ||
          data?.error;
        if (errorMsg) {
          setError(errorMsg);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      setSuccess(data?.message || "Password reset successfully!");

      // Auto close after 1.3 seconds
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1300);
    } catch (err) {
      setIsLoading(false);
      setError(err?.message || "Could not reset password. Please try again.");
    }
  };

  const inputStyle = {
    width: "100%",
    height: "46px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #dde4f0",
    borderRadius: "11px",
    padding: "0 44px 0 44px",
    fontSize: "14px",
    fontFamily: "inherit",
    fontWeight: "450",
    color: "#0d1b35",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        animation: "qlFadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "28px 24px 22px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          position: "relative",
          boxSizing: "border-box",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          animation: "qlScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e2e8f0";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f5f9";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Icon + Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#eff6ff",
              border: "1px solid #dbeafe",
              color: "#1960f7",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3
            style={{
              margin: "0 0 6px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#0f172a",
              letterSpacing: "-0.3px",
            }}
          >
            Reset Password
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "13.5px",
              color: "#64748b",
              lineHeight: 1.45,
            }}
          >
            Enter your new password and confirm it below.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Form: ONLY New Password & Confirm Password */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 1. New Password */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                color: "#94a3b8",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              ref={newPasswordRef}
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError("");
              }}
              required
              disabled={isLoading || Boolean(success)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "#1960f7";
                e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#dde4f0";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label="Toggle new password visibility"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showNewPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div style={{ marginTop: "-6px", marginBottom: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>Password Strength:</span>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: strengthInfo.color }}>
                  {strengthInfo.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px", height: "3.5px", marginBottom: "6px" }}>
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

          {/* 2. Confirm Password */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                color: "#94a3b8",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              required
              disabled={isLoading || Boolean(success)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "#1960f7";
                e.target.style.boxShadow = "0 0 0 3px rgba(25,96,247,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#dde4f0";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showConfirmPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password Match Indicator */}
          {confirmPassword && (
            <div style={{ marginTop: "-6px", marginBottom: "2px" }}>
              {newPassword !== confirmPassword ? (
                <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span>✕</span> Passwords do not match
                </span>
              ) : (
                <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span>✓</span> Passwords match
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Boolean(success)}
            style={{
              width: "100%",
              height: "46px",
              backgroundColor: "#1960f7",
              color: "#ffffff",
              border: "none",
              borderRadius: "11px",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: isLoading || Boolean(success) ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
              transition: "background-color 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !success) e.currentTarget.style.backgroundColor = "#124cd4";
            }}
            onMouseLeave={(e) => {
              if (!isLoading && !success) e.currentTarget.style.backgroundColor = "#1960f7";
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "qlModalSpin 0.7s linear infinite",
                  }}
                />
                <span>Updating password...</span>
              </>
            ) : success ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Updated!</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "13.5px",
              fontWeight: "500",
              cursor: "pointer",
              padding: "4px",
              marginTop: "2px",
              textAlign: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
          >
            Cancel
          </button>
        </form>

        <style>{`
          @keyframes qlFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes qlScaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes qlModalSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

export default ForgotPasswordModal;

