import React, { useState } from "react";
import { useCustomer } from "../CustomerContext";

export function CustomerTokensPage() {
  const { tokensHistory, activeToken, openQrModal, openCancelModal, openBookModal, shops } = useCustomer();

  const [activeTab, setActiveTab] = useState("all");

  const filteredTokens = tokensHistory.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return t.status === "WAITING" || t.status === "SERVING";
    if (activeTab === "completed") return t.status === "COMPLETED";
    if (activeTab === "cancelled") return t.status === "CANCELLED";
    return true;
  });

  return (
    <div className="cst-content-body">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px" }}>
          My Queue Tokens &amp; Passes
        </h1>
        <p style={{ margin: 0, color: "var(--cst-text-muted)", fontSize: "14px" }}>
          View your active tokens, track turn progress, or review your past service history.
        </p>
      </div>

      {/* Tabs */}
      <div className="cst-category-chips">
        <button
          type="button"
          className={`cst-cat-chip ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Tokens ({tokensHistory.length})
        </button>
        <button
          type="button"
          className={`cst-cat-chip ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active / In Queue ({tokensHistory.filter((t) => t.status === "WAITING").length})
        </button>
        <button
          type="button"
          className={`cst-cat-chip ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({tokensHistory.filter((t) => t.status === "COMPLETED").length})
        </button>
        <button
          type="button"
          className={`cst-cat-chip ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled ({tokensHistory.filter((t) => t.status === "CANCELLED").length})
        </button>
      </div>

      {/* Table Card */}
      <div className="cst-tokens-table-card">
        <div className="cst-table-wrap">
          <table className="cst-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Shop / Destination</th>
                <th>Service &amp; Counter</th>
                <th>Date &amp; Time</th>
                <th>Queue Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((tkn) => {
                const isActive = tkn.status === "WAITING";
                const isCompleted = tkn.status === "COMPLETED";

                return (
                  <tr key={tkn.id}>
                    <td>
                      <span className="cst-token-pill">{tkn.tokenNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{tkn.shopName}</div>
                      <div style={{ fontSize: "12px", color: "var(--cst-text-muted)" }}>
                        {tkn.category}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tkn.service}</div>
                      <div style={{ fontSize: "12px", color: "var(--cst-text-muted)" }}>
                        {tkn.counter}
                      </div>
                    </td>
                    <td>{tkn.date}</td>
                    <td>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: isActive ? "var(--cst-green-text)" : "var(--cst-text-muted)" }}>
                        {tkn.estWait}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`cst-status-badge ${
                          isActive ? "active" : isCompleted ? "completed" : "cancelled"
                        }`}
                      >
                        ● {tkn.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          style={{
                            background: "var(--cst-surface)",
                            border: "1px solid var(--cst-border)",
                            padding: "6px 12px",
                            borderRadius: "var(--cst-radius-sm)",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "var(--cst-primary)",
                            cursor: "pointer",
                          }}
                          onClick={() => openQrModal(tkn)}
                        >
                          📱 Pass
                        </button>
                        {isActive && (
                          <button
                            type="button"
                            style={{
                              background: "transparent",
                              border: "1px solid var(--cst-red-border)",
                              padding: "6px 10px",
                              borderRadius: "var(--cst-radius-sm)",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: "var(--cst-red-text)",
                              cursor: "pointer",
                            }}
                            onClick={openCancelModal}
                          >
                            Cancel
                          </button>
                        )}
                        {!isActive && (
                          <button
                            type="button"
                            style={{
                              background: "transparent",
                              border: "1px solid var(--cst-border)",
                              padding: "6px 10px",
                              borderRadius: "var(--cst-radius-sm)",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: "var(--cst-text-secondary)",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const s = shops.find((sh) => sh.id === tkn.shopId) || shops[0];
                              openBookModal(s);
                            }}
                          >
                            Rebook
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

