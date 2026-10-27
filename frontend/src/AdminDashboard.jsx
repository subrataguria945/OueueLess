import { useState } from "react";
import "./AdminDashboard.css";

// ── MOCK DATA MATCHING EXACT UI DESIGN ────────────────────────────────────

const STAT_METRICS = [
  {
    id: "owners",
    label: "Total Owners",
    value: "128",
    trend: "↗ 12%",
    context: "from last month",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "shops",
    label: "Total Shops",
    value: "342",
    trend: "↗ 18%",
    context: "from last month",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
        <path d="M2 7h20" />
      </svg>
    ),
  },
  {
    id: "users",
    label: "Total Users",
    value: "12,480",
    trend: "↗ 25%",
    context: "from last month",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "revenue",
    label: "Total Revenue",
    value: "₹ 2,45,680",
    trend: "↗ 32%",
    context: "from last month",
    icon: (
      <div className="ql-rupee-circle-icon">₹</div>
    ),
  },
  {
    id: "subs",
    label: "Active Subscriptions",
    value: "96",
    trend: "↗ 15%",
    context: "from last month",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

const TOP_SHOPS = [
  { rank: 1, name: "Coffee Hub", owner: "Ananya Das", users: 128, max: 128 },
  { rank: 2, name: "Tasty Bites", owner: "Rahul Sen", users: 96, max: 128 },
  { rank: 3, name: "Quick Care Clinic", owner: "Priya Ghosh", users: 84, max: 128 },
  { rank: 4, name: "FitLife Gym", owner: "Sujit Paul", users: 72, max: 128 },
  { rank: 5, name: "Book Nook", owner: "Arjun Roy", users: 68, max: 128 },
];

const REVENUE_BARS = [
  { month: "Apr", val: 12, heightPct: 32 },
  { month: "May", val: 19, heightPct: 48 },
  { month: "Jun", val: 24, heightPct: 60 },
  { month: "Jul", val: 28, heightPct: 70 },
  { month: "Aug", val: 32, heightPct: 79 },
  { month: "Sep", val: 36, heightPct: 88 },
  { month: "Oct", val: 42, heightPct: 98 },
];

const RECENT_OWNERS = [
  {
    id: 1,
    name: "Ananya Das",
    initial: "A",
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    email: "ananya@example.com",
    phone: "+91 98765 43210",
    shops: 3,
    status: "Active",
    joinedOn: "12 Jun 2026",
  },
  {
    id: 2,
    name: "Rahul Sen",
    initial: "R",
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    email: "rahul@example.com",
    phone: "+91 98765 43211",
    shops: 1,
    status: "Expiring Soon",
    joinedOn: "25 Jul 2026",
  },
  {
    id: 3,
    name: "Priya Ghosh",
    initial: "P",
    avatarBg: "#e0e7ff",
    avatarColor: "#4338ca",
    email: "priya@example.com",
    phone: "+91 98765 43212",
    shops: 2,
    status: "Active",
    joinedOn: "10 Jan 2026",
  },
  {
    id: 4,
    name: "Arjun Roy",
    initial: "A",
    avatarBg: "#ffedd5",
    avatarColor: "#c2410c",
    email: "arjun@example.com",
    phone: "+91 98765 43213",
    shops: 1,
    status: "Suspended",
    joinedOn: "05 Feb 2026",
  },
  {
    id: 5,
    name: "Sujit Paul",
    initial: "S",
    avatarBg: "#f3e8ff",
    avatarColor: "#7e22ce",
    email: "sujit@example.com",
    phone: "+91 98765 43214",
    shops: 4,
    status: "Active",
    joinedOn: "18 Mar 2026",
  },
];

const TIMELINE_ACTIVITIES = [
  {
    id: 1,
    color: "#10b981",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    title: "New owner registered",
    desc: "Ananya Das joined the platform",
    time: "2 hours ago",
  },
  {
    id: 2,
    color: "#1960f7",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      </svg>
    ),
    title: "New shop added",
    desc: "Coffee Hub (Ananya Das)",
    time: "4 hours ago",
  },
  {
    id: 3,
    color: "#8b5cf6",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: "Subscription renewed",
    desc: "Rahul Sen - Pro Plan",
    time: "6 hours ago",
  },
  {
    id: 4,
    color: "#f59e0b",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <circle cx="12" cy="7" r="4" />
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      </svg>
    ),
    title: "User registered",
    desc: "New user from Coffee Hub",
    time: "8 hours ago",
  },
  {
    id: 5,
    color: "#ef4444",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: "Payment received",
    desc: "₹ 4,999 from Priya Ghosh",
    time: "1 day ago",
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Oct 1, 2026 - Oct 31, 2026");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selected owner for detail view
  const [detailModalOwner, setDetailModalOwner] = useState(null);

  const filteredOwners = RECENT_OWNERS.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("ql_admin_token");
    window.location.href = "/login";
  };

  return (
    <div className="ql-admin-layout">
      {/* ── 1. SIDEBAR (MATCHES UI MOCKUP EXACTLY) ─────────────── */}
      <aside className={`ql-admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div>
          {/* Brand Header with Stylized Circular 'Q' Badge */}
          <div className="ql-admin-brand">
            <div className="ql-brand-icon-circle">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                {/* Vibrant Blue Gradient Background Circle */}
                <circle cx="50" cy="50" r="48" fill="url(#ql-official-q-grad)" />
                {/* Official Q White Ring */}
                <circle cx="48" cy="46" r="21" stroke="#ffffff" strokeWidth="8.5" fill="none" />
                {/* Distinctive Inner Dot */}
                <circle cx="55.5" cy="53.5" r="4.5" fill="#ffffff" />
                {/* Rounded Magnifying Tail */}
                <line x1="55" y1="53" x2="73" y2="71" stroke="#ffffff" strokeWidth="9.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="ql-official-q-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00b0ff" />
                    <stop offset="0.45" stopColor="#0077ff" />
                    <stop offset="1" stopColor="#1a56db" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="ql-brand-text">
              <span className="ql-brand-title">Queueless</span>
              <span className="ql-brand-subtitle">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="ql-admin-nav">
            <button
              type="button"
              className={`ql-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "owners" ? "active" : ""}`}
              onClick={() => setActiveTab("owners")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </span>
              <span>Owners</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "shops" ? "active" : ""}`}
              onClick={() => setActiveTab("shops")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                </svg>
              </span>
              <span>Shops</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span>Users</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "subscriptions" ? "active" : ""}`}
              onClick={() => setActiveTab("subscriptions")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </span>
              <span>Subscriptions</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                  <line x1="6" x2="8" y1="15" y2="15" />
                </svg>
              </span>
              <span>Payments</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </span>
              <span>Reports</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Artwork & Tagline */}
        <div className="ql-sidebar-footer">
          <div className="ql-sidebar-illustration-card">
            <svg width="150" height="48" viewBox="0 0 150 48" fill="none">
              <rect x="0" y="44" width="150" height="2" fill="rgba(255,255,255,0.15)" />
              <rect x="10" y="32" width="130" height="1.5" fill="rgba(255,255,255,0.08)" />
              <circle cx="25" cy="18" r="4.5" fill="#38bdf8" opacity="0.6" />
              <path d="M19 36c0-5 2.5-7 6-7s6 2 6 7" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
              <circle cx="48" cy="16" r="5" fill="#60a5fa" opacity="0.75" />
              <path d="M41 36c0-6 3-8 7-8s7 2 7 8" stroke="#60a5fa" strokeWidth="2" opacity="0.75" />
              <circle cx="74" cy="17" r="4.5" fill="#93c5fd" opacity="0.8" />
              <path d="M68 36c0-5 2.5-7 6-7s6 2 6 7" stroke="#93c5fd" strokeWidth="2" opacity="0.8" />
              <circle cx="100" cy="15" r="5" fill="#38bdf8" opacity="0.85" />
              <path d="M93 36c0-6 3-8 7-8s7 2 7 8" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
              <circle cx="125" cy="18" r="4.5" fill="#60a5fa" opacity="0.6" />
              <path d="M119 36c0-5 2.5-7 6-7s6 2 6 7" stroke="#60a5fa" strokeWidth="2" opacity="0.6" />
            </svg>
          </div>
          <p className="ql-sidebar-tagline">
            Smart Queue<br />Management<br />for a Smoother<br />Tomorrow
          </p>
        </div>
      </aside>

      {/* ── 2. MAIN VIEWPORT (HEADER + DASHBOARD CANVAS) ───────── */}
      <div className="ql-admin-main">
        {/* Top Navbar */}
        <header className="ql-admin-topbar">
          <div className="ql-topbar-left">
            <button
              type="button"
              className="ql-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Global Search Pill Input */}
            <div className="ql-topbar-search">
              <span className="ql-topbar-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search owners, shops, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="ql-topbar-right">
            {/* Date Range Picker Pill */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="ql-date-picker-btn"
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>{dateRange}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dateDropdownOpen && (
                <div className="ql-date-dropdown">
                  <button type="button" onClick={() => { setDateRange("Today"); setDateDropdownOpen(false); }}>Today</button>
                  <button type="button" onClick={() => { setDateRange("Last 7 Days"); setDateDropdownOpen(false); }}>Last 7 Days</button>
                  <button type="button" onClick={() => { setDateRange("Oct 1, 2026 - Oct 31, 2026"); setDateDropdownOpen(false); }}>Oct 1, 2026 - Oct 31, 2026</button>
                  <button type="button" onClick={() => { setDateRange("Year to Date (2026)"); setDateDropdownOpen(false); }}>Year to Date</button>
                </div>
              )}
            </div>

            {/* Notification Bell with Red Badge */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="ql-notif-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label="View notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="ql-notif-badge">3</span>
              </button>

              {notifDropdownOpen && (
                <div className="ql-notif-dropdown">
                  <div className="ql-notif-header">Notifications (3)</div>
                  <div className="ql-notif-item">🔔 Rahul Sen subscription expires in 2 days</div>
                  <div className="ql-notif-item">👤 Ananya Das added Coffee Hub shop</div>
                  <div className="ql-notif-item">💳 Payment ₹ 4,999 received from Priya Ghosh</div>
                </div>
              )}
            </div>

            {/* Admin Profile Pill */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="ql-admin-profile"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ql-avatar-circle">A</div>
                <span className="ql-profile-name">Admin</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2">
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

        {/* ── 3. DASHBOARD MAIN CANVAS (100VH COMPACT) ───────────── */}
        <main className="ql-admin-content">
          {/* Page Heading */}
          <div className="ql-page-header">
            <h1 className="ql-page-title">Dashboard</h1>
            <p className="ql-page-sub">Welcome to Queueless Admin Panel</p>
          </div>

          {/* ── ROW 1: 5 STAT METRIC CARDS ───────────────────────── */}
          <section className="ql-stats-grid">
            {STAT_METRICS.map((item) => (
              <div key={item.id} className="ql-stat-card">
                <div className="ql-stat-top">
                  <div className="ql-stat-icon-wrap">{item.icon}</div>
                  <div className="ql-stat-body">
                    <div className="ql-stat-label">{item.label}</div>
                    <div className="ql-stat-number">{item.value}</div>
                  </div>
                </div>
                <div className="ql-stat-bottom">
                  <span className="ql-stat-trend">{item.trend}</span>
                  <span className="ql-stat-context">{item.context}</span>
                </div>
              </div>
            ))}
          </section>

          {/* ── ROW 2: 3 ANALYTICS CARDS (DONUT, SHOPS, REVENUE) ─── */}
          <section className="ql-analytics-grid">
            {/* Card 1: Subscription Status Donut Chart */}
            <div className="ql-card ql-card-donut">
              <div className="ql-card-head">
                <div className="ql-card-title-group">
                  <span className="ql-card-badge-icon blue">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </span>
                  <span className="ql-card-title">Subscription Status</span>
                </div>
                <button type="button" className="ql-card-link" onClick={() => setActiveTab("subscriptions")}>
                  View All &rarr;
                </button>
              </div>

              <div className="ql-donut-content">
                {/* SVG Multi-segment Donut Ring Matching Mockup */}
                <div className="ql-donut-graphic">
                  <svg width="112" height="112" viewBox="0 0 140 140">
                    {/* Background light ring */}
                    <circle cx="70" cy="70" r="50" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                    {/* Blue segment: 38% */}
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#1960f7"
                      strokeWidth="18"
                      strokeDasharray="120 314"
                      strokeDashoffset="0"
                    />
                    {/* Green segment: 28% */}
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#00c853"
                      strokeWidth="18"
                      strokeDasharray="88 314"
                      strokeDashoffset="-120"
                    />
                    {/* Amber segment: 18% */}
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="18"
                      strokeDasharray="54 314"
                      strokeDashoffset="-208"
                    />
                    {/* Red segment: 10% */}
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="18"
                      strokeDasharray="32 314"
                      strokeDashoffset="-262"
                    />
                    {/* Purple segment: 6% */}
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="18"
                      strokeDasharray="20 314"
                      strokeDashoffset="-294"
                    />
                  </svg>
                  <div className="ql-donut-center">
                    <span className="ql-donut-num">96</span>
                    <span className="ql-donut-lbl">Total</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="ql-donut-legend">
                  <div className="ql-legend-row">
                    <span className="ql-dot green" />
                    <span className="ql-legend-name">Active</span>
                    <span className="ql-legend-val">96</span>
                  </div>
                  <div className="ql-legend-row">
                    <span className="ql-dot amber" />
                    <span className="ql-legend-name">Expiring Soon</span>
                    <span className="ql-legend-val">18</span>
                  </div>
                  <div className="ql-legend-row">
                    <span className="ql-dot red" />
                    <span className="ql-legend-name">Expired</span>
                    <span className="ql-legend-val">12</span>
                  </div>
                  <div className="ql-legend-row">
                    <span className="ql-dot purple" />
                    <span className="ql-legend-name">Suspended</span>
                    <span className="ql-legend-val">8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Top Performing Shops */}
            <div className="ql-card ql-card-shops">
              <div className="ql-card-head">
                <div className="ql-card-title-group">
                  <span className="ql-card-badge-icon blue">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34c3.48-.91 6-4.04 6-7.66V3H4v6c0 3.62 2.52 6.75 6 7.66Z" />
                    </svg>
                  </span>
                  <span className="ql-card-title">Top Performing Shops</span>
                </div>
                <button type="button" className="ql-card-link" onClick={() => setActiveTab("shops")}>
                  View All &rarr;
                </button>
              </div>

              <div className="ql-top-shops-table">
                <div className="ql-top-shops-header">
                  <span className="col-rank">#</span>
                  <span className="col-shop">Shop Name</span>
                  <span className="col-owner">Owner</span>
                  <span className="col-users">Users Today</span>
                </div>
                {TOP_SHOPS.map((shop) => (
                  <div key={shop.rank} className="ql-top-shop-row">
                    <span className="col-rank">{shop.rank}</span>
                    <span className="col-shop">{shop.name}</span>
                    <span className="col-owner">{shop.owner}</span>
                    <span className="col-users">
                      <span className="val">{shop.users}</span>
                      <span className="bar-track">
                        <span
                          className="bar-fill"
                          style={{ width: `${(shop.users / shop.max) * 100}%` }}
                        />
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Revenue Overview Bar Chart */}
            <div className="ql-card ql-card-revenue">
              <div className="ql-card-head">
                <div className="ql-card-title-group">
                  <span className="ql-card-badge-icon blue">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M18 20V10" />
                      <path d="M12 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                  </span>
                  <span className="ql-card-title">Revenue Overview</span>
                </div>
                <button type="button" className="ql-card-link" onClick={() => setActiveTab("payments")}>
                  View Details &rarr;
                </button>
              </div>

              <div className="ql-revenue-chart">
                {/* Y Axis */}
                <div className="ql-chart-y-axis">
                  <span>40K</span>
                  <span>30K</span>
                  <span>20K</span>
                  <span>10K</span>
                  <span>0</span>
                </div>

                {/* Bars Area with subtle grid lines */}
                <div className="ql-chart-bars-wrap">
                  <div className="ql-chart-grid-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ql-chart-bars">
                    {REVENUE_BARS.map((bar) => (
                      <div key={bar.month} className="ql-bar-col" title={`${bar.month}: ₹${bar.val * 1000}`}>
                        <div className="ql-bar-pill-track">
                          <div
                            className="ql-bar-pill"
                            style={{ height: `${bar.heightPct}%` }}
                          />
                        </div>
                        <span className="ql-bar-lbl">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── ROW 3: BOTTOM GRID (RECENT OWNERS & RECENT ACTIVITIES) ─ */}
          <section className="ql-bottom-grid">
            {/* Left Card: Recent Owners Table */}
            <div className="ql-card ql-card-owners-table">
              <div className="ql-card-head">
                <div className="ql-card-title-group">
                  <span className="ql-card-badge-icon blue">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="ql-card-title">Recent Owners</span>
                </div>
                <button type="button" className="ql-card-link" onClick={() => setActiveTab("owners")}>
                  View All &rarr;
                </button>
              </div>

              <div className="ql-table-container">
                <table className="ql-owners-table">
                  <thead>
                    <tr>
                      <th style={{ width: "24px" }}>#</th>
                      <th>Owner</th>
                      <th>Phone</th>
                      <th style={{ textAlign: "center", width: "55px" }}>Shops</th>
                      <th>Status</th>
                      <th>Joined On</th>
                      <th style={{ textAlign: "center", width: "70px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.map((owner) => (
                      <tr key={owner.id}>
                        <td>{owner.id}</td>
                        <td>
                          <div className="ql-owner-info">
                            <span
                              className="ql-owner-avatar"
                              style={{
                                backgroundColor: owner.avatarBg,
                                color: owner.avatarColor,
                              }}
                            >
                              {owner.initial}
                            </span>
                            <div className="ql-owner-details">
                              <span className="ql-owner-name">{owner.name}</span>
                              <span className="ql-owner-email">{owner.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{owner.phone}</td>
                        <td style={{ textAlign: "center", fontWeight: "700" }}>{owner.shops}</td>
                        <td>
                          <span
                            className={`ql-badge-pill ${
                              owner.status === "Active"
                                ? "active"
                                : owner.status === "Expiring Soon"
                                ? "expiring"
                                : "suspended"
                            }`}
                          >
                            <span className="dot" />
                            {owner.status}
                          </span>
                        </td>
                        <td>{owner.joinedOn}</td>
                        <td>
                          <div className="ql-row-actions">
                            <button
                              type="button"
                              className="ql-action-icon blue"
                              title="View Owner Details"
                              onClick={() => setDetailModalOwner(owner)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2.2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="ql-action-icon"
                              title="More Options"
                              onClick={() => alert(`Actions for ${owner.name}`)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="1.2" />
                                <circle cx="12" cy="5" r="1.2" />
                                <circle cx="12" cy="19" r="1.2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Recent Activities Timeline */}
            <div className="ql-card ql-card-activities">
              <div className="ql-card-head">
                <div className="ql-card-title-group">
                  <span className="ql-card-badge-icon blue">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span className="ql-card-title">Recent Activities</span>
                </div>
                <button type="button" className="ql-card-link" onClick={() => alert("All activities are up to date.")}>
                  View All &rarr;
                </button>
              </div>

              <div className="ql-timeline-list">
                {TIMELINE_ACTIVITIES.map((act, index) => (
                  <div key={act.id} className="ql-timeline-item">
                    {/* Circle badge with icon inside + connecting vertical line */}
                    <div className="ql-timeline-marker">
                      <span
                        className="ql-timeline-circle-badge"
                        style={{ backgroundColor: act.color }}
                      >
                        {act.icon}
                      </span>
                      {index < TIMELINE_ACTIVITIES.length - 1 && <span className="ql-timeline-line" />}
                    </div>

                    {/* Content Box */}
                    <div className="ql-timeline-content">
                      <div className="ql-timeline-title">{act.title}</div>
                      <div className="ql-timeline-desc">{act.desc}</div>
                    </div>

                    {/* Timestamp */}
                    <div className="ql-timeline-time">{act.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ── OWNER DETAIL MODAL ─────────────────────────────────── */}
      {detailModalOwner && (
        <div className="ql-modal-backdrop" onClick={() => setDetailModalOwner(null)}>
          <div className="ql-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  className="ql-owner-avatar"
                  style={{
                    backgroundColor: detailModalOwner.avatarBg,
                    color: detailModalOwner.avatarColor,
                    width: 38,
                    height: 38,
                    fontSize: 16,
                  }}
                >
                  {detailModalOwner.initial}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                    {detailModalOwner.name}
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Registered Owner</span>
                </div>
              </div>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setDetailModalOwner(null)}
              >
                ✕
              </button>
            </div>

            <div className="ql-modal-body">
              <div className="ql-detail-field">
                <span className="lbl">Email Address:</span>
                <span className="val">{detailModalOwner.email}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Phone Number:</span>
                <span className="val">{detailModalOwner.phone}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Total Shops:</span>
                <span className="val">{detailModalOwner.shops} active queues</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Account Status:</span>
                <span className="val">
                  <span className={`ql-badge-pill ${detailModalOwner.status === "Active" ? "active" : detailModalOwner.status === "Expiring Soon" ? "expiring" : "suspended"}`}>
                    <span className="dot" />
                    {detailModalOwner.status}
                  </span>
                </span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Joined Date:</span>
                <span className="val">{detailModalOwner.joinedOn}</span>
              </div>
            </div>

            <div className="ql-modal-footer">
              <button
                type="button"
                className="ql-btn-close"
                onClick={() => setDetailModalOwner(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
