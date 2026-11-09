import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Masks email address for privacy (e.g. sujitkar2005@gmail.com -> su***05@gmail.com)
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return email || "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  if (local.length <= 4) return `${local.slice(0, 1)}***${local.slice(-1)}@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-2)}@${domain}`;
}

export function EmailOtpModal({
  isOpen,
  email,
  isSendingCode = false,
  sendingError = "",
  onVerifyOtp,
  onResendOtp,
  onCancel,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Reset digits, errors, and start countdown when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setInfoMessage("");
    setCountdown(60);

    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);
    if (error) setError("");

    // Automatically focus next input box
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
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasteData) {
      const newDigits = [...digits];
      for (let i = 0; i < pasteData.length; i++) {
        newDigits[i] = pasteData[i];
      }
      setDigits(newDigits);
      if (error) setError("");
      const focusIndex = Math.min(pasteData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerifySubmit = async (e) => {
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
      if (onVerifyOtp) {
        await onVerifyOtp(otpCode);
      }
    } catch (err) {
      setError(err?.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendClick = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setInfoMessage("");
    try {
      if (onResendOtp) {
        await onResendOtp();
      }
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      setInfoMessage("A new 6-digit verification code has been sent to your Gmail.");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = digits.join("").length === 6;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "92vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          backgroundColor: "#ffffff",
          borderRadius: "22px",
          padding: "36px 32px 30px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.2)",
          border: "1px solid #e2e8f0",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
            background: "#f1f5f9",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.15s ease",
          }}
          aria-label="Close popup"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              margin: "0 auto 14px",
              borderRadius: "16px",
              background: "#eff6ff",
              border: "1.5px solid #dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" }}>
            Verify Your Email
          </h3>
          <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b", lineHeight: 1.45 }}>
            We have sent a verification code to your email address:
          </p>
          <div
            style={{
              display: "inline-block",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "9px",
              padding: "6px 16px",
              fontSize: "13.5px",
              fontWeight: "600",
              color: "#1e293b",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {maskEmail(email)}
          </div>

          {isSendingCode && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "#2563eb", fontWeight: "500" }}>
              <span style={{ width: "12px", height: "12px", border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "qlSpin 0.75s linear infinite" }} />
              Sending code to your email...
            </div>
          )}

          {sendingError && !isSendingCode && (
            <div style={{ marginTop: "10px", padding: "6px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "12px", color: "#dc2626" }}>
              {sendingError}
            </div>
          )}
        </div>

        {/* 6 Digit Inputs */}
        <form onSubmit={handleVerifySubmit}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "clamp(4px, 1.8vw, 8px)",
              margin: "20px 0 16px",
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
                  width: "clamp(38px, 11.5vw, 46px)",
                  height: "clamp(46px, 13vw, 52px)",
                  textAlign: "center",
                  fontSize: "clamp(18px, 5vw, 22px)",
                  fontWeight: "700",
                  color: "#0f172a",
                  background: "#ffffff",
                  border: digit ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                  borderRadius: "11px",
                  outline: "none",
                  boxSizing: "border-box",
                  boxShadow: digit ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
                  transition: "all 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
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

          {infoMessage && (
            <div
              style={{
                padding: "9px 12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "9px",
                color: "#15803d",
                fontSize: "12.5px",
                textAlign: "center",
                marginBottom: "14px",
                lineHeight: 1.4,
              }}
            >
              {infoMessage}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "9px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "9px",
                color: "#dc2626",
                fontSize: "12.5px",
                textAlign: "center",
                marginBottom: "14px",
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          {/* Verify & Create Account Button */}
          <button
            type="submit"
            disabled={isVerifying || !isOtpComplete}
            style={{
              width: "100%",
              height: "46px",
              background:
                isVerifying || !isOtpComplete
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "11px",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: isVerifying || !isOtpComplete ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isOtpComplete ? "0 4px 14px rgba(25, 96, 247, 0.35)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {isVerifying ? (
              <>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #ffffff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "qlSpin 0.75s linear infinite",
                  }}
                />
                <span>Verifying & Creating Account...</span>
              </>
            ) : (
              <>
                <span>Verify & Create Account</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Resend Code Option */}
        <div style={{ textAlign: "center", marginTop: "18px" }}>
          {countdown > 0 ? (
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
              Resend code in <b style={{ color: "#0f172a" }}>{countdown}s</b>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={isResending}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 8px",
                textDecoration: "underline",
              }}
            >
              {isResending ? "Sending fresh code..." : "Resend 6-Digit Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

export default EmailOtpModal;
