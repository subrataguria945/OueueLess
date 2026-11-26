import React from "react";
import { useCustomer } from "../CustomerContext";

export function CancelTokenModal() {
  const { cancelModalOpen, setCancelModalOpen, activeToken, handleCancelActiveToken } = useCustomer();

  if (!cancelModalOpen || !activeToken) return null;

  return (
    <div className="cst-modal-backdrop" onClick={() => setCancelModalOpen(false)}>
      <div className="cst-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="cst-modal-header">
          <h3 className="cst-modal-title">Cancel Queue Token</h3>
          <button
            type="button"
            className="cst-modal-close-btn"
            onClick={() => setCancelModalOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="cst-modal-body">
          <p style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: "1.5", color: "var(--cst-text)" }}>
            Are you sure you want to cancel your active token{" "}
            <strong>{activeToken.tokenNumber}</strong> for <strong>{activeToken.shopName}</strong>?
          </p>
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--cst-radius)",
              background: "var(--cst-red-bg)",
              border: "1px solid var(--cst-red-border)",
              fontSize: "12.5px",
              color: "var(--cst-red-text)",
            }}
          >
            ⚠️ If you cancel, your position in line will be released and given to the next waiting customer.
          </div>
        </div>

        <div className="cst-modal-footer">
          <button
            type="button"
            className="cst-btn-modal-cancel"
            onClick={() => setCancelModalOpen(false)}
          >
            Keep Token
          </button>
          <button
            type="button"
            className="cst-btn-modal-submit"
            style={{ background: "#ef4444" }}
            onClick={handleCancelActiveToken}
          >
            Yes, Cancel Token
          </button>
        </div>
      </div>
    </div>
  );
}

