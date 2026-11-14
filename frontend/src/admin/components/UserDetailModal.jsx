import React from "react";
import { useAdmin } from "../AdminContext";
import { getRoleBadgeClass } from "../adminData";

export function UserDetailModal() {
  const { selectedUserDetail, setSelectedUserDetail, handleUpdateUserStatus, handleOpenEditUser } = useAdmin();

  if (!selectedUserDetail) return null;

  const isActive = selectedUserDetail.status === "Active";

  return (
    <div className="adm-modal-backdrop" onClick={() => setSelectedUserDetail(null)}>
      <div className="adm-modal-dialog adm-modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div className="adm-header-avatar-group">
            <div className="adm-avatar-circle" style={{ width: "50px", height: "50px", fontSize: "18px" }}>
              {selectedUserDetail.avatarImg ? (
                <img src={selectedUserDetail.avatarImg} alt={selectedUserDetail.name} className="adm-avatar-img" />
              ) : (
                selectedUserDetail.name ? selectedUserDetail.name.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 className="adm-modal-title" style={{ fontSize: "18px" }}>{selectedUserDetail.name}</h3>
                <span className={getRoleBadgeClass(selectedUserDetail.role)}>{selectedUserDetail.role || "User"}</span>
                <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                  {selectedUserDetail.status}
                </span>
              </div>
              <p className="adm-modal-subtitle" style={{ fontSize: "13px", marginTop: "4px" }}>
                {selectedUserDetail.email || "No email registered"} • Token ID: <strong style={{ color: "var(--adm-text)" }}>{selectedUserDetail.token}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setSelectedUserDetail(null)}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="adm-modal-body">
          {/* Quick Highlight Cards */}
          <div className="adm-detail-highlight-row">
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Account Clearance</span>
              <span className="adm-highlight-val">Regular Customer</span>
            </div>
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Verification</span>
              <span className="adm-highlight-val" style={{ color: selectedUserDetail.emailVerified ? "#16a34a" : "#ca8a04" }}>
                {selectedUserDetail.emailVerified ? "✓ Email Verified" : "⏳ Pending"}
              </span>
            </div>
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Registered Since</span>
              <span className="adm-highlight-val">{selectedUserDetail.joinedOn || "Recently"}</span>
            </div>
          </div>

          {/* 2-Column Information Panels */}
          <div className="adm-detail-two-col">
            <div className="adm-detail-panel">
              <h4 className="adm-panel-title">
                <span>👤</span>
                <span>Personal & Contact Information</span>
              </h4>
              <div className="adm-panel-rows">
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Full Name</span>
                  <span className="adm-panel-value">{selectedUserDetail.name}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Email Address</span>
                  <span className="adm-panel-value">{selectedUserDetail.email || "—"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Contact Number</span>
                  <span className="adm-panel-value">{selectedUserDetail.phone || "—"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">City / Address</span>
                  <span className="adm-panel-value">{selectedUserDetail.address || "—"}</span>
                </div>
              </div>
            </div>

            <div className="adm-detail-panel">
              <h4 className="adm-panel-title">
                <span>🛡️</span>
                <span>Account & Access Details</span>
              </h4>
              <div className="adm-panel-rows">
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Customer ID</span>
                  <span className="adm-panel-value font-mono">{selectedUserDetail.token || "USR-0001"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Role Classification</span>
                  <span className="adm-panel-value">{selectedUserDetail.role || "User"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Account Status</span>
                  <span className="adm-panel-value">
                    <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                      {selectedUserDetail.status}
                    </span>
                  </span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Portal Access</span>
                  <span className="adm-panel-value">Customer Queue Portal & Mobile App</span>
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
            onClick={() => setSelectedUserDetail(null)}
          >
            Close
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => {
              const currentUser = selectedUserDetail;
              setSelectedUserDetail(null);
              handleOpenEditUser(currentUser);
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Customer
          </button>
          <button
            type="button"
            className={`adm-btn ${isActive ? "adm-btn-danger" : "adm-btn-primary"}`}
            onClick={() => handleUpdateUserStatus(selectedUserDetail.id, isActive ? "Suspended" : "Active")}
          >
            {isActive ? "Suspend Customer Account" : "Activate Customer Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

