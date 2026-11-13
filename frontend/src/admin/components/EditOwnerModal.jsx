import React from "react";
import { useAdmin } from "../AdminContext";

export function EditOwnerModal() {
  const {
    editOwnerModalOpen,
    setEditOwnerModalOpen,
    editingOwner,
    editOwnerForm,
    setEditOwnerForm,
    isSavingOwner,
    editOwnerError,
    setEditOwnerError,
    handleSaveOwner,
  } = useAdmin();

  if (!editOwnerModalOpen || !editingOwner) return null;

  return (
    <div className="adm-modal-backdrop" onClick={() => setEditOwnerModalOpen(false)}>
      <div className="adm-modal-dialog adm-modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">Edit Shop Owner Details</h3>
            <p className="adm-modal-subtitle">
              Update merchant identity, contact number, store quota, and subscription.
            </p>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setEditOwnerModalOpen(false)}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {editOwnerError && (
          <div className="adm-modal-alert">
            <span>⚠️</span>
            <span>{editOwnerError}</span>
          </div>
        )}

        <form onSubmit={handleSaveOwner} autoComplete="off" className="adm-modal-form">
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
                  value={editOwnerForm.name}
                  onChange={(e) => {
                    setEditOwnerForm({ ...editOwnerForm, name: e.target.value });
                    if (editOwnerError) setEditOwnerError("");
                  }}
                  autoFocus
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Official Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="adm-input"
                  placeholder="e.g. ramesh@example.com"
                  value={editOwnerForm.email}
                  onChange={(e) => {
                    setEditOwnerForm({ ...editOwnerForm, email: e.target.value });
                    if (editOwnerError) setEditOwnerError("");
                  }}
                />
              </div>
            </div>

            {/* Row 2: Phone & Outlet Quota */}
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
                  value={editOwnerForm.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setEditOwnerForm({ ...editOwnerForm, phone: digits });
                    if (editOwnerError) setEditOwnerError("");
                  }}
                />
                <span className="adm-field-hint">Numbers only, exactly 10 digits</span>
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Allowed Store Outlets Quota <span className="req">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  className="adm-input"
                  value={editOwnerForm.maxShops}
                  onChange={(e) => {
                    setEditOwnerForm({ ...editOwnerForm, maxShops: e.target.value });
                    if (editOwnerError) setEditOwnerError("");
                  }}
                />
                <span className="adm-field-hint">Maximum counters/shops allowed</span>
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
                value={editOwnerForm.address}
                onChange={(e) => {
                  setEditOwnerForm({ ...editOwnerForm, address: e.target.value });
                  if (editOwnerError) setEditOwnerError("");
                }}
              />
            </div>

            {/* Row 4: Plan & Status */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">Subscription Tier</label>
                <select
                  className="adm-select"
                  value={editOwnerForm.plan}
                  onChange={(e) => {
                    setEditOwnerForm({ ...editOwnerForm, plan: e.target.value });
                    if (editOwnerError) setEditOwnerError("");
                  }}
                >
                  <option value="Free Trial">Free Trial</option>
                  <option value="Starter Tier">Starter Tier</option>
                  <option value="Professional Tier">Professional Tier</option>
                  <option value="Enterprise Pro">Enterprise Pro</option>
                </select>
              </div>

              <div className="adm-field">
                <label className="adm-label">Account Status</label>
                <select
                  className="adm-select"
                  value={editOwnerForm.status}
                  onChange={(e) => {
                    setEditOwnerForm({ ...editOwnerForm, status: e.target.value });
                    if (editOwnerError) setEditOwnerError("");
                  }}
                >
                  <option value="Active">Active (Operating)</option>
                  <option value="Suspended">Suspended (Disabled)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="adm-modal-footer">
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={() => setEditOwnerModalOpen(false)}
              disabled={isSavingOwner}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={isSavingOwner}
            >
              {isSavingOwner ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
