import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useCustomer } from "./CustomerContext";
import { BookTokenModal } from "./components/BookTokenModal";
import { TokenQRModal } from "./components/TokenQRModal";
import { CancelTokenModal } from "./components/CancelTokenModal";
import "./customer.css";

export function CustomerLayout({ children }) {
  const {
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    customerProfile,
    activeToken,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    toast,
    openBookModal,
    handleLogout,
  } = useCustomer();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navItems = [
    {
      group: "MAIN",
      items: [
        {
          to: "/customer/dashboard",
          label: "Dashboard",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          ),
        },
        {
          to: "/customer/calendar",
          label: "Availability Calendar",
          badge: "Slots",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
        },
        {
          to: "/customer/shops",
          label: "Explore Shops",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "MY QUEUES",
      items: [
        {
          to: "/customer/tokens",
          label: "My Tokens",
          badge: activeToken ? "1 Active" : null,
          badgeLive: !!activeToken,
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          ),
        },
        {
          to: "/customer/favorites",
          label: "Saved Favorites",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "SETTINGS",
      items: [
        {
          to: "/customer/profile",
          label: "Profile & Settings",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          ),
        },
      ],
    },
  ];

  // Helper for Breadcrumbs title
  const getBreadcrumbTitle = () => {
    const p = location.pathname.replace(/^\/customer\/?/, "");
    if (!p || p === "dashboard") return "Dashboard";
    if (p === "calendar") return "Availability Calendar";
    if (p === "shops") return "Explore Shops";
    if (p === "tokens") return "My Tokens";
    if (p === "favorites") return "Saved Favorites";
    if (p === "profile") return "Profile & Settings";
    return p.charAt(0).toUpperCase() + p.slice(1);
  };

  return (
    <div className={`cst-root ${theme === "dark" ? "cst-theme-dark" : "cst-theme-light"}`}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 95,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── 1. SIDEBAR NAVIGATION ───────────────────────────────────── */}
      <aside className={`cst-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="cst-sidebar-header">
          <div className="cst-brand" onClick={() => navigate("/customer/dashboard")}>
            <div className="cst-brand-logo">Q</div>
            <div className="cst-brand-text">
              <span className="cst-brand-title">
                Queue<span>Less</span>
              </span>
              <span className="cst-brand-badge">CUSTOMER PORTAL</span>
            </div>
          </div>
          <button
            type="button"
            className="cst-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="cst-sidebar-nav">
          {navItems.map((group) => (
            <div key={group.group} className="cst-nav-group">
              <div className="cst-nav-group-title">{group.group}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `cst-nav-link ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (window.innerWidth <= 768) setSidebarOpen(false);
                  }}
                >
                  <span className="cst-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`cst-nav-badge ${item.badgeLive ? "live" : ""}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}

          {/* Mini Live Ticker in Sidebar if user has an active token */}
          {activeToken && (
            <div className="cst-sidebar-live-widget">
              <div className="cst-widget-header">
                <span className="cst-widget-title">Live Queue Status</span>
                <span className="cst-widget-live-dot" />
              </div>
              <div className="cst-widget-body">
                {activeToken.tokenNumber} • Serving {activeToken.currentServing}
              </div>
              <div className="cst-widget-sub">
                {activeToken.shopName.split(" ")[0]} (~{activeToken.estWaitMins}m wait)
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="cst-sidebar-footer">
          <div
            className="cst-sidebar-user"
            onClick={() => navigate("/customer/profile")}
            title="Manage profile"
          >
            <div className="cst-sidebar-avatar">
              {customerProfile.name ? customerProfile.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="cst-sidebar-user-info">
              <div className="cst-sidebar-user-name">{customerProfile.name}</div>
              <div className="cst-sidebar-user-role">{customerProfile.phone}</div>
            </div>
          </div>
          <button
            type="button"
            className="cst-sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── 2. MAIN CONTENT WRAPPER ─────────────────────────────────── */}
      <div className="cst-main-wrap">
        {/* Topbar */}
        <header className="cst-topbar">
          <div className="cst-topbar-left">
            <button
              type="button"
              className="cst-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="cst-breadcrumbs">
              <span className="cst-breadcrumb-root">Customer</span>
              <span className="cst-breadcrumb-sep">/</span>
              <span className="cst-breadcrumb-curr">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="cst-topbar-right">
            {/* Quick "+ Book Token" Button */}
            <button
              type="button"
              className="cst-btn-quick-book"
              onClick={() => openBookModal()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Book Token</span>
            </button>

            {/* Notification Bell */}
            <div ref={notificationsRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="cst-icon-btn"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (unreadNotificationsCount > 0) markNotificationsAsRead();
                }}
                aria-label="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotificationsCount > 0 && <span className="cst-notification-dot" />}
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "320px",
                    background: "var(--cst-surface)",
                    border: "1px solid var(--cst-border)",
                    borderRadius: "var(--cst-radius-lg)",
                    boxShadow: "var(--cst-shadow-lg)",
                    padding: "12px",
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--cst-text)" }}>
                      Notifications
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--cst-primary)", fontWeight: 600 }}>
                      Queue Updates
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "10px",
                          borderRadius: "var(--cst-radius-sm)",
                          background: n.read ? "var(--cst-surface-subtle)" : "var(--cst-primary-subtle)",
                          fontSize: "12.5px",
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "var(--cst-text)", marginBottom: "2px" }}>
                          {n.title}
                        </div>
                        <div style={{ color: "var(--cst-text-secondary)", lineHeight: "1.3" }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "var(--cst-text-muted)", marginTop: "4px" }}>
                          {n.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              className="cst-icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            >
              {theme === "dark" ? (
                /* Sun Icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* User Profile Pill Menu */}
            <div className="cst-user-menu-wrapper" ref={profileMenuRef}>
              <div
                className="cst-user-pill-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="cst-user-pill-avatar">
                  {customerProfile.name ? customerProfile.name.charAt(0).toUpperCase() : "C"}
                </div>
                <span className="cst-user-pill-name">
                  {customerProfile.name.split(" ")[0]}
                </span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease",
                    transform: profileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--cst-text-muted, #64748b)",
                    flexShrink: 0
                  }}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {profileDropdownOpen && (
                <div className="cst-user-dropdown">
                  <div className="cst-dropdown-header">
                    <div className="cst-dropdown-user-name">{customerProfile.name}</div>
                    <div className="cst-dropdown-user-email">{customerProfile.email}</div>
                  </div>

                  <button
                    type="button"
                    className="cst-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/customer/profile");
                    }}
                  >
                    👤 My Profile
                  </button>
                  <button
                    type="button"
                    className="cst-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/customer/tokens");
                    }}
                  >
                    🎫 My Tokens
                  </button>
                  <button
                    type="button"
                    className="cst-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/customer/calendar");
                    }}
                  >
                    📅 Availability Calendar
                  </button>
                  <button
                    type="button"
                    className="cst-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/home");
                    }}
                  >
                    🌐 Public Landing Page
                  </button>

                  <div style={{ height: "1px", background: "var(--cst-border)", margin: "4px 0" }} />

                  <button
                    type="button"
                    className="cst-dropdown-item danger"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main>{children}</main>
      </div>

      {/* Global Customer Modals */}
      <BookTokenModal />
      <TokenQRModal />
      <CancelTokenModal />

      {/* Toast Notification */}
      {toast.visible && (
        <div className={`cst-toast ${toast.type}`}>
          <span>
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

