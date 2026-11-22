import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const CustomerContext = createContext(null);

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return ctx;
};

export function CustomerProvider({ children }) {
  const navigate = useNavigate();

  // ── 1. Theme State (Light / Dark) ──────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ql_customer_theme") || "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("ql_customer_theme", nextTheme);
  };

  // ── 2. Sidebar Mobile Drawer State ────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── 3. Customer Profile ───────────────────────────────────────────
  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          id: parsed.id || parsed.user_id || 101,
          name: parsed.name || parsed.username || "Customer User",
          email: parsed.email || "customer@queueless.com",
          phone: parsed.phone || "+91 98301 23456",
          avatarImg: parsed.avatar || parsed.avatarImg || null,
          role: "Verified Customer",
          memberSince: "Nov 2026",
        };
      }
    } catch {}
    return {
      id: 101,
      name: "Sujit Kumar",
      email: "sujit@gmail.com",
      phone: "+91 98301 23456",
      avatarImg: null,
      role: "Verified Customer",
      memberSince: "Nov 2026",
    };
  });

  const updateProfile = (updatedFields) => {
    setCustomerProfile((prev) => {
      const next = { ...prev, ...updatedFields };
      try {
        const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (stored) {
          const userObj = JSON.parse(stored);
          const merged = { ...userObj, ...updatedFields };
          localStorage.setItem("user", JSON.stringify(merged));
        }
      } catch {}
      return next;
    });
    showToast("Profile details updated successfully!", "success");
  };

  // ── 4. Shops Data ─────────────────────────────────────────────────
  const [shops] = useState([
    {
      id: 1,
      name: "Apex Healthcare Clinic",
      category: "health",
      categoryLabel: "Healthcare",
      location: "Park Circus, Kolkata",
      currentServing: "#A-21",
      currentToken: "#A-24",
      estWait: "9 mins",
      peopleInQueue: 4,
      status: "open",
      statusLabel: "Queue Active",
      icon: "🏥",
      rating: "4.8",
      counters: ["Counter #01 - Registration", "Counter #02 - Doctor Chamber", "Counter #03 - Pharmacy"],
      services: ["General Physician Consultation", "Routine Health Checkup", "Pediatric Care"],
    },
    {
      id: 2,
      name: "Urban Scissor Studio",
      category: "salon",
      categoryLabel: "Salon & Spa",
      location: "Salt Lake Sector V, Kolkata",
      currentServing: "#S-10",
      currentToken: "#S-14",
      estWait: "14 mins",
      peopleInQueue: 3,
      status: "open",
      statusLabel: "Fast Moving",
      icon: "✂️",
      rating: "4.9",
      counters: ["Stylist Station 1", "Stylist Station 2", "Spa Suite"],
      services: ["Haircut & Styling", "Beard Trim & Grooming", "Head Massage & Spa"],
    },
    {
      id: 3,
      name: "Brew & Bite Artisan Café",
      category: "dining",
      categoryLabel: "Café & Dining",
      location: "Ballygunge, Kolkata",
      currentServing: "#B-07",
      currentToken: "#B-09",
      estWait: "4 mins",
      peopleInQueue: 2,
      status: "open",
      statusLabel: "Tables Available",
      icon: "☕",
      rating: "4.7",
      counters: ["Order Counter A", "Pickup Window B"],
      services: ["Table Booking / Dine-In", "Takeaway Express Counter"],
    },
    {
      id: 4,
      name: "Metro Retail Mart",
      category: "retail",
      categoryLabel: "Supermarket",
      location: "New Town, Kolkata",
      currentServing: "#M-42",
      currentToken: "#M-45",
      estWait: "5 mins",
      peopleInQueue: 3,
      status: "open",
      statusLabel: "Express Billing",
      icon: "🛒",
      rating: "4.6",
      counters: ["Express Billing Counter #01", "Counter #02", "Self-Checkout"],
      services: ["Express Grocery Checkout (Up to 10 items)", "Standard Supermarket Cart"],
    },
    {
      id: 5,
      name: "Prime Dental Care",
      category: "health",
      categoryLabel: "Dental Clinic",
      location: "Gariahat, Kolkata",
      currentServing: "#D-05",
      currentToken: "#D-08",
      estWait: "18 mins",
      peopleInQueue: 3,
      status: "open",
      statusLabel: "Doctor In",
      icon: "🦷",
      rating: "4.9",
      counters: ["Consultation Suite A", "Dental X-Ray Counter"],
      services: ["Dental Cleaning & Checkup", "Root Canal Consultation", "Teeth Whitening"],
    },
    {
      id: 6,
      name: "First National Trust Bank",
      category: "bank",
      categoryLabel: "Banking & Teller",
      location: "Dalhousie, Kolkata",
      currentServing: "#N-38",
      currentToken: "#N-42",
      estWait: "10 mins",
      peopleInQueue: 4,
      status: "open",
      statusLabel: "Counters Open",
      icon: "🏦",
      rating: "4.5",
      counters: ["Cash Deposit Counter #01", "Account Services #02", "Forex / KYC Desk"],
      services: ["Cash Deposit / Withdrawal", "Account Opening & KYC", "Loan Inquiry"],
    },
  ]);

  // ── 5. Active Live Token Tracker State ────────────────────────────
  const [activeToken, setActiveToken] = useState({
    id: "TKN-1024",
    tokenNumber: "#A-24",
    shopId: 1,
    shopName: "Apex Healthcare Clinic",
    category: "Healthcare",
    service: "General Physician Consultation",
    counter: "Counter #02 - Doctor Chamber",
    location: "Park Circus, Kolkata",
    currentServing: "#A-21",
    peopleAhead: 3,
    estWaitMins: 9,
    totalQueueLength: 12,
    progressPct: 75,
    status: "WAITING", // WAITING, SERVING, COMPLETED, CANCELLED
    bookedAt: "Today, 10:15 AM",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "10:30 AM - 11:00 AM",
    qrCode: "QL-TKN-1024-APEX",
  });

  // ── 6. Tokens History ─────────────────────────────────────────────
  const [tokensHistory, setTokensHistory] = useState([
    {
      id: "TKN-1024",
      tokenNumber: "#A-24",
      shopId: 1,
      shopName: "Apex Healthcare Clinic",
      category: "Healthcare",
      service: "General Physician Consultation",
      counter: "Counter #02",
      date: "Today, 10:15 AM",
      status: "WAITING",
      estWait: "9 mins",
    },
    {
      id: "TKN-0988",
      tokenNumber: "#S-12",
      shopId: 2,
      shopName: "Urban Scissor Studio",
      category: "Salon & Spa",
      service: "Haircut & Styling",
      counter: "Stylist Station 1",
      date: "Yesterday, 4:30 PM",
      status: "COMPLETED",
      estWait: "Served in 12 mins",
    },
    {
      id: "TKN-0892",
      tokenNumber: "#M-35",
      shopId: 4,
      shopName: "Metro Retail Mart",
      category: "Supermarket",
      service: "Express Grocery Checkout",
      counter: "Express Counter 1",
      date: "17 Nov 2026, 6:00 PM",
      status: "COMPLETED",
      estWait: "Served in 5 mins",
    },
    {
      id: "TKN-0810",
      tokenNumber: "#N-19",
      shopId: 6,
      shopName: "First National Trust Bank",
      category: "Banking",
      service: "Account KYC Update",
      counter: "KYC Desk",
      date: "12 Nov 2026, 11:20 AM",
      status: "CANCELLED",
      estWait: "User Cancelled",
    },
  ]);

  // ── 7. Favorite Shops ─────────────────────────────────────────────
  const [favoriteShopIds, setFavoriteShopIds] = useState([1, 2]);

  const toggleFavoriteShop = (shopId) => {
    setFavoriteShopIds((prev) => {
      if (prev.includes(shopId)) {
        showToast("Removed shop from favorites", "info");
        return prev.filter((id) => id !== shopId);
      } else {
        showToast("Added shop to favorites!", "success");
        return [...prev, shopId];
      }
    });
  };

  // ── 8. Notification Center ────────────────────────────────────────
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Queue Alert: Turn Approaching!",
      message: "You are only 3 persons away at Apex Healthcare Clinic. Please head toward Counter #02.",
      time: "2 mins ago",
      read: false,
      type: "alert",
    },
    {
      id: 2,
      title: "Token Booked Successfully",
      message: "Token #A-24 booked for General Physician Consultation.",
      time: "15 mins ago",
      read: true,
      type: "success",
    },
    {
      id: 3,
      title: "Urban Scissor Studio",
      message: "Your previous appointment on 18 Nov was completed.",
      time: "1 day ago",
      read: true,
      type: "info",
    },
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── 9. Toast Notification System ──────────────────────────────────
  const [toast, setToast] = useState({ message: "", type: "info", visible: false });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  // ── 10. Modals Management ─────────────────────────────────────────
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedShopForBooking, setSelectedShopForBooking] = useState(null);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTokenForQr, setSelectedTokenForQr] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const openBookModal = (shop = null, date = null) => {
    setSelectedShopForBooking(shop || shops[0]);
    setSelectedDateForBooking(date || new Date().toISOString().split("T")[0]);
    setBookModalOpen(true);
  };

  const openQrModal = (token = null) => {
    setSelectedTokenForQr(token || activeToken);
    setQrModalOpen(true);
  };

  const openCancelModal = () => {
    setCancelModalOpen(true);
  };

  // ── 11. Book Token Action ─────────────────────────────────────────
  const handleConfirmBooking = ({ shopId, service, counter, date, timeSlot, notes }) => {
    const targetShop = shops.find((s) => s.id === Number(shopId)) || shops[0];
    const newTokenNum = `#${targetShop.name.charAt(0).toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`;
    const newId = `TKN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newToken = {
      id: newId,
      tokenNumber: newTokenNum,
      shopId: targetShop.id,
      shopName: targetShop.name,
      category: targetShop.categoryLabel,
      service: service || targetShop.services[0],
      counter: counter || targetShop.counters[0],
      location: targetShop.location,
      currentServing: targetShop.currentServing,
      peopleAhead: targetShop.peopleInQueue,
      estWaitMins: parseInt(targetShop.estWait) || 10,
      totalQueueLength: targetShop.peopleInQueue + 1,
      progressPct: 15,
      status: "WAITING",
      bookedAt: "Just now",
      date: date || new Date().toISOString().split("T")[0],
      timeSlot: timeSlot || "11:00 AM - 11:30 AM",
      qrCode: `QL-${newId}-${targetShop.name.replace(/\s+/g, "").toUpperCase()}`,
      notes: notes || "",
    };

    setActiveToken(newToken);
    setTokensHistory((prev) => [
      {
        id: newToken.id,
        tokenNumber: newToken.tokenNumber,
        shopId: newToken.shopId,
        shopName: newToken.shopName,
        category: newToken.category,
        service: newToken.service,
        counter: newToken.counter,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        status: "WAITING",
        estWait: `${newToken.estWaitMins} mins`,
      },
      ...prev,
    ]);

    setBookModalOpen(false);
    showToast(`Token ${newToken.tokenNumber} booked successfully!`, "success");

    // Add alert notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: "New Token Booked!",
        message: `Token ${newToken.tokenNumber} for ${targetShop.name} is confirmed. Track your live turn now.`,
        time: "Just now",
        read: false,
        type: "success",
      },
      ...prev,
    ]);
  };

  // ── 12. Cancel Active Token Action ────────────────────────────────
  const handleCancelActiveToken = () => {
    if (!activeToken) return;
    const cancelledTokenNum = activeToken.tokenNumber;

    setTokensHistory((prev) =>
      prev.map((t) => (t.id === activeToken.id ? { ...t, status: "CANCELLED", estWait: "Cancelled" } : t))
    );

    setActiveToken(null);
    setCancelModalOpen(false);
    showToast(`Token ${cancelledTokenNum} cancelled.`, "info");
  };

  // ── 13. Logout Handler ────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ql_admin_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.clear();
    showToast("Signed out successfully.", "info");
    navigate("/login", { replace: true });
  };

  return (
    <CustomerContext.Provider
      value={{
        theme,
        toggleTheme,
        sidebarOpen,
        setSidebarOpen,
        customerProfile,
        updateProfile,
        shops,
        activeToken,
        tokensHistory,
        favoriteShopIds,
        toggleFavoriteShop,
        notifications,
        unreadNotificationsCount,
        markNotificationsAsRead,
        toast,
        showToast,
        bookModalOpen,
        setBookModalOpen,
        selectedShopForBooking,
        selectedDateForBooking,
        openBookModal,
        qrModalOpen,
        setQrModalOpen,
        selectedTokenForQr,
        openQrModal,
        cancelModalOpen,
        setCancelModalOpen,
        openCancelModal,
        handleConfirmBooking,
        handleCancelActiveToken,
        handleLogout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

