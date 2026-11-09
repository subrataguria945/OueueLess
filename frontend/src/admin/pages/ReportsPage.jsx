import React from "react";
import { useAdmin } from "../AdminContext";

export function ReportsPage() {
  const { dateRange, setDateRange } = useAdmin();

  return (
    <div className="adm-page-body">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Analytics & Operations Reports</h1>
          <p className="adm-page-desc">Telemetry data covering visitor wait-times, counter throughput, and shop efficiency.</p>
        </div>
        <div className="adm-header-actions">
          <select
            className="adm-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="Today">Today's Realtime Stats</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Oct 1, 2026 - Oct 31, 2026">October 2026</option>
            <option value="Year to Date">Year to Date (2026)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Average Wait Reduction</span>
            <span className="adm-stat-trend">+38%</span>
          </div>
          <div className="adm-stat-value">8.4 mins</div>
          <div className="adm-stat-context">down from 26 mins before QueueLess</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Total Daily Served</span>
            <span className="adm-stat-trend">+22%</span>
          </div>
          <div className="adm-stat-value">1,480 Tokens</div>
          <div className="adm-stat-context">across all active shop counters</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Visitor Retention Rate</span>
            <span className="adm-stat-trend">+14%</span>
          </div>
          <div className="adm-stat-value">94.2%</div>
          <div className="adm-stat-context">zero queue dropouts observed</div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="adm-grid-2-1" style={{ marginTop: "24px" }}>
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Peak Queue Hours Distribution</h3>
              <p className="adm-card-desc">Hourly visitor token requests throughout business days</p>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-bar-chart">
              {[
                { time: "9 AM", pct: 30 },
                { time: "11 AM", pct: 65 },
                { time: "1 PM", pct: 90 },
                { time: "3 PM", pct: 55 },
                { time: "5 PM", pct: 95 },
                { time: "7 PM", pct: 80 },
                { time: "9 PM", pct: 40 },
              ].map((h) => (
                <div key={h.time} className="adm-bar-col">
                  <div className="adm-bar-track">
                    <div className="adm-bar-fill" style={{ height: `${h.pct}%` }} />
                  </div>
                  <span className="adm-bar-label">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Counter Calling Efficiency</h3>
              <p className="adm-card-desc">Staff token resolution speeds</p>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-list-group">
              <div className="adm-list-item">
                <div className="adm-list-item-info">
                  <div className="adm-list-item-title">Café & Fast Food</div>
                  <div className="adm-list-item-sub">Coffee Hub, Tasty Bites</div>
                </div>
                <div className="adm-list-item-metric">3.2 mins / token</div>
              </div>
              <div className="adm-list-item">
                <div className="adm-list-item-info">
                  <div className="adm-list-item-title">Healthcare & Clinic</div>
                  <div className="adm-list-item-sub">Quick Care Clinic</div>
                </div>
                <div className="adm-list-item-metric">11.5 mins / token</div>
              </div>
              <div className="adm-list-item">
                <div className="adm-list-item-info">
                  <div className="adm-list-item-title">Retail Counter</div>
                  <div className="adm-list-item-sub">The Book Nook Store</div>
                </div>
                <div className="adm-list-item-metric">4.8 mins / token</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

