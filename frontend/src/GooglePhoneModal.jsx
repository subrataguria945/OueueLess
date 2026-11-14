import { useState } from "react";

export function GooglePhoneModal({ isOpen, googleUser, onSubmit, onCancel }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !googleUser) return null;

  const handlePhoneChange = (e) => {
    // Only allow numbers and limit to 10 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit(phone);
    } catch (err) {
      setError(err?.message || "Failed to save mobile number. Please try again.");
      setIsSubmitting(false);
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
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        zIndex: 9999,
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
          borderRadius: "20px",
          padding: "36px 32px 30px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.2)",
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 12px",
              borderRadius: "14px",
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: "19px", fontWeight: "700", color: "#0f172a" }}>
            Complete Your Account
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.45 }}>
            Please provide your mobile number to complete your QueueLess registration.
          </p>
        </div>

        {/* User Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "18px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {googleUser.name}
            </div>
            <div style={{ fontSize: "12.5px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>
              {googleUser.email}
            </div>
          </div>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: "600",
              color: "#16a34a",
              background: "#dcfce7",
              padding: "4px 10px",
              borderRadius: "12px",
              flexShrink: 0,
            }}
          >
            ✓ Google
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="ql-google-mobile"
              style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}
            >
              Mobile Number
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div
                style={{
                  width: "60px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f8fafc",
                  border: "1.5px solid #dde4f0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                +91
              </div>
              <input
                id="ql-google-mobile"
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={handlePhoneChange}
                autoFocus
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 12px",
                  border: "1.5px solid #dde4f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.14)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#dde4f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            {error && (
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#dc2626" }}>
                {error}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "44px",
              background: isSubmitting
                ? "#94a3b8"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isSubmitting ? "none" : "0 4px 14px rgba(25, 96, 247, 0.35)",
              transition: "all 0.15s ease",
            }}
          >
            {isSubmitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
