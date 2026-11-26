import React, { useState, useEffect } from "react";
import { useCustomer } from "../CustomerContext";

export function BookTokenModal() {
  const {
    bookModalOpen,
    setBookModalOpen,
    selectedShopForBooking,
    selectedDateForBooking,
    shops,
    handleConfirmBooking,
    customerProfile,
  } = useCustomer();

  const [shopId, setShopId] = useState(1);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 10:30 AM");
  const [service, setService] = useState("");
  const [counter, setCounter] = useState("");
  const [notes, setNotes] = useState("");

  const currentShop = shops.find((s) => s.id === Number(shopId)) || shops[0];

  useEffect(() => {
    if (selectedShopForBooking) {
      setShopId(selectedShopForBooking.id);
      if (selectedShopForBooking.services && selectedShopForBooking.services[0]) {
        setService(selectedShopForBooking.services[0]);
      }
      if (selectedShopForBooking.counters && selectedShopForBooking.counters[0]) {
        setCounter(selectedShopForBooking.counters[0]);
      }
    }
    if (selectedDateForBooking) {
      setDate(selectedDateForBooking);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [selectedShopForBooking, selectedDateForBooking, bookModalOpen]);

  if (!bookModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConfirmBooking({
      shopId,
      service,
      counter,
      date,
      timeSlot,
      notes,
    });
  };

  const timeSlots = [
    { slot: "09:30 AM - 10:00 AM", available: true, label: "5 slots left" },
    { slot: "10:00 AM - 10:30 AM", available: true, label: "3 slots left" },
    { slot: "11:00 AM - 11:30 AM", available: true, label: "6 slots left" },
    { slot: "02:00 PM - 02:30 PM", available: true, label: "4 slots left" },
    { slot: "04:30 PM - 05:00 PM", available: true, label: "2 slots left" },
    { slot: "06:00 PM - 06:30 PM", available: false, label: "Full" },
  ];

  return (
    <div className="cst-modal-backdrop" onClick={() => setBookModalOpen(false)}>
      <div className="cst-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="cst-modal-header">
          <h3 className="cst-modal-title">Book New Queue Token</h3>
          <button
            type="button"
            className="cst-modal-close-btn"
            onClick={() => setBookModalOpen(false)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cst-modal-body">
            {/* Shop Selector */}
            <div>
              <label className="cst-panel-section-title">Select Shop / Destination</label>
              <select
                className="cst-shop-select-box"
                value={shopId}
                onChange={(e) => {
                  const sId = Number(e.target.value);
                  setShopId(sId);
                  const s = shops.find((item) => item.id === sId);
                  if (s) {
                    setService(s.services[0]);
                    setCounter(s.counters[0]);
                  }
                }}
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name} ({s.categoryLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="cst-panel-section-title">Select Date</label>
              <input
                type="date"
                className="cst-shop-select-box"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="cst-panel-section-title">Available Time Slot</label>
              <div className="cst-slots-grid">
                {timeSlots.map((ts) => (
                  <div
                    key={ts.slot}
                    className={`cst-slot-chip ${timeSlot === ts.slot ? "selected" : ""} ${
                      !ts.available ? "disabled" : ""
                    }`}
                    onClick={() => {
                      if (ts.available) setTimeSlot(ts.slot);
                    }}
                  >
                    <span className="cst-slot-time">{ts.slot}</span>
                    <span
                      className={`cst-slot-availability ${
                        !ts.available ? "red" : ts.label.includes("2") ? "amber" : "green"
                      }`}
                    >
                      ● {ts.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service & Counter */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="cst-panel-section-title">Service Type</label>
                <select
                  className="cst-shop-select-box"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  {currentShop.services.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="cst-panel-section-title">Counter</label>
                <select
                  className="cst-shop-select-box"
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                >
                  {currentShop.counters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Details info */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--cst-radius)",
                background: "var(--cst-surface-subtle)",
                fontSize: "12.5px",
                color: "var(--cst-text-muted)",
              }}
            >
              Booking for: <strong style={{ color: "var(--cst-text)" }}>{customerProfile.name}</strong> (
              {customerProfile.phone})
            </div>
          </div>

          <div className="cst-modal-footer">
            <button
              type="button"
              className="cst-btn-modal-cancel"
              onClick={() => setBookModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="cst-btn-modal-submit">
              Confirm &amp; Generate Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

