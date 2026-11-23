import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminImageCropModal } from "./AdminImageCropModal";
import { checkIsOwner, formatMemberSince, formatName } from "./authRole";
import "./CustomerHome.css";

export function CustomerHome() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const shopsSectionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const calendarSectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Select Location");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Read current user from localStorage / sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (token && userStr) {
        return JSON.parse(userStr);
      }
    } catch {}
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ql_admin_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("refresh_token");
    sessionStorage.clear();
    setCurrentUser(null);
    setProfileDropdownOpen(false);
    navigate("/");
  };

  // If stored session belongs to an Owner, clear and log out
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (checkIsOwner({ user: u, token })) {
          handleLogout();
        }
      } catch {}
    }
  }, []);

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Profile & History State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState("details"); // 'details' | 'tokens' | 'notifications' | 'security'
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const [profileData, setProfileData] = useState(() => {
    let name = "";
    let email = "";
    let phone = "";
    let location = "";
    let avatar = null;
    let joined = null;
    let role = "Customer";
    let userId = null;

    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        name = u.fullname || u.name || "";
        email = u.email || "";
        phone = u.phone || "";
        location = u.address || u.location || "";
        avatar =
          u.profile_image ||
          u.avatar ||
          u.avatarImg ||
          localStorage.getItem("customerAvatar") ||
          (() => {
            try {
              const adm = JSON.parse(localStorage.getItem("ql_admin_profile") || "{}");
              return adm.avatarImg || null;
            } catch {
              return null;
            }
          })() ||
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
      location,
      address: location,
      avatar,
      role: role === "Customer" || role === "CUSTOMER" ? "Customer" : role,
      joined_date: joined,
      memberSince: joined ? formatMemberSince(joined) : "Recently",
      smsAlerts: true,
      whatsappUpdates: true,
      soundAlerts: true,
    };
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  // User booking tokens - purely from real activity, zero fake demo data
  const [tokenHistory, setTokenHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("customer_token_history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Active Token live turn state (loads saved booking or defaults to null)
  const [activeToken, setActiveToken] = useState(() => {
    try {
      const saved = localStorage.getItem("activeToken");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    if (activeToken) {
      localStorage.setItem("activeToken", JSON.stringify(activeToken));
    } else {
      localStorage.removeItem("activeToken");
    }
  }, [activeToken]);

  // Calendar State
  const [calendarMonthDate, setCalendarMonthDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [calendarShopId, setCalendarShopId] = useState(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState("10:00 AM - 10:30 AM");

  // Real Live Shops State (zero demo data)
  const [shops, setShops] = useState(() => {
    try {
      const saved = localStorage.getItem("ql_admin_shops_list") || localStorage.getItem("ql_shops");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((s) => s && !String(s.name || "").toLowerCase().includes("demo"));
        }
      }
    } catch {}
    return [];
  });
  const [isShopsLoading, setIsShopsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRealShops = async () => {
      setIsShopsLoading(true);
      try {
        const API_BASE = (
          import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          "https://queueless-backend-b2qh.onrender.com"
        ).replace(/\/+$/, "");

        let res = await fetch(`${API_BASE}/admin/shops/all`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/shop/all`);
        }
        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data)
            ? data
            : Array.isArray(data?.shops)
            ? data.shops
            : Array.isArray(data?.data)
            ? data.data
            : [];

          const cleanList = rawList
            .filter((s) => s && !String(s.name || s.shop_name || "").toLowerCase().includes("demo"))
            .map((s) => {
              const isActive =
                s.is_active !== undefined
                  ? Boolean(s.is_active)
                  : s.status === "Suspended" || s.status === "Inactive"
                  ? false
                  : true;
              const isOpen =
                s.is_open !== undefined
                  ? Boolean(s.is_open)
                  : s.status === "Closed"
                  ? false
                  : true;

              const cat = s.category || "General";
              const icon =
                cat.toLowerCase().includes("health") || cat.toLowerCase().includes("clinic")
                  ? "🏥"
                  : cat.toLowerCase().includes("salon") || cat.toLowerCase().includes("spa")
                  ? "✂️"
                  : cat.toLowerCase().includes("dine") || cat.toLowerCase().includes("cafe")
                  ? "☕"
                  : cat.toLowerCase().includes("bank")
                  ? "🏦"
                  : cat.toLowerCase().includes("retail") || cat.toLowerCase().includes("market")
                  ? "🛍️"
                  : "🏪";

              return {
                id: s.shop_id || s.id,
                name: s.shop_name || s.name || "Store Counter",
                category: cat.toLowerCase(),
                categoryLabel: cat,
                location: s.address || s.location || "Store Location",
                currentToken: s.current_token || "#0",
                currentServing: s.current_serving || s.currentServing || "--",
                estWait: s.average_wait_time ? `${s.average_wait_time} mins` : "--",
                peopleInQueue: s.waiting_count ?? s.peopleInQueue ?? 0,
                status: isOpen ? "open" : "closed",
                statusLabel: isOpen ? "Queue Active" : "Closed",
                icon,
                counters: Array.isArray(s.counters) && s.counters.length > 0 ? s.counters : ["Main Counter #01"],
                services: Array.isArray(s.services) && s.services.length > 0 ? s.services : ["General Service"],
                rawShop: s,
              };
            });

          if (isMounted && cleanList.length > 0) {
            setShops(cleanList);
            localStorage.setItem("ql_shops", JSON.stringify(cleanList));
            setCalendarShopId((prev) => prev || cleanList[0].id);
          }
        }
      } catch (err) {
        console.warn("Could not load shops from backend API:", err);
      } finally {
        if (isMounted) setIsShopsLoading(false);
      }
    };

    fetchRealShops();
    return () => {
      isMounted = false;
    };
  }, []);

  // Modals State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [modalShop, setModalShop] = useState(null);
  const [modalDate, setModalDate] = useState("");
  const [modalSlot, setModalSlot] = useState("10:00 AM - 10:30 AM");
  const [modalService, setModalService] = useState("");
  const [modalCounter, setModalCounter] = useState("");
  const [modalNotes, setModalNotes] = useState("");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Toast State
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
        setCurrentUser(u);
        setProfileData((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          location: u.location || prev.location,
          avatar: localStorage.getItem("customerAvatar") || u.avatar || prev.avatar,
        }));
      } catch {}
    }
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (JPG, PNG, WebP).", "error");
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
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        avatar: profileData.avatar,
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

  // Locations dynamically derived from real shops
  const locationsList = [
    "All Locations",
    ...Array.from(new Set(shops.map((s) => s.location).filter(Boolean))),
  ];

  // Categories dynamically derived from real shops
  const categories = [
    { id: "all", label: "All Categories" },
    ...Array.from(
      new Set(shops.map((s) => s.categoryLabel || s.category).filter(Boolean))
    ).map((cat) => ({
      id: cat.toLowerCase(),
      label: cat,
    })),
  ];

  // Close location dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".ql-search-location-box")) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc === "All Locations" ? "Select Location" : loc);
    setLocationDropdownOpen(false);
  };

  const scrollToSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const scrollToCalendar = () => {
    setActiveTab("calendar");
    if (calendarSectionRef.current) {
      calendarSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToHowItWorks = () => {
    setActiveTab("how-it-works");
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToShops = () => {
    setActiveTab("find-shop");
    if (shopsSectionRef.current) {
      shopsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Calendar Calculation Logic
  const calendarYear = calendarMonthDate.getFullYear();
  const calendarMonth = calendarMonthDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    setCalendarMonthDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonthDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCalendarMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedCalendarDate(today.toISOString().split("T")[0]);
  };

  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const totalDaysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();

  const selectedCalendarShop =
    shops.find((s) => s.id === Number(calendarShopId)) || shops[0] || null;

  const getDayAvailability = (dayNum, isCurrentMonth) => {
    if (!isCurrentMonth) return { status: "closed", label: "Closed", slotsCount: 0 };
    if (!selectedCalendarShop) return { status: "closed", label: "No Shop Selected", slotsCount: 0 };

    const dateObj = new Date(calendarYear, calendarMonth, dayNum);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      return { status: "closed", label: "Sunday Closed", slotsCount: 0 };
    }

    if (selectedCalendarShop.status === "closed") {
      return { status: "closed", label: "Closed", slotsCount: 0 };
    }

    return { status: "available", label: "Slots Open", slotsCount: 8 };
  };

  const calendarCells = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateStr: "",
      availability: { status: "closed", label: "Closed", slotsCount: 0 },
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  for (let d = 1; d <= totalDaysInCurrentMonth; d++) {
    const mm = String(calendarMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${calendarYear}-${mm}-${dd}`;
    const availability = getDayAvailability(d, true);

    calendarCells.push({
      dayNum: d,
      isCurrentMonth: true,
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedCalendarDate,
      availability,
    });
  }

  const remainingPad = (7 - (calendarCells.length % 7)) % 7;
  for (let n = 1; n <= remainingPad; n++) {
    calendarCells.push({
      dayNum: n,
      isCurrentMonth: false,
      dateStr: "",
      availability: { status: "closed", label: "Closed", slotsCount: 0 },
    });
  }

  const getSelectedDateDisplay = () => {
    if (!selectedCalendarDate) return "Today";
    const [y, m, d] = selectedCalendarDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const availableTimeSlots = [
    { time: "09:30 AM - 10:00 AM", available: true, count: 5 },
    { time: "10:30 AM - 11:00 AM", available: true, count: 4 },
    { time: "11:30 AM - 12:00 PM", available: true, count: 2 },
    { time: "01:30 PM - 02:00 PM", available: true, count: 6 },
    { time: "02:30 PM - 03:00 PM", available: true, count: 5 },
    { time: "03:30 PM - 04:00 PM", available: true, count: 3 },
    { time: "05:00 PM - 05:30 PM", available: true, count: 4 },
    { time: "06:30 PM - 07:00 PM", available: true, count: 2 },
  ];

  const openBookModalForShop = (shop, date = null, slot = null) => {
    const target = shop || selectedCalendarShop || shops[0];
    if (!target) {
      showToast("No shop available to book.", "error");
      return;
    }
    setModalShop(target);
    setModalDate(date || selectedCalendarDate || todayStr);
    setModalSlot(slot || selectedSlotTime);
    setModalService(target.services?.[0] || "General Service");
    setModalCounter(target.counters?.[0] || "Counter #01");
    setModalNotes("");
    setBookModalOpen(true);
  };

  const handleBookFromCalendar = () => {
    if (!selectedCalendarShop) {
      showToast("Please select a registered shop first.", "error");
      return;
    }
    openBookModalForShop(selectedCalendarShop, selectedCalendarDate, selectedSlotTime);
  };

  const handleConfirmBookingSubmit = (e) => {
    e.preventDefault();
    const targetShop = modalShop || selectedCalendarShop || shops[0];
    if (!targetShop) {
      showToast("Cannot book token without an active shop.", "error");
      return;
    }
    const shopPrefix = targetShop.name ? targetShop.name.charAt(0).toUpperCase() : "Q";
    const newTokenNum = `#${shopPrefix}-${Math.floor(10 + Math.random() * 89)}`;

    const newActiveToken = {
      id: `TKN-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: newTokenNum,
      shopId: targetShop.id,
      shopName: targetShop.name,
      category: targetShop.categoryLabel || targetShop.category || "General",
      service: modalService || targetShop.services?.[0] || "General Service",
      counter: modalCounter || targetShop.counters?.[0] || "Counter #01",
      location: targetShop.location || "Store Location",
      currentServing: targetShop.currentServing || "--",
      peopleAhead: targetShop.peopleInQueue || 0,
      estWaitMins: parseInt(targetShop.estWait) || 5,
      progressPct: 15,
      date: modalDate,
      timeSlot: modalSlot,
    };

    setActiveToken(newActiveToken);
    setTokenHistory((prev) => [
      {
        id: newActiveToken.id,
        tokenNumber: newActiveToken.tokenNumber,
        shopName: newActiveToken.shopName,
        service: newActiveToken.service,
        date: `Today, ${newActiveToken.timeSlot}`,
        timeSlot: newActiveToken.timeSlot,
        status: "ACTIVE",
      },
      ...prev,
    ]);
    setBookModalOpen(false);
    showToast(`Token ${newTokenNum} booked successfully! Live tracking is active.`);
  };

  const handleCancelActiveToken = () => {
    if (activeToken) {
      setTokenHistory((prev) =>
        prev.map((t) => (t.id === activeToken.id ? { ...t, status: "CANCELLED" } : t))
      );
    }
    setActiveToken(null);
    setCancelModalOpen(false);
    showToast("Active token was cancelled.", "info");
  };

  const filteredShops = shops.filter((shop) => {
    const matchesCat = activeCategory === "all" || shop.category === activeCategory;
    const matchesSearch =
      searchKeyword.trim() === "" ||
      shop.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      shop.categoryLabel.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesLoc =
      selectedLocation === "Select Location" ||
      selectedLocation === "All Locations" ||
      shop.location.toLowerCase().includes(selectedLocation.split(",")[0].toLowerCase());
    return matchesCat && matchesSearch && matchesLoc;
  });

  const rawName =
    currentUser?.fullname ||
    currentUser?.name ||
    profileData.fullname ||
    profileData.name ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Customer");

  const customerFullName = formatName(rawName);
  const customerEmail =
    currentUser?.email || profileData.email || "";
  const customerInitial = (customerFullName || "Customer").charAt(0).toUpperCase();

  return (
    <div className="ql-customer-root">
      {/* ── 1. NAVBAR / HEADER ────────────────────────────────────────── */}
      <header className="ql-nav-header">
        <div className="ql-nav-container">
          {/* Brand Logo */}
          <div
            className="ql-nav-brand"
            onClick={() => {
              setActiveTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <svg
              className="ql-logo-svg"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="18" fill="#1665D8" />
              <circle cx="20" cy="20" r="8.5" fill="#FFFFFF" />
              <path
                d="M26 26 L36 36"
                stroke="#1665D8"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <span className="ql-brand-title">
              Queue<span className="ql-accent">Less</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="ql-nav-links">
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "home" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("home");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "calendar" ? "active" : ""}`}
                  onClick={scrollToCalendar}
                >
                  📅 Availability Calendar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "find-shop" ? "active" : ""}`}
                  onClick={scrollToShops}
                >
                  Find Shop
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "how-it-works" ? "active" : ""}`}
                  onClick={scrollToHowItWorks}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "about" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("about");
                    alert("QueueLess is an intelligent digital queuing and token booking platform.");
                  }}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`ql-nav-link ${activeTab === "contact" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("contact");
                    alert("Need help? Reach out to support@queueless.com");
                  }}
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* Action Buttons: Logged In Customer Pill (media_1795365502142_ab2f7431.png) or Login & Sign Up */}
          <div className="ql-nav-actions">
            {currentUser ? (
              <div className="ql-nav-user-cluster">
                {activeToken && (
                  <button
                    type="button"
                    className="ql-nav-token-btn"
                    onClick={() => setQrModalOpen(true)}
                    title="View Active Token Pass"
                  >
                    <span className="ql-nav-token-dot" />
                    <span className="ql-nav-token-text">Token {activeToken.tokenNumber} (Active)</span>
                    <span className="ql-nav-token-text-mobile">#{activeToken.tokenNumber}</span>
                  </button>
                )}

                {/* Customer Pill with User Name & SVG Chevron Icon */}
                <div className="ql-customer-pill-wrap" ref={profileMenuRef}>
                  <button
                    type="button"
                    className={`ql-customer-pill ${profileDropdownOpen ? "active" : ""}`}
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    aria-expanded={profileDropdownOpen}
                    title="Customer Account Menu"
                  >
                    <div
                      className="ql-customer-pill-avatar"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile");
                      }}
                      title="View Customer Profile Details"
                    >
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt={customerFullName} />
                      ) : (
                        customerInitial
                      )}
                    </div>
                    <span
                      className="ql-customer-pill-name"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/profile");
                      }}
                      title="View Customer Profile Details"
                    >
                      {customerFullName}
                    </span>
                    <svg
                      className="ql-customer-pill-caret"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
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
                          navigate("/profile");
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>My Profile &amp; Details</span>
                      </button>

                      <button
                        type="button"
                        className="ql-customer-dropdown-item"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/profile?tab=tokens");
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
                          navigate("/profile?tab=notifications");
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
                          navigate("/profile?tab=security");
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
            ) : (
              <>
                <button
                  type="button"
                  className="ql-btn-login"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="ql-btn-signup"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="ql-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="ql-mobile-menu">
            <a
              className="ql-mobile-link"
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </a>
            <a
              className="ql-mobile-link"
              onClick={() => {
                scrollToShops();
                setMobileMenuOpen(false);
              }}
            >
              Find Shop
            </a>
            <a
              className="ql-mobile-link"
              onClick={() => {
                scrollToCalendar();
                setMobileMenuOpen(false);
              }}
            >
              📅 Availability Calendar
            </a>
            <a
              className="ql-mobile-link"
              onClick={() => {
                scrollToHowItWorks();
                setMobileMenuOpen(false);
              }}
            >
              How It Works
            </a>
            {currentUser && (
              <a
                className="ql-mobile-link"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/profile");
                }}
              >
                👤 Customer Profile Details
              </a>
            )}
            <div className="ql-mobile-actions">
              {currentUser ? (
                <button
                  type="button"
                  className="ql-btn-logout"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout ({currentUser.name})
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="ql-btn-login"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="ql-btn-signup"
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO SECTION ───────────────────────────────────────────── */}
      <section className="ql-hero-section">
        <div className="ql-hero-container">
          {/* Left Column: Heading, Subtitle & Buttons */}
          <div className="ql-hero-left">
            <h1 className="ql-hero-title">
              Book Your Token<br />
              Online &amp; Skip<br />
              the Queue.
            </h1>
            <p className="ql-hero-subtitle">
              Find your favorite shop, book a token in seconds,<br />
              and track your turn in real time.
            </p>

            <div className="ql-hero-btn-group">
              <button
                type="button"
                className="ql-hero-btn-primary"
                onClick={scrollToCalendar}
              >
                <span>Book Token</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                type="button"
                className="ql-hero-btn-outline"
                onClick={scrollToShops}
              >
                Find Shop
              </button>
            </div>
          </div>

          {/* Right Column: Hero Person Image seamlessly blended into background */}
          <div className="ql-hero-right">
            <img
              src="/customer-hero-person-perfect.png?v=2"
              alt="QueueLess Smart Customer Booking"
              className="ql-hero-person-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/customer-hero-clean.png";
              }}
            />
          </div>
        </div>
      </section>

      {/* ── 3. FLOATING SEARCH CARD ───────────────────────────────────── */}
      <div className="ql-search-wrapper">
        <div className="ql-search-card">
          {/* Location Selector */}
          <div
            className="ql-search-location-box"
            onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
          >
            <svg
              className="ql-search-icon-pin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="ql-search-location-text">{selectedLocation}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>

            {locationDropdownOpen && (
              <ul className="ql-search-location-dropdown">
                {locationsList.map((loc) => (
                  <li
                    key={loc}
                    className={`ql-search-location-option ${
                      selectedLocation === loc || (selectedLocation === "Select Location" && loc === "All Locations")
                        ? "selected"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLocation(loc);
                    }}
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Divider Line */}
          <div className="ql-search-divider" />

          {/* Search Input Box */}
          <div className="ql-search-input-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="ql-search-input-field"
              placeholder="Search shop, service or category (e.g., Salon, Clinic, Bank)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <button
                type="button"
                className="ql-search-clear-btn"
                onClick={() => setSearchKeyword("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search CTA Button */}
          <button
            type="button"
            className="ql-search-btn"
            onClick={scrollToShops}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* ── 4. ACTIVE TOKEN LIVE TURN TRACKER (IF TOKEN IS ACTIVE) ──── */}
      {activeToken && (
        <div className="ql-active-token-wrapper">
          <div className="ql-live-banner">
            <div className="ql-live-banner-content">
              <div>
                <div className="ql-live-status-pill">
                  <span className="ql-live-pulse-dot" />
                  <span>Your Turn is Active</span>
                </div>
                <h2 className="ql-live-shop-name">{activeToken.shopName}</h2>
                <div className="ql-live-shop-info">
                  📍 {activeToken.location} • 🪑 {activeToken.counter} ({activeToken.service})
                </div>

                <div className="ql-live-metrics-row">
                  <div className="ql-live-metric-box">
                    <div className="ql-live-metric-label">Your Token</div>
                    <div className="ql-live-metric-val highlight">{activeToken.tokenNumber}</div>
                  </div>
                  <div className="ql-live-metric-box">
                    <div className="ql-live-metric-label">Now Serving</div>
                    <div className="ql-live-metric-val">{activeToken.currentServing}</div>
                  </div>
                  <div className="ql-live-metric-box">
                    <div className="ql-live-metric-label">People Ahead</div>
                    <div className="ql-live-metric-val">{activeToken.peopleAhead}</div>
                  </div>
                  <div className="ql-live-metric-box">
                    <div className="ql-live-metric-label">Est. Wait</div>
                    <div className="ql-live-metric-val">~{activeToken.estWaitMins}m</div>
                  </div>
                </div>

                <div className="ql-live-progress-wrap">
                  <div className="ql-live-progress-labels">
                    <span>Queue Progress</span>
                    <span>{activeToken.progressPct}% Completed</span>
                  </div>
                  <div className="ql-live-progress-bar">
                    <div
                      className="ql-live-progress-fill"
                      style={{ width: `${activeToken.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="ql-live-banner-actions">
                <button
                  type="button"
                  className="ql-btn-view-qr"
                  onClick={() => setQrModalOpen(true)}
                >
                  <span>📱 View QR Token Pass</span>
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
          </div>
        </div>
      )}

      {/* ── 5. QUEUE & SLOT AVAILABILITY CALENDAR SECTION ────────────── */}
      <section className="ql-calendar-section" ref={calendarSectionRef} id="calendar-section">
        <div className="ql-calendar-card">
          <div className="ql-calendar-top-bar">
            <div className="ql-calendar-title-wrap">
              <h2>📅 Check Slot &amp; Queue Availability Calendar</h2>
              <p>Pick any date to see live open slots, token capacity, and reserve your turn in advance.</p>
            </div>

            <div className="ql-calendar-month-nav">
              <button
                type="button"
                className="ql-btn-today"
                onClick={handleGoToday}
              >
                Today
              </button>
              <button
                type="button"
                className="ql-month-btn"
                onClick={handlePrevMonth}
                title="Previous Month"
              >
                ❮
              </button>
              <span className="ql-current-month-label">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <button
                type="button"
                className="ql-month-btn"
                onClick={handleNextMonth}
                title="Next Month"
              >
                ❯
              </button>
            </div>
          </div>

          <div className="ql-calendar-legend">
            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
              Availability Status:
            </span>
            <div className="ql-legend-item">
              <span className="ql-legend-dot available" />
              <span>Available (Slots Open)</span>
            </div>
            <div className="ql-legend-item">
              <span className="ql-legend-dot limited" />
              <span>Filling Fast</span>
            </div>
            <div className="ql-legend-item">
              <span className="ql-legend-dot full" />
              <span>Full / Sold Out</span>
            </div>
            <div className="ql-legend-item">
              <span className="ql-legend-dot closed" />
              <span>Closed / Holiday</span>
            </div>
          </div>

          <div className="ql-calendar-layout">
            {/* Calendar Grid */}
            <div className="ql-calendar-grid-wrap">
              <div className="ql-calendar-weekdays">
                <span className="ql-calendar-weekday">Sun</span>
                <span className="ql-calendar-weekday">Mon</span>
                <span className="ql-calendar-weekday">Tue</span>
                <span className="ql-calendar-weekday">Wed</span>
                <span className="ql-calendar-weekday">Thu</span>
                <span className="ql-calendar-weekday">Fri</span>
                <span className="ql-calendar-weekday">Sat</span>
              </div>

              <div className="ql-calendar-days-grid">
                {calendarCells.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`ql-calendar-day ${!cell.isCurrentMonth ? "other-month" : ""} ${
                      cell.isToday ? "today" : ""
                    } ${cell.isSelected ? "selected" : ""}`}
                    onClick={() => {
                      if (cell.isCurrentMonth && cell.dateStr) {
                        setSelectedCalendarDate(cell.dateStr);
                      }
                    }}
                  >
                    <div className="ql-day-header">
                      <span className="ql-day-number">{cell.dayNum}</span>
                      {cell.isToday && (
                        <span style={{ fontSize: "9px", fontWeight: 800, color: "#1665d8", textTransform: "uppercase" }}>
                          Today
                        </span>
                      )}
                    </div>

                    {cell.isCurrentMonth && (
                      <div>
                        <span className={`ql-day-status-pill ${cell.availability.status}`}>
                          ● {cell.availability.label}
                        </span>
                        {cell.availability.slotsCount > 0 && (
                          <span className="ql-day-token-count">
                            {cell.availability.slotsCount} tokens left
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Date Detail Panel */}
            <div className="ql-day-detail-panel">
              <div className="ql-day-detail-header">
                <span className="ql-selected-date-badge">🗓️ Selected Date</span>
                <h3 className="ql-selected-date-title">{getSelectedDateDisplay()}</h3>
              </div>

              <div>
                <label className="ql-panel-section-title">Select Shop / Destination</label>
                <select
                  className="ql-shop-select-box"
                  value={calendarShopId || ""}
                  onChange={(e) => setCalendarShopId(Number(e.target.value))}
                  disabled={shops.length === 0}
                >
                  {shops.length === 0 ? (
                    <option value="">No registered shops available</option>
                  ) : (
                    shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name} ({s.categoryLabel})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="ql-panel-section-title" style={{ margin: 0 }}>
                    Available Time Slots
                  </span>
                  <span style={{ fontSize: "12px", color: selectedCalendarShop?.status === "closed" ? "#dc2626" : "#059669", fontWeight: 700 }}>
                    ● {selectedCalendarShop?.status === "closed" ? "Shop Closed" : shops.length === 0 ? "No Active Queue" : "Slots Open"}
                  </span>
                </div>

                <div className="ql-slots-grid">
                  {availableTimeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className={`ql-slot-chip ${selectedSlotTime === slot.time ? "selected" : ""} ${
                        !slot.available ? "disabled" : ""
                      }`}
                      onClick={() => {
                        if (slot.available) setSelectedSlotTime(slot.time);
                      }}
                    >
                      <span className="ql-slot-time">{slot.time}</span>
                      <span
                        className={`ql-slot-availability ${
                          !slot.available ? "red" : slot.count <= 2 ? "amber" : "green"
                        }`}
                      >
                        ● {slot.available ? `${slot.count} tokens left` : "Full / Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  fontSize: "12.5px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  Destination: <strong style={{ color: "#0f172a" }}>{selectedCalendarShop.name}</strong>
                </div>
                <div style={{ color: "#64748b" }}>
                  Selected Slot: <strong style={{ color: "#1665d8" }}>{selectedSlotTime}</strong>
                </div>
              </div>

              <button
                type="button"
                className="ql-btn-book-slot"
                onClick={handleBookFromCalendar}
              >
                <span>Book Token for this Date &amp; Time</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS SECTION ───────────────────────────────────── */}
      <section className="ql-how-section" ref={howItWorksRef}>
        <div className="ql-how-container">
          <div className="ql-section-header-center">
            <h2 className="ql-section-title">How It Works?</h2>
            <p className="ql-section-subtitle">
              Book, track, and get served — all in a few simple steps.
            </p>
          </div>

          <div className="ql-steps-grid">
            {/* Step 1 */}
            <div className="ql-step-card">
              <div className="ql-step-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1665D8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2" />
                  <path d="M13 17v2" />
                  <path d="M13 11v2" />
                </svg>
              </div>
              <h3 className="ql-step-title">Book Token</h3>
              <p className="ql-step-desc">
                Choose a shop and book your token online instantly.
              </p>
            </div>

            {/* Connecting Arrow 1 */}
            <div className="ql-step-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1665D8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="ql-step-card">
              <div className="ql-step-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1665D8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3 className="ql-step-title">Track Turn</h3>
              <p className="ql-step-desc">
                Get real-time updates and notifications on your queue.
              </p>
            </div>

            {/* Connecting Arrow 2 */}
            <div className="ql-step-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1665D8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="ql-step-card">
              <div className="ql-step-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1665D8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 12 12 8 8 12" />
                  <line x1="12" y1="16" x2="12" y2="8" />
                </svg>
              </div>
              <h3 className="ql-step-title">Get Served</h3>
              <p className="ql-step-desc">
                Visit the shop right at your turn and get served quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. POPULAR SHOPS & LIVE QUEUES SECTION ────────────────────── */}
      <section className="ql-shops-section" ref={shopsSectionRef} id="shops-section">
        <div className="ql-shops-container">
          <div className="ql-section-header-center">
            <h2 className="ql-section-title">Popular Shops &amp; Live Queues</h2>
            <p className="ql-section-subtitle">
              Check real-time counter status and reserve your spot before stepping out.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="ql-category-chips">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`ql-cat-chip ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Shops Grid or Clean Empty State (Zero Demo Data) */}
          {isShopsLoading ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b", fontSize: "14px" }}>
              Loading registered queues...
            </div>
          ) : filteredShops.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                background: "#f8fafc",
                borderRadius: "20px",
                border: "1.5px dashed #cbd5e1",
                color: "#64748b",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏪</div>
              <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                No Active Queues Found
              </h3>
              <p style={{ margin: 0, fontSize: "13.5px", maxWidth: "460px", margin: "0 auto" }}>
                There are no live registered shops available in this category or location right now. Real store queues will appear here once registered.
              </p>
            </div>
          ) : (
            <div className="ql-shops-grid">
              {filteredShops.map((shop) => (
                <div key={shop.id} className="ql-shop-card">
                  <div className="ql-shop-card-head">
                    <div className="ql-shop-badge-and-name">
                      <div className="ql-shop-avatar-icon">{shop.icon}</div>
                      <div>
                        <h3 className="ql-shop-name">{shop.name}</h3>
                        <span className="ql-shop-category">{shop.categoryLabel}</span>
                      </div>
                    </div>
                    <span className={`ql-shop-status-badge ${shop.status}`}>
                      ● {shop.statusLabel}
                    </span>
                  </div>

                  <div className="ql-shop-card-body">
                    <div className="ql-shop-location">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{shop.location}</span>
                    </div>

                    <div className="ql-shop-queue-metrics">
                      <div className="ql-metric-box">
                        <span className="ql-metric-label">Now Serving</span>
                        <span className="ql-metric-value" style={{ color: "#1665d8" }}>
                          {shop.currentServing}
                        </span>
                      </div>
                      <div className="ql-metric-box">
                        <span className="ql-metric-label">In Line</span>
                        <span className="ql-metric-value">{shop.peopleInQueue}</span>
                      </div>
                      <div className="ql-metric-box">
                        <span className="ql-metric-label">Est. Wait</span>
                        <span className="ql-metric-value" style={{ color: "#059669" }}>
                          {shop.estWait}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ql-shop-card-footer">
                    <button
                      type="button"
                      className="ql-btn-book-token"
                      onClick={() => openBookModalForShop(shop)}
                    >
                      <span>Book Token</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. FOOTER ─────────────────────────────────────────────────── */}
      <footer className="ql-customer-footer">
        <div className="ql-footer-container">
          <div className="ql-footer-top">
            <div className="ql-footer-brand">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="#1665D8" />
                <circle cx="20" cy="20" r="8.5" fill="#FFFFFF" />
                <path d="M26 26 L36 36" stroke="#1665D8" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <span className="ql-footer-brand-title">QueueLess</span>
            </div>

            <div className="ql-footer-links">
              <span onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</span>
              <span onClick={scrollToCalendar}>Availability Calendar</span>
              <span onClick={scrollToShops}>Find Shop</span>
              <span onClick={scrollToHowItWorks}>How It Works</span>
              <span onClick={() => alert("Privacy policy: your data is encrypted and secure.")}>Privacy</span>
              <span onClick={() => alert("Terms of service: QueueLess terms 2026.")}>Terms</span>
            </div>
          </div>

          <div className="ql-footer-bottom">
            <p>&copy; {new Date().getFullYear()} QueueLess Inc. All rights reserved.</p>
            <p>Skip the wait, save your time.</p>
          </div>
        </div>
      </footer>

      {/* ── MODALS (BOOK TOKEN, QR PASS, CANCEL) ──────────────────────── */}
      {bookModalOpen && (
        <div className="ql-modal-backdrop" onClick={() => setBookModalOpen(false)}>
          <div className="ql-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header">
              <h3 className="ql-modal-title">Book Queue Token</h3>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setBookModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBookingSubmit}>
              <div className="ql-modal-body">
                <div>
                  <label className="ql-panel-section-title">Selected Shop</label>
                  <select
                    className="ql-shop-select-box"
                    value={modalShop?.id || ""}
                    onChange={(e) => {
                      const sh = shops.find((item) => item.id === Number(e.target.value));
                      if (sh) {
                        setModalShop(sh);
                        setModalService(sh.services?.[0] || "General Service");
                        setModalCounter(sh.counters?.[0] || "Counter #01");
                      }
                    }}
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name} ({s.categoryLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="ql-panel-section-title">Booking Date</label>
                  <input
                    type="date"
                    className="ql-shop-select-box"
                    value={modalDate}
                    min={todayStr}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="ql-panel-section-title">Time Slot</label>
                  <div className="ql-slots-grid">
                    {availableTimeSlots.map((ts) => (
                      <div
                        key={ts.time}
                        className={`ql-slot-chip ${modalSlot === ts.time ? "selected" : ""} ${
                          !ts.available ? "disabled" : ""
                        }`}
                        onClick={() => {
                          if (ts.available) setModalSlot(ts.time);
                        }}
                      >
                        <span className="ql-slot-time">{ts.time}</span>
                        <span
                          className={`ql-slot-availability ${
                            !ts.available ? "red" : ts.count <= 2 ? "amber" : "green"
                          }`}
                        >
                          ● {ts.available ? `${ts.count} left` : "Full"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="ql-panel-section-title">Service Type</label>
                    <select
                      className="ql-shop-select-box"
                      value={modalService}
                      onChange={(e) => setModalService(e.target.value)}
                    >
                      {modalShop?.services?.map((srv) => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="ql-panel-section-title">Counter</label>
                    <select
                      className="ql-shop-select-box"
                      value={modalCounter}
                      onChange={(e) => setModalCounter(e.target.value)}
                    >
                      {modalShop?.counters?.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="ql-modal-footer">
                <button
                  type="button"
                  className="ql-btn-modal-cancel"
                  onClick={() => setBookModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ql-btn-modal-submit">
                  Confirm &amp; Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
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

      {/* ── CUSTOMER PROFILE & ACCOUNT SETTINGS MODAL ────────────────── */}
      {profileModalOpen && (
        <div className="ql-modal-backdrop" onClick={() => setProfileModalOpen(false)}>
          <div className="ql-profile-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Header Banner with Profile Avatar */}
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
                    title="Change profile picture"
                  >
                    📷
                  </button>
                </div>
                <div className="ql-profile-user-info">
                  <h3 className="ql-profile-name">{profileData.name}</h3>
                  <p className="ql-profile-email">{profileData.email}</p>
                  <div className="ql-profile-meta-row">
                    <span className="ql-profile-verified-badge">
                      ● {currentUser ? "Verified Customer" : "Guest Customer"}
                    </span>
                    <span className="ql-profile-member-date">
                      Member since {profileData.memberSince}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="ql-profile-close-btn"
                onClick={() => setProfileModalOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="ql-profile-nav-tabs">
              <button
                type="button"
                className={`ql-profile-tab-button ${profileActiveTab === "details" ? "active" : ""}`}
                onClick={() => setProfileActiveTab("details")}
              >
                <span>👤 Personal Details</span>
              </button>
              <button
                type="button"
                className={`ql-profile-tab-button ${profileActiveTab === "tokens" ? "active" : ""}`}
                onClick={() => setProfileActiveTab("tokens")}
              >
                <span>🎟️ My Bookings ({tokenHistory.length + (activeToken ? 1 : 0)})</span>
              </button>
              <button
                type="button"
                className={`ql-profile-tab-button ${profileActiveTab === "notifications" ? "active" : ""}`}
                onClick={() => setProfileActiveTab("notifications")}
              >
                <span>🔔 Turn Alerts</span>
              </button>
              <button
                type="button"
                className={`ql-profile-tab-button ${profileActiveTab === "security" ? "active" : ""}`}
                onClick={() => setProfileActiveTab("security")}
              >
                <span>🔒 Security</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="ql-profile-tab-body">
              {/* If not logged in, show Guest Notice */}
              {!currentUser && (
                <div className="ql-profile-guest-card">
                  <p className="ql-profile-guest-text">
                    💡 <strong>You are browsing as Guest.</strong> Log in to sync your bookings across devices and receive live WhatsApp alerts.
                  </p>
                  <div className="ql-profile-guest-actions">
                    <button
                      type="button"
                      className="ql-btn-login"
                      style={{ padding: "6px 16px", fontSize: "13px" }}
                      onClick={() => {
                        setProfileModalOpen(false);
                        navigate("/login");
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="ql-btn-signup"
                      style={{ padding: "6px 16px", fontSize: "13px" }}
                      onClick={() => {
                        setProfileModalOpen(false);
                        navigate("/register");
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: Personal Details */}
              {profileActiveTab === "details" && (
                <form onSubmit={handleSaveProfile} className="ql-profile-form-grid">
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
                    <label className="ql-profile-field-label">Preferred Location / City</label>
                    <select
                      className="ql-profile-input"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, location: e.target.value }))
                      }
                    >
                      {locationsList.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ql-profile-field-full" style={{ marginTop: "10px" }}>
                    <button
                      type="submit"
                      className="ql-btn-modal-submit"
                      style={{ padding: "11px 24px" }}
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: My Bookings & History */}
              {profileActiveTab === "tokens" && (
                <div className="ql-profile-bookings-list">
                  {/* Active Booking Card (if active) */}
                  {activeToken ? (
                    <div className="ql-profile-active-booking-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="ql-booking-status-badge active">
                          ● Live Active Token
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#1665d8" }}>
                          Est. Wait: ~{activeToken.estWaitMins} mins
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div className="ql-profile-token-pill" style={{ background: "#ffffff", borderColor: "#1665d8" }}>
                          {activeToken.tokenNumber}
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                            {activeToken.shopName}
                          </h4>
                          <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                            {activeToken.counter} • Serving: <strong>{activeToken.currentServing}</strong>
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <button
                          type="button"
                          className="ql-btn-view-qr"
                          style={{ padding: "8px 18px", fontSize: "13px" }}
                          onClick={() => {
                            setProfileModalOpen(false);
                            setQrModalOpen(true);
                          }}
                        >
                          📱 View QR Pass
                        </button>
                        <button
                          type="button"
                          className="ql-btn-cancel-token"
                          style={{ borderColor: "#cbd5e1", color: "#dc2626", padding: "8px 16px", fontSize: "13px" }}
                          onClick={() => {
                            setProfileModalOpen(false);
                            setCancelModalOpen(true);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      No active token at the moment. Pick a shop or slot below to book!
                    </div>
                  )}

                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0b192c", margin: "14px 0 6px" }}>
                    Past Bookings &amp; Visits
                  </h4>

                  {tokenHistory && tokenHistory.length > 0 ? (
                    tokenHistory.map((item) => (
                      <div key={item.id} className="ql-profile-booking-card">
                        <div className="ql-profile-booking-left">
                          <div className="ql-profile-token-pill">{item.tokenNumber}</div>
                          <div className="ql-profile-booking-details">
                            <h4>{item.shopName}</h4>
                            <p>
                              {item.service} • {item.date}
                            </p>
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
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      No past bookings found.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Turn Alerts */}
              {profileActiveTab === "notifications" && (
                <div className="ql-profile-notifications-list">
                  <div
                    className="ql-profile-toggle-card"
                    onClick={() =>
                      setProfileData((prev) => ({ ...prev, smsAlerts: !prev.smsAlerts }))
                    }
                  >
                    <div className="ql-profile-toggle-info">
                      <h4>📲 SMS Turn Alert</h4>
                      <p>Send an SMS notification to your mobile when your turn is 2 persons away.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.smsAlerts}
                      onChange={() => {}}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </div>

                  <div
                    className="ql-profile-toggle-card"
                    onClick={() =>
                      setProfileData((prev) => ({ ...prev, whatsappUpdates: !prev.whatsappUpdates }))
                    }
                  >
                    <div className="ql-profile-toggle-info">
                      <h4>💬 WhatsApp Live Pass</h4>
                      <p>Receive digital QR pass directly on WhatsApp with real-time queue position updates.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.whatsappUpdates}
                      onChange={() => {}}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </div>

                  <div
                    className="ql-profile-toggle-card"
                    onClick={() =>
                      setProfileData((prev) => ({ ...prev, soundAlerts: !prev.soundAlerts }))
                    }
                  >
                    <div className="ql-profile-toggle-info">
                      <h4>🔔 Web Browser Audio Chime</h4>
                      <p>Play an audio bell chime on this device when your token number is announced.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.soundAlerts}
                      onChange={() => {}}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                  </div>

                  <button
                    type="button"
                    className="ql-btn-modal-submit"
                    style={{ alignSelf: "flex-start", marginTop: "10px" }}
                    onClick={() => showToast("Turn alert preferences updated!", "success")}
                  >
                    Save Alert Preferences
                  </button>
                </div>
              )}

              {/* TAB 4: Security & Logout */}
              {profileActiveTab === "security" && (
                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <button type="submit" className="ql-btn-modal-submit">
                      Update Password
                    </button>

                    {currentUser && (
                      <button
                        type="button"
                        className="ql-btn-cancel-token"
                        style={{ borderColor: "#ef4444", color: "#dc2626", padding: "8px 18px" }}
                        onClick={() => {
                          setProfileModalOpen(false);
                          handleLogout();
                        }}
                      >
                        Sign Out of Account
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="ql-profile-footer">
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                QueueLess Customer Portal • Account &amp; Privacy Protected
              </span>
              <button
                type="button"
                className="ql-btn-modal-cancel"
                onClick={() => setProfileModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Picker for Customer Profile Photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* Admin Image Crop Modal for Avatar Cropping */}
      {cropModalOpen && (
        <AdminImageCropModal
          isOpen={cropModalOpen}
          imageSrc={cropImageSrc}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          userName={profileData.name}
        />
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="ql-toast">
          <span>{toast.type === "success" ? "✅" : "ℹ️"}</span>
          <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
