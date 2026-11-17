import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAdmin } from "../AdminContext";
import { isDemoToken } from "../adminData";

export function ShopQueuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [queueFilter, setQueueFilter] = useState("All");
  const [tokenSearch, setTokenSearch] = useState("");

  const { shopsData, selectedShopDetail, handleToggleShopOpen, showToast } = useAdmin();

  // Find shop by ID
  const shop =
    shopsData.find((s) => String(s.id) === String(id)) ||
    (selectedShopDetail && String(selectedShopDetail.id) === String(id) ? selectedShopDetail : null);

  // Live tokens array for this specific store (excluding mock demo tokens)
  const [liveTokens, setLiveTokens] = useState(() => {
    try {
      const saved = localStorage.getItem("ql_admin_live_tokens");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (t) =>
              !isDemoToken(t) &&
              (String(t.shopId) === String(id) ||
                (shop && t.shop && t.shop.toLowerCase() === shop.name.toLowerCase()))
          );
        }
      }
    } catch (_) {}
    return [];
  });

  if (!shop) {
    return (
      <div className="adm-page-body">
        <div className="adm-detail-nav">
          <button type="button" className="adm-back-link" onClick={() => navigate("/admin/shops")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Shops</span>
          </button>
        </div>
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>🏪</span>
          <h3 style={{ margin: "14px 0 6px", fontSize: "18px", color: "var(--adm-text)" }}>Store Not Found</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", maxWidth: "420px", margin: "0 auto 20px" }}>
            The store location with ID <code>{id}</code> could not be located.
          </p>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => navigate("/admin/shops")}>
            Return to Shops
          </button>
        </div>
      </div>
    );
  }

  const isOpen = shop.isOpen !== undefined ? shop.isOpen : (shop.status === "Open" || shop.status === "Active");
  const isActive = shop.isActive !== undefined ? shop.isActive : (shop.status !== "Inactive" && shop.status !== "Suspended");

  const filteredTokens = liveTokens.filter((item) => {
    const matchFilter = queueFilter === "All" || item.status === queueFilter;
    const q = tokenSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.token.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.counter.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="adm-page-body">
      {/* Top Back Navigation */}
      <div className="adm-detail-nav">
        <button type="button" className="adm-back-link" onClick={() => navigate("/admin/shops")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Shops</span>
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          <span className="adm-live-badge-pulse">
            <span className="adm-status-dot-pulse" />
            <span>LIVE QUEUE ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="adm-hero-card">
        <div className="adm-hero-left">
          <div className="adm-hero-avatar" style={{ borderRadius: "12px", width: "70px", height: "70px" }}>
            {shop.image ? (
              <img src={shop.image} alt={shop.name} />
            ) : (
              shop.name.charAt(0)
            )}
          </div>
          <div className="adm-hero-meta">
            <div className="adm-hero-title-row">
              <h1 className="adm-hero-title">{shop.name}</h1>
              <span className="adm-badge adm-badge-neutral">{shop.category}</span>
              <span className={`adm-badge ${isActive ? "adm-badge-role-admin" : "adm-badge-danger"}`}>
                {isActive ? "✓ Active Outlet" : "✕ Inactive"}
              </span>
              <span
                className={`adm-badge ${isOpen ? "adm-badge-success" : "adm-badge-neutral"}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: isOpen ? "#10b981" : "#94a3b8",
                  }}
                />
                <span>{isOpen ? "Counter Open" : "Counter Closed"}</span>
              </span>
            </div>
            <p className="adm-hero-subtitle">
              <span>Managed by: <strong style={{ color: "var(--adm-text)" }}>{shop.owner}</strong></span>
              <span>•</span>
              <span>Location: {shop.location}</span>
              <span>•</span>
              <span>Operating Hours: {shop.timing || "Regular Store Hours"}</span>
            </p>
          </div>
        </div>

        <div className="adm-hero-actions" style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className={`adm-btn ${isOpen ? "adm-btn-secondary" : "adm-btn-primary"}`}
            onClick={() => {
              handleToggleShopOpen(shop.id);
              if (showToast) showToast(`Counter ${isOpen ? "closed" : "opened"} for ${shop.name}`, "success");
            }}
          >
            {isOpen ? "🔴 Close Counter" : "🟢 Open Counter"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => alert(`Calling next customer for ${shop.name}...`)}
            disabled={!isOpen}
          >
            📢 Call Next Token
          </button>
        </div>
      </div>

      {/* 4 Highlight Stat Cards */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Now Serving</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>Counter A</span>
          </div>
          <div className="adm-stat-value" style={{ color: "#2563eb", fontSize: "20px" }}>
            {shop.currentServing || "--"}
          </div>
          <div className="adm-stat-context">Customer at service desk</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Waiting Visitors</span>
            <span className="adm-stat-trend">In Line</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "20px" }}>
            {shop.waitingCount}
          </div>
          <div className="adm-stat-context">Customers in waiting room</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Average Wait</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "20px" }}>
            {shop.avgWaitTime}
          </div>
          <div className="adm-stat-context">Turnaround per visitor</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Daily Processed</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "20px" }}>
            {shop.dailyTokens}
          </div>
          <div className="adm-stat-context">Completed visits today</div>
        </div>
      </div>

      {/* Live Interactive Queue Board Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">Live Counter Token Registry</h3>
            <p className="adm-card-desc">Real-time status of issued queue tickets and counters for {shop.name}</p>
          </div>
        </div>

        <div className="adm-card-body">
          {/* Filters & Search */}
          <div className="adm-filter-bar">
            <div className="adm-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="adm-search-input"
                placeholder="Search token #, visitor name or counter..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
              />
              {tokenSearch && (
                <button type="button" className="adm-search-clear" onClick={() => setTokenSearch("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="adm-pill-filters">
              {["All", "Serving", "Waiting", "Completed"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`adm-pill-btn ${queueFilter === filter ? "active" : ""}`}
                  onClick={() => setQueueFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>Token Code</th>
                  <th>Customer Name</th>
                  <th>Counter Desk</th>
                  <th>Estimated Wait</th>
                  <th>Issue Time</th>
                  <th style={{ textAlign: "right" }}>Live Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="adm-table-empty">
                      <span style={{ fontSize: "28px" }}>🎟️</span>
                      <h4>No Live Tokens in Queue</h4>
                      <p>There are currently no visitor tokens in queue for {shop.name}.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((item) => (
                    <tr key={item.token}>
                      <td>
                        <span className="adm-font-semibold" style={{ color: "#2563eb", fontFamily: "monospace", fontSize: "14px" }}>
                          {item.token}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "var(--adm-text)" }}>{item.name}</div>
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-neutral">{item.counter}</span>
                      </td>
                      <td className="adm-text-muted">{item.wait}</td>
                      <td className="adm-text-muted">{item.time}</td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          className={`adm-badge ${
                            item.status === "Serving"
                              ? "adm-badge-success"
                              : item.status === "Waiting"
                              ? "adm-badge-warning"
                              : "adm-badge-neutral"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-table-footer">
          <span>Displaying {filteredTokens.length} visitor tokens in live queue</span>
          <span className="adm-text-muted">Direct counter telemetry</span>
        </div>
      </div>
    </div>
  );
}

