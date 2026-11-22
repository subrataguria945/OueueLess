import React from "react";
import { useCustomer } from "../CustomerContext";
import { CustomerAvailabilityCalendar } from "../components/CustomerAvailabilityCalendar";

export function CustomerCalendarPage() {
  const { openBookModal } = useCustomer();

  return (
    <div className="cst-content-body">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px" }}>
          Booking &amp; Availability Calendar
        </h1>
        <p style={{ margin: 0, color: "var(--cst-text-muted)", fontSize: "14px" }}>
          View daily capacity, available token slots across shops, and reserve your queue slot in advance.
        </p>
      </div>

      <CustomerAvailabilityCalendar
        onSelectDateAndShop={(date, shop) => {
          openBookModal(shop, date);
        }}
      />
    </div>
  );
}

