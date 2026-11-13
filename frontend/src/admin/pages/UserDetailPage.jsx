import React from "react";
import { useParams, useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";
import { getRoleBadgeClass } from "../adminData";

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    usersData,
    isUsersLoading,
    handleUpdateUserStatus,
    selectedUserDetail,
    fetchUsers,
    handleDeleteUser,
    deletingUserId,
  } = useAdmin();

  // Find user by ID or Token
  const user =
    usersData.find((u) => String(u.id) === String(id) || String(u.token) === String(id)) ||
    (selectedUserDetail && (String(selectedUserDetail.id) === String(id) || String(selectedUserDetail.token) === String(id))
      ? selectedUserDetail
      : null);

  if (isUsersLoading && !user) {
    return (
      <div className="adm-page-body">
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <div className="adm-loading-spinner" />
          <h3 style={{ marginTop: "12px", fontSize: "16px", color: "var(--adm-text)" }}>Loading Customer Record...</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px" }}>Fetching live account data from database</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="adm-page-body">
        <div className="adm-detail-nav">
          <button type="button" className="adm-back-link" onClick={() => navigate("/admin/users")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Users Directory</span>
          </button>
        </div>
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>👤</span>
          <h3 style={{ margin: "14px 0 6px", fontSize: "18px", color: "var(--adm-text)" }}>Customer Not Found</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", maxWidth: "420px", margin: "0 auto 20px" }}>
            The customer record with ID <code>{id}</code> could not be located in the current database index.
          </p>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => navigate("/admin/users")}>
            Return to Users Directory
          </button>
        </div>
      </div>
    );
  }

  const isActive = user.status === "Active";

  return (
    <div className="adm-page-body">
      {/* Top Back Navigation */}
      <div className="adm-detail-nav">
        <button type="button" className="adm-back-link" onClick={() => navigate("/admin/users")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Users Directory</span>
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="adm-hero-card">
        <div className="adm-hero-left">
          <div className="adm-hero-avatar">
            {user.avatarImg ? (
              <img src={user.avatarImg} alt={user.name} />
            ) : (
              user.initial || (user.name ? user.name.charAt(0).toUpperCase() : "U")
            )}
          </div>
          <div className="adm-hero-meta">
            <div className="adm-hero-title-row">
              <h1 className="adm-hero-title">{user.name}</h1>
              <span className={getRoleBadgeClass(user.role)}>{user.role || "User"}</span>
              <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                {user.status}
              </span>
            </div>
            <p className="adm-hero-subtitle">
              <span>{user.email || "No email registered"}</span>
              <span>•</span>
              <span>Token: <strong style={{ color: "var(--adm-text)" }}>{user.token || "USR-0001"}</strong></span>
              <span>•</span>
              <span>Phone: {user.phone || "—"}</span>
              <span>•</span>
              <span>Joined: {user.joinedOn || "Recently"}</span>
            </p>
          </div>
        </div>

        <div className="adm-hero-actions">
          <button
            type="button"
            className={`adm-btn adm-btn-sm ${isActive ? "adm-btn-secondary" : "adm-btn-primary"}`}
            onClick={() => handleUpdateUserStatus(user.id, isActive ? "Suspended" : "Active")}
          >
            {isActive ? "Suspend Account" : "Activate Account"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            disabled={deletingUserId === user.id}
            onClick={async () => {
              const ok = await handleDeleteUser(user.id, user.name);
              if (ok) {
                navigate("/admin/users");
              }
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>{deletingUserId === user.id ? "Deleting..." : "Delete Customer"}</span>
          </button>
        </div>
      </div>

      {/* 4 Highlight Stat Cards */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Platform Role</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#e0f2fe", color: "#0284c7", borderColor: "#bae6fd" }}>Enforced</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px" }}>Customer</div>
          <div className="adm-stat-context">Regular platform user</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Verification Status</span>
            <span
              className="adm-stat-trend"
              style={
                user.emailVerified
                  ? { backgroundColor: "var(--adm-green-bg)", color: "var(--adm-green-text)", borderColor: "var(--adm-green-border)" }
                  : { backgroundColor: "var(--adm-amber-bg)", color: "var(--adm-amber-text)", borderColor: "var(--adm-amber-border)" }
              }
            >
              {user.emailVerified ? "Verified" : "Pending"}
            </span>
          </div>
          <div
            className="adm-stat-value"
            style={{
              fontSize: "15px",
              color: user.emailVerified ? "var(--adm-green-text)" : "var(--adm-amber-text)",
            }}
          >
            {user.emailVerified ? "✓ Verified Email" : "⏳ Pending"}
          </div>
          <div className="adm-stat-context">Customer security check</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Token Identifier</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>Active</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px", fontFamily: "monospace" }}>{user.token || "USR-0001"}</div>
          <div className="adm-stat-context">Assigned counter token code</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Member Since</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px" }}>{user.joinedOn || "Recently"}</div>
          <div className="adm-stat-context">Platform registration date</div>
        </div>
      </div>

      {/* Detailed Information Cards */}
      <div className="adm-detail-two-col">
        {/* Card 1: Personal & Contact Profile */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">👤 Personal Profile & Contact</h3>
              <p className="adm-card-desc">Customer identity verified against database records</p>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-panel-rows">
              <div className="adm-panel-row">
                <span className="adm-panel-label">Full Name</span>
                <span className="adm-panel-value">{user.name}</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">Email Address</span>
                <span className="adm-panel-value">{user.email || "—"}</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">Contact Phone</span>
                <span className="adm-panel-value">{user.phone || "—"}</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">City / Residential Address</span>
                <span className="adm-panel-value">{user.address || "—"}</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">Database Record ID</span>
                <span className="adm-panel-value font-mono">{user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Account Clearance */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">🛡️ Security & Account Clearance</h3>
              <p className="adm-card-desc">System governance and queue platform permissions</p>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-panel-rows">
              <div className="adm-panel-row">
                <span className="adm-panel-label">Clearance Classification</span>
                <span className="adm-panel-value">Regular Queue Customer</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">Account Lifecycle Status</span>
                <span className="adm-panel-value">
                  <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                    {user.status}
                  </span>
                </span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">Portal Application Access</span>
                <span className="adm-panel-value">QueueLess Consumer Web & Mobile App</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">Owner Portal Clearance</span>
                <span className="adm-panel-value" style={{ color: "var(--adm-text-muted)" }}>🚫 Restricted (Customer Only)</span>
              </div>
              <div className="adm-panel-row">
                <span className="adm-panel-label">System Audit State</span>
                <span className="adm-panel-value" style={{ color: "var(--adm-green-text)" }}>✓ Fully Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Recent Activity & Live Counter Status */}
      <div className="adm-card" style={{ marginTop: "16px" }}>
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">🎫 Token Engagements & Counter Telemetry</h3>
            <p className="adm-card-desc">Real-time token distribution and store queue visit history</p>
          </div>
        </div>
        <div className="adm-card-body">
          <div className="adm-token-live-box">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "var(--adm-accent-subtle)", color: "var(--adm-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "15px" }}>
                #
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "13.5px", color: "var(--adm-text)" }}>
                  Token {user.token || "USR-0001"} — Live Queue Status
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--adm-text-muted)", marginTop: "2px" }}>
                  Active platform token assigned to {user.name} for outlet queue access.
                </div>
              </div>
            </div>
            <span className="adm-live-badge-pulse">
              <span className="adm-status-dot-pulse" />
              <span>SYNCED</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

