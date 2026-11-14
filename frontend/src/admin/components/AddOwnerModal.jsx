import React from "react";
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

  if (!addOwnerModalOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const passwordStrength = getOwnerPasswordStrength(newOwnerForm.password);
  const isPasswordStrong = passwordStrength === 4;
  const canSubmit = !isAddingOwner && isPasswordStrong;

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
          <div className="adm-modal-body">
            {/* Row 1: Name & Email */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">
                  Owner Full Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="adm-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={newOwnerForm.name}
                  onChange={(e) => {
                    setNewOwnerForm({ ...newOwnerForm, name: e.target.value });
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

            {/* Row 2: Phone & Joined Date */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">
                  Contact Phone Number (10 Digits) <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  required
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
                  Joined Date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={todayStr}
                  className="adm-input"
                  value={newOwnerForm.joinedDate}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected > todayStr) {
                      setAddOwnerError("Joined Date cannot be in the future (cannot exceed today).");
                      return;
                    }
                    setNewOwnerForm({ ...newOwnerForm, joinedDate: selected });
                    if (addOwnerError) setAddOwnerError("");
                  }}
                />
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="adm-field">
              <label className="adm-label">
                Business / Residential Address <span className="req">*</span>
              </label>
              <input
                type="text"
                required
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
                  <label className="adm-label">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="adm-password-wrapper">
                    <input
                      type={showAddOwnerConfirmPassword ? "text" : "password"}
                      required
                      className="adm-input"
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

              {/* Password Strength Meter */}
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
                    ? "✓ Strong password criteria met. Register button is unlocked."
                    : "🔒 Register button is locked: Password must include uppercase, lowercase, number, and special symbol (min 8 chars)."}
                </p>
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
              title={!isPasswordStrong ? "Password must reach Strong level to register owner" : "Register Owner"}
            >
              {isAddingOwner ? "Registering on Server..." : "Register Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

