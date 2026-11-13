import React from "react";
import { useAdmin } from "../AdminContext";
import { getRoleBadgeClass } from "../adminData";

export function OwnerDetailModal() {
  const {
    detailModalOwner,
    setDetailModalOwner,
    ownerProfileTab,
    setOwnerProfileTab,
    handleToggleOwnerStatus,
    updatingOwnerStatusId,
    shopsData,
  } = useAdmin();

  if (!detailModalOwner) return null;

  const isActive = detailModalOwner.status === "Active";
  const ownerShops = (shopsData || []).filter(
    (s) => (s.owner && s.owner.toLowerCase() === (detailModalOwner.name || "").toLowerCase()) ||
           (s.ownerEmail && s.ownerEmail.toLowerCase() === (detailModalOwner.email || "").toLowerCase())
  );

  return (
    <div className="adm-modal-backdrop" onClick={() => setDetailModalOwner(null)}>
      <div className="adm-modal-dialog adm-modal-xl" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div className="adm-header-avatar-group">
            <div className="adm-avatar-circle" style={{ width: "52px", height: "52px", fontSize: "19px" }}>
              {detailModalOwner.avatarImg ? (
                <img src={detailModalOwner.avatarImg} alt={detailModalOwner.name} className="adm-avatar-img" />
              ) : (
                detailModalOwner.initial || "O"
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 className="adm-modal-title" style={{ fontSize: "18px" }}>{detailModalOwner.name}</h3>
                <span className={getRoleBadgeClass("Owner")}>Owner</span>
                <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                  {detailModalOwner.status}
                </span>
              </div>
              <p className="adm-modal-subtitle" style={{ fontSize: "13px", marginTop: "4px" }}>
                {detailModalOwner.email} • Code: <strong style={{ color: "var(--adm-text)" }}>{detailModalOwner.ownerCode || "OWN-0001"}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setDetailModalOwner(null)}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="adm-modal-tabs">
          <button
            type="button"
            className={`adm-modal-tab ${ownerProfileTab === "overview" ? "active" : ""}`}
            onClick={() => setOwnerProfileTab("overview")}
          >
            📋 Overview & Credentials
          </button>
          <button
            type="button"
            className={`adm-modal-tab ${ownerProfileTab === "shops" ? "active" : ""}`}
            onClick={() => setOwnerProfileTab("shops")}
          >
            🏪 Registered Outlets ({ownerShops.length || detailModalOwner.shops || 1})
          </button>
        </div>

        <div className="adm-modal-body">
          {/* Top Metric Strip */}
          <div className="adm-detail-highlight-row">
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Outlets Capacity</span>
              <span className="adm-highlight-val">{detailModalOwner.maxShops || 5} Stores Allowed</span>
            </div>
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Active Outlets</span>
              <span className="adm-highlight-val" style={{ color: "#2563eb" }}>
                {ownerShops.length || detailModalOwner.shops || 1} Operating
              </span>
            </div>
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Subscription Tier</span>
              <span className="adm-highlight-val">{detailModalOwner.plan || "Enterprise Pro"}</span>
            </div>
            <div className="adm-highlight-mini-card">
              <span className="adm-highlight-label">Registered Since</span>
              <span className="adm-highlight-val">{detailModalOwner.joinedOn || "Recently"}</span>
            </div>
          </div>

          {ownerProfileTab === "overview" ? (
            <div className="adm-detail-two-col">
              <div className="adm-detail-panel">
                <h4 className="adm-panel-title">
                  <span>🏢</span>
                  <span>Merchant Identity & Contact</span>
                </h4>
                <div className="adm-panel-rows">
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Business Owner</span>
                    <span className="adm-panel-value">{detailModalOwner.name}</span>
                  </div>
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Official Email</span>
                    <span className="adm-panel-value">{detailModalOwner.email || "—"}</span>
                  </div>
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Contact Number</span>
                    <span className="adm-panel-value">{detailModalOwner.phone || "—"}</span>
                  </div>
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Registered City / Address</span>
                    <span className="adm-panel-value">{detailModalOwner.address || detailModalOwner.city || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="adm-detail-panel">
                <h4 className="adm-panel-title">
                  <span>📜</span>
                  <span>Subscription & Platform Privileges</span>
                </h4>
                <div className="adm-panel-rows">
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Owner Reference Code</span>
                    <span className="adm-panel-value font-mono">{detailModalOwner.ownerCode || "OWN-0001"}</span>
                  </div>
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Subscription Plan</span>
                    <span className="adm-panel-value">{detailModalOwner.plan || "Enterprise Pro"}</span>
                  </div>
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Store Outlet Quota</span>
                    <span className="adm-panel-value">{detailModalOwner.maxShops || 5} Maximum Outlets</span>
                  </div>
                  <div className="adm-panel-row">
                    <span className="adm-panel-label">Multi-Counter Queuing</span>
                    <span className="adm-panel-value" style={{ color: "#16a34a", fontWeight: "600" }}>✓ Enabled & Active</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {ownerShops.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {ownerShops.map((shop) => (
                    <div key={shop.id} className="adm-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14.5px" }}>{shop.name}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>{shop.category}</div>
                        </div>
                        <span className="adm-badge adm-badge-success">{shop.status}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderTop: "1px solid var(--adm-border-light)", paddingTop: "8px" }}>
                        <span>Now Serving: <strong style={{ color: "var(--adm-accent)" }}>{shop.currentServing}</strong></span>
                        <span>Waiting: <strong>{shop.waitingCount}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="adm-empty-state">
                  <span style={{ fontSize: "32px" }}>🏪</span>
                  <h4>Registered Store Counters</h4>
                  <p>This merchant currently has {detailModalOwner.shops || 1} registered counter outlet configured on QueueLess.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="adm-modal-footer">
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => setDetailModalOwner(null)}
          >
            Close
          </button>
          <button
            type="button"
            className={`adm-btn ${isActive ? "adm-btn-danger" : "adm-btn-primary"}`}
            disabled={updatingOwnerStatusId === detailModalOwner.id}
            onClick={() => handleToggleOwnerStatus(detailModalOwner.id)}
          >
            {updatingOwnerStatusId === detailModalOwner.id
              ? "Updating..."
              : isActive
              ? "Suspend Owner Account"
              : "Reactivate Owner Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

