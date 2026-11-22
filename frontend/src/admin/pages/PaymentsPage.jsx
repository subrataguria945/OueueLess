import React from "react";
import { useAdmin } from "../AdminContext";
import { TRANSACTIONS_DATA } from "../adminData";

export function PaymentsPage() {
  const { showToast } = useAdmin();

  const handleDownloadInvoice = (txnId) => {
    showToast(`Invoice PDF for ${txnId} downloaded successfully!`, "success");
  };

  return (
    <div className="adm-page-body">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Payments & Revenue Ledger</h1>
          <p className="adm-page-desc">Invoices, payout records, and transaction histories across merchant accounts.</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Total Monthly Recurring</span>
            <span className="adm-stat-trend">+18%</span>
          </div>
          <div className="adm-stat-value">₹ 2,45,680</div>
          <div className="adm-stat-context">from subscription plans</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Successful Invoices</span>
            <span className="adm-stat-trend">98.4%</span>
          </div>
          <div className="adm-stat-value">124 Paid</div>
          <div className="adm-stat-context">2 pending clearances</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Payouts Dispatched</span>
            <span className="adm-stat-trend">+12%</span>
          </div>
          <div className="adm-stat-value">₹ 1,85,200</div>
          <div className="adm-stat-context">net settled this cycle</div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="adm-card" style={{ marginTop: "24px" }}>
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">Recent Invoices & Transactions</h3>
            <p className="adm-card-desc">UPI, Card and Netbanking subscription billing logs</p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Invoice / Txn ID</th>
                <th>Merchant Owner</th>
                <th>Purchased Tier</th>
                <th>Amount</th>
                <th>Gateway / Method</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS_DATA.map((t) => {
                const isSuccess = t.status === "Completed";
                const isPending = t.status === "Pending";
                return (
                  <tr key={t.id}>
                    <td className="adm-font-semibold">{t.id}</td>
                    <td>{t.owner}</td>
                    <td>{t.plan}</td>
                    <td className="adm-font-semibold">{t.amount}</td>
                    <td className="adm-text-muted">{t.method}</td>
                    <td className="adm-text-muted">{t.date}</td>
                    <td>
                      <span
                        className={`adm-badge ${
                          isSuccess ? "adm-badge-success" : isPending ? "adm-badge-warning" : "adm-badge-danger"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="adm-table-btn"
                        onClick={() => handleDownloadInvoice(t.id)}
                      >
                        PDF Receipt
                      </button>
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

