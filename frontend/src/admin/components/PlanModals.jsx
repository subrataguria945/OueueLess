import React, { useState } from "react";
import { useAdmin } from "../AdminContext";

export function PlanModals() {
  const {
    editingPlanModal,
    setEditingPlanModal,
    handleSavePlanEdits,
    changeSubscriberModal,
    setChangeSubscriberModal,
    handleChangeSubscriberPlan,
    subscriptionPlans,
  } = useAdmin();

  // Local state for editing a subscription plan
  const [formPlan, setFormPlan] = useState(editingPlanModal);
  const [selectedTier, setSelectedTier] = useState(changeSubscriberModal?.planId || "growth");
  const [selectedCycle, setSelectedCycle] = useState(changeSubscriberModal?.billingCycle || "Monthly");

  // If opening plan modal, keep in sync
  React.useEffect(() => {
    if (editingPlanModal) setFormPlan(editingPlanModal);
  }, [editingPlanModal]);

  React.useEffect(() => {
    if (changeSubscriberModal) {
      setSelectedTier(changeSubscriberModal.planId);
      setSelectedCycle(changeSubscriberModal.billingCycle);
    }
  }, [changeSubscriberModal]);

  return (
    <>
      {/* ── 1. EDIT SUBSCRIPTION PLAN MODAL ────────────────── */}
      {editingPlanModal && formPlan && (
        <div className="adm-modal-backdrop" onClick={() => setEditingPlanModal(null)}>
          <div className="adm-modal-dialog adm-modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Edit Plan Pricing & Details</h3>
                <p className="adm-modal-subtitle">{formPlan.name}</p>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setEditingPlanModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-field">
                <label className="adm-label">Plan Name</label>
                <input
                  type="text"
                  className="adm-input"
                  value={formPlan.name}
                  onChange={(e) => setFormPlan({ ...formPlan, name: e.target.value })}
                />
              </div>

              <div className="adm-form-grid">
                <div className="adm-field">
                  <label className="adm-label">Monthly Price (₹)</label>
                  <input
                    type="number"
                    className="adm-input"
                    value={formPlan.monthlyPrice}
                    onChange={(e) => setFormPlan({ ...formPlan, monthlyPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Annual Price /mo (₹)</label>
                  <input
                    type="number"
                    className="adm-input"
                    value={formPlan.annualPrice}
                    onChange={(e) =>
                      setFormPlan({
                        ...formPlan,
                        annualPrice: Number(e.target.value),
                        annualTotal: Number(e.target.value) * 12,
                      })
                    }
                  />
                </div>
              </div>

              <div className="adm-field">
                <label className="adm-label">Tagline Description</label>
                <input
                  type="text"
                  className="adm-input"
                  value={formPlan.tagline}
                  onChange={(e) => setFormPlan({ ...formPlan, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setEditingPlanModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => handleSavePlanEdits(formPlan)}
              >
                Save Plan Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CHANGE SUBSCRIBER TIER MODAL ────────────────── */}
      {changeSubscriberModal && (
        <div className="adm-modal-backdrop" onClick={() => setChangeSubscriberModal(null)}>
          <div className="adm-modal-dialog adm-modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Modify Merchant Subscription</h3>
                <p className="adm-modal-subtitle">{changeSubscriberModal.ownerName} • {changeSubscriberModal.shopName}</p>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setChangeSubscriberModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-field">
                <label className="adm-label">Select Subscription Tier</label>
                <select
                  className="adm-select"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                >
                  {subscriptionPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹ {p.monthlyPrice}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="adm-field">
                <label className="adm-label">Billing Cycle</label>
                <select
                  className="adm-select"
                  value={selectedCycle}
                  onChange={(e) => setSelectedCycle(e.target.value)}
                >
                  <option value="Monthly">Monthly Billing</option>
                  <option value="Annual">Annual Billing (Discounted)</option>
                </select>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setChangeSubscriberModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => handleChangeSubscriberPlan(changeSubscriberModal.id, selectedTier, selectedCycle)}
              >
                Confirm Upgrade / Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

