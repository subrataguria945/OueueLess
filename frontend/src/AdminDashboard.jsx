import { useState } from "react";
import "./AdminDashboard.css";

const INITIAL_OWNERS = [
  {
    id: 1,
    name: "Ananya Das",
    avatarBg: "#1960f7",
    email: "ananya@example.com",
    phone: "+91 98765 43210",
    shops: 3,
    expiresAt: "18 Nov 2026",
    status: "Active",
  },
  {
    id: 2,
    name: "Rahul Sen",
    avatarBg: "#8b5cf6",
    email: "rahul@example.com",
    phone: "+91 98765 43211",
    shops: 1,
    expiresAt: "29 Oct 2026",
    status: "Expiring Soon",
  },
  {
    id: 3,
    name: "Priya Ghosh",
    avatarBg: "#0284c7",
    email: "priya@example.com",
    phone: "+91 98765 43212",
    shops: 2,
    expiresAt: "12 Dec 2026",
    status: "Active",
  },
  {
    id: 4,
    name: "Arjun Roy",
    avatarBg: "#f59e0b",
    email: "arjun@example.com",
    phone: "+91 98765 43213",
    shops: 1,
    expiresAt: "20 Oct 2026",
    status: "Suspended",
  },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "add",
    icon: "+",
    color: "green",
    title: "New owner added",
    detail: "Ananya Das (ananya@example.com)",
    time: "10 Oct 2026, 11:24 AM",
  },
  {
    id: 2,
    type: "renew",
    icon: "↻",
    color: "blue",
    title: "Subscription renewed",
    detail: "Rahul Sen (rahul@example.com)",
    time: "10 Oct 2026, 09:18 AM",
  },
  {
    id: 3,
    type: "status",
    icon: "✎",
    color: "amber",
    title: "Owner status updated",
    detail: "Arjun Roy → Suspended",
    time: "09 Oct 2026, 06:42 PM",
  },
  {
    id: 4,
    type: "update",
    icon: "⚙",
    color: "gray",
    title: "Owner details updated",
    detail: "Priya Ghosh (priya@example.com)",
    time: "09 Oct 2026, 02:15 PM",
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const [owners, setOwners] = useState(INITIAL_OWNERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shops: 1,
    expiresAt: "",
    status: "Active",
  });

  /* ── Filtered Owners ────────────────────────────────────────────── */
  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      owner.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  /* ── Add Owner Handlers ─────────────────────────────────────────── */
  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      shops: 1,
      expiresAt: "15 Nov 2026",
      status: "Active",
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewOwner = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const colors = ["#1960f7", "#8b5cf6", "#0284c7", "#f59e0b", "#10b981"];
    const newOwner = {
      id: owners.length + 1,
      name: formData.name.trim(),
      avatarBg: colors[Math.floor(Math.random() * colors.length)],
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      shops: Number(formData.shops) || 1,
      expiresAt: formData.expiresAt || "30 Nov 2026",
      status: formData.status,
    };

    setOwners([newOwner, ...owners]);
    setIsAddModalOpen(false);
  };

  /* ── Edit Owner Handlers ────────────────────────────────────────── */
  const handleOpenEditModal = (owner) => {
    setSelectedOwner(owner);
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      shops: owner.shops,
      expiresAt: owner.expiresAt,
      status: owner.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditOwner = (e) => {
    e.preventDefault();
    if (!selectedOwner) return;

    setOwners((prev) =>
      prev.map((o) =>
        o.id === selectedOwner.id
          ? {
              ...o,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              shops: Number(formData.shops) || 1,
              expiresAt: formData.expiresAt,
              status: formData.status,
            }
          : o
      )
    );
    setIsEditModalOpen(false);
  };

  /* ── Delete Owner Handler ───────────────────────────────────────── */
  const handleDeleteOwner = (id) => {
    if (window.confirm("Are you sure you want to remove this owner?")) {
      setOwners((prev) => prev.filter((o) => o.id !== id));
    }
  };

  /* ── Logout Handler ─────────────────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="ql-admin-layout">
      {/* ── 1. LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside className={`ql-admin-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div>
          {/* Brand Logo */}
          <div className="ql-admin-brand">
            <div className="ql-brand-icon-box">
              <span className="ql-brand-icon-text">Q</span>
            </div>
            <span className="ql-brand-title">Queueless</span>
          </div>

          {/* Navigation Links */}
          <nav className="ql-admin-nav">
            <button
              type="button"
              className={`ql-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "owners" ? "active" : ""}`}
              onClick={() => setActiveTab("owners")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Owners</span>
              <span className="ql-nav-badge">{owners.length}</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "add-owner" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("add-owner");
                handleOpenAddModal();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <span>Add Owner</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Owner Details</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Tagline */}
        <div className="ql-sidebar-footer">
          <div className="ql-sidebar-graphic">
            <svg width="100" height="40" viewBox="0 0 120 40" fill="none" opacity="0.45">
              <circle cx="20" cy="15" r="7" fill="#60a5fa" />
              <circle cx="45" cy="15" r="7" fill="#60a5fa" />
              <circle cx="70" cy="15" r="7" fill="#60a5fa" />
              <circle cx="95" cy="15" r="7" fill="#60a5fa" />
              <path d="M10 35C10 26 30 26 30 35" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M35 35C35 26 55 26 55 35" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M60 35C60 26 80 26 80 35" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M85 35C85 26 105 26 105 35" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="ql-sidebar-tagline">
            Smart Queue Management<br />for a Smoother Tomorrow
          </p>
        </div>
      </aside>

      {/* ── 2. MAIN BODY ────────────────────────────────────────── */}
      <div className="ql-admin-main">
        {/* Top Navbar */}
        <header className="ql-admin-topbar">
          <div className="ql-topbar-left">
            <button
              type="button"
              className="ql-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="ql-breadcrumb">
              <span className="ql-breadcrumb-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Admin
              </span>
              <span className="ql-breadcrumb-sep">/</span>
              <span className="ql-breadcrumb-current">Dashboard</span>
            </div>
          </div>

          <div className="ql-topbar-right">
            {/* Search Input */}
            <div className="ql-topbar-search">
              <span className="ql-topbar-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search owners, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="ql-notif-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="ql-notif-badge">3</span>
              </button>

              {notifDropdownOpen && (
                <div className="ql-profile-dropdown" style={{ width: "240px", right: 0 }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "700" }}>
                    Notifications (3)
                  </div>
                  <div style={{ padding: "8px 12px", fontSize: "12.5px", color: "#334155" }}>
                    🔔 Rahul Sen subscription expires in 2 days.
                  </div>
                  <div style={{ padding: "8px 12px", fontSize: "12.5px", color: "#334155" }}>
                    👤 Ananya Das added 1 new shop queue.
                  </div>
                  <div style={{ padding: "8px 12px", fontSize: "12.5px", color: "#334155" }}>
                    ⚠️ Arjun Roy account status set to Suspended.
                  </div>
                </div>
              )}
            </div>

            <div className="ql-topbar-divider" />

            {/* Profile Menu */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="ql-admin-profile"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ql-avatar-circle">A</div>
                <span className="ql-profile-name">Admin</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="ql-profile-dropdown">
                  <button type="button" className="ql-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <span>👤</span> Profile Settings
                  </button>
                  <button type="button" className="ql-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <span>⚙️</span> System Config
                  </button>
                  <button type="button" className="ql-dropdown-item danger" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 3. DASHBOARD PAGE CONTENT ───────────────────────────── */}
        <main className="ql-admin-content">
          {/* Header Title */}
          <div className="ql-page-header">
            <h1 className="ql-page-title">Admin Dashboard</h1>
            <p className="ql-page-sub">
              Manage owners, subscriptions, and platform activity.
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="ql-stats-grid">
            {/* Total Owners */}
            <div className="ql-stat-card blue">
              <div className="ql-stat-top">
                <div className="ql-stat-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="ql-stat-info">
                  <div className="ql-stat-label">Total Owners</div>
                  <div className="ql-stat-number">128</div>
                </div>
                {/* Mini Bars */}
                <div className="ql-mini-bars">
                  <div className="ql-mini-bar" style={{ height: "45%" }} />
                  <div className="ql-mini-bar" style={{ height: "65%" }} />
                  <div className="ql-mini-bar" style={{ height: "80%" }} />
                  <div className="ql-mini-bar" style={{ height: "100%" }} />
                </div>
              </div>
              <div className="ql-stat-bottom">
                <span className="ql-trend-up">↗ +12%</span>
                <span className="ql-trend-context">from last month</span>
              </div>
            </div>

            {/* Active Owners */}
            <div className="ql-stat-card green">
              <div className="ql-stat-top">
                <div className="ql-stat-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="ql-stat-info">
                  <div className="ql-stat-label">Active Owners</div>
                  <div className="ql-stat-number">96</div>
                </div>
                <div className="ql-mini-bars">
                  <div className="ql-mini-bar" style={{ height: "40%" }} />
                  <div className="ql-mini-bar" style={{ height: "60%" }} />
                  <div className="ql-mini-bar" style={{ height: "75%" }} />
                  <div className="ql-mini-bar" style={{ height: "95%" }} />
                </div>
              </div>
              <div className="ql-stat-bottom">
                <span className="ql-trend-up">↗ +8%</span>
                <span className="ql-trend-context">from last month</span>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="ql-stat-card amber">
              <div className="ql-stat-top">
                <div className="ql-stat-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="ql-stat-info">
                  <div className="ql-stat-label">Expiring Soon</div>
                  <div className="ql-stat-number">12</div>
                </div>
                <div className="ql-mini-bars">
                  <div className="ql-mini-bar" style={{ height: "30%" }} />
                  <div className="ql-mini-bar" style={{ height: "50%" }} />
                  <div className="ql-mini-bar" style={{ height: "70%" }} />
                  <div className="ql-mini-bar" style={{ height: "90%" }} />
                </div>
              </div>
              <div className="ql-stat-bottom">
                <span className="ql-trend-up" style={{ color: "#d97706" }}>↗ +3</span>
                <span className="ql-trend-context">from last month</span>
              </div>
            </div>

            {/* Suspended */}
            <div className="ql-stat-card red">
              <div className="ql-stat-top">
                <div className="ql-stat-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="ql-stat-info">
                  <div className="ql-stat-label">Suspended</div>
                  <div className="ql-stat-number">8</div>
                </div>
                <div className="ql-mini-bars">
                  <div className="ql-mini-bar" style={{ height: "85%" }} />
                  <div className="ql-mini-bar" style={{ height: "65%" }} />
                  <div className="ql-mini-bar" style={{ height: "50%" }} />
                  <div className="ql-mini-bar" style={{ height: "35%" }} />
                </div>
              </div>
              <div className="ql-stat-bottom">
                <span className="ql-trend-down">↘ -2</span>
                <span className="ql-trend-context">from last month</span>
              </div>
            </div>
          </div>

          {/* ── 4. BOTTOM GRID (SIDE-BY-SIDE: TABLE & RECENT ACTIVITY) ─── */}
          <div className="ql-dashboard-bottom-grid">
            {/* 4A. OWNER MANAGEMENT TABLE CARD */}
            <div className="ql-card-panel ql-table-panel">
              <div className="ql-panel-header">
                <div>
                  <h2 className="ql-panel-title">Owner Management</h2>
                  <p className="ql-panel-sub">
                    View, add, edit or manage all owners in the platform.
                  </p>
                </div>
                <button
                  type="button"
                  className="ql-btn-primary"
                  onClick={handleOpenAddModal}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Owner</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="ql-table-toolbar">
                <div className="ql-toolbar-search">
                  <span className="ql-topbar-search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="ql-toolbar-filter">
                  <select
                    className="ql-btn-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="ql-table-wrapper">
                <table className="ql-table">
                  <thead>
                    <tr>
                      <th style={{ width: "36px" }}>#</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Shops</th>
                      <th>Expires</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center", width: "100px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.length > 0 ? (
                      filteredOwners.map((owner, idx) => (
                        <tr key={owner.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="ql-owner-cell">
                              <div
                                className="ql-owner-avatar"
                                style={{ backgroundColor: owner.avatarBg }}
                              >
                                {owner.name.charAt(0)}
                              </div>
                              <span className="ql-owner-name">{owner.name}</span>
                            </div>
                          </td>
                          <td>{owner.email}</td>
                          <td>{owner.phone}</td>
                          <td>{owner.shops}</td>
                          <td>{owner.expiresAt}</td>
                          <td>
                            <span
                              className={`ql-badge-status ${
                                owner.status === "Active"
                                  ? "active"
                                  : owner.status === "Expiring Soon"
                                  ? "expiring"
                                  : "suspended"
                              }`}
                            >
                              <span className="ql-status-dot" />
                              {owner.status}
                            </span>
                          </td>
                          <td>
                            <div className="ql-actions-cell" style={{ justifyContent: "center" }}>
                              {/* View */}
                              <button
                                type="button"
                                className="ql-action-btn"
                                title="View details"
                                onClick={() => alert(`Owner: ${owner.name}\nEmail: ${owner.email}\nPhone: ${owner.phone}\nShops: ${owner.shops}\nExpires: ${owner.expiresAt}\nStatus: ${owner.status}`)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                className="ql-action-btn"
                                title="Edit owner"
                                onClick={() => handleOpenEditModal(owner)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                className="ql-action-btn delete"
                                title="Delete owner"
                                onClick={() => handleDeleteOwner(owner.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                          No owners match your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4B. RECENT ACTIVITY CARD */}
            <div className="ql-card-panel ql-activity-panel">
              <div className="ql-panel-header">
                <div>
                  <h2 className="ql-panel-title">Recent Activity</h2>
                  <p className="ql-panel-sub">
                    Latest platform events
                  </p>
                </div>
                <button
                  type="button"
                  className="ql-btn-secondary"
                  onClick={() => alert("All activity logs are up to date.")}
                >
                  View All
                </button>
              </div>

              <div className="ql-activity-list">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="ql-activity-item">
                    <div className="ql-activity-left">
                      <div className={`ql-activity-icon ${act.color}`}>
                        {act.icon}
                      </div>
                      <div className="ql-activity-text">
                        <span className="ql-activity-title">{act.title}</span>
                        <span>— {act.detail}</span>
                      </div>
                    </div>
                    <div className="ql-activity-time">{act.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── 6. ADD OWNER MODAL ──────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="ql-admin-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="ql-admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-head">
              <h3>Add New Owner</h3>
              <button type="button" className="ql-modal-close" onClick={() => setIsAddModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveNewOwner}>
              <div className="ql-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Das"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="ql-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ananya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="ql-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="ql-form-group">
                  <label>Shops Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.shops}
                    onChange={(e) => setFormData({ ...formData, shops: e.target.value })}
                  />
                </div>

                <div className="ql-form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="ql-form-group">
                <label>Subscription Expiry Date</label>
                <input
                  type="text"
                  placeholder="e.g. 18 Nov 2026"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>

              <div className="ql-modal-actions">
                <button
                  type="button"
                  className="ql-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ql-btn-primary">
                  Save Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. EDIT OWNER MODAL ─────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="ql-admin-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="ql-admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-head">
              <h3>Edit Owner</h3>
              <button type="button" className="ql-modal-close" onClick={() => setIsEditModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditOwner}>
              <div className="ql-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="ql-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="ql-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="ql-form-group">
                  <label>Shops Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.shops}
                    onChange={(e) => setFormData({ ...formData, shops: e.target.value })}
                  />
                </div>

                <div className="ql-form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="ql-form-group">
                <label>Subscription Expiry Date</label>
                <input
                  type="text"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>

              <div className="ql-modal-actions">
                <button
                  type="button"
                  className="ql-btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ql-btn-primary">
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
