import React from "react";
import { Link } from "react-router";
import { useAdmin } from "../AdminContext";
import { STAT_METRICS, TOP_SHOPS, REVENUE_BARS, TIMELINE_ACTIVITIES } from "../adminData";

export function OverviewPage() {
  const { ownersData, usersData, shopsData } = useAdmin();

  // Dynamic values based on live state if available
  const metrics = [
    { id: "owners", label: "Registered Owners", value: ownersData.length || "6", trend: "+12%", context: "active merchants", link: "/admin/owners" },
    { id: "shops", label: "Active Store Queues", value: shopsData.length || "6", trend: "+8%", context: "live counter stores", link: "/admin/shops" },
    { id: "users", label: "Queue Customers", value: usersData.length || "1", trend: "+25%", context: "verified app users", link: "/admin/users" },
    { id: "revenue", label: "Platform Revenue", value: "₹ 2,45,680", trend: "+32%", context: "from last month", link: "/admin/payments" },
  ];

  return (
    <div className="adm-page-body">
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Executive Dashboard</h1>
          <p className="adm-page-desc">High-level platform telemetry, active store traffic, and merchant operations.</p>
        </div>
        <div className="adm-header-actions">
          <Link to="/admin/reports" className="adm-btn adm-btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Platform Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="adm-stats-grid">
        {metrics.map((m) => (
          <Link to={m.link} key={m.id} className="adm-stat-card">
            <div className="adm-stat-top">
              <span className="adm-stat-label">{m.label}</span>
              <span className="adm-stat-trend">{m.trend}</span>
            </div>
            <div className="adm-stat-value">{m.value}</div>
            <div className="adm-stat-context">{m.context}</div>
          </Link>
        ))}
      </div>

      {/* Charts & Top Shops Grid */}
      <div className="adm-grid-2-1">
        {/* Revenue / Traffic Chart */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Monthly Token Traffic & Growth</h3>
              <p className="adm-card-desc">Total processed visitor queue tokens across registered shops in 2026</p>
            </div>
            <Link to="/admin/reports" className="adm-card-action-link">
              Detailed Analytics &rarr;
            </Link>
          </div>
          <div className="adm-card-body">
            <div className="adm-bar-chart">
              {REVENUE_BARS.map((b) => (
                <div key={b.month} className="adm-bar-col">
                  <div className="adm-bar-track">
                    <div className="adm-bar-fill" style={{ height: `${b.heightPct}%` }} title={`${b.val * 1000} tokens`} />
                  </div>
                  <span className="adm-bar-label">{b.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Active Stores */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Top Performing Shops</h3>
              <p className="adm-card-desc">Busiest counter queues</p>
            </div>
            <Link to="/admin/shops" className="adm-card-action-link">
              View All &rarr;
            </Link>
          </div>
          <div className="adm-card-body">
            <div className="adm-list-group">
              {TOP_SHOPS.map((s) => (
                <Link
                  key={s.rank}
                  to={`/admin/shops/${s.rank}`}
                  className="adm-list-item"
                  style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                  title="View live counter queue"
                >
                  <div className="adm-rank-badge">#{s.rank}</div>
                  <div className="adm-list-item-info">
                    <div className="adm-list-item-title">{s.name}</div>
                    <div className="adm-list-item-sub">{s.owner}</div>
                  </div>
                  <div className="adm-list-item-metric">
                    <span className="adm-font-semibold">{s.users}</span>
                    <span className="adm-text-muted"> tokens</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Quick Links */}
      <div className="adm-grid-2-1">
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Realtime Platform Activity</h3>
              <p className="adm-card-desc">Recent merchant and subscriber event logs</p>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-timeline">
              {TIMELINE_ACTIVITIES.map((act) => (
                <div key={act.id} className="adm-timeline-item">
                  <div className="adm-timeline-dot" />
                  <div className="adm-timeline-content">
                    <div className="adm-timeline-title">{act.title}</div>
                    <div className="adm-timeline-desc">{act.desc}</div>
                    <div className="adm-timeline-time">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Operations Card */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Quick Administration</h3>
              <p className="adm-card-desc">Frequently used management actions</p>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-quick-actions">
              <Link to="/admin/owners" className="adm-quick-action-btn">
                <span>👥 Manage All Shop Owners</span>
                <span>&rarr;</span>
              </Link>
              <Link to="/admin/shops" className="adm-quick-action-btn">
                <span>🏪 Live Counter Outlets</span>
                <span>&rarr;</span>
              </Link>
              <Link to="/admin/users" className="adm-quick-action-btn">
                <span>👤 Customer User Directory</span>
                <span>&rarr;</span>
              </Link>
              <Link to="/admin/subscriptions" className="adm-quick-action-btn">
                <span>💳 Review Subscription Tiers</span>
                <span>&rarr;</span>
              </Link>
              <Link to="/admin/settings" className="adm-quick-action-btn">
                <span>⚙️ Administrator Profile Settings</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

