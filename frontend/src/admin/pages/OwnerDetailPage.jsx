import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAdmin } from "../AdminContext";
import { getRoleBadgeClass } from "../adminData";

export function OwnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    ownersData,
    isOwnersLoading,
    handleToggleOwnerStatus,
    updatingOwnerStatusId,
    shopsData,
    detailModalOwner,
    fetchOwners,
    handleOpenEditOwner,
    handleDeleteOwner,
    deletingOwnerId,
  } = useAdmin();

  // Find owner by ID or OwnerCode
  const owner =
    ownersData.find((o) => String(o.id) === String(id) || String(o.ownerCode) === String(id)) ||
    (detailModalOwner && (String(detailModalOwner.id) === String(id) || String(detailModalOwner.ownerCode) === String(id))
      ? detailModalOwner
      : null);

  const ownerShops = (shopsData || []).filter(
    (s) =>
      (s.owner && owner && s.owner.toLowerCase() === owner.name.toLowerCase()) ||
      (s.ownerEmail && owner && s.ownerEmail.toLowerCase() === (owner.email || "").toLowerCase())
  );

  if (isOwnersLoading && !owner) {
    return (
      <div className="adm-page-body">
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <div className="adm-loading-spinner" />
          <h3 style={{ marginTop: "12px", fontSize: "16px", color: "var(--adm-text)" }}>Loading Merchant Profile...</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px" }}>Connecting with shop owner database</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="adm-page-body">
        <div className="adm-detail-nav">
          <button type="button" className="adm-back-link" onClick={() => navigate("/admin/owners")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Shop Owners</span>
          </button>
        </div>
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>🏢</span>
          <h3 style={{ margin: "14px 0 6px", fontSize: "18px", color: "var(--adm-text)" }}>Merchant Not Found</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", maxWidth: "420px", margin: "0 auto 20px" }}>
            The business owner record with ID <code>{id}</code> could not be found.
          </p>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => navigate("/admin/owners")}>
            Return to Shop Owners
          </button>
        </div>
      </div>
    );
  }

  const isActive = owner.status === "Active";
  const isUpdating = updatingOwnerStatusId === owner.id;

  return (
    <div className="adm-page-body">
      {/* Top Back Navigation */}
      <div className="adm-detail-nav">
        <button type="button" className="adm-back-link" onClick={() => navigate("/admin/owners")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Shop Owners</span>
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="adm-hero-card">
        <div className="adm-hero-left">
          <div className="adm-hero-avatar">
            {owner.avatarImg ? (
              <img src={owner.avatarImg} alt={owner.name} />
            ) : (
              owner.initial || (owner.name ? owner.name.charAt(0).toUpperCase() : "O")
            )}
          </div>
          <div className="adm-hero-meta">
            <div className="adm-hero-title-row">
              <h1 className="adm-hero-title">{owner.name}</h1>
              <span className={getRoleBadgeClass("Owner")}>Shop Owner</span>
              <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                {owner.status}
              </span>
            </div>
            <p className="adm-hero-subtitle">
              <span>{owner.email || "No email registered"}</span>
              <span>•</span>
              <span>Code: <strong style={{ color: "var(--adm-text)" }}>{owner.ownerCode || "OWN-0001"}</strong></span>
              <span>•</span>
              <span>Contact: {owner.phone || "—"}</span>
              <span>•</span>
              <span>Joined: {owner.joinedOn || "Recently"}</span>
            </p>
          </div>
        </div>

        <div className="adm-hero-actions">
          <button
            type="button"
            className={`adm-btn adm-btn-sm ${isActive ? "adm-btn-secondary" : "adm-btn-primary"}`}
            disabled={isUpdating}
            onClick={() => handleToggleOwnerStatus(owner.id)}
          >
            {isUpdating
              ? "Updating..."
              : isActive
              ? "Suspend Account"
              : "Reactivate Account"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-secondary"
            onClick={() => handleOpenEditOwner(owner)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit Owner</span>
          </button>
        </div>
      </div>

      {/* 4 Highlight Stat Cards */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Outlets Capacity</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>Quota</span>
          </div>
          <div className="adm-stat-value">
            <span>{owner.maxShops || 5}</span>
            <span className="adm-stat-unit">Stores</span>
          </div>
          <div className="adm-stat-context">Maximum permitted counter stores</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Active Outlets</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }}>Live</span>
          </div>
          <div className="adm-stat-value">
            <span style={{ color: "#2563eb" }}>{ownerShops.length || owner.shops || 1}</span>
            <span className="adm-stat-unit">Outlets Active</span>
          </div>
          <div className="adm-stat-context">Currently configured stores</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Subscription Tier</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px" }}>
            {owner.plan || "Enterprise Pro"}
          </div>
          <div className="adm-stat-context">Platform merchant tier</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Member Since</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px" }}>
            {owner.joinedOn || "Recently"}
          </div>
          <div className="adm-stat-context">Initial merchant onboarding</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-detail-tabs">
        <button
          type="button"
          className={`adm-detail-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📋 Overview & Business Credentials
        </button>
        <button
          type="button"
          className={`adm-detail-tab-btn ${activeTab === "shops" ? "active" : ""}`}
          onClick={() => setActiveTab("shops")}
        >
          🏪 Registered Outlets ({ownerShops.length || owner.shops || 1})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="adm-detail-two-col">
          {/* Panel 1: Merchant Identity & Contact */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h3 className="adm-card-title">🏢 Merchant Identity & Contact</h3>
                <p className="adm-card-desc">Business entity details and primary communications channel</p>
              </div>
            </div>
            <div className="adm-card-body">
              <div className="adm-panel-rows">
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Business Owner Name</span>
                  <span className="adm-panel-value">{owner.name}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Official Email</span>
                  <span className="adm-panel-value">{owner.email || "—"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Contact Number</span>
                  <span className="adm-panel-value">{owner.phone || "—"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Registered City / Address</span>
                  <span className="adm-panel-value">{owner.address || owner.city || "—"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Unique Merchant Code</span>
                  <span className="adm-panel-value font-mono">{owner.ownerCode || "OWN-0001"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Subscription & Platform Privileges */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h3 className="adm-card-title">📜 Subscription & Platform Privileges</h3>
                <p className="adm-card-desc">Contract terms and authorized platform access</p>
              </div>
            </div>
            <div className="adm-card-body">
              <div className="adm-panel-rows">
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Subscription Tier</span>
                  <span className="adm-panel-value">{owner.plan || "Enterprise Pro"}</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Outlets Quota</span>
                  <span className="adm-panel-value">{owner.maxShops || 5} Total Locations</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Multi-Counter Queues</span>
                  <span className="adm-panel-value" style={{ color: "#16a34a", fontWeight: "600" }}>✓ Enabled & Active</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Merchant Dashboard Access</span>
                  <span className="adm-panel-value" style={{ color: "#16a34a", fontWeight: "600" }}>✓ Authorized</span>
                </div>
                <div className="adm-panel-row">
                  <span className="adm-panel-label">Account Lifecycle State</span>
                  <span className="adm-panel-value">
                    <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                      {owner.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {ownerShops.length > 0 ? (
            <div className="adm-shops-grid">
              {ownerShops.map((shop) => (
                <div key={shop.id} className="adm-shop-card">
                  <div className="adm-shop-card-image-wrap">
                    <img src={shop.image} alt={shop.name} className="adm-shop-card-img" />
                    <span className="adm-badge adm-badge-success adm-shop-status-badge">
                      {shop.status}
                    </span>
                  </div>
                  <div className="adm-shop-card-body">
                    <div className="adm-shop-cat">{shop.category}</div>
                    <h3 className="adm-shop-title">{shop.name}</h3>
                    <div className="adm-shop-sub">{shop.location}</div>

                    <div className="adm-shop-metrics">
                      <div className="adm-shop-metric-item">
                        <span className="adm-shop-metric-label">Serving</span>
                        <span className="adm-shop-metric-val" style={{ color: "#2563eb" }}>{shop.currentServing}</span>
                      </div>
                      <div className="adm-shop-metric-item">
                        <span className="adm-shop-metric-label">Waiting</span>
                        <span className="adm-shop-metric-val">{shop.waitingCount}</span>
                      </div>
                      <div className="adm-shop-metric-item">
                        <span className="adm-shop-metric-label">Avg Wait</span>
                        <span className="adm-shop-metric-val">{shop.avgWaitTime}</span>
                      </div>
                    </div>

                    <div className="adm-shop-card-actions">
                      <Link
                        to={`/admin/shops/${shop.id}`}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ flex: 1, textAlign: "center" }}
                      >
                        View Live Queue &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="adm-card" style={{ padding: "50px 20px", textAlign: "center" }}>
              <span style={{ fontSize: "36px" }}>🏪</span>
              <h4 style={{ margin: "12px 0 4px", fontSize: "16px", color: "var(--adm-text)" }}>Configured Store Counters</h4>
              <p style={{ color: "var(--adm-text-muted)", fontSize: "13px" }}>
                This merchant currently has {owner.shops || 1} counter outlet configured on QueueLess.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

