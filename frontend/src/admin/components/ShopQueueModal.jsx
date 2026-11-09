import React from "react";
import { useAdmin } from "../AdminContext";

export function ShopQueueModal() {
  const { selectedShopDetail, setSelectedShopDetail, queueModalFilter, setQueueModalFilter } = useAdmin();

  if (!selectedShopDetail) return null;

  return (
    <div className="adm-modal-backdrop" onClick={() => setSelectedShopDetail(null)}>
      <div className="adm-modal-dialog adm-modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">{selectedShopDetail.name} — Live Queue</h3>
            <p className="adm-modal-subtitle">
              {selectedShopDetail.category} • Operated by {selectedShopDetail.owner}
            </p>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={() => setSelectedShopDetail(null)}
          >
            ✕
          </button>
        </div>

        <div className="adm-modal-body">
          <div className="adm-stats-strip">
            <div className="adm-stat-mini">
              <span className="adm-stat-mini-label">Now Serving</span>
              <span className="adm-stat-mini-val" style={{ color: "#2563eb" }}>{selectedShopDetail.currentServing}</span>
            </div>
            <div className="adm-stat-mini">
              <span className="adm-stat-mini-label">Waiting Visitors</span>
              <span className="adm-stat-mini-val">{selectedShopDetail.waitingCount}</span>
            </div>
            <div className="adm-stat-mini">
              <span className="adm-stat-mini-label">Average Wait</span>
              <span className="adm-stat-mini-val">{selectedShopDetail.avgWaitTime}</span>
            </div>
            <div className="adm-stat-mini">
              <span className="adm-stat-mini-label">Daily Tokens</span>
              <span className="adm-stat-mini-val">{selectedShopDetail.dailyTokens}</span>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div className="adm-filter-bar" style={{ padding: "8px 0" }}>
              <div className="adm-pill-filters">
                {["All", "Serving", "Waiting", "Completed"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`adm-pill-btn ${queueModalFilter === filter ? "active" : ""}`}
                    onClick={() => setQueueModalFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="adm-table-wrap" style={{ maxHeight: "380px", overflowY: "auto" }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Customer Name</th>
                    <th>Counter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="adm-font-semibold">{selectedShopDetail.currentServing}</td>
                    <td>Aditi Sharma</td>
                    <td>Counter A</td>
                    <td><span className="adm-badge adm-badge-success">Serving</span></td>
                  </tr>
                  <tr>
                    <td className="adm-font-semibold">QL-043</td>
                    <td>Bikram Roy</td>
                    <td>Counter A</td>
                    <td><span className="adm-badge adm-badge-warning">Waiting (Pos #1)</span></td>
                  </tr>
                  <tr>
                    <td className="adm-font-semibold">QL-044</td>
                    <td>Kavita Sen</td>
                    <td>Counter B</td>
                    <td><span className="adm-badge adm-badge-warning">Waiting (Pos #2)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => setSelectedShopDetail(null)}
          >
            Close Queue View
          </button>
        </div>
      </div>
    </div>
  );
}

