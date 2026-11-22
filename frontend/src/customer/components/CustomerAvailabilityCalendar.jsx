import React, { useState } from "react";
import { useCustomer } from "../CustomerContext";

export function CustomerAvailabilityCalendar({ onSelectDateAndShop }) {
  const { shops, openBookModal } = useCustomer();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedShopId, setSelectedShopId] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM - 10:30 AM");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split("T")[0]);
  };

  // Generate calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Availability algorithm based on date
  const getDayAvailability = (dayNum, isCurrentMonth) => {
    if (!isCurrentMonth) return { status: "closed", label: "Closed", slotsCount: 0 };

    const dateObj = new Date(year, month, dayNum);
    const dayOfWeek = dateObj.getDay();

    // Sunday = limited or closed
    if (dayOfWeek === 0) {
      if (dayNum % 2 === 0) {
        return { status: "closed", label: "Holiday", slotsCount: 0 };
      }
      return { status: "limited", label: "2 Slots", slotsCount: 2 };
    }

    // Pseudo-deterministic pattern for realistic shop availability
    const seed = (dayNum * 7 + selectedShopId * 13) % 10;
    if (seed < 5) {
      return { status: "available", label: "Available", slotsCount: 8 + (dayNum % 6) };
    } else if (seed < 8) {
      return { status: "limited", label: "Filling Fast", slotsCount: 2 + (dayNum % 3) };
    } else {
      return { status: "full", label: "Full", slotsCount: 0 };
    }
  };

  // Calendar cells
  const calendarCells = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: "",
      availability: { status: "closed", label: "Closed", slotsCount: 0 },
    });
  }

  // Days in current month
  const todayStr = new Date().toISOString().split("T")[0];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    const availability = getDayAvailability(d, true);

    calendarCells.push({
      dayNum: d,
      isCurrentMonth: true,
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr,
      availability,
    });
  }

  // Next month leading days to complete row
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    calendarCells.push({
      dayNum: n,
      isCurrentMonth: false,
      dateStr: "",
      availability: { status: "closed", label: "Closed", slotsCount: 0 },
    });
  }

  const selectedShop = shops.find((s) => s.id === Number(selectedShopId)) || shops[0];

  // Formatted date string for panel header
  const getSelectedDateDisplay = () => {
    if (!selectedDateStr) return "Today";
    const [y, m, d] = selectedDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Time slots for selected date & shop
  const sampleSlots = [
    { time: "09:30 AM - 10:00 AM", available: true, count: 5, category: "Morning" },
    { time: "10:30 AM - 11:00 AM", available: true, count: 4, category: "Morning" },
    { time: "11:30 AM - 12:00 PM", available: true, count: 2, category: "Morning" },
    { time: "01:30 PM - 02:00 PM", available: true, count: 6, category: "Afternoon" },
    { time: "02:30 PM - 03:00 PM", available: false, count: 0, category: "Afternoon" },
    { time: "03:30 PM - 04:00 PM", available: true, count: 3, category: "Afternoon" },
    { time: "05:00 PM - 05:30 PM", available: true, count: 4, category: "Evening" },
    { time: "06:30 PM - 07:00 PM", available: true, count: 1, category: "Evening" },
  ];

  const handleBookFromCalendar = () => {
    openBookModal(selectedShop, selectedDateStr);
    if (onSelectDateAndShop) {
      onSelectDateAndShop(selectedDateStr, selectedShop);
    }
  };

  return (
    <div className="cst-calendar-card">
      {/* ── Top Bar with Month Navigation ────────────────────────────── */}
      <div className="cst-calendar-top-bar">
        <div className="cst-calendar-title-wrap">
          <h2>📅 Queue &amp; Slot Availability Calendar</h2>
          <p>Check available dates, open token slots, and book your turn in advance.</p>
        </div>

        <div className="cst-calendar-month-nav">
          <button
            type="button"
            className="cst-btn-today"
            onClick={handleGoToday}
          >
            Today
          </button>
          <button
            type="button"
            className="cst-month-btn"
            onClick={handlePrevMonth}
            title="Previous Month"
          >
            ❮
          </button>
          <span className="cst-current-month-label">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            className="cst-month-btn"
            onClick={handleNextMonth}
            title="Next Month"
          >
            ❯
          </button>
        </div>
      </div>

      {/* ── Availability Legend ──────────────────────────────────────── */}
      <div className="cst-calendar-legend">
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--cst-text)" }}>
          Availability Status:
        </span>
        <div className="cst-legend-item">
          <span className="cst-legend-dot available" />
          <span>Available (Slots Open)</span>
        </div>
        <div className="cst-legend-item">
          <span className="cst-legend-dot limited" />
          <span>Limited / Filling Fast</span>
        </div>
        <div className="cst-legend-item">
          <span className="cst-legend-dot full" />
          <span>Full / Sold Out</span>
        </div>
        <div className="cst-legend-item">
          <span className="cst-legend-dot closed" />
          <span>Closed / Holiday</span>
        </div>
      </div>

      {/* ── Main Calendar Layout (Grid + Detail Panel) ───────────────── */}
      <div className="cst-calendar-layout">
        {/* Left Column: Calendar Days Grid */}
        <div className="cst-calendar-grid-wrap">
          <div className="cst-calendar-weekdays">
            <span className="cst-calendar-weekday">Sun</span>
            <span className="cst-calendar-weekday">Mon</span>
            <span className="cst-calendar-weekday">Tue</span>
            <span className="cst-calendar-weekday">Wed</span>
            <span className="cst-calendar-weekday">Thu</span>
            <span className="cst-calendar-weekday">Fri</span>
            <span className="cst-calendar-weekday">Sat</span>
          </div>

          <div className="cst-calendar-days-grid">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={`cst-calendar-day ${!cell.isCurrentMonth ? "other-month" : ""} ${
                  cell.isToday ? "today" : ""
                } ${cell.isSelected ? "selected" : ""}`}
                onClick={() => {
                  if (cell.isCurrentMonth && cell.dateStr) {
                    setSelectedDateStr(cell.dateStr);
                  }
                }}
              >
                <div className="cst-day-header">
                  <span className="cst-day-number">{cell.dayNum}</span>
                  {cell.isToday && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "var(--cst-primary)",
                        textTransform: "uppercase",
                      }}
                    >
                      Today
                    </span>
                  )}
                </div>

                {cell.isCurrentMonth && (
                  <div>
                    <span className={`cst-day-status-pill ${cell.availability.status}`}>
                      ● {cell.availability.label}
                    </span>
                    {cell.availability.slotsCount > 0 && (
                      <span className="cst-day-token-count">
                        {cell.availability.slotsCount} tokens left
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Day Slots & 1-Click Booking */}
        <div className="cst-day-detail-panel">
          <div className="cst-day-detail-header">
            <span className="cst-selected-date-badge">🗓️ Selected Date</span>
            <h3 className="cst-selected-date-title">{getSelectedDateDisplay()}</h3>
          </div>

          {/* Shop Picker for this Date */}
          <div>
            <label className="cst-panel-section-title">Select Shop to Check</label>
            <select
              className="cst-shop-select-box"
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(Number(e.target.value))}
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name} ({s.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Available Slots Header */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="cst-panel-section-title" style={{ margin: 0 }}>
                Available Time Slots
              </span>
              <span style={{ fontSize: "12px", color: "var(--cst-green-text)", fontWeight: 700 }}>
                ● 7 Slots Open
              </span>
            </div>

            {/* Slots Grid */}
            <div className="cst-slots-grid">
              {sampleSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`cst-slot-chip ${selectedSlot === slot.time ? "selected" : ""} ${
                    !slot.available ? "disabled" : ""
                  }`}
                  onClick={() => {
                    if (slot.available) setSelectedSlot(slot.time);
                  }}
                >
                  <span className="cst-slot-time">{slot.time}</span>
                  <span
                    className={`cst-slot-availability ${
                      !slot.available ? "red" : slot.count <= 2 ? "amber" : "green"
                    }`}
                  >
                    ● {slot.available ? `${slot.count} tokens left` : "Full / Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Booking Summary */}
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--cst-radius)",
              background: "var(--cst-surface-subtle)",
              fontSize: "12.5px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ color: "var(--cst-text-muted)" }}>
              Destination: <strong style={{ color: "var(--cst-text)" }}>{selectedShop.name}</strong>
            </div>
            <div style={{ color: "var(--cst-text-muted)" }}>
              Selected Slot: <strong style={{ color: "var(--cst-primary)" }}>{selectedSlot}</strong>
            </div>
          </div>

          {/* Book Button */}
          <button
            type="button"
            className="cst-btn-book-slot"
            onClick={handleBookFromCalendar}
          >
            <span>Book Token for this Date</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

