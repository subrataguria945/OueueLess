import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAdmin } from "../AdminContext";
import { authFetch } from "../../apiClient";
import {
  STAT_METRICS,
  TOP_SHOPS,
  REVENUE_BARS,
  TIMELINE_ACTIVITIES,
  isRegularUser,
  isDemoOwner,
  DASHBOARD_STATS_API_URL,
} from "../adminData";

export function OverviewPage() {
  const { ownersData, usersData, shopsData } = useAdmin();
  const [dbStats, setDbStats] = useState(null);

  // Entrance growth animation for dashboard charts
  const [isChartAnimated, setIsChartAnimated] = useState(false);

  useEffect(() => {
    // Small timeout ensures the initial render mounts with height 0%, then triggers smooth growth animation
    const timer = setTimeout(() => {
      setIsChartAnimated(true);
    }, 70);
    return () => clearTimeout(timer);
  }, []);

  // Fetch official telemetry from GET /dashboard/stats
  useEffect(() => {
    let mounted = true;
    authFetch(DASHBOARD_STATS_API_URL, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data && typeof data === "object" && !data.detail) {
          setDbStats(data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Dynamic values based strictly on real state (excluding demo data)
  const realOwners = (ownersData || []).filter((o) => !isDemoOwner(o));
  const regularUsersCount = (usersData || []).filter((u) => isRegularUser(u, realOwners)).length;

  const metrics = [
    {
      id: "owners",
      label: "Registered Owners",
      value: dbStats?.total_owners ?? realOwners.length,
      trend: "Live",
      context: dbStats?.active_owners ? `${dbStats.active_owners} active merchants` : "active merchants",
      link: "/admin/owners",
    },
    {
      id: "shops",
      label: "Active Store Queues",
      value: dbStats?.total_shops ?? (shopsData?.length ?? 0),
      trend: "Live",
      context: dbStats?.active_shops ? `${dbStats.active_shops} operating outlets` : "live counter stores",
      link: "/admin/shops",
    },
    {
      id: "users",
      label: "Queue Customers",
      value: dbStats?.total_customers ?? regularUsersCount,
      trend: "Live",
      context: dbStats?.active_customers ? `${dbStats.active_customers} active users` : "verified app users",
      link: "/admin/users",
    },
    {
      id: "revenue",
      label: "Platform Revenue",
      value: "₹ 0",
      trend: "--",
      context: "current period",
      link: "/admin/payments",
    },
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
          <Link to="/admin/tokens" className="adm-btn adm-btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
            </svg>
            <span>Live Tokens</span>
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
            <Link to="/admin/tokens" className="adm-card-action-link">
              Live Tokens &rarr;
            </Link>
          </div>
          <div className="adm-card-body">
            <div className="adm-bar-chart">
              {REVENUE_BARS.map((b, index) => {
                const isPeak = b.val >= 40;
                return (
                  <div key={b.month} className="adm-bar-col">
                    {/* Floating SaaS tooltip showing exact tokens */}
                    <div className="adm-bar-tooltip">
                      <strong>{b.val}k</strong> tokens
                    </div>

                    <div className="adm-bar-track">
                      <div
                        className={`adm-bar-fill ${isPeak ? "is-peak" : ""}`}
                        style={{
                          height: isChartAnimated ? `${b.heightPct}%` : "0%",
                          transitionDelay: `${index * 45}ms`,
                        }}
                        title={`${b.val * 1000} tokens (${b.month} 2026)`}
                      />
                    </div>
                    <span className="adm-bar-label">{b.month}</span>
                  </div>
                );
              })}
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
            {shopsData && shopsData.length > 0 ? (
              <div className="adm-list-group">
                {shopsData.slice(0, 5).map((s, index) => (
                  <Link
                    key={s.id || index}
                    to={`/admin/shops/${s.id}`}
                    className="adm-list-item"
                    style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                    title="View live counter queue"
                  >
                    <div className="adm-rank-badge">#{index + 1}</div>
                    <div className="adm-list-item-info">
                      <div className="adm-list-item-title">{s.name}</div>
                      <div className="adm-list-item-sub">{s.owner}</div>
                    </div>
                    <div className="adm-list-item-metric">
                      <span className="adm-font-semibold">{s.dailyTokens ?? 0}</span>
                      <span className="adm-text-muted"> tokens</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: "36px 12px", textAlign: "center", color: "var(--adm-text-muted)", fontSize: "13px" }}>
                <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>🏪</span>
                No active counter shops registered yet.
              </div>
            )}
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

