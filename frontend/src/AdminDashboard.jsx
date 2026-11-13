import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { AdminProvider } from "./admin/AdminContext";
import { AdminLayout } from "./admin/AdminLayout";
import { OverviewPage } from "./admin/pages/OverviewPage";
import { OwnersPage } from "./admin/pages/OwnersPage";
import { OwnerDetailPage } from "./admin/pages/OwnerDetailPage";
import { ShopsPage } from "./admin/pages/ShopsPage";
import { ShopQueuePage } from "./admin/pages/ShopQueuePage";
import { UsersPage } from "./admin/pages/UsersPage";
import { UserDetailPage } from "./admin/pages/UserDetailPage";
import { SubscriptionsPage } from "./admin/pages/SubscriptionsPage";
import { PaymentsPage } from "./admin/pages/PaymentsPage";
import { ReportsPage } from "./admin/pages/ReportsPage";
import { SettingsPage } from "./admin/pages/SettingsPage";

export { mapApiOwnerToDashboard, mapApiUserToDashboard, getOwnerPasswordStrength } from "./admin/adminData";

export function AdminDashboard() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("ql_admin_token") ||
    sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminProvider>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="owners" element={<OwnersPage />} />
          <Route path="owners/:id" element={<OwnerDetailPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:id" element={<ShopQueuePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </AdminProvider>
  );
}

export default AdminDashboard;
