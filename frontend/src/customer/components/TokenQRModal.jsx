import React from "react";
import { useCustomer } from "../CustomerContext";

export function TokenQRModal() {
  const { qrModalOpen, setQrModalOpen, selectedTokenForQr } = useCustomer();

  if (!qrModalOpen || !selectedTokenForQr) return null;

  return (
    <div className="cst-modal-backdrop" onClick={() => setQrModalOpen(false)}>
      <div className="cst-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="cst-modal-header">
          <h3 className="cst-modal-title">Digital Queue Token Pass</h3>
          <button
            type="button"
            className="cst-modal-close-btn"
            onClick={() => setQrModalOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="cst-modal-body">
          <div className="cst-qr-pass-container">
            {/* Token Number */}
            <h1 className="cst-qr-token-number">{selectedTokenForQr.tokenNumber}</h1>
            <h4 className="cst-qr-shop-name">{selectedTokenForQr.shopName}</h4>

            {/* SVG Digital QR Code */}
            <div className="cst-qr-box">
              <svg viewBox="0 0 100 100" width="100%" height="100%" fill="#0b192c">
                {/* QR corner marks */}
                <rect x="5" y="5" width="26" height="26" fill="#1665d8" rx="4" />
                <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="13" y="13" width="10" height="10" fill="#1665d8" />

                <rect x="69" y="5" width="26" height="26" fill="#1665d8" rx="4" />
                <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="77" y="13" width="10" height="10" fill="#1665d8" />

                <rect x="5" y="69" width="26" height="26" fill="#1665d8" rx="4" />
                <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="13" y="77" width="10" height="10" fill="#1665d8" />

                {/* QR data pattern dots */}
                <rect x="36" y="8" width="6" height="6" />
                <rect x="46" y="14" width="6" height="6" />
                <rect x="56" y="8" width="6" height="6" />
                <rect x="36" y="24" width="6" height="6" />
                <rect x="46" y="28" width="6" height="6" />
                <rect x="56" y="22" width="6" height="6" />

                <rect x="8" y="38" width="6" height="6" />
                <rect x="18" y="44" width="6" height="6" />
                <rect x="28" y="38" width="6" height="6" />
                <rect x="38" y="40" width="8" height="8" fill="#1665d8" />
                <rect x="52" y="42" width="6" height="6" />
                <rect x="64" y="38" width="6" height="6" />
                <rect x="76" y="44" width="6" height="6" />
                <rect x="86" y="38" width="6" height="6" />

                <rect x="38" y="56" width="6" height="6" />
                <rect x="48" y="62" width="6" height="6" />
                <rect x="58" y="56" width="6" height="6" />
                <rect x="38" y="74" width="6" height="6" />
                <rect x="48" y="80" width="6" height="6" />
                <rect x="58" y="72" width="6" height="6" />
                <rect x="72" y="68" width="8" height="8" />
                <rect x="84" y="78" width="6" height="6" />
              </svg>
            </div>

            {/* Token Meta Grid */}
            <div
              style={{
                width: "100%",
                background: "var(--cst-surface-subtle)",
                borderRadius: "var(--cst-radius)",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                textAlign: "left",
                fontSize: "12.5px",
                marginBottom: "14px",
              }}
            >
              <div>
                <span style={{ color: "var(--cst-text-muted)" }}>Service:</span>
                <div style={{ fontWeight: 700, color: "var(--cst-text)" }}>
                  {selectedTokenForQr.service || "Standard Service"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--cst-text-muted)" }}>Counter:</span>
                <div style={{ fontWeight: 700, color: "var(--cst-text)" }}>
                  {selectedTokenForQr.counter || "Counter #01"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--cst-text-muted)" }}>Est. Turn:</span>
                <div style={{ fontWeight: 700, color: "var(--cst-green-text)" }}>
                  {selectedTokenForQr.estWait || "In ~9 mins"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--cst-text-muted)" }}>Status:</span>
                <div style={{ fontWeight: 700, color: "var(--cst-primary)" }}>
                  {selectedTokenForQr.status}
                </div>
              </div>
            </div>

            <p className="cst-qr-instructions">
              Please present this QR code or token number when your turn is called at the service counter.
            </p>
          </div>
        </div>

        <div className="cst-modal-footer">
          <button
            type="button"
            className="cst-btn-modal-cancel"
            onClick={() => window.print()}
          >
            🖨️ Print Pass
          </button>
          <button
            type="button"
            className="cst-btn-modal-submit"
            onClick={() => setQrModalOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

