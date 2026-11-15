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
      <div className="adm-modal-dialog adm-modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">Register New Shop Owner</h3>
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
            {/* Row 1: Name & Email */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">
                  Owner Full Name (fullname) <span className="req">*</span>
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
                  Email Address (email) <span className="req">*</span>
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
            </div>

            {/* Row 2: Phone & Max Shop Count */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">
                  Contact Phone Number (phone) <span className="req">*</span>
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
                <span className="adm-field-hint">Numbers only, exactly 10 digits</span>
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Max Shop Count (max_shop_count) <span className="req">*</span>
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
                <span className="adm-field-hint">Maximum number of shops this owner can register</span>
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="adm-field">
              <label className="adm-label">
                Business / Residential Address (address) <span className="req">*</span>
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

            {/* Security Section: Password */}
            <div className="adm-security-card">
              <div className="adm-security-header">
                <div>
                  <h4 className="adm-security-title">Account Security Credentials</h4>
                  <p className="adm-security-sub">Set an initial strong password for the shop owner to log in.</p>
                </div>
              </div>

              <div className="adm-form-grid">
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
                </div>

                <div className="adm-field">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label className="adm-label" style={{ marginBottom: 0 }}>
                      Confirm Password <span className="req">*</span>
                    </label>
                    {newOwnerForm.confirmPassword && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: isPasswordMatching ? "#16a34a" : "#dc2626",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        {isPasswordMatching ? "✓ Passwords Match" : "✕ Passwords Not Match"}
                      </span>
                    )}
                  </div>
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
                </div>
              </div>

              {/* Password Strength & Match Status Box */}
              <div className="adm-strength-box">
                <div className="adm-strength-header">
                  <span className="adm-strength-label">Password Strength:</span>
                  <div className="adm-strength-bars">
                    {[1, 2, 3, 4].map((step) => {
                      const active = passwordStrength >= step;
                      return (
                        <span
                          key={step}
                          className={`adm-strength-segment ${active ? `active-${passwordStrength}` : ""}`}
                        />
                      );
                    })}
                  </div>
                  {newOwnerForm.password && (
                    <span className={`adm-strength-text strength-${passwordStrength}`}>
                      {passwordStrength <= 1 && "Weak"}
                      {passwordStrength === 2 && "Fair"}
                      {passwordStrength === 3 && "Good"}
                      {passwordStrength === 4 && "Strong ✓"}
                    </span>
                  )}
                </div>
                <p className="adm-strength-hint">
                  {isPasswordStrong
                    ? "✓ Strong password criteria met."
                    : "🔒 Password must include uppercase, lowercase, number, and special symbol (min 8 chars)."}
                </p>

                {/* Password Match Status Row */}
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "8px",
                    borderTop: "1px dashed var(--adm-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="adm-strength-label">Password Match:</span>
                  {!newOwnerForm.confirmPassword ? (
                    <span style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>
                      Enter confirm password to verify
                    </span>
                  ) : isPasswordMatching ? (
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#16a34a",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ✓ Passwords Match
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#dc2626",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ✕ Passwords Do Not Match
                    </span>
                  )}
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

