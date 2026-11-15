import React from "react";
import { useAdmin } from "../AdminContext";

export function SubscriptionsPage() {
  const {
    subscriptionPlans,
    subscribersList,
    setEditingPlanModal,
    setChangeSubscriberModal,
  } = useAdmin();

  return (
    <div className="adm-page-body">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Subscription Plans & Billing</h1>
          <p className="adm-page-desc">Pricing tiers, subscriber quotas, and merchant membership health.</p>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="adm-plans-grid">
        {subscriptionPlans.map((plan) => (
          <div key={plan.id} className={`adm-plan-card ${plan.popular ? "featured" : ""}`}>
            {plan.popular && <span className="adm-featured-tag">Most Popular Tier</span>}
            <div className="adm-plan-header">
              <span className="adm-plan-icon">{plan.icon}</span>
              <h3 className="adm-plan-name">{plan.name}</h3>
              <p className="adm-plan-desc">{plan.tagline}</p>
            </div>

            <div className="adm-plan-price-wrap">
              <span className="adm-plan-curr">{plan.currency}</span>
              <span className="adm-plan-amount">{plan.monthlyPrice.toLocaleString()}</span>
              <span className="adm-plan-per">/month</span>
            </div>

            <div className="adm-plan-annual-sub">
              or ₹ {plan.annualPrice.toLocaleString()}/mo billed annually (₹ {plan.annualTotal.toLocaleString()}/yr)
            </div>

            <div className="adm-plan-features">
              {plan.features.map((feat, idx) => (
                <div key={idx} className={`adm-plan-feature-item ${feat.included ? "included" : "excluded"}`}>
                  <span className="adm-feature-icon">{feat.included ? "✓" : "—"}</span>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              style={{ width: "100%", marginTop: "16px" }}
              onClick={() => setEditingPlanModal(plan)}
            >
              Configure Pricing & Features
            </button>
          </div>
        ))}
      </div>

      {/* Subscribers Table */}
      <div className="adm-card" style={{ marginTop: "24px" }}>
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">Merchant Subscribers Directory</h3>
            <p className="adm-card-desc">Active store owners billed on platform tiers</p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Subscriber Code</th>
                <th>Owner Name</th>
                <th>Store Outlets</th>
                <th>Current Plan</th>
                <th>Cycle</th>
                <th>Billed Rate</th>
                <th>Renewal Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribersList.map((sub) => (
                <tr key={sub.id}>
                  <td className="adm-font-semibold">{sub.id}</td>
                  <td>
                    <div className="adm-font-medium">{sub.ownerName}</div>
                    <div className="adm-text-muted" style={{ fontSize: "12px" }}>{sub.email}</div>
                  </td>
                  <td className="adm-text-muted">{sub.shopName}</td>
                  <td>
                    <span className="adm-badge adm-badge-neutral">{sub.planName}</span>
                  </td>
                  <td>{sub.billingCycle}</td>
                  <td className="adm-font-semibold">{sub.amount}</td>
                  <td className="adm-text-muted">{sub.renewsOn}</td>
                  <td>
                    <span className="adm-badge adm-badge-success">{sub.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="adm-table-btn"
                      onClick={() => setChangeSubscriberModal(sub)}
                    >
                      Change Plan
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

