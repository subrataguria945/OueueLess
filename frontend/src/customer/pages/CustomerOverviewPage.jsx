import React from "react";
import { useNavigate } from "react-router";
import { useCustomer } from "../CustomerContext";
import { CustomerAvailabilityCalendar } from "../components/CustomerAvailabilityCalendar";

export function CustomerOverviewPage() {
  const navigate = useNavigate();
  const {
    customerProfile,
    activeToken,
    tokensHistory,
    shops,
    openBookModal,
    openQrModal,
    openCancelModal,
    toggleFavoriteShop,
    favoriteShopIds,
  } = useCustomer();

  return (
    <div className="cst-content-body">
      {/* ── 1. WELCOME HEADER ────────────────────────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
          Welcome back, {customerProfile.name.split(" ")[0]}! 👋
        </h1>
        <p style={{ margin: 0, color: "var(--cst-text-muted)", fontSize: "14px" }}>
          Track your live queue position, check upcoming shop availability, and skip the wait effortlessly.
        </p>
      </div>

      {/* ── 2. ACTIVE TOKEN LIVE TRACKER BANNER ──────────────────────── */}
      {activeToken ? (
        <div className="cst-live-banner">
          <div className="cst-live-banner-content">
            {/* Left Info */}
            <div>
              <div className="cst-live-status-pill">
                <span className="cst-live-pulse-dot" />
                <span>Live Turn Active</span>
              </div>
              <h2 className="cst-live-shop-name">{activeToken.shopName}</h2>
              <div className="cst-live-shop-info">
                📍 {activeToken.location} • 🪑 {activeToken.counter} ({activeToken.service})
              </div>

              {/* Metrics Row */}
              <div className="cst-live-metrics-row">
                <div className="cst-live-metric-box">
                  <div className="cst-live-metric-label">Your Token</div>
                  <div className="cst-live-metric-val highlight">{activeToken.tokenNumber}</div>
                </div>
                <div className="cst-live-metric-box">
                  <div className="cst-live-metric-label">Now Serving</div>
                  <div className="cst-live-metric-val">{activeToken.currentServing}</div>
                </div>
                <div className="cst-live-metric-box">
                  <div className="cst-live-metric-label">People Ahead</div>
                  <div className="cst-live-metric-val">{activeToken.peopleAhead}</div>
                </div>
                <div className="cst-live-metric-box">
                  <div className="cst-live-metric-label">Est. Wait</div>
                  <div className="cst-live-metric-val">~{activeToken.estWaitMins}m</div>
                </div>
              </div>

              {/* Queue Progress Bar */}
              <div className="cst-live-progress-wrap">
                <div className="cst-live-progress-labels">
                  <span>Queue Progress</span>
                  <span>{activeToken.progressPct}% Completed</span>
                </div>
                <div className="cst-live-progress-bar">
                  <div
                    className="cst-live-progress-fill"
                    style={{ width: `${activeToken.progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="cst-live-banner-actions">
              <button
                type="button"
                className="cst-btn-view-qr"
                onClick={() => openQrModal(activeToken)}
              >
                <span>📱 Show QR Token Pass</span>
              </button>
              <button
                type="button"
                className="cst-btn-cancel-token"
                onClick={openCancelModal}
              >
                Cancel Token
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="cst-empty-live-banner">
          <div className="cst-empty-live-text">
            <h3>No Active Queue Token</h3>
            <p>You don't have any waiting tokens right now. Ready to visit a shop without waiting in line?</p>
          </div>
          <button
            type="button"
            className="cst-btn-quick-book"
            onClick={() => openBookModal()}
          >
            <span>+ Book a Token</span>
          </button>
        </div>
      )}

      {/* ── 3. STATS METRICS GRID ────────────────────────────────────── */}
      <div className="cst-stats-grid">
        <div className="cst-stat-card">
          <div className="cst-stat-icon-wrap blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h6" />
            </svg>
          </div>
          <div className="cst-stat-info">
            <div className="cst-stat-label">Active Queues</div>
            <div className="cst-stat-val">{activeToken ? "1" : "0"}</div>
          </div>
        </div>

        <div className="cst-stat-card">
          <div className="cst-stat-icon-wrap green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="cst-stat-info">
            <div className="cst-stat-label">Completed Tokens</div>
            <div className="cst-stat-val">12</div>
          </div>
        </div>

        <div className="cst-stat-card">
          <div className="cst-stat-icon-wrap amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="cst-stat-info">
            <div className="cst-stat-label">Time Saved</div>
            <div className="cst-stat-val">~3.5 hrs</div>
          </div>
        </div>

        <div className="cst-stat-card">
          <div className="cst-stat-icon-wrap purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <div className="cst-stat-info">
            <div className="cst-stat-label">Favorite Shops</div>
            <div className="cst-stat-val">{favoriteShopIds.length}</div>
          </div>
        </div>
      </div>

      {/* ── 4. CALENDAR & AVAILABILITY ENGINE ────────────────────────── */}
      <CustomerAvailabilityCalendar
        onSelectDateAndShop={(date, shop) => {
          // Open booking modal prefilled
          openBookModal(shop, date);
        }}
      />

      {/* ── 5. POPULAR SHOPS PREVIEW ─────────────────────────────────── */}
      <div style={{ marginTop: "32px", marginBottom: "32px" }}>
        <div className="cst-section-header">
          <h2 className="cst-section-title">Popular Shops &amp; Live Queues</h2>
          <span
            className="cst-section-link"
            onClick={() => navigate("/customer/shops")}
          >
            View All ({shops.length}) →
          </span>
        </div>

        <div className="cst-shops-grid">
          {shops.slice(0, 3).map((shop) => (
            <div key={shop.id} className="cst-shop-card">
              <div className="cst-shop-card-head">
                <div className="cst-shop-badge-and-name">
                  <div className="cst-shop-avatar-icon">{shop.icon}</div>
                  <div>
                    <h3 className="cst-shop-name">{shop.name}</h3>
                    <span className="cst-shop-category">{shop.categoryLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`cst-btn-favorite ${favoriteShopIds.includes(shop.id) ? "active" : ""}`}
                  onClick={() => toggleFavoriteShop(shop.id)}
                  title="Toggle Favorite"
                >
                  ♥
                </button>
              </div>

              <div className="cst-shop-card-body">
                <div className="cst-shop-location">
                  <span>📍</span>
                  <span>{shop.location}</span>
                </div>

                <div className="cst-shop-queue-stats">
                  <div>
                    <div className="cst-q-stat-label">Serving</div>
                    <div className="cst-q-stat-val" style={{ color: "var(--cst-primary)" }}>
                      {shop.currentServing}
                    </div>
                  </div>
                  <div>
                    <div className="cst-q-stat-label">Waiting</div>
                    <div className="cst-q-stat-val">{shop.peopleInQueue}</div>
                  </div>
                  <div>
                    <div className="cst-q-stat-label">Est. Wait</div>
                    <div className="cst-q-stat-val" style={{ color: "var(--cst-green-text)" }}>
                      {shop.estWait}
                    </div>
                  </div>
                </div>
              </div>

              <div className="cst-shop-card-footer">
                <button
                  type="button"
                  className="cst-btn-card-book"
                  onClick={() => openBookModal(shop)}
                >
                  <span>Book Token</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. RECENT BOOKINGS TABLE ─────────────────────────────────── */}
      <div className="cst-section-header">
        <h2 className="cst-section-title">Recent Token Activity</h2>
        <span
          className="cst-section-link"
          onClick={() => navigate("/customer/tokens")}
        >
          See All Tokens →
        </span>
      </div>

      <div className="cst-tokens-table-card">
        <div className="cst-table-wrap">
          <table className="cst-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Shop &amp; Service</th>
                <th>Counter</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokensHistory.slice(0, 4).map((tkn) => (
                <tr key={tkn.id}>
                  <td>
                    <span className="cst-token-pill">{tkn.tokenNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{tkn.shopName}</div>
                    <div style={{ fontSize: "12px", color: "var(--cst-text-muted)" }}>
                      {tkn.service}
                    </div>
                  </td>
                  <td>{tkn.counter}</td>
                  <td>{tkn.date}</td>
                  <td>
                    <span
                      className={`cst-status-badge ${
                        tkn.status === "WAITING"
                          ? "active"
                          : tkn.status === "COMPLETED"
                          ? "completed"
                          : "cancelled"
                      }`}
                    >
                      ● {tkn.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--cst-border)",
                        padding: "5px 12px",
                        borderRadius: "var(--cst-radius-sm)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--cst-primary)",
                        cursor: "pointer",
                      }}
                      onClick={() => openQrModal(tkn)}
                    >
                      View QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

