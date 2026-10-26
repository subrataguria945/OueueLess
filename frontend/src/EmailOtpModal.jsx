import { useState, useEffect, useRef } from "react";
import { verifyEmailOtp, sendEmailOtp } from "./emailVerification";

export function EmailOtpModal({ isOpen, email, onVerified, onCancel }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const inputRefs = useRef([]);

  // Timer countdown and reset on open
  useEffect(() => {
    if (!isOpen) return;
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setInfoMessage("");
    setCountdown(60);
    setShowCodeInput(false);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // When code input is toggled, focus first input
  useEffect(() => {
    if (showCodeInput) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showCodeInput]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);
    if (error) setError("");

    // Auto-advance to next input
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData) {
      const newDigits = [...digits];
      for (let i = 0; i < pasteData.length; i++) {
        newDigits[i] = pasteData[i];
      }
      setDigits(newDigits);
      if (pasteData.length === 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[pasteData.length]?.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const otpCode = digits.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsVerifying(true);
    setError("");
    setInfoMessage("");
    try {
      await verifyEmailOtp(email, otpCode);
      setIsVerifying(false);
      onVerified();
    } catch (err) {
      setIsVerifying(false);
      setError(err?.message || "Invalid or expired code. Please try again.");
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setInfoMessage("");
    try {
      await sendEmailOtp(email);
      setIsResending(false);
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      setInfoMessage("A new verification email has been sent to your Gmail.");
      if (showCodeInput) {
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setIsResending(false);
      setError(err?.message || "Failed to resend verification email.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.68)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "28px 24px 24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          boxSizing: "border-box",
          position: "relative",
          animation: "qlCardEnter 0.25s ease both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: "center", marginBottom: "14px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 12px",
              borderRadius: "16px",
              background: "#eff6ff",
              border: "1.5px solid #dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1960f7",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: "19px", fontWeight: "700", color: "#0f172a" }}>
            Check Your Gmail
          </h3>
          <p style={{ margin: "0 0 8px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.45 }}>
            A verification email has been sent to:
          </p>
          <div
            style={{
              display: "inline-block",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "5px 14px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#1e293b",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
        </div>

        {/* Action 1: Open Gmail & Click Link (Quickest & Guaranteed) */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "14px",
            margin: "12px 0 14px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: "12.5px", color: "#334155", lineHeight: 1.45 }}>
            Click the <b style={{ color: "#1960f7" }}>"Confirm email address"</b> link in the email to automatically verify your account.
          </p>

          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              height: "42px",
              background: "linear-gradient(135deg, #1960f7 0%, #0d47a1 100%)",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: "600",
              boxShadow: "0 3px 10px rgba(25, 96, 247, 0.25)",
              boxSizing: "border-box",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span>Open Gmail Inbox</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Toggle 6-digit Code Input */}
        <div style={{ textAlign: "center", marginBottom: showCodeInput ? "14px" : "10px" }}>
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              padding: "4px 8px",
              textDecoration: "underline",
            }}
          >
            {showCodeInput ? "▲ Hide 6-digit code box" : "Have a 6-digit code? Enter code here ▼"}
          </button>
        </div>

        {/* 6 Digit Inputs (Collapsible) */}
        {showCodeInput && (
          <form onSubmit={handleVerify}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                margin: "10px 0 14px",
              }}
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: "44px",
                    height: "48px",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f172a",
                    background: "#ffffff",
                    border: digit ? "2px solid #1960f7" : "1.5px solid #cbd5e1",
                    borderRadius: "10px",
                    outline: "none",
                    boxSizing: "border-box",
                    boxShadow: digit ? "0 0 0 3px rgba(25, 96, 247, 0.12)" : "none",
                    transition: "all 0.15s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1960f7";
                    e.target.style.boxShadow = "0 0 0 3px rgba(25, 96, 247, 0.15)";
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.style.borderColor = "#cbd5e1";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || digits.join("").length !== 6}
              style={{
                width: "100%",
                height: "40px",
                background:
                  isVerifying || digits.join("").length !== 6
                    ? "#cbd5e1"
                    : "#1e293b",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isVerifying || digits.join("").length !== 6 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                marginBottom: "10px",
              }}
            >
              {isVerifying ? "Verifying code..." : "Verify Code"}
            </button>
          </form>
        )}

        {infoMessage && (
          <div
            style={{
              padding: "8px 12px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#15803d",
              fontSize: "12px",
              textAlign: "center",
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            {infoMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "8px 12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "12.5px",
              textAlign: "center",
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Resend Code Footer */}
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          {countdown > 0 ? (
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              Resend email in <b style={{ color: "#0f172a" }}>{countdown}s</b>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              style={{
                background: "none",
                border: "none",
                color: "#1960f7",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 8px",
                textDecoration: "underline",
              }}
            >
              {isResending ? "Sending email..." : "Resend Verification Email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default EmailOtpModal;
