import React, { useState } from "react";
import { useCustomer } from "../CustomerContext";

export function CustomerProfilePage() {
  const { customerProfile, updateProfile } = useCustomer();

  const [name, setName] = useState(customerProfile.name);
  const [phone, setPhone] = useState(customerProfile.phone);
  const [email, setEmail] = useState(customerProfile.email);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, phone, email });
  };

  return (
    <div className="cst-content-body" style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px" }}>
          Profile &amp; Account Settings
        </h1>
        <p style={{ margin: 0, color: "var(--cst-text-muted)", fontSize: "14px" }}>
          Manage your personal details and queue turn notification preferences.
        </p>
      </div>

      <div
        style={{
          background: "var(--cst-surface)",
          border: "1px solid var(--cst-border)",
          borderRadius: "var(--cst-radius-xl)",
          padding: "24px",
          boxShadow: "var(--cst-shadow-sm)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "var(--cst-primary-subtle)",
              color: "var(--cst-primary)",
              fontSize: "26px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--cst-primary-border)",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "var(--cst-text)" }}>{name}</h3>
            <span style={{ fontSize: "13px", color: "var(--cst-text-muted)" }}>
              {customerProfile.role} • Member since {customerProfile.memberSince}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="cst-panel-section-title">Full Name</label>
              <input
                type="text"
                className="cst-shop-select-box"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="cst-panel-section-title">Phone Number</label>
                <input
                  type="text"
                  className="cst-shop-select-box"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="cst-panel-section-title">Email Address</label>
                <input
                  type="email"
                  className="cst-shop-select-box"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--cst-border)", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px", color: "var(--cst-text)" }}>
                Queue Turn Alerts &amp; Notifications
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span>SMS alert when my turn is 2 persons away</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={whatsappUpdates}
                    onChange={(e) => setWhatsappUpdates(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span>WhatsApp instant token pass &amp; live queue updates</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span>Audio bell chime on web page when my token is called</span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <button type="submit" className="cst-btn-modal-submit" style={{ padding: "11px 26px" }}>
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

