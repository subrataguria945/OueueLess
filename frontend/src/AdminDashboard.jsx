import { useState, useEffect } from "react";
import "./AdminDashboard.css";

// ── MOCK DATA FOR COMPREHENSIVE ADMIN EXPERIENCE ──────────────────────────

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
    icon: <div className="ql-rupee-circle-icon">₹</div>,
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
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    email: "priya@example.com",
    phone: "+91 98765 43212",
    shops: 2,
    status: "Active",
    joinedOn: "03 Aug 2026",
  },
  {
    id: 4,
    name: "Sujit Paul",
    initial: "S",
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    email: "sujit@example.com",
    phone: "+91 98765 43213",
    shops: 1,
    status: "Suspended",
    joinedOn: "18 Aug 2026",
  },
  {
    id: 5,
    name: "Arjun Roy",
    initial: "A",
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    email: "arjun@example.com",
    phone: "+91 98765 43214",
    shops: 4,
    status: "Active",
    joinedOn: "01 Sep 2026",
  },
];

const ALL_SHOPS_DATA = [
  {
    id: "shop-1",
    name: "Coffee Hub",
    category: "Cafe & Dining",
    owner: "Ananya Das",
    phone: "+91 98765 43210",
    status: "Active",
    currentServing: "QL-042",
    waitingCount: 14,
    avgWaitTime: "8 mins",
    dailyTokens: 128,
  },
  {
    id: "shop-2",
    name: "Quick Care Clinic",
    category: "Healthcare",
    owner: "Priya Ghosh",
    phone: "+91 98765 43212",
    status: "Active",
    currentServing: "QC-018",
    waitingCount: 9,
    avgWaitTime: "12 mins",
    dailyTokens: 84,
  },
  {
    id: "shop-3",
    name: "Tasty Bites Restaurant",
    category: "Cafe & Dining",
    owner: "Rahul Sen",
    phone: "+91 98765 43211",
    status: "Active",
    currentServing: "TB-067",
    waitingCount: 22,
    avgWaitTime: "15 mins",
    dailyTokens: 96,
  },
  {
    id: "shop-4",
    name: "FitLife Gym & Spa",
    category: "Fitness",
    owner: "Sujit Paul",
    phone: "+91 98765 43213",
    status: "Closed",
    currentServing: "FL-000",
    waitingCount: 0,
    avgWaitTime: "--",
    dailyTokens: 72,
  },
  {
    id: "shop-5",
    name: "The Book Nook Store",
    category: "Retail",
    owner: "Arjun Roy",
    phone: "+91 98765 43214",
    status: "Active",
    currentServing: "BN-031",
    waitingCount: 5,
    avgWaitTime: "5 mins",
    dailyTokens: 68,
  },
  {
    id: "shop-6",
    name: "Apex Electronics Care",
    category: "Services",
    owner: "Ananya Das",
    phone: "+91 98765 43210",
    status: "Active",
    currentServing: "AE-014",
    waitingCount: 7,
    avgWaitTime: "18 mins",
    dailyTokens: 45,
  },
];

const ALL_USERS_DATA = [
  {
    id: 101,
    name: "Sourav Ganguly",
    phone: "+91 98301 23456",
    shop: "Coffee Hub",
    token: "QL-045",
    position: 3,
    status: "Waiting",
    bookedAt: "10 mins ago",
  },
  {
    id: 102,
    name: "Rimi Mukherjee",
    phone: "+91 98302 34567",
    shop: "Quick Care Clinic",
    token: "QC-018",
    position: 0,
    status: "Serving Now",
    bookedAt: "25 mins ago",
  },
  {
    id: 103,
    name: "Debashis Banerjee",
    phone: "+91 98303 45678",
    shop: "Tasty Bites Restaurant",
    token: "TB-072",
    position: 5,
    status: "Waiting",
    bookedAt: "8 mins ago",
  },
  {
    id: 104,
    name: "Tanmoy Sarkar",
    phone: "+91 98304 56789",
    shop: "The Book Nook Store",
    token: "BN-030",
    position: 0,
    status: "Completed",
    bookedAt: "42 mins ago",
  },
  {
    id: 105,
    name: "Mousumi Dutta",
    phone: "+91 98305 67890",
    shop: "Coffee Hub",
    token: "QL-039",
    position: 0,
    status: "Completed",
    bookedAt: "50 mins ago",
  },
  {
    id: 106,
    name: "Rohit Verma",
    phone: "+91 98306 78901",
    shop: "Tasty Bites Restaurant",
    token: "TB-065",
    position: 0,
    status: "Cancelled",
    bookedAt: "1 hour ago",
  },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter Tier",
    price: "₹ 999",
    period: "/month",
    subscribers: "45 Business Owners",
    popular: false,
    features: [
      "1 Registered Shop Queue",
      "Up to 100 Daily Tokens",
      "Real-time Queue Display",
      "SMS Token Alerts",
      "Standard Email Support",
    ],
  },
  {
    id: "growth",
    name: "Pro Growth Plan",
    price: "₹ 2,499",
    period: "/month",
    subscribers: "68 Business Owners",
    popular: true,
    features: [
      "Up to 5 Shop Locations",
      "Unlimited Daily Tokens",
      "QR Code Instant Check-in",
      "WhatsApp & SMS Notifications",
      "Detailed Analytics & Export",
      "Priority 24/7 Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Chain",
    price: "₹ 4,999",
    period: "/month",
    subscribers: "15 Business Owners",
    popular: false,
    features: [
      "Unlimited Shop Branches",
      "Custom Subdomain & Branding",
      "Dedicated Queue Kiosk App",
      "Staff Counter Permissions",
      "Multi-counter Call Display",
      "Dedicated Account Manager",
    ],
  },
];

const TRANSACTIONS_DATA = [
  {
    id: "TXN-9041",
    owner: "Ananya Das",
    plan: "Pro Growth (Annual)",
    amount: "₹ 24,990",
    method: "UPI (Google Pay)",
    status: "Completed",
    date: "28 Oct 2026",
  },
  {
    id: "TXN-9040",
    owner: "Priya Ghosh",
    plan: "Pro Growth",
    amount: "₹ 2,499",
    method: "Credit Card (HDFC)",
    status: "Completed",
    date: "27 Oct 2026",
  },
  {
    id: "TXN-9039",
    owner: "Arjun Roy",
    plan: "Enterprise",
    amount: "₹ 4,999",
    method: "Net Banking (SBI)",
    status: "Completed",
    date: "26 Oct 2026",
  },
  {
    id: "TXN-9038",
    owner: "Rahul Sen",
    plan: "Starter Tier",
    amount: "₹ 999",
    method: "UPI (PhonePe)",
    status: "Pending",
    date: "25 Oct 2026",
  },
  {
    id: "TXN-9037",
    owner: "Sujit Paul",
    plan: "Starter Tier",
    amount: "₹ 999",
    method: "Debit Card",
    status: "Failed",
    date: "24 Oct 2026",
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
    title: "New shop owner registered",
    desc: "Ananya Das joined QueueLess",
    time: "2 hours ago",
  },
  {
    id: 2,
    color: "#3b82f6",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      </svg>
    ),
    title: "Shop queue created",
    desc: "Tasty Bites added a new queue",
    time: "4 hours ago",
  },
  {
    id: 3,
    color: "#8b5cf6",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
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
  // Navigation & View State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Oct 1, 2026 - Oct 31, 2026");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 1024;
    }
    return true;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  // ── THEME SWITCHER (DARK & LIGHT MODE) ──────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ql_admin_theme") || "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("ql_admin_theme", nextTheme);
      return nextTheme;
    });
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("ql_admin_theme", newTheme);
  };

  // Specific Tab Filters
  const [ownerFilterStatus, setOwnerFilterStatus] = useState("All");
  const [shopCategoryFilter, setShopCategoryFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");

  // Modals & Forms State
  const [detailModalOwner, setDetailModalOwner] = useState(null);
  const [addOwnerModalOpen, setAddOwnerModalOpen] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState({
    name: "",
    email: "",
    phone: "",
    shops: 1,
  });

  // Admin Profile State & Modals
  const [adminProfileModalOpen, setAdminProfileModalOpen] = useState(false);
  const [editAdminModalOpen, setEditAdminModalOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(() => {
    const defaultProfile = {
      name: "Sujit Kar",
      username: "admin_sujit",
      email: "sujit@queueless.com",
      phone: "+91 98765 43210",
      role: "Super Admin",
      joinedOn: "12 Jan 2026",
      status: "Active",
      department: "System Architecture & Operations",
      accessLevel: "Root Clearance",
      bio: "Master administrator for QueueLess platform, token moderation, shop subscriptions & system configuration.",
      avatarBg: "#1960f7",
      avatarColor: "#ffffff",
      avatarImg: null, // Base64 uploaded image URL
      twoFactor: "Enabled (Authenticator App)",
      lastLogin: "Today, 12:45 AM (Local IP)",
    };
    const saved = localStorage.getItem("ql_admin_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultProfile,
          ...parsed,
          role: "Super Admin",
          accessLevel: "Root Clearance",
        };
      } catch (e) {}
    }
    return defaultProfile;
  });

  const [editAdminForm, setEditAdminForm] = useState(adminProfile);

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image file size should be less than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setEditAdminForm((prev) => ({ ...prev, avatarImg: base64 }));
        setAdminProfile((prev) => {
          const updated = { ...prev, avatarImg: base64 };
          localStorage.setItem("ql_admin_profile", JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setEditAdminForm((prev) => ({ ...prev, avatarImg: null }));
    setAdminProfile((prev) => {
      const updated = { ...prev, avatarImg: null };
      localStorage.setItem("ql_admin_profile", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAdminProfile = (e) => {
    if (e) e.preventDefault();
    setAdminProfile(editAdminForm);
    localStorage.setItem("ql_admin_profile", JSON.stringify(editAdminForm));
    setSettingsSavedToast(true);
    setEditAdminModalOpen(false);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Settings State
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Filter Owners
  const filteredOwners = RECENT_OWNERS.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.status.toLowerCase().includes(q);

    const matchStatus = ownerFilterStatus === "All" || o.status === ownerFilterStatus;
    return matchSearch && matchStatus;
  });

  // Filter Shops
  const filteredShops = ALL_SHOPS_DATA.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.owner.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);

    const matchCat = shopCategoryFilter === "All" || s.category === shopCategoryFilter;
    return matchSearch && matchCat;
  });

  // Filter Users
  const filteredUsers = ALL_USERS_DATA.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.shop.toLowerCase().includes(q) ||
      u.token.toLowerCase().includes(q);

    const matchStatus = userStatusFilter === "All" || u.status === userStatusFilter;
    return matchSearch && matchStatus;
  });

  const handleLogout = () => {
    localStorage.removeItem("ql_admin_token");
    window.location.href = "/login";
  };

  const handleAddOwnerSubmit = (e) => {
    e.preventDefault();
    if (!newOwnerForm.name || !newOwnerForm.email) {
      alert("Please fill in Owner Name and Email.");
      return;
    }
    alert(`Owner "${newOwnerForm.name}" registered successfully with ${newOwnerForm.shops} shop(s).`);
    setAddOwnerModalOpen(false);
    setNewOwnerForm({ name: "", email: "", phone: "", shops: 1 });
  };

  const handleSaveSettings = () => {
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Dynamic Header Titles
  const TAB_TITLES = {
    dashboard: { title: "Dashboard", sub: "Welcome to Queueless Admin Panel" },
    owners: { title: "Shop Owners", sub: "Manage and monitor all registered business owners" },
    shops: { title: "Registered Shops", sub: "Live queue tracking and store directories" },
    users: { title: "User Directory", sub: "Monitor active queue visitors and registered customers" },
    subscriptions: { title: "Subscription Plans", sub: "Pricing tiers, owner plans, and billing health" },
    payments: { title: "Payments & Revenue", sub: "Track invoices, payments, and payout logs" },
    reports: { title: "Analytics & Reports", sub: "Platform wait time reduction, queue traffic & analytics" },
    settings: { title: "Admin Settings", sub: "Color mode (Dark / Light), platform configs and alerts" },
  };

  const currentHeader = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <div className={`ql-admin-layout ql-admin-dashboard ${theme}`}>
      {/* Mobile Backdrop for sidebar */}
      {sidebarOpen && (
        <div
          className="ql-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── 1. SIDEBAR (TOGGLE OFF / ON) ────────────────────────── */}
      <aside className={`ql-admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div>
          {/* Brand Header with Official Queueless 'Q' Logo & Collapse Button */}
          <div className="ql-admin-brand">
            <div className="ql-brand-left">
              <div
                className="ql-brand-icon-box"
                onClick={() => setSidebarOpen((prev) => !prev)}
                title={sidebarOpen ? "Queueless" : "Expand Sidebar"}
              >
                <img src="/favicon.png" alt="QueueLess" className="ql-brand-logo-img" />
              </div>
              <div className="ql-brand-text">
                <span className="ql-brand-title">Queueless</span>
                <span className="ql-brand-subtitle">Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="ql-admin-nav">
            <button
              type="button"
              className={`ql-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => handleTabChange("dashboard")}
              title="Dashboard"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span className="ql-nav-label">Dashboard</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "owners" ? "active" : ""}`}
              onClick={() => handleTabChange("owners")}
              title="Shop Owners"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </span>
              <span className="ql-nav-label">Owners</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "shops" ? "active" : ""}`}
              onClick={() => handleTabChange("shops")}
              title="Registered Shops"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                </svg>
              </span>
              <span className="ql-nav-label">Shops</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => handleTabChange("users")}
              title="Users Directory"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="ql-nav-label">Users</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "subscriptions" ? "active" : ""}`}
              onClick={() => handleTabChange("subscriptions")}
              title="Subscription Plans"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </span>
              <span className="ql-nav-label">Subscriptions</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => handleTabChange("payments")}
              title="Payments & Revenue"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                  <line x1="6" x2="8" y1="15" y2="15" />
                </svg>
              </span>
              <span className="ql-nav-label">Payments</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => handleTabChange("reports")}
              title="Analytics Reports"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </span>
              <span className="ql-nav-label">Reports</span>
            </button>

            <button
              type="button"
              className={`ql-nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => handleTabChange("settings")}
              title="Admin Settings"
            >
              <span className="ql-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <span className="ql-nav-label">Settings</span>
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
              className="ql-sidebar-toggle-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? "Hide Sidebar (Off)" : "Show Sidebar (On)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Global Search Pill Input */}
            <div className="ql-topbar-search">
              <span className="ql-topbar-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search owners, shops, tokens, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="ql-topbar-right">
            {/* 🌙 / ☀️ DYNAMIC THEME TOGGLE BUTTON */}
            <button
              type="button"
              className="ql-theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                  <span style={{ color: "#fbbf24" }}>Light</span>
                </>
              )}
            </button>

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
                <span className="ql-date-picker-text">{dateRange}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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

            {/* Notification Bell with Badge */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="ql-notif-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label="View notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="ql-notif-badge">3</span>
              </button>

              {notifDropdownOpen && (
                <div className="ql-notif-dropdown">
                  <div className="ql-notif-header">Notifications (3)</div>
                  <div className="ql-notif-item">🔔 Rahul Sen subscription expires in 2 days</div>
                  <div className="ql-notif-item">👤 Ananya Das added Coffee Hub branch</div>
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
                title="Admin Account"
              >
                <div className="ql-avatar-circle" style={{ backgroundColor: adminProfile.avatarBg }}>
                  {adminProfile.avatarImg ? (
                    <img src={adminProfile.avatarImg} alt={adminProfile.name} className="ql-avatar-fill-img" />
                  ) : (
                    adminProfile.name.charAt(0)
                  )}
                </div>
                <span className="ql-profile-name">{adminProfile.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="ql-profile-dropdown">
                  <div className="ql-dropdown-user-header">
                    <div className="ql-avatar-circle sm" style={{ backgroundColor: adminProfile.avatarBg }}>
                      {adminProfile.avatarImg ? (
                        <img src={adminProfile.avatarImg} alt={adminProfile.name} className="ql-avatar-fill-img" />
                      ) : (
                        adminProfile.name.charAt(0)
                      )}
                    </div>
                    <div className="ql-user-header-text">
                      <span className="ql-dropdown-name">{adminProfile.name}</span>
                      <span className="ql-dropdown-badge">Super Admin</span>
                    </div>
                  </div>
                  <div className="ql-dropdown-divider" />
                  <button
                    type="button"
                    className="ql-dropdown-item"
                    onClick={() => {
                      setAdminProfileModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span>👤</span> View Profile
                  </button>
                  <button
                    type="button"
                    className="ql-dropdown-item"
                    onClick={() => {
                      setEditAdminForm(adminProfile);
                      setEditAdminModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span>✏️</span> Edit Profile & Photo
                  </button>
                  <button
                    type="button"
                    className="ql-dropdown-item"
                    onClick={() => {
                      setActiveTab("settings");
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span>⚙️</span> Admin Settings
                  </button>
                  <button type="button" className="ql-dropdown-item" onClick={toggleTheme}>
                    <span>{theme === "light" ? "🌙" : "☀️"}</span> {theme === "light" ? "Dark Theme" : "Light Theme"}
                  </button>
                  <div className="ql-dropdown-divider" />
                  <button type="button" className="ql-dropdown-item danger" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 3. MAIN CONTENT CONTAINER (SWITCHES ACCORDING TO activeTab) ─ */}
        <main className="ql-admin-content">
          {/* Dynamic Page Heading */}
          <div className="ql-page-header">
            <h1 className="ql-page-title">{currentHeader.title}</h1>
            <p className="ql-page-sub">{currentHeader.sub}</p>
          </div>

          {/* ═════════ TAB 1: MAIN DASHBOARD VIEW ═════════ */}
          {activeTab === "dashboard" && (
            <>
              {/* ROW 1: 5 STAT METRIC CARDS */}
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

              {/* ROW 2: 3 ANALYTICS CARDS (DONUT, TOP SHOPS, REVENUE) */}
              <section className="ql-analytics-grid">
                {/* Card 1: Shop Subscriptions Donut Chart */}
                <div className="ql-card ql-card-donut">
                  <div className="ql-card-head">
                    <div className="ql-card-title-group">
                      <span className="ql-card-badge-icon blue">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      </span>
                      <span className="ql-card-title">Shop Subscriptions</span>
                    </div>
                    <button type="button" className="ql-card-link" onClick={() => setActiveTab("subscriptions")}>
                      View All &rarr;
                    </button>
                  </div>

                  <div className="ql-donut-content">
                    <div className="ql-donut-graphic">
                      <svg viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.6" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00c853" strokeWidth="3.6" strokeDasharray="60, 100" strokeDashoffset="0" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="3.6" strokeDasharray="18, 100" strokeDashoffset="-60" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="3.6" strokeDasharray="12, 100" strokeDashoffset="-78" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="3.6" strokeDasharray="10, 100" strokeDashoffset="-90" />
                      </svg>
                      <div className="ql-donut-center">
                        <span className="ql-donut-num">128</span>
                        <span className="ql-donut-lbl">Total</span>
                      </div>
                    </div>

                    <div className="ql-donut-legend">
                      <div className="ql-legend-row">
                        <span className="ql-dot green" />
                        <span className="ql-legend-name">Active</span>
                        <span className="ql-legend-val">90</span>
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
                    <div className="ql-chart-y-axis">
                      <span>40K</span>
                      <span>30K</span>
                      <span>20K</span>
                      <span>10K</span>
                      <span>0</span>
                    </div>

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

              {/* ROW 3: BOTTOM GRID (RECENT OWNERS & RECENT ACTIVITIES) */}
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
                          <th className="col-hide-mobile" style={{ width: "24px" }}>#</th>
                          <th>Owner</th>
                          <th className="col-hide-mobile">Phone</th>
                          <th style={{ textAlign: "center", width: "46px" }}>Shops</th>
                          <th>Status</th>
                          <th className="col-hide-mobile">Joined On</th>
                          <th style={{ textAlign: "center", width: "46px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOwners.map((owner) => (
                          <tr key={owner.id}>
                            <td className="col-hide-mobile">{owner.id}</td>
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
                                  <span className="ql-owner-email col-hide-mobile">{owner.email}</span>
                                  <span className="ql-owner-phone-mobile col-show-mobile">{owner.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="col-hide-mobile">{owner.phone}</td>
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
                            <td className="col-hide-mobile">{owner.joinedOn}</td>
                            <td>
                              <div className="ql-row-actions">
                                <button
                                  type="button"
                                  className="ql-action-icon blue"
                                  title="View Owner Details"
                                  onClick={() => setDetailModalOwner(owner)}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className="ql-action-icon col-hide-mobile"
                                  title="More Options"
                                  onClick={() => alert(`Options for ${owner.name}`)}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                    <button type="button" className="ql-card-link" onClick={() => alert("Activity log is fully up to date.")}>
                      View All &rarr;
                    </button>
                  </div>

                  <div className="ql-timeline-list">
                    {TIMELINE_ACTIVITIES.map((act, index) => (
                      <div key={act.id} className="ql-timeline-item">
                        <div className="ql-timeline-marker">
                          <span
                            className="ql-timeline-circle-badge"
                            style={{ backgroundColor: act.color }}
                          >
                            {act.icon}
                          </span>
                          {index < TIMELINE_ACTIVITIES.length - 1 && <span className="ql-timeline-line" />}
                        </div>
                        <div className="ql-timeline-content">
                          <div className="ql-timeline-title">{act.title}</div>
                          <div className="ql-timeline-desc">{act.desc}</div>
                        </div>
                        <div className="ql-timeline-time">{act.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ═════════ TAB 2: OWNERS MANAGEMENT ═════════ */}
          {activeTab === "owners" && (
            <div className="ql-tab-view">
              <div className="ql-tab-stats-bar">
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Total Registered Owners</span>
                  <span className="val">{RECENT_OWNERS.length}</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Active Subscriptions</span>
                  <span className="val" style={{ color: "var(--admin-green)" }}>3</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Expiring Soon</span>
                  <span className="val" style={{ color: "var(--admin-amber)" }}>1</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Suspended</span>
                  <span className="val" style={{ color: "var(--admin-red)" }}>1</span>
                </div>
              </div>

              <div className="ql-tab-filter-bar">
                <div className="ql-tab-filter-left">
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>Status:</span>
                  <div className="ql-filter-pill-group">
                    {["All", "Active", "Expiring Soon", "Suspended"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`ql-filter-pill-btn ${ownerFilterStatus === st ? "active" : ""}`}
                        onClick={() => setOwnerFilterStatus(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="ql-btn-primary"
                  onClick={() => setAddOwnerModalOpen(true)}
                >
                  <span>+</span> Add New Owner
                </button>
              </div>

              <div className="ql-card" style={{ flex: 1, minHeight: "350px", overflow: "hidden" }}>
                <div className="ql-table-container">
                  <table className="ql-owners-table">
                    <thead>
                      <tr>
                        <th style={{ width: "24px" }}>#</th>
                        <th>Owner Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th style={{ textAlign: "center" }}>Shops</th>
                        <th>Subscription Status</th>
                        <th>Registered Date</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
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
                              <span className="ql-owner-name">{owner.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--admin-text-muted)" }}>{owner.email}</td>
                          <td>{owner.phone}</td>
                          <td style={{ textAlign: "center", fontWeight: "800" }}>{owner.shops}</td>
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
                                title="View Details"
                                onClick={() => setDetailModalOwner(owner)}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="ql-action-icon"
                                title="Send Alert"
                                onClick={() => alert(`Email verification & status notice sent to ${owner.name}`)}
                              >
                                ✉️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 3: REGISTERED SHOPS ═════════ */}
          {activeTab === "shops" && (
            <div className="ql-tab-view">
              <div className="ql-tab-filter-bar">
                <div className="ql-tab-filter-left">
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>Category:</span>
                  <div className="ql-filter-pill-group">
                    {["All", "Cafe & Dining", "Healthcare", "Fitness", "Retail", "Services"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`ql-filter-pill-btn ${shopCategoryFilter === cat ? "active" : ""}`}
                        onClick={() => setShopCategoryFilter(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>
                  Showing {filteredShops.length} active shops
                </span>
              </div>

              <div className="ql-shops-grid">
                {filteredShops.map((shop) => (
                  <div key={shop.id} className="ql-shop-card">
                    <div>
                      <div className="ql-shop-card-head">
                        <div>
                          <h3 className="ql-shop-card-name">{shop.name}</h3>
                          <div className="ql-shop-card-cat">{shop.category} &bull; Owner: {shop.owner}</div>
                        </div>
                        <span className={`ql-badge-pill ${shop.status === "Active" ? "active" : "suspended"}`}>
                          <span className="dot" />
                          {shop.status === "Active" ? "Serving Live" : "Closed"}
                        </span>
                      </div>
                    </div>

                    <div className="ql-shop-metrics-row">
                      <div className="ql-shop-metric-item">
                        <div className="val" style={{ color: "var(--admin-blue)" }}>{shop.currentServing}</div>
                        <div className="lbl">Serving Token</div>
                      </div>
                      <div className="ql-shop-metric-item">
                        <div className="val" style={{ color: "var(--admin-amber)" }}>{shop.waitingCount}</div>
                        <div className="lbl">In Queue</div>
                      </div>
                      <div className="ql-shop-metric-item">
                        <div className="val">{shop.avgWaitTime}</div>
                        <div className="lbl">Est. Wait</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px dashed var(--admin-border-subtle)" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                        {shop.dailyTokens} tokens served today
                      </span>
                      <button
                        type="button"
                        className="ql-btn-primary"
                        style={{ padding: "4px 10px", fontSize: "11.5px" }}
                        onClick={() => alert(`Opening live queue monitor for ${shop.name}`)}
                      >
                        View Live Queue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ TAB 4: USERS DIRECTORY ═════════ */}
          {activeTab === "users" && (
            <div className="ql-tab-view">
              <div className="ql-tab-filter-bar">
                <div className="ql-tab-filter-left">
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>Queue Status:</span>
                  <div className="ql-filter-pill-group">
                    {["All", "Waiting", "Serving Now", "Completed", "Cancelled"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`ql-filter-pill-btn ${userStatusFilter === st ? "active" : ""}`}
                        onClick={() => setUserStatusFilter(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>
                  Total Queued Visitors: {filteredUsers.length}
                </span>
              </div>

              <div className="ql-card" style={{ flex: 1, minHeight: "350px" }}>
                <div className="ql-table-container">
                  <table className="ql-owners-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Contact Number</th>
                        <th>Store Queue</th>
                        <th style={{ textAlign: "center" }}>Token #</th>
                        <th style={{ textAlign: "center" }}>Queue Pos</th>
                        <th>Status</th>
                        <th>Booking Time</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td style={{ fontWeight: "700" }}>{user.name}</td>
                          <td>{user.phone}</td>
                          <td style={{ color: "var(--admin-blue)", fontWeight: "600" }}>{user.shop}</td>
                          <td style={{ textAlign: "center", fontWeight: "900" }}>{user.token}</td>
                          <td style={{ textAlign: "center" }}>
                            {user.position === 0 ? "—" : `#${user.position}`}
                          </td>
                          <td>
                            <span
                              className={`ql-badge-pill ${
                                user.status === "Serving Now"
                                  ? "active"
                                  : user.status === "Waiting"
                                  ? "expiring"
                                  : user.status === "Completed"
                                  ? "active"
                                  : "suspended"
                              }`}
                            >
                              <span className="dot" />
                              {user.status}
                            </span>
                          </td>
                          <td>{user.bookedAt}</td>
                          <td>
                            <div className="ql-row-actions">
                              <button
                                type="button"
                                className="ql-action-icon blue"
                                title="Send SMS Update"
                                onClick={() => alert(`SMS notification sent to ${user.name} for ${user.token}`)}
                              >
                                📲
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 5: SUBSCRIPTIONS ═════════ */}
          {activeTab === "subscriptions" && (
            <div className="ql-tab-view">
              <div className="ql-plans-grid">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div key={plan.id} className={`ql-plan-card ${plan.popular ? "popular" : ""}`}>
                    {plan.popular && <span className="ql-plan-popular-badge">POPULAR</span>}
                    <div>
                      <h3 className="ql-plan-name">{plan.name}</h3>
                      <div className="ql-plan-price">
                        {plan.price} <span>{plan.period}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontWeight: "700", marginBottom: "12px" }}>
                        Active: {plan.subscribers}
                      </div>

                      <ul className="ql-plan-features">
                        {plan.features.map((feat, i) => (
                          <li key={i}>
                            <span style={{ color: "var(--admin-green)", fontWeight: "900" }}>✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="ql-btn-primary"
                      style={{ justifyContent: "center", marginTop: "16px" }}
                      onClick={() => alert(`Managing subscribers for ${plan.name}`)}
                    >
                      Manage Plan Tiers
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ TAB 6: PAYMENTS & TRANSACTIONS ═════════ */}
          {activeTab === "payments" && (
            <div className="ql-tab-view">
              <div className="ql-tab-stats-bar">
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Total Collected</span>
                  <span className="val" style={{ color: "var(--admin-blue)" }}>₹ 2,45,680</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">This Month Revenue</span>
                  <span className="val" style={{ color: "var(--admin-green)" }}>+₹ 42,800</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Pending Invoices</span>
                  <span className="val" style={{ color: "var(--admin-amber)" }}>₹ 9,998</span>
                </div>
              </div>

              <div className="ql-card" style={{ flex: 1, minHeight: "350px" }}>
                <div className="ql-table-container">
                  <table className="ql-owners-table">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Owner Name</th>
                        <th>Plan Purchased</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Payment Status</th>
                        <th>Transaction Date</th>
                        <th style={{ textAlign: "center" }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRANSACTIONS_DATA.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ fontWeight: "800" }}>{tx.id}</td>
                          <td>{tx.owner}</td>
                          <td style={{ color: "var(--admin-text-sub)" }}>{tx.plan}</td>
                          <td style={{ fontWeight: "900" }}>{tx.amount}</td>
                          <td>{tx.method}</td>
                          <td>
                            <span
                              className={`ql-badge-pill ${
                                tx.status === "Completed"
                                  ? "active"
                                  : tx.status === "Pending"
                                  ? "expiring"
                                  : "suspended"
                              }`}
                            >
                              <span className="dot" />
                              {tx.status}
                            </span>
                          </td>
                          <td>{tx.date}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="ql-action-icon blue"
                              title="Download Tax Receipt"
                              onClick={() => alert(`Downloading PDF invoice for ${tx.id}`)}
                            >
                              📄
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 7: REPORTS & ANALYTICS ═════════ */}
          {activeTab === "reports" && (
            <div className="ql-tab-view">
              <div className="ql-tab-stats-bar">
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Avg. Customer Wait Reduction</span>
                  <span className="val" style={{ color: "var(--admin-green)" }}>42.8%</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">On-Time Serving Rate</span>
                  <span className="val" style={{ color: "var(--admin-blue)" }}>98.4%</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Customer Feedback Rating</span>
                  <span className="val" style={{ color: "var(--admin-amber)" }}>4.9 ★</span>
                </div>
                <div className="ql-tab-stat-pill">
                  <span className="lbl">Total Digital Tickets</span>
                  <span className="val">84,920</span>
                </div>
              </div>

              <div className="ql-card" style={{ padding: "20px" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800" }}>
                  Peak Queue Traffic Distribution (Hourly)
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: "12px", color: "var(--admin-text-muted)" }}>
                  Peak hours detected between 1:00 PM – 3:00 PM and 6:30 PM – 8:30 PM across all shops.
                </p>

                <div className="ql-revenue-chart" style={{ height: "180px" }}>
                  <div className="ql-chart-y-axis">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0</span>
                  </div>
                  <div className="ql-chart-bars-wrap">
                    <div className="ql-chart-grid-lines">
                      <span /><span /><span /><span /><span />
                    </div>
                    <div className="ql-chart-bars">
                      {[
                        { time: "9 AM", pct: 30 },
                        { time: "11 AM", pct: 60 },
                        { time: "1 PM", pct: 95 },
                        { time: "3 PM", pct: 75 },
                        { time: "5 PM", pct: 65 },
                        { time: "7 PM", pct: 98 },
                        { time: "9 PM", pct: 40 },
                      ].map((item) => (
                        <div key={item.time} className="ql-bar-col">
                          <div className="ql-bar-pill-track">
                            <div className="ql-bar-pill" style={{ height: `${item.pct}%` }} />
                          </div>
                          <span className="ql-bar-lbl">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                  <button
                    type="button"
                    className="ql-btn-primary"
                    onClick={() => alert("Exporting monthly analytics report (CSV/PDF)...")}
                  >
                    📥 Export Comprehensive Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 8: ADMIN SETTINGS ═════════ */}
          {activeTab === "settings" && (
            <div className="ql-tab-view">
              {settingsSavedToast && (
                <div style={{ background: "var(--admin-green-light)", border: "1px solid var(--admin-green)", color: "var(--admin-green)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>
                  ✓ Settings saved successfully!
                </div>
              )}

              <div className="ql-settings-grid">
                {/* 👤 1. ADMINISTRATOR PROFILE & DETAILS */}
                <div className="ql-settings-card ql-admin-profile-settings-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="ql-settings-title" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>👤</span> Administrator Profile & Access Details
                    </div>
                    <span className="ql-badge-pill active" style={{ fontSize: "11px" }}>
                      <span className="dot" /> Super Admin
                    </span>
                  </div>

                  <div className="ql-admin-profile-hero">
                    <div className="ql-admin-hero-avatar-wrap">
                      <div className="ql-admin-hero-avatar" style={{ backgroundColor: adminProfile.avatarBg }}>
                        {adminProfile.avatarImg ? (
                          <img src={adminProfile.avatarImg} alt={adminProfile.name} className="ql-avatar-fill-img" />
                        ) : (
                          adminProfile.name.charAt(0)
                        )}
                      </div>
                      <label htmlFor="ql-settings-avatar-input" className="ql-avatar-upload-badge" title="Change Profile Photo">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </label>
                      <input
                        id="ql-settings-avatar-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarFileSelect}
                      />
                    </div>
                    <div className="ql-admin-hero-details">
                      <div className="ql-admin-hero-name">{adminProfile.name}</div>
                      <div className="ql-admin-hero-role">
                        <span className="ql-admin-role-badge">Super Admin</span>
                        <span className="ql-admin-dept-text">{adminProfile.department}</span>
                      </div>
                      <div className="ql-admin-hero-meta">
                        <span>📅 Joined: {adminProfile.joinedOn}</span>
                        <span>•</span>
                        <span>🔒 Clearance: {adminProfile.accessLevel}</span>
                        <span>•</span>
                        <span>⚡ Status: <strong style={{ color: "var(--admin-green)" }}>{adminProfile.status}</strong></span>
                      </div>
                      <div className="ql-avatar-btn-row">
                        <label htmlFor="ql-settings-avatar-input" className="ql-photo-action-btn">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Upload Profile Picture
                        </label>
                        {adminProfile.avatarImg && (
                          <button type="button" className="ql-photo-remove-btn" onClick={handleRemoveAvatar}>
                            🗑️ Remove Photo
                          </button>
                        )}
                        <button
                          type="button"
                          className="ql-photo-edit-modal-btn"
                          onClick={() => {
                            setEditAdminForm(adminProfile);
                            setEditAdminModalOpen(true);
                          }}
                        >
                          ✏️ Edit Profile Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 📋 Administrator Profile Overview Details */}
                  <div className="ql-admin-info-overview-grid">
                    <div className="ql-admin-info-item">
                      <span className="ql-admin-info-label">Full Name</span>
                      <span className="ql-admin-info-value">{adminProfile.name}</span>
                    </div>

                    <div className="ql-admin-info-item">
                      <span className="ql-admin-info-label">Username</span>
                      <span className="ql-admin-info-value">@{adminProfile.username}</span>
                    </div>

                    <div className="ql-admin-info-item">
                      <span className="ql-admin-info-label">Official Email Address</span>
                      <span className="ql-admin-info-value">{adminProfile.email}</span>
                    </div>

                    <div className="ql-admin-info-item">
                      <span className="ql-admin-info-label">Contact Phone</span>
                      <span className="ql-admin-info-value">{adminProfile.phone}</span>
                    </div>

                    <div className="ql-admin-info-item">
                      <span className="ql-admin-info-label">Department / Designation</span>
                      <span className="ql-admin-info-value">{adminProfile.department}</span>
                    </div>

                    <div className="ql-admin-info-item">
                      <span className="ql-admin-info-label">Security & Two-Factor Auth</span>
                      <span className="ql-admin-info-value" style={{ color: "var(--admin-green)", fontWeight: 700 }}>
                        ✓ {adminProfile.twoFactor}
                      </span>
                    </div>

                    <div className="ql-admin-info-item" style={{ gridColumn: "1 / -1" }}>
                      <span className="ql-admin-info-label">Administrator Bio & Responsibilities</span>
                      <span className="ql-admin-info-value" style={{ lineHeight: "1.5", fontWeight: 500, color: "var(--admin-text-sub)" }}>
                        {adminProfile.bio}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button
                      type="button"
                      className="ql-btn-primary"
                      onClick={() => {
                        setEditAdminForm(adminProfile);
                        setEditAdminModalOpen(true);
                      }}
                    >
                      ✏️ Edit Profile Details
                    </button>
                  </div>
                </div>

                {/* 🌙 / ☀️ APPEARANCE & THEME SWITCHER */}
                <div className="ql-settings-card">
                  <div className="ql-settings-title">
                    <span>🎨</span> Theme & Appearance
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "var(--admin-text-muted)" }}>
                    Choose your preferred dashboard color theme. Instant switch without reload:
                  </p>

                  <div className="ql-theme-picker">
                    <div
                      className={`ql-theme-option-box ${theme === "light" ? "selected" : ""}`}
                      onClick={() => handleSetTheme("light")}
                    >
                      <div className="ql-theme-option-preview light-preview">☀️</div>
                      <span className="ql-theme-option-lbl">Light Theme</span>
                    </div>

                    <div
                      className={`ql-theme-option-box ${theme === "dark" ? "selected" : ""}`}
                      onClick={() => handleSetTheme("dark")}
                    >
                      <div className="ql-theme-option-preview dark-preview">🌙</div>
                      <span className="ql-theme-option-lbl">Dark Theme</span>
                    </div>
                  </div>
                </div>

                {/* Notifications & System Preferences */}
                <div className="ql-settings-card">
                  <div className="ql-settings-title">
                    <span>🔔</span> System Notifications
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                      />
                      <span>Email alerts when owner subscriptions expire</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                      />
                      <span>SMS broadcast on server maintenance</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  className="ql-btn-primary"
                  onClick={handleSaveSettings}
                >
                  Save System Preferences
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── ADMIN PROFILE MODAL ─────────────────────────────────── */}
      {adminProfileModalOpen && (
        <div className="ql-modal-backdrop" onClick={() => setAdminProfileModalOpen(false)}>
          <div className="ql-detail-modal ql-admin-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="ql-admin-hero-avatar" style={{ backgroundColor: adminProfile.avatarBg, width: 44, height: 44, fontSize: 18 }}>
                  {adminProfile.avatarImg ? (
                    <img src={adminProfile.avatarImg} alt={adminProfile.name} className="ql-avatar-fill-img" />
                  ) : (
                    adminProfile.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                    {adminProfile.name}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--admin-blue)", fontWeight: "700" }}>
                    {adminProfile.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setAdminProfileModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ql-modal-body">
              <div className="ql-admin-modal-banner">
                <span className="ql-admin-modal-tag">🛡️ Root Access</span>
                <span className="ql-admin-modal-tag">✓ 2FA Verified</span>
                <span className="ql-admin-modal-tag">⚡ Full Clearance</span>
              </div>

              <div className="ql-detail-field">
                <span className="lbl">Username:</span>
                <span className="val">@{adminProfile.username}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Official Email:</span>
                <span className="val">{adminProfile.email}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Phone Number:</span>
                <span className="val">{adminProfile.phone}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Department:</span>
                <span className="val">{adminProfile.department}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">System Role:</span>
                <span className="val" style={{ color: "var(--admin-blue)", fontWeight: "800" }}>
                  Super Admin
                </span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Access Clearance:</span>
                <span className="val">{adminProfile.accessLevel}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Security Status:</span>
                <span className="val" style={{ color: "var(--admin-green)", fontWeight: "700" }}>
                  ● {adminProfile.twoFactor}
                </span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Last Session:</span>
                <span className="val">{adminProfile.lastLogin}</span>
              </div>
              <div className="ql-detail-field">
                <span className="lbl">Registration Date:</span>
                <span className="val">{adminProfile.joinedOn}</span>
              </div>
              <div className="ql-detail-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                <span className="lbl">Bio & Responsibilities:</span>
                <span className="val" style={{ fontSize: "12.5px", lineHeight: "1.4", color: "var(--admin-text-sub)" }}>
                  {adminProfile.bio}
                </span>
              </div>
            </div>

            <div className="ql-modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="ql-btn-primary"
                style={{ background: "var(--admin-blue-light)", color: "var(--admin-blue)", border: "1px solid var(--admin-blue)" }}
                onClick={() => {
                  setEditAdminForm(adminProfile);
                  setAdminProfileModalOpen(false);
                  setEditAdminModalOpen(true);
                }}
              >
                ✏️ Edit Profile & Photo
              </button>
              <button
                type="button"
                className="ql-btn-close"
                onClick={() => setAdminProfileModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ADMIN PROFILE & PHOTO MODAL ───────────────────── */}
      {editAdminModalOpen && (
        <div className="ql-modal-backdrop" onClick={() => setEditAdminModalOpen(false)}>
          <div className="ql-detail-modal ql-admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>✏️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                    Edit Administrator Profile
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
                    Update your profile picture, credentials and contact information
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setEditAdminModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdminProfile}>
              <div className="ql-modal-body">
                {/* Profile Picture Upload Section */}
                <div className="ql-edit-photo-box">
                  <div className="ql-edit-avatar-preview" style={{ backgroundColor: editAdminForm.avatarBg }}>
                    {editAdminForm.avatarImg ? (
                      <img src={editAdminForm.avatarImg} alt="Admin Preview" className="ql-avatar-fill-img" />
                    ) : (
                      editAdminForm.name.charAt(0)
                    )}
                  </div>
                  <div className="ql-edit-photo-controls">
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--admin-text-main)" }}>
                      Administrator Profile Picture
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginBottom: "8px" }}>
                      Upload PNG, JPG or WebP (Max 3MB). Will display across the header and profile.
                    </div>
                    <div className="ql-avatar-btn-row">
                      <label htmlFor="ql-modal-avatar-input" className="ql-photo-action-btn">
                        📷 Upload New Photo
                      </label>
                      <input
                        id="ql-modal-avatar-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarFileSelect}
                      />
                      {editAdminForm.avatarImg && (
                        <button type="button" className="ql-photo-remove-btn" onClick={handleRemoveAvatar}>
                          🗑️ Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="ql-admin-profile-form-grid" style={{ marginTop: "14px" }}>
                  <div>
                    <label className="ql-form-label">Full Name</label>
                    <input
                      type="text"
                      className="ql-form-input"
                      value={editAdminForm.name}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Username</label>
                    <input
                      type="text"
                      className="ql-form-input"
                      value={editAdminForm.username}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, username: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Official Email Address</label>
                    <input
                      type="email"
                      className="ql-form-input"
                      value={editAdminForm.email}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="ql-form-input"
                      value={editAdminForm.phone}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Department / Designation</label>
                    <input
                      type="text"
                      className="ql-form-input"
                      value={editAdminForm.department}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, department: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Role Clearance (System Enforced)</label>
                    <input
                      type="text"
                      className="ql-form-input"
                      disabled
                      value="Super Admin"
                      style={{ opacity: 0.85, cursor: "not-allowed" }}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="ql-form-label">Administrator Bio & Responsibilities</label>
                    <textarea
                      rows={2}
                      className="ql-form-input"
                      style={{ resize: "vertical" }}
                      value={editAdminForm.bio}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, bio: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="ql-modal-footer" style={{ gap: "10px" }}>
                <button
                  type="button"
                  className="ql-btn-close"
                  onClick={() => setEditAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ql-btn-primary">
                  💾 Save Profile & Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--admin-text-main)" }}>
                    {detailModalOwner.name}
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Registered Business Owner</span>
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
                <span className="lbl">Total Registered Shops:</span>
                <span className="val">{detailModalOwner.shops} active queue(s)</span>
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
                <span className="lbl">Registration Date:</span>
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

      {/* ── ADD OWNER MODAL ────────────────────────────────────── */}
      {addOwnerModalOpen && (
        <div className="ql-modal-backdrop" onClick={() => setAddOwnerModalOpen(false)}>
          <div className="ql-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                Add New Shop Owner
              </h3>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setAddOwnerModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOwnerSubmit}>
              <div className="ql-modal-body">
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--admin-border)", background: "var(--admin-input-bg)", color: "var(--admin-text-main)", outline: "none" }}
                    value={newOwnerForm.name}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--admin-border)", background: "var(--admin-input-bg)", color: "var(--admin-text-main)", outline: "none" }}
                    value={newOwnerForm.email}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--admin-border)", background: "var(--admin-input-bg)", color: "var(--admin-text-main)", outline: "none" }}
                    value={newOwnerForm.phone}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Number of Initial Shops
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--admin-border)", background: "var(--admin-input-bg)", color: "var(--admin-text-main)", outline: "none" }}
                    value={newOwnerForm.shops}
                    onChange={(e) => setNewOwnerForm({ ...newOwnerForm, shops: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="ql-modal-footer" style={{ gap: "8px" }}>
                <button
                  type="button"
                  style={{ background: "none", border: "1px solid var(--admin-border)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", color: "var(--admin-text-main)", fontWeight: "600" }}
                  onClick={() => setAddOwnerModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ql-btn-primary">
                  Create Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
