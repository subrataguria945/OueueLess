import React from "react";
import { useAdmin } from "../AdminContext";

export function SettingsPage() {
  const {
    adminProfile,
    theme,
    toggleTheme,
    setEditAdminModalOpen,
    setEditAdminForm,
    setCropModalOpen,
    setRawSelectedImage,
    handleRemoveAvatar,
    showToast,
  } = useAdmin();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (JPG, PNG or WebP).", "error");
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
    <div className="adm-page-body">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Admin Profile & Settings</h1>
          <p className="adm-page-desc">System administrator account, identity, and interface preferences.</p>
        </div>
      </div>

      <div className="adm-grid-2-1">
        {/* Left Column: Admin Profile Card */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Administrator Profile</h3>
              <p className="adm-card-desc">Personal account details synced directly with the database</p>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              onClick={() => {
                setEditAdminForm(adminProfile);
                setEditAdminModalOpen(true);
              }}
            >
              Edit Details
            </button>
          </div>

          <div className="adm-card-body">
            {/* Avatar & Basic Info */}
            <div className="adm-profile-top-strip">
              <div className="adm-profile-avatar-box">
                {adminProfile.avatarImg ? (
                  <img src={adminProfile.avatarImg} alt={adminProfile.name} className="adm-profile-avatar-img" />
                ) : (
                  <div className="adm-avatar-circle-lg">
                    {adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
              </div>

              <div className="adm-profile-main-meta">
                <div className="adm-profile-name-row">
                  <h2 className="adm-profile-name">{adminProfile.name}</h2>
                  <span className="adm-badge adm-badge-neutral">{adminProfile.role}</span>
                </div>
                <div className="adm-profile-email">{adminProfile.email}</div>
                <div className="adm-profile-dept">{adminProfile.department}</div>

                <div className="adm-photo-actions" style={{ marginTop: "12px" }}>
                  <label className="adm-btn adm-btn-secondary adm-btn-sm" style={{ cursor: "pointer" }}>
                    <span>Upload New Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                  </label>
                  {adminProfile.avatarImg && (
                    <button
                      type="button"
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      onClick={handleRemoveAvatar}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Fields Grid */}
            <div className="adm-detail-grid" style={{ marginTop: "24px" }}>
              <div className="adm-detail-item">
                <span className="adm-detail-label">Full Name</span>
                <span className="adm-detail-value">{adminProfile.name}</span>
              </div>

              <div className="adm-detail-item">
                <span className="adm-detail-label">Email Address</span>
                <span className="adm-detail-value">{adminProfile.email}</span>
              </div>

              <div className="adm-detail-item">
                <span className="adm-detail-label">Contact Phone</span>
                <span className="adm-detail-value">{adminProfile.phone || "Not configured"}</span>
              </div>

              <div className="adm-detail-item">
                <span className="adm-detail-label">City / Address</span>
                <span className="adm-detail-value">{adminProfile.address || "Not configured"}</span>
              </div>

              <div className="adm-detail-item">
                <span className="adm-detail-label">Department</span>
                <span className="adm-detail-value">{adminProfile.department}</span>
              </div>

              <div className="adm-detail-item">
                <span className="adm-detail-label">Role Clearance</span>
                <span className="adm-detail-value">{adminProfile.accessLevel}</span>
              </div>
            </div>

            {/* Bio Box */}
            <div style={{ marginTop: "20px" }}>
              <span className="adm-detail-label">Administrator Bio</span>
              <p className="adm-bio-text">{adminProfile.bio || "No biography provided."}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Security */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Appearance Card */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h3 className="adm-card-title">Theme & Appearance</h3>
                <p className="adm-card-desc">Switch between light and dark modes</p>
              </div>
            </div>
            <div className="adm-card-body">
              <div className="adm-theme-toggle-row">
                <span className="adm-font-medium">Current Mode</span>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={toggleTheme}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {theme === "dark" ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                      <span>Dark Theme (Switch to Light)</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                      <span>Light Theme (Switch to Dark)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h3 className="adm-card-title">Security & Session</h3>
                <p className="adm-card-desc">Authentication and two-factor clearance</p>
              </div>
            </div>
            <div className="adm-card-body">
              <div className="adm-detail-item" style={{ marginBottom: "12px" }}>
                <span className="adm-detail-label">Two-Factor Authentication</span>
                <span className="adm-badge adm-badge-success">{adminProfile.twoFactor}</span>
              </div>
              <div className="adm-detail-item">
                <span className="adm-detail-label">Last Session Login</span>
                <span className="adm-detail-value">{adminProfile.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

