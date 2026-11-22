import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { CustomerProvider } from "./customer/CustomerContext";
import { CustomerLayout } from "./customer/CustomerLayout";
import { CustomerOverviewPage } from "./customer/pages/CustomerOverviewPage";
import { CustomerCalendarPage } from "./customer/pages/CustomerCalendarPage";
import { CustomerShopsPage } from "./customer/pages/CustomerShopsPage";
import { CustomerTokensPage } from "./customer/pages/CustomerTokensPage";
import { CustomerFavoritesPage } from "./customer/pages/CustomerFavoritesPage";
import { CustomerProfilePage } from "./customer/pages/CustomerProfilePage";

export function CustomerPortal() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("ql_admin_token") ||
    sessionStorage.getItem("token");

  // If user is not authenticated at all, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CustomerProvider>
      <CustomerLayout>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerOverviewPage />} />
          <Route path="calendar" element={<CustomerCalendarPage />} />
          <Route path="shops" element={<CustomerShopsPage />} />
          <Route path="tokens" element={<CustomerTokensPage />} />
          <Route path="favorites" element={<CustomerFavoritesPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </CustomerLayout>
    </CustomerProvider>
  );
}

export default CustomerPortal;

