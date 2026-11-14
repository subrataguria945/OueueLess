import React from "react";
import { useAdmin } from "../AdminContext";

export function EditAdminModal() {
  const {
    editAdminModalOpen,
    setEditAdminModalOpen,
    editAdminForm,
    setEditAdminForm,
    isSavingProfile,
    adminProfileError,
    handleSaveAdminProfile,
    adminProfile,
    setCropModalOpen,
    setRawSelectedImage,
    handleRemoveAvatar,
  } = useAdmin();

  if (!editAdminModalOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawSelectedImage(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="adm-modal-backdrop" onClick={() => setEditAdminModalOpen(false)}>
      <div className="adm-modal-dialog adm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">Edit Administrator Profile</h3>
            <p className="adm-modal-subtitle">Update your personal contact details and operational bio.</p>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setEditAdminModalOpen(false)}
          >
            ✕
          </button>
        </div>

        {adminProfileError && (
          <div className="adm-modal-alert">
            <span>⚠️</span>
            <span>{adminProfileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAdminProfile} className="adm-modal-form">
          <div className="adm-modal-body">
            {/* Avatar Row */}
            <div className="adm-profile-photo-card">
              <div className="adm-avatar-wrap">
                {editAdminForm.avatarImg ? (
                  <img src={editAdminForm.avatarImg} alt="Avatar" className="adm-avatar-img" />
                ) : (
                  <div className="adm-avatar-fallback">
                    {editAdminForm.name ? editAdminForm.name.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
              </div>
              <div className="adm-photo-actions">
                <label className="adm-btn adm-btn-secondary adm-btn-sm" style={{ cursor: "pointer" }}>
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                </label>
                {editAdminForm.avatarImg && (
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    onClick={handleRemoveAvatar}
                  >
                    Remove
                  </button>
                )}
                <span className="adm-field-hint">JPG, PNG or WebP up to 5MB</span>
              </div>
            </div>

            {/* Row 1: Name & Email */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  className="adm-input"
                  value={editAdminForm.name || ""}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })}
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Email Address <span className="adm-pill-tag">System Protected</span>
                </label>
                <input
                  type="email"
                  readOnly
                  disabled
                  className="adm-input adm-input-disabled"
                  value={editAdminForm.email || adminProfile.email || ""}
                />
              </div>
            </div>

            {/* Row 2: Phone & Address */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">Contact Phone</label>
                <input
                  type="tel"
                  className="adm-input"
                  value={editAdminForm.phone || ""}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, phone: e.target.value })}
                  placeholder="e.g. 07047104672"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">City / Address</label>
                <input
                  type="text"
                  className="adm-input"
                  value={editAdminForm.address || ""}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, address: e.target.value })}
                  placeholder="e.g. Kolkata, WB"
                />
              </div>
            </div>

            {/* Row 3: Department & Role Clearance */}
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">Department / Designation</label>
                <input
                  type="text"
                  className="adm-input"
                  value={editAdminForm.department || ""}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, department: e.target.value })}
                  placeholder="System Architecture & Operations"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Role Clearance <span className="adm-pill-tag">System Enforced</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="adm-input adm-input-disabled"
                  value={editAdminForm.accessLevel || "Role Clearance (System Enforced)"}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="adm-field">
              <label className="adm-label">Administrator Bio & Responsibilities</label>
              <textarea
                rows={3}
                className="adm-textarea"
                value={editAdminForm.bio || ""}
                onChange={(e) => setEditAdminForm({ ...editAdminForm, bio: e.target.value })}
                placeholder="Platform administrator responsibilities..."
              />
            </div>
          </div>

          <div className="adm-modal-footer">
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={() => setEditAdminModalOpen(false)}
              disabled={isSavingProfile}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? "Saving to Database..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

