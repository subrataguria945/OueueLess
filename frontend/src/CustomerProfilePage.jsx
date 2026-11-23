import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { AdminImageCropModal } from "./AdminImageCropModal";
import { checkIsOwner, formatMemberSince, formatName } from "./authRole";
import "./CustomerHome.css";

export function CustomerProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Tab State (defaults to 'details', or reads from query param ?tab=tokens)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "details";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setProfileDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {}
    return null;
  });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  // Profile Data - purely from real logged-in customer data, ZERO demo data
  const [profileData, setProfileData] = useState(() => {
    let name = "";
    let email = "";
    let phone = "";
    let loc = "";
    let avatar = null;
    let joined = null;
    let role = "Customer";
    let userId = null;

    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        name = u.fullname || u.full_name || u.name || "";
        email = u.email || "";
        phone = u.phone || "";
        loc = u.address || u.location || "";
        avatar =
          u.profile_image ||
          u.avatar ||
          u.avatarImg ||
          localStorage.getItem("customerAvatar") ||
          null;
        joined = u.joined_date || null;
        role = u.user_role || u.role || "Customer";
        userId = u.user_id || u.id || null;
      }
    } catch {}

    return {
      userId,
      name,
      fullname: name,
      email,
      phone,
      location: loc,
      address: loc,
      avatar,
      role: role === "Customer" || role === "CUSTOMER" ? "Customer" : role,
      joined_date: joined,
      memberSince: joined ? formatMemberSince(joined) : "Recently",
      smsAlerts: true,
      whatsappUpdates: true,
      soundAlerts: true,
    };
  });

  // Active Token
  const [activeToken, setActiveToken] = useState(() => {
    try {
      const saved = localStorage.getItem("activeToken");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Token Booking History - purely from real customer activity, zero demo data
  const [tokenHistory, setTokenHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("customer_token_history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Security Form
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  // Modals
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (checkIsOwner({ user: u, token })) {
          localStorage.removeItem("token");
          localStorage.removeItem("ql_admin_token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          localStorage.removeItem("refresh_token");
          sessionStorage.clear();
          navigate("/login", { replace: true });
          return;
        }
        setCurrentUser(u);
        setProfileData((prev) => ({
          ...prev,
          userId: u.user_id || u.id || prev.userId,
          name: u.fullname || u.full_name || u.name || prev.name,
          fullname: u.fullname || u.full_name || u.name || prev.fullname,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          location: u.address || u.location || prev.location,
          address: u.address || u.location || prev.address,
          avatar: u.profile_image || u.avatar || localStorage.getItem("customerAvatar") || prev.avatar,
          role: u.user_role || u.role || prev.role,
          memberSince: u.joined_date ? formatMemberSince(u.joined_date) : prev.memberSince,
        }));
      } catch {}
    } else {
      setCurrentUser(null);
    }
  }, [navigate]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WebP).", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (croppedDataUrl) => {
    setProfileData((prev) => ({ ...prev, avatar: croppedDataUrl }));
    localStorage.setItem("customerAvatar", croppedDataUrl);
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.avatar = croppedDataUrl;
        localStorage.setItem("user", JSON.stringify(u));
        setCurrentUser(u);
      }
    } catch {}
    setCropModalOpen(false);
    showToast("Profile photo updated successfully!", "success");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      let u = {};
      if (userStr) {
        try { u = JSON.parse(userStr); } catch {}
      }
      const updatedUser = {
        ...u,
        fullname: profileData.name,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.location,
        location: profileData.location,
        avatar: profileData.avatar,
        profile_image: profileData.avatar,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    } catch {}
    showToast("Profile details saved successfully!", "success");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPass || !passwordForm.confirmPass) {
      showToast("Please enter new password and confirmation.", "error");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast("New passwords do not match.", "error");
      return;
    }
    setPasswordForm({ current: "", newPass: "", confirmPass: "" });
    showToast("Password changed successfully!", "success");
  };

  const handleCancelActiveToken = () => {
    if (activeToken) {
      setTokenHistory((prev) =>
        prev.map((t) => (t.id === activeToken.id ? { ...t, status: "CANCELLED" } : t))
      );
    }
    setActiveToken(null);
    localStorage.removeItem("activeToken");
    setCancelModalOpen(false);
    showToast("Active token was cancelled.", "info");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ql_admin_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.clear();
    showToast("Signed out successfully.", "info");
    navigate("/", { replace: true });
  };

  const customerFullName = formatName(
    currentUser?.fullname ||
    currentUser?.full_name ||
    currentUser?.name ||
    profileData.fullname ||
    profileData.full_name ||
    profileData.name ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "") ||
    "Customer"
  );
  const customerEmail =
    currentUser?.email || profileData.email || "";
  const customerInitial = (customerFullName || "Customer").charAt(0).toUpperCase();

  return (
    <div className="ql-customer-root" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* ── TOP NAVBAR HEADER ─────────────────────────────────────────── */}
      <header className="ql-nav-header">
        <div className="ql-nav-container">
          {/* Brand Logo */}
          <div className="ql-nav-brand" onClick={() => navigate("/home")} title="QueueLess Home">
            <svg
              className="ql-logo-svg"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="12" fill="#1665D8" />
              <path
                d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C22.3869 30 24.5867 29.1636 26.3111 27.7667L28.2929 29.7485C28.6834 30.1391 29.3166 30.1391 29.7071 29.7485C30.0976 29.358 30.0976 28.7248 29.7071 28.3343L27.7667 26.3111C29.1636 24.5867 30 22.3869 30 20C30 14.4772 25.5228 10 20 10ZM14 20C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20C26 23.3137 23.3137 26 20 26C16.6863 26 14 23.3137 14 20Z"
                fill="white"
              />
            </svg>
            <span className="ql-brand-title">
              Queue<span className="ql-accent">Less</span>
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav>
            <ul className="ql-nav-links">
              <li>
                <button type="button" className="ql-nav-link" onClick={() => navigate("/home")}>
                  ← Back to Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "details" ? "active" : ""}`}
                  onClick={() => setActiveTab("details")}
                >
                  Personal Details
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "tokens" ? "active" : ""}`}
                  onClick={() => setActiveTab("tokens")}
                >
                  My Bookings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "notifications" ? "active" : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  Turn Alerts
                </button>
              </li>
            </ul>
          </nav>

          {/* Right Action: Pill with Customer Name & SVG Chevron */}
          <div className="ql-nav-actions">
            <div className="ql-customer-pill-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className={`ql-customer-pill ${profileDropdownOpen ? "active" : ""}`}
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-expanded={profileDropdownOpen}
                title="Customer Account Menu"
              >
                <div className="ql-customer-pill-avatar">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt={customerFullName} />
                  ) : (
                    customerInitial
                  )}
                </div>
                <span className="ql-customer-pill-name">{customerFullName}</span>
                <svg
                  className="ql-customer-pill-caret"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="ql-customer-dropdown-menu">
                  <div className="ql-customer-dropdown-header">
                    <div className="ql-customer-dropdown-user-row">
                      <div className="ql-customer-dropdown-avatar-sm">
                        {profileData.avatar ? (
                          <img src={profileData.avatar} alt={customerFullName} />
                        ) : (
                          customerInitial
                        )}
                      </div>
                      <div className="ql-customer-dropdown-meta">
                        <div className="ql-customer-dropdown-name">{customerFullName}</div>
                        <div className="ql-customer-dropdown-email">{customerEmail}</div>
                      </div>
                    </div>
                    <div className="ql-customer-dropdown-badge">
                      <span className="ql-customer-dropdown-badge-dot" />
                      <span>Verified Customer</span>
                    </div>
                  </div>

                  <div className="ql-customer-dropdown-divider" />

                  <button
                    type="button"
                    className="ql-customer-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab("details");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Personal Details</span>
                  </button>

                  <button
                    type="button"
                    className="ql-customer-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab("tokens");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
                    </svg>
                    <span>My Bookings &amp; Passes</span>
                  </button>

                  <button
                    type="button"
                    className="ql-customer-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab("notifications");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>Turn Alerts &amp; Updates</span>
                  </button>

                  <button
                    type="button"
                    className="ql-customer-dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab("security");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Security &amp; Password</span>
                  </button>

                  <div className="ql-customer-dropdown-divider" />

                  <button
                    type="button"
                    className="ql-customer-dropdown-item ql-customer-dropdown-danger"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        </div>
      </header>

      {/* ── PROFILE MAIN CONTENT CONTAINER ───────────────────────────── */}
      <main className="ql-profile-page-main">
        {/* Page Heading & Back Bar */}
        <div className="ql-profile-page-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <button
                type="button"
                onClick={() => navigate("/home")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#1665d8",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: 0,
                }}
              >
                ← Back to Home
              </button>
            </div>
            <h1 className="ql-profile-heading-title">
              Customer Profile &amp; Account Details
            </h1>
            <p className="ql-profile-heading-sub">
              Manage your personal information, view active &amp; past queue tokens, and configure turn notifications.
            </p>
          </div>

          <button
            type="button"
            className="ql-btn-login"
            onClick={handleLogout}
            style={{ color: "#dc2626", borderColor: "#fecaca" }}
          >
            Sign Out
          </button>
        </div>

        {/* Profile Card Container */}
        <div className="ql-profile-page-card">
          {/* Top Hero Banner */}
          <div className="ql-profile-header-banner">
            <div className="ql-profile-header-banner-content">
              <div className="ql-profile-avatar-box">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="ql-profile-avatar-img"
                  />
                ) : (
                  <span>{profileData.name.charAt(0).toUpperCase()}</span>
                )}
                <button
                  type="button"
                  className="ql-profile-avatar-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload &amp; Crop Profile Photo"
                >
                  📷
                </button>
              </div>

              <div className="ql-profile-user-info">
                <h2 className="ql-profile-name">{profileData.name}</h2>
                <p className="ql-profile-email">{profileData.email} • {profileData.phone}</p>
                <div className="ql-profile-meta-row">
                  <span className="ql-profile-verified-badge">
                    ● {currentUser ? "Verified Customer" : "Guest Profile"}
                  </span>
                  <span className="ql-profile-member-date">
                    Member since {profileData.memberSince}
                  </span>
                  {profileData.userId && (
                    <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.75)" }}>
                      • ID: #{profileData.userId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="ql-profile-nav-tabs">
            <button
              type="button"
              className={`ql-profile-tab-button ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              <span>👤 Personal Details</span>
            </button>
            <button
              type="button"
              className={`ql-profile-tab-button ${activeTab === "tokens" ? "active" : ""}`}
              onClick={() => setActiveTab("tokens")}
            >
              <span>🎟️ My Bookings &amp; Queue ({tokenHistory.length + (activeToken ? 1 : 0)})</span>
            </button>
            <button
              type="button"
              className={`ql-profile-tab-button ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <span>🔔 Turn Alerts</span>
            </button>
            <button
              type="button"
              className={`ql-profile-tab-button ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <span>🔒 Security &amp; Settings</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="ql-profile-tab-content-wrap">
            {/* TAB 1: Personal Details */}
            {activeTab === "details" && (
              <form onSubmit={handleSaveProfile} className="ql-profile-form-grid" style={{ maxWidth: "800px" }}>
                <div>
                  <label className="ql-profile-field-label">Full Name</label>
                  <input
                    type="text"
                    className="ql-profile-input"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="ql-profile-field-label">Phone Number</label>
                  <input
                    type="tel"
                    className="ql-profile-input"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="ql-profile-field-label">Email Address</label>
                  <input
                    type="email"
                    className="ql-profile-input"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="ql-profile-field-label">Address / Location</label>
                  <input
                    type="text"
                    className="ql-profile-input"
                    value={profileData.address || profileData.location}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        location: e.target.value,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter your address (e.g. Kolkata, West Bengal)"
                  />
                </div>

                <div>
                  <label className="ql-profile-field-label">Customer ID</label>
                  <input
                    type="text"
                    className="ql-profile-input"
                    value={profileData.userId ? `#${profileData.userId}` : "Assigned"}
                    disabled
                    style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
                  />
                </div>

                <div>
                  <label className="ql-profile-field-label">Account Role</label>
                  <input
                    type="text"
                    className="ql-profile-input"
                    value={profileData.role || "Customer"}
                    disabled
                    style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
                  />
                </div>

                <div>
                  <label className="ql-profile-field-label">Member Since</label>
                  <input
                    type="text"
                    className="ql-profile-input"
                    value={profileData.memberSince || "Recently"}
                    disabled
                    style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
                  />
                </div>

                <div className="ql-profile-field-full" style={{ marginTop: "14px" }}>
                  <button
                    type="submit"
                    className="ql-btn-modal-submit"
                    style={{ padding: "12px 28px", fontSize: "14px" }}
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: My Bookings & Queue */}
            {activeTab === "tokens" && (
              <div className="ql-profile-bookings-list" style={{ maxWidth: "860px" }}>
                {activeToken ? (
                  <div className="ql-profile-active-booking-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="ql-booking-status-badge active">
                        ● Live Active Token
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1665d8" }}>
                        Est. Wait: ~{activeToken.estWaitMins} mins
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div className="ql-profile-token-pill" style={{ background: "#ffffff", borderColor: "#1665d8", width: "64px", height: "64px", fontSize: "18px" }}>
                        {activeToken.tokenNumber}
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                          {activeToken.shopName}
                        </h3>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                          📍 {activeToken.location} • 🪑 {activeToken.counter} ({activeToken.service})
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#1665d8", fontWeight: 600 }}>
                          Currently Serving: <strong>{activeToken.currentServing}</strong> • {activeToken.peopleAhead} people ahead
                        </p>
                      </div>
                    </div>

                    <div className="ql-profile-active-actions">
                      <button
                        type="button"
                        className="ql-btn-view-qr"
                        onClick={() => setQrModalOpen(true)}
                      >
                        📱 View Digital QR Pass
                      </button>
                      <button
                        type="button"
                        className="ql-btn-cancel-token"
                        onClick={() => setCancelModalOpen(true)}
                      >
                        Cancel Token
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      borderRadius: "14px",
                      background: "#f8fafc",
                      border: "1.5px dashed #cbd5e1",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#0f172a" }}>
                      You don't have any active queue tokens at this moment.
                    </p>
                    <button
                      type="button"
                      className="ql-btn-book-slot"
                      style={{ maxWidth: "240px", margin: "0 auto" }}
                      onClick={() => navigate("/")}
                    >
                      Book a Token Now →
                    </button>
                  </div>
                )}

                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0b192c", margin: "24px 0 10px" }}>
                  Past Booking History
                </h3>

                {tokenHistory && tokenHistory.length > 0 ? (
                  tokenHistory.map((item) => (
                    <div key={item.id} className="ql-profile-booking-card">
                      <div className="ql-profile-booking-left">
                        <div className="ql-profile-token-pill">{item.tokenNumber}</div>
                        <div className="ql-profile-booking-details">
                          <h4>{item.shopName}</h4>
                          <p>{item.service} • {item.date}</p>
                        </div>
                      </div>
                      <div className="ql-profile-booking-right">
                        <span
                          className={`ql-booking-status-badge ${
                            item.status === "COMPLETED"
                              ? "completed"
                              : item.status === "ACTIVE"
                              ? "active"
                              : "cancelled"
                          }`}
                        >
                          ● {item.status}
                        </span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.id}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "36px 20px",
                      borderRadius: "14px",
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎟️</div>
                    <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>
                      No Past Bookings Found
                    </p>
                    <p style={{ margin: 0, fontSize: "13px" }}>
                      Your completed and past queue tokens will automatically be displayed here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Turn Alerts */}
            {activeTab === "notifications" && (
              <div className="ql-profile-notifications-list" style={{ maxWidth: "760px" }}>
                <div
                  className="ql-profile-toggle-card"
                  onClick={() =>
                    setProfileData((prev) => ({ ...prev, smsAlerts: !prev.smsAlerts }))
                  }
                >
                  <div className="ql-profile-toggle-info">
                    <h4>📲 SMS Turn Notification</h4>
                    <p>Receive an automatic SMS alert on your mobile when your turn is 2 persons away.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.smsAlerts}
                    onChange={() => {}}
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  />
                </div>

                <div
                  className="ql-profile-toggle-card"
                  onClick={() =>
                    setProfileData((prev) => ({ ...prev, whatsappUpdates: !prev.whatsappUpdates }))
                  }
                >
                  <div className="ql-profile-toggle-info">
                    <h4>💬 WhatsApp Instant Live Pass</h4>
                    <p>Receive digital QR pass directly on WhatsApp with real-time countdown &amp; counter updates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.whatsappUpdates}
                    onChange={() => {}}
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  />
                </div>

                <div
                  className="ql-profile-toggle-card"
                  onClick={() =>
                    setProfileData((prev) => ({ ...prev, soundAlerts: !prev.soundAlerts }))
                  }
                >
                  <div className="ql-profile-toggle-info">
                    <h4>🔔 Web Browser Audio Chime Bell</h4>
                    <p>Play an audio bell chime sound on this browser tab when your token number is announced.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.soundAlerts}
                    onChange={() => {}}
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  />
                </div>

                <button
                  type="button"
                  className="ql-btn-modal-submit"
                  style={{ alignSelf: "flex-start", marginTop: "14px", padding: "12px 26px" }}
                  onClick={() => showToast("Turn alert preferences updated successfully!", "success")}
                >
                  Save Notification Preferences
                </button>
              </div>
            )}

            {/* TAB 4: Security */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>
                <div>
                  <label className="ql-profile-field-label">Current Password</label>
                  <input
                    type="password"
                    className="ql-profile-input"
                    placeholder="••••••••"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="ql-profile-field-label">New Password</label>
                    <input
                      type="password"
                      className="ql-profile-input"
                      placeholder="At least 6 characters"
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="ql-profile-field-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="ql-profile-input"
                      placeholder="Repeat new password"
                      value={passwordForm.confirmPass}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPass: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
                  <button type="submit" className="ql-btn-modal-submit" style={{ padding: "11px 26px" }}>
                    Update Password
                  </button>

                  <button
                    type="button"
                    className="ql-btn-cancel-token"
                    style={{ borderColor: "#ef4444", color: "#dc2626", padding: "9px 20px" }}
                    onClick={handleLogout}
                  >
                    Sign Out of Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* Image Crop Modal */}
      {cropModalOpen && (
        <AdminImageCropModal
          isOpen={cropModalOpen}
          imageSrc={cropImageSrc}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          userName={profileData.name}
        />
      )}

      {/* QR Pass Modal */}
      {qrModalOpen && activeToken && (
        <div className="ql-modal-backdrop" onClick={() => setQrModalOpen(false)}>
          <div className="ql-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <h3 className="ql-modal-title">Digital Queue Token Pass</h3>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setQrModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ql-modal-body">
              <div className="ql-qr-pass-container">
                <h1 className="ql-qr-token-number">{activeToken.tokenNumber}</h1>
                <h4 className="ql-qr-shop-name">{activeToken.shopName}</h4>

                <div className="ql-qr-box">
                  <svg viewBox="0 0 100 100" width="100%" height="100%" fill="#0b192c">
                    <rect x="5" y="5" width="26" height="26" fill="#1665d8" rx="4" />
                    <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="13" y="13" width="10" height="10" fill="#1665d8" />
                    <rect x="69" y="5" width="26" height="26" fill="#1665d8" rx="4" />
                    <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="77" y="13" width="10" height="10" fill="#1665d8" />
                    <rect x="5" y="69" width="26" height="26" fill="#1665d8" rx="4" />
                    <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="13" y="77" width="10" height="10" fill="#1665d8" />
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="46" y="14" width="6" height="6" />
                    <rect x="56" y="8" width="6" height="6" />
                    <rect x="36" y="24" width="6" height="6" />
                    <rect x="46" y="28" width="6" height="6" />
                    <rect x="8" y="38" width="6" height="6" />
                    <rect x="18" y="44" width="6" height="6" />
                    <rect x="38" y="40" width="8" height="8" fill="#1665d8" />
                    <rect x="52" y="42" width="6" height="6" />
                    <rect x="76" y="44" width="6" height="6" />
                    <rect x="38" y="56" width="6" height="6" />
                    <rect x="48" y="62" width="6" height="6" />
                    <rect x="72" y="68" width="8" height="8" />
                  </svg>
                </div>

                <div
                  style={{
                    width: "100%",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    padding: "12px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    textAlign: "left",
                    fontSize: "12.5px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <span style={{ color: "#64748b" }}>Counter:</span>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{activeToken.counter}</div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Turn in:</span>
                    <div style={{ fontWeight: 700, color: "#059669" }}>~{activeToken.estWaitMins} mins</div>
                  </div>
                </div>

                <p className="ql-qr-instructions">
                  Please show this QR code at the service counter when your token number is announced.
                </p>
              </div>
            </div>

            <div className="ql-modal-footer">
              <button
                type="button"
                className="ql-btn-modal-cancel"
                onClick={() => window.print()}
              >
                🖨️ Print Pass
              </button>
              <button
                type="button"
                className="ql-btn-modal-submit"
                onClick={() => setQrModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && activeToken && (
        <div className="ql-modal-backdrop" onClick={() => setCancelModalOpen(false)}>
          <div className="ql-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <h3 className="ql-modal-title">Cancel Queue Token</h3>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setCancelModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ql-modal-body">
              <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#0f172a" }}>
                Are you sure you want to cancel token <strong>{activeToken.tokenNumber}</strong> for{" "}
                <strong>{activeToken.shopName}</strong>?
              </p>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  fontSize: "12.5px",
                  color: "#dc2626",
                }}
              >
                ⚠️ Your spot in the live queue will be forfeited and assigned to the next customer.
              </div>
            </div>

            <div className="ql-modal-footer">
              <button
                type="button"
                className="ql-btn-modal-cancel"
                onClick={() => setCancelModalOpen(false)}
              >
                Keep Token
              </button>
              <button
                type="button"
                className="ql-btn-modal-submit"
                style={{ background: "#ef4444" }}
                onClick={handleCancelActiveToken}
              >
                Yes, Cancel Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div className="ql-toast">
          <span>{toast.type === "success" ? "✅" : "ℹ️"}</span>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default CustomerProfilePage;

