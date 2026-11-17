import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { AdminProvider } from "./admin/AdminContext";
import { AdminLayout } from "./admin/AdminLayout";
import { OverviewPage } from "./admin/pages/OverviewPage";
import { OwnersPage } from "./admin/pages/OwnersPage";
import { OwnerDetailPage } from "./admin/pages/OwnerDetailPage";
import { ShopsPage } from "./admin/pages/ShopsPage";
import { ShopQueuePage } from "./admin/pages/ShopQueuePage";
import { TokensPage } from "./admin/pages/TokensPage";
import { UsersPage } from "./admin/pages/UsersPage";
import { UserDetailPage } from "./admin/pages/UserDetailPage";
import { SubscriptionsPage } from "./admin/pages/SubscriptionsPage";
import { PaymentsPage } from "./admin/pages/PaymentsPage";
import { ReportsPage } from "./admin/pages/ReportsPage";
import { SettingsPage } from "./admin/pages/SettingsPage";
import { checkIsAdmin } from "./authRole";

export { mapApiOwnerToDashboard, mapApiUserToDashboard, getOwnerPasswordStrength } from "./admin/adminData";

export function AdminDashboard() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("ql_admin_token") ||
    sessionStorage.getItem("token");

  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch {}

  const role = localStorage.getItem("role") || sessionStorage.getItem("role") || user?.role;
  const isAdmin = checkIsAdmin({
    user,
    role,
    user_role: user?.user_role,
    token,
    email: user?.email,
  });

  if (!token || !isAdmin) {
    localStorage.removeItem("token");
    localStorage.removeItem("ql_admin_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.clear();
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
          <Route path="tokens" element={<TokensPage />} />
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
