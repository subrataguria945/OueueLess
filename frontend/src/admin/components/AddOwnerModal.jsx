import React, { useEffect } from "react";
import { useAdmin } from "../AdminContext";
import { getOwnerPasswordStrength } from "../adminData";

export function AddOwnerModal() {
  const {
    addOwnerModalOpen,
    setAddOwnerModalOpen,
    newOwnerForm,
    setNewOwnerForm,
    isAddingOwner,
    addOwnerError,
    setAddOwnerError,
    showAddOwnerPassword,
    setShowAddOwnerPassword,
    showAddOwnerConfirmPassword,
    setShowAddOwnerConfirmPassword,
    handleAddOwnerSubmit,
  } = useAdmin();

  // Reset form whenever modal opens to prevent browser autofill or stale values
  useEffect(() => {
    if (addOwnerModalOpen) {
      setNewOwnerForm({
        fullname: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        max_shop_count: 5,
        maxShops: 5,
        address: "",
      });
      setAddOwnerError("");
      setShowAddOwnerPassword(false);
      setShowAddOwnerConfirmPassword(false);
    }
  }, [addOwnerModalOpen, setNewOwnerForm, setAddOwnerError, setShowAddOwnerPassword, setShowAddOwnerConfirmPassword]);

  if (!addOwnerModalOpen) return null;

  const passwordStrength = getOwnerPasswordStrength(newOwnerForm.password || "");
  const isPasswordStrong = passwordStrength === 4;
  const isPasswordMatching = Boolean(
    newOwnerForm.password &&
    newOwnerForm.confirmPassword &&
    newOwnerForm.password === newOwnerForm.confirmPassword
  );
  const canSubmit = !isAddingOwner && isPasswordStrong && isPasswordMatching;

  return (
    <div className="adm-modal-backdrop" onClick={() => setAddOwnerModalOpen(false)}>
      <div className="adm-modal-dialog adm-modal-compact adm-modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">Register New Business Owner</h3>
            <p className="adm-modal-subtitle">Add a verified business owner to manage counter queues and outlets.</p>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setAddOwnerModalOpen(false)}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {addOwnerError && (
          <div className="adm-modal-alert">
            <span>⚠️</span>
            <span>{addOwnerError}</span>
          </div>
        )}

        <form onSubmit={handleAddOwnerSubmit} autoComplete="off" className="adm-modal-form">
          {/* Honeypot traps to prevent aggressive browser autofill of saved admin credentials */}
          <div style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, opacity: 0, overflow: "hidden" }} aria-hidden="true">
            <input type="text" name="chrome_prevent_username_autofill" tabIndex={-1} autoComplete="off" />
            <input type="password" name="chrome_prevent_password_autofill" tabIndex={-1} autoComplete="new-password" />
          </div>

          <div className="adm-modal-body">
            {/* Form Grid (2 Columns, perfectly aligned) */}
            <div className="adm-form-grid-2">
              {/* Row 1: Full Name & Email */}
              <div className="adm-field">
                <label className="adm-label">
                  Owner Full Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="new_owner_fullname"
                  id="new_owner_fullname"
                  autoComplete="off"
                  className="adm-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={newOwnerForm.fullname || newOwnerForm.name || ""}
                  onChange={(e) => {
                    setNewOwnerForm({ ...newOwnerForm, fullname: e.target.value, name: e.target.value });
                    if (addOwnerError) setAddOwnerError("");
                  }}
                  autoFocus
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  required
                  name="new_owner_email"
                  id="new_owner_email"
                  autoComplete="off"
                  className="adm-input"
                  placeholder="e.g. ramesh@example.com"
                  value={newOwnerForm.email}
                  onChange={(e) => {
                    setNewOwnerForm({ ...newOwnerForm, email: e.target.value });
                    if (addOwnerError) setAddOwnerError("");
                  }}
                />
              </div>

              {/* Row 2: Contact Phone Number & Max Shops */}
              <div className="adm-field">
                <label className="adm-label">
                  Contact Phone Number <span className="req">*</span>{" "}
                  <span style={{ fontSize: "10.5px", color: "var(--adm-text-faint)", fontWeight: "normal" }}>
                    (10 digits)
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  name="new_owner_phone"
                  id="new_owner_phone"
                  maxLength={10}
                  className="adm-input"
                  placeholder="e.g. 9876543210"
                  value={newOwnerForm.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setNewOwnerForm({ ...newOwnerForm, phone: digits });
                    if (addOwnerError) setAddOwnerError("");
                  }}
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Max Shops Allowed <span className="req">*</span>
                </label>
                <input
                  type="number"
                  required
                  name="new_owner_max_shop_count"
                  id="new_owner_max_shop_count"
                  min={1}
                  max={50}
                  className="adm-input"
                  placeholder="e.g. 5"
                  value={newOwnerForm.max_shop_count ?? newOwnerForm.maxShops ?? 5}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setNewOwnerForm({
                      ...newOwnerForm,
                      max_shop_count: isNaN(val) ? "" : val,
                      maxShops: isNaN(val) ? "" : val,
                    });
                    if (addOwnerError) setAddOwnerError("");
                  }}
                />
              </div>

              {/* Row 3: Business Address (Spans full width across both columns) */}
              <div className="adm-field adm-field-col-span-2">
                <label className="adm-label">
                  Business / Outlet Address <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="new_owner_address"
                  id="new_owner_address"
                  autoComplete="off"
                  className="adm-input"
                  placeholder="e.g. 12, Main Road, Salt Lake, Kolkata, WB"
                  value={newOwnerForm.address}
                  onChange={(e) => {
                    setNewOwnerForm({ ...newOwnerForm, address: e.target.value });
                    if (addOwnerError) setAddOwnerError("");
                  }}
                />
              </div>
            </div>

            {/* Section 2: Security & Credentials */}
            <div className="adm-security-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 className="adm-security-title" style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--adm-accent)" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Account Security Credentials</span>
                </h4>
                <span style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>
                  Set initial strong password for login
                </span>
              </div>

              <div className="adm-form-grid-2">
                {/* Login Password */}
                <div className="adm-field">
                  <label className="adm-label">
                    Login Password <span className="req">*</span>
                  </label>
                  <div className="adm-password-wrapper">
                    <input
                      type={showAddOwnerPassword ? "text" : "password"}
                      required
                      name="new_owner_password"
                      id="new_owner_password"
                      autoComplete="new-password"
                      className="adm-input"
                      placeholder="Minimum 8 characters"
                      value={newOwnerForm.password}
                      onChange={(e) => {
                        setNewOwnerForm({ ...newOwnerForm, password: e.target.value });
                        if (addOwnerError) setAddOwnerError("");
                      }}
                    />
                    <button
                      type="button"
                      className="adm-eye-toggle"
                      onClick={() => setShowAddOwnerPassword(!showAddOwnerPassword)}
                      tabIndex={-1}
                    >
                      {showAddOwnerPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Password Strength Inline Feedback */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "3px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ display: "flex", gap: "3px", width: "70px" }}>
                        {[1, 2, 3, 4].map((step) => {
                          const active = passwordStrength >= step;
                          return (
                            <span
                              key={step}
                              style={{
                                height: "3.5px",
                                flex: 1,
                                borderRadius: "2px",
                                backgroundColor: active
                                  ? passwordStrength === 4
                                    ? "#16a34a"
                                    : passwordStrength === 3
                                    ? "#eab308"
                                    : passwordStrength === 2
                                    ? "#f97316"
                                    : "#ef4444"
                                  : "var(--adm-border)",
                                transition: "background-color 0.2s ease",
                              }}
                            />
                          );
                        })}
                      </div>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          color:
                            passwordStrength === 4
                              ? "#16a34a"
                              : passwordStrength === 3
                              ? "#eab308"
                              : passwordStrength === 2
                              ? "#f97316"
                              : passwordStrength === 1
                              ? "#ef4444"
                              : "var(--adm-text-faint)",
                        }}
                      >
                        {passwordStrength === 0
                          ? "Strength"
                          : passwordStrength === 4
                          ? "Strong ✓"
                          : passwordStrength === 3
                          ? "Good"
                          : passwordStrength === 2
                          ? "Fair"
                          : "Weak"}
                      </span>
                    </div>

                    <span style={{ fontSize: "10px", color: isPasswordStrong ? "#16a34a" : "var(--adm-text-faint)" }}>
                      {isPasswordStrong ? "✓ Requirements met" : "A-Z, a-z, 0-9, symbol"}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="adm-field">
                  <label className="adm-label">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="adm-password-wrapper">
                    <input
                      type={showAddOwnerConfirmPassword ? "text" : "password"}
                      required
                      name="new_owner_confirm_password"
                      id="new_owner_confirm_password"
                      autoComplete="new-password"
                      className={`adm-input ${
                        newOwnerForm.confirmPassword
                          ? isPasswordMatching
                            ? "adm-input-success"
                            : "adm-input-danger"
                          : ""
                      }`}
                      placeholder="Re-enter password"
                      value={newOwnerForm.confirmPassword}
                      onChange={(e) => {
                        setNewOwnerForm({ ...newOwnerForm, confirmPassword: e.target.value });
                        if (addOwnerError) setAddOwnerError("");
                      }}
                    />
                    <button
                      type="button"
                      className="adm-eye-toggle"
                      onClick={() => setShowAddOwnerConfirmPassword(!showAddOwnerConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showAddOwnerConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Match Inline Feedback */}
                  <div style={{ marginTop: "3px", fontSize: "10.5px", minHeight: "16px" }}>
                    {!newOwnerForm.confirmPassword ? (
                      <span style={{ color: "var(--adm-text-faint)" }}>Re-enter to verify match</span>
                    ) : isPasswordMatching ? (
                      <span style={{ color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        ✓ Passwords match
                      </span>
                    ) : (
                      <span style={{ color: "#dc2626", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        ✕ Passwords do not match
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="adm-modal-footer">
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={() => setAddOwnerModalOpen(false)}
              disabled={isAddingOwner}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={!canSubmit}
              title={
                !isPasswordStrong
                  ? "Password must reach Strong level to register owner"
                  : !isPasswordMatching
                  ? "Confirm password must match login password"
                  : "Register Owner"
              }
            >
              {isAddingOwner ? "Registering on Server..." : "Register Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

