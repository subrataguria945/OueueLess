import React from "react";
import { useAdmin } from "../AdminContext";

export function EditUserModal() {
  const {
    editUserModalOpen,
    setEditUserModalOpen,
    editingUser,
    editUserForm,
    setEditUserForm,
    isSavingUser,
    editUserError,
    setEditUserError,
    handleSaveUser,
  } = useAdmin();

  if (!editUserModalOpen || !editingUser) return null;

  return (
    <div className="adm-modal-backdrop" onClick={() => setEditUserModalOpen(false)}>
      <div className="adm-modal-dialog adm-modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">Edit Customer Details</h3>
            <p className="adm-modal-subtitle">
              Update registered customer profile, contact details, and account status.
            </p>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setEditUserModalOpen(false)}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {editUserError && (
          <div className="adm-modal-alert">
            <span>⚠️</span>
            <span>{editUserError}</span>
          </div>
        )}

        <form onSubmit={handleSaveUser} autoComplete="off" className="adm-modal-form">
          <div className="adm-modal-body">
            {/* Row 1: Name & Email */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">
                  Customer Full Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="adm-input"
                  placeholder="e.g. Rahul Sharma"
                  value={editUserForm.name}
                  onChange={(e) => {
                    setEditUserForm({ ...editUserForm, name: e.target.value });
                    if (editUserError) setEditUserError("");
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
                  placeholder="e.g. rahul@example.com"
                  value={editUserForm.email}
                  onChange={(e) => {
                    setEditUserForm({ ...editUserForm, email: e.target.value });
                    if (editUserError) setEditUserError("");
                  }}
                />
              </div>
            </div>

            {/* Row 2: Phone & Status */}
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
                  value={editUserForm.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setEditUserForm({ ...editUserForm, phone: digits });
                    if (editUserError) setEditUserError("");
                  }}
                />
                <span className="adm-field-hint">Numbers only, exactly 10 digits</span>
              </div>

              <div className="adm-field">
                <label className="adm-label">Account Status</label>
                <select
                  className="adm-select"
                  value={editUserForm.status}
                  onChange={(e) => {
                    setEditUserForm({ ...editUserForm, status: e.target.value });
                    if (editUserError) setEditUserError("");
                  }}
                >
                  <option value="Active">Active (Operating)</option>
                  <option value="Suspended">Suspended (Disabled)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="adm-field">
              <label className="adm-label">
                City / Residential Address <span className="req">*</span>
              </label>
              <input
                type="text"
                required
                className="adm-input"
                placeholder="e.g. 45 Park Street, Kolkata, WB"
                value={editUserForm.address}
                onChange={(e) => {
                  setEditUserForm({ ...editUserForm, address: e.target.value });
                  if (editUserError) setEditUserError("");
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="adm-modal-footer">
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={() => setEditUserModalOpen(false)}
              disabled={isSavingUser}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={isSavingUser}
            >
              {isSavingUser ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
