import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useAdmin } from "./AdminContext";
import { AddOwnerModal } from "./components/AddOwnerModal";
import { EditAdminModal } from "./components/EditAdminModal";
import { PlanModals } from "./components/PlanModals";
import { AdminImageCropModal } from "../AdminImageCropModal";
import "./admin.css";

export function AdminLayout({ children }) {
  const {
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    adminProfile,
    handleLogout,
    cropModalOpen,
    setCropModalOpen,
    rawSelectedImage,
    handleCropComplete,
    dashboardToast,
    setAddOwnerModalOpen,
  } = useAdmin();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Links with SVG icons
  const navItems = [
    {
      group: "OVERVIEW",
      items: [
        {
          to: "/admin/dashboard",
          label: "Dashboard",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "DIRECTORIES",
      items: [
        {
          to: "/admin/owners",
          label: "Shop Owners",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        },
        {
          to: "/admin/shops",
          label: "Store Queues",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
            </svg>
          ),
        },
        {
          to: "/admin/users",
          label: "Customers",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "BUSINESS & REPORTS",
      items: [
        {
          to: "/admin/subscriptions",
          label: "Subscriptions",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          ),
        },
        {
          to: "/admin/payments",
          label: "Revenue & Ledger",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          ),
        },
        {
          to: "/admin/reports",
          label: "Analytics",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        {
          to: "/admin/settings",
          label: "Admin Settings",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className={`adm-root ${theme === "dark" ? "adm-theme-dark" : "adm-theme-light"}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="adm-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className={`adm-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="adm-sidebar-header">
          <div className="adm-brand" onClick={() => navigate("/admin/dashboard")}>
            <div className="adm-brand-logo">Q</div>
            <div className="adm-brand-text">
              <span className="adm-brand-title">QueueLess</span>
              <span className="adm-brand-badge">ADMIN</span>
            </div>
          </div>
          <button
            type="button"
            className="adm-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
          >
            ❮
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="adm-sidebar-nav">
          {navItems.map((group) => (
            <div key={group.group} className="adm-nav-group">
              <div className="adm-nav-group-title">{group.group}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `adm-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => {
                    if (window.innerWidth <= 1024) setSidebarOpen(false);
                  }}
                >
                  <span className="adm-nav-icon">{item.icon}</span>
                  <span className="adm-nav-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Admin Profile */}
        <div className="adm-sidebar-footer">
          <div
            className="adm-sidebar-profile"
            onClick={() => navigate("/admin/settings")}
            title="Go to Settings"
          >
            <div className="adm-avatar-small">
              {adminProfile.avatarImg ? (
                <img src={adminProfile.avatarImg} alt={adminProfile.name} />
              ) : (
                adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : "A"
              )}
            </div>
            <div className="adm-sidebar-profile-info">
              <div className="adm-sidebar-profile-name">{adminProfile.name}</div>
              <div className="adm-sidebar-profile-role">{adminProfile.role}</div>
            </div>
          </div>
          <button
            type="button"
            className="adm-logout-btn"
            onClick={handleLogout}
            title="Sign out of Admin Session"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────── */}
      <div className="adm-main-wrap">
        {/* Top Navbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button
              type="button"
              className="adm-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="adm-breadcrumb">
              <span className="adm-breadcrumb-root">Admin</span>
              <span className="adm-breadcrumb-sep">/</span>
              <span className="adm-breadcrumb-curr">
                {(() => {
                  const clean = location.pathname.replace(/^\/admin\/?/, "");
                  if (!clean || clean === "dashboard") return "Dashboard";
                  const parts = clean.split("/").filter(Boolean);
                  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                  return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} / Details`;
                })()}
              </span>
            </div>
          </div>

          <div className="adm-topbar-right">
            {/* Dark / Light Toggle */}
            <button
              type="button"
              className="adm-icon-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                /* Sun Icon */
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="adm-profile-menu-wrap">
              <button
                type="button"
                className="adm-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="adm-avatar-small">
                  {adminProfile.avatarImg ? (
                    <img src={adminProfile.avatarImg} alt={adminProfile.name} />
                  ) : (
                    adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : "A"
                  )}
                </div>
                <span className="adm-profile-trigger-name">{adminProfile.name}</span>
                <span style={{ fontSize: "10px", color: "var(--adm-text-muted)" }}>▼</span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="adm-dropdown-menu"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="adm-dropdown-header">
                    <div className="adm-font-semibold">{adminProfile.name}</div>
                    <div className="adm-text-muted" style={{ fontSize: "12px" }}>{adminProfile.email}</div>
                  </div>
                  <div className="adm-dropdown-divider" />
                  <button
                    type="button"
                    className="adm-dropdown-item"
                    onClick={() => navigate("/admin/settings")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Account Settings</span>
                  </button>
                  <button
                    type="button"
                    className="adm-dropdown-item adm-dropdown-danger"
                    onClick={handleLogout}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="adm-page-container">{children}</main>
      </div>

      {/* ── MODALS MOUNTED GLOBALLY ──────────────────────────────── */}
      <AddOwnerModal />
      <EditAdminModal />
      <PlanModals />

      {/* Image Crop Modal */}
      {cropModalOpen && (
        <AdminImageCropModal
          isOpen={cropModalOpen}
          imageSrc={rawSelectedImage}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          userName={adminProfile.name || "Administrator"}
        />
      )}

      {/* ── GLOBAL TOAST NOTIFICATION ────────────────────────────── */}
      {dashboardToast && (
        <div className={`adm-toast ${dashboardToast.type === "error" ? "error" : "success"}`}>
          <span className="adm-toast-icon">
            {dashboardToast.type === "error" ? "⚠️" : "✓"}
          </span>
          <span className="adm-toast-text">{dashboardToast.message}</span>
        </div>
      )}
    </div>
  );
}

