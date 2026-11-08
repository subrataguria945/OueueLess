import { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { AdminImageCropModal } from "./AdminImageCropModal";
import apiClient, { authFetch } from "./apiClient";

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
  { month: "Jan", val: 10, heightPct: 24 },
  { month: "Feb", val: 14, heightPct: 33 },
  { month: "Mar", val: 18, heightPct: 42 },
  { month: "Apr", val: 21, heightPct: 49 },
  { month: "May", val: 25, heightPct: 58 },
  { month: "Jun", val: 28, heightPct: 65 },
  { month: "Jul", val: 31, heightPct: 72 },
  { month: "Aug", val: 34, heightPct: 79 },
  { month: "Sep", val: 38, heightPct: 88 },
  { month: "Oct", val: 42, heightPct: 98 },
  { month: "Nov", val: 39, heightPct: 91 },
  { month: "Dec", val: 41, heightPct: 95 },
];

const OWNERS_API_URL =
  import.meta.env.VITE_OWNERS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/all`;

const ADD_OWNER_API_URL =
  import.meta.env.VITE_ADD_OWNER_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/add`;

const OWNER_STATUS_API_URL =
  import.meta.env.VITE_OWNER_STATUS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/status`;

const USER_UPDATE_API_URL =
  import.meta.env.VITE_USER_UPDATE_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/user/update`;

const ALL_USERS_API_URL =
  import.meta.env.VITE_ALL_USERS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/user/all`;

export function mapApiOwnerToDashboard(apiOwner) {
  const id = Number(apiOwner.owner_id ?? apiOwner.id ?? 0);
  const name = (apiOwner.full_name || apiOwner.name || "").trim() || "Owner";
  const initial = name ? name.charAt(0).toUpperCase() : "O";
  const avatarImg = apiOwner.profile_image || apiOwner.avatarImg || null;
  const email = apiOwner.email || "";
  const phone = apiOwner.phone || "N/A";
  const shops = Number(apiOwner.shop_count ?? apiOwner.shops ?? 0);
  const maxShops = Number(apiOwner.max_shop_count ?? 5);
  const isActive =
    apiOwner.account_status !== undefined
      ? Boolean(apiOwner.account_status)
      : apiOwner.status === "Active";
  const status = isActive ? "Active" : "Suspended";

  let joinedOn = "Recently";
  if (apiOwner.joined_date || apiOwner.joinedOn) {
    try {
      const d = new Date(apiOwner.joined_date || apiOwner.joinedOn);
      if (!isNaN(d.getTime())) {
        joinedOn = d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    } catch {}
  }

  // Parse shop_details if provided by backend
  let parsedShopDetails = [];
  if (apiOwner.shop_details) {
    try {
      if (
        typeof apiOwner.shop_details === "string" &&
        (apiOwner.shop_details.startsWith("[") || apiOwner.shop_details.startsWith("{"))
      ) {
        parsedShopDetails = JSON.parse(apiOwner.shop_details);
      } else if (Array.isArray(apiOwner.shop_details)) {
        parsedShopDetails = apiOwner.shop_details;
      }
    } catch {}
  }

  return {
    id,
    ownerCode: `OWN-${String(id).padStart(4, "0")}`,
    name,
    initial,
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    avatarImg,
    email,
    phone,
    shops,
    maxShops,
    status,
    joinedOn,
    plan: status === "Active" ? "Enterprise Pro" : "Starter Trial",
    city: "Kolkata, WB",
    kycStatus: "KYC Verified",
    billingCycle: "Annual (₹ 14,999/yr)",
    totalTokens: shops * 1420 + 350,
    monthlyRevenue: `₹ ${(shops * 4500 + 1200).toLocaleString()}`,
    lastActive: "Today",
    notes: "Verified platform merchant.",
    shopDetails: apiOwner.shop_details,
    parsedShopDetails,
  };
}

export function mapApiUserToDashboard(apiUser) {
  const id = Number(apiUser.user_id ?? apiUser.userid ?? apiUser.id ?? 0);
  const name = (apiUser.full_name || apiUser.fullname || apiUser.name || "").trim() || "User";
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  const avatarImg = apiUser.profile_image || apiUser.profileimage || apiUser.avatarImg || null;
  const email = apiUser.email || "";
  const phone = apiUser.phone || "N/A";
  const address = apiUser.address || "N/A";
  const role = apiUser.role || "User";
  const isActive =
    apiUser.account_status !== undefined
      ? Boolean(apiUser.account_status)
      : apiUser.status !== undefined
      ? (typeof apiUser.status === "boolean" ? apiUser.status : apiUser.status === "Active")
      : true;
  const status = isActive ? "Active" : "Suspended";

  let joinedOn = "Recently";
  if (apiUser.joined_date || apiUser.createdat || apiUser.joinedOn) {
    try {
      const d = new Date(apiUser.joined_date || apiUser.createdat || apiUser.joinedOn);
      if (!isNaN(d.getTime())) {
        joinedOn = d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    } catch {}
  }

  const token = `USR-${String(id).padStart(4, "0")}`;

  return {
    id,
    token,
    name,
    initial,
    avatarImg,
    email,
    phone,
    address,
    city: address,
    role,
    shop: role,
    counter: "General Desk",
    serviceType: apiUser.email_verified || apiUser.isemailverified ? "Verified Member" : "Registered User",
    position: 0,
    approxWait: status === "Active" ? "Active Now" : "Inactive",
    status,
    bookedAt: joinedOn,
    joinedOn,
    joinedVia: "QueueLess App / Web Portal",
    notes: `Registered as ${role} in QueueLess system.`,
    emailVerified: Boolean(apiUser.email_verified || apiUser.isemailverified),
    rawUser: apiUser,
  };
}

const ALL_SHOPS_DATA = [
  {
    id: "shop-1",
    name: "Coffee Hub",
    category: "Café & Dining",
    owner: "Ananya Das",
    phone: "+91 98765 43210",
    status: "Active",
    currentServing: "QL-042",
    waitingCount: 14,
    avgWaitTime: "8 mins",
    dailyTokens: 128,
    location: "Contai, Purba Medinipur, WB",
    timing: "9:00 AM – 10:00 PM",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80",
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
    location: "Salt Lake Sector V, Kolkata, WB",
    timing: "8:00 AM – 8:00 PM",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "shop-3",
    name: "Tasty Bites Restaurant",
    category: "Café & Dining",
    owner: "Rahul Sen",
    phone: "+91 98765 43211",
    status: "Active",
    currentServing: "TB-067",
    waitingCount: 22,
    avgWaitTime: "15 mins",
    dailyTokens: 96,
    location: "Park Street, Kolkata, WB",
    timing: "11:00 AM – 11:00 PM",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
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
    location: "New Town Action Area I, Kolkata, WB",
    timing: "6:00 AM – 10:00 PM",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
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
    location: "College Street, Kolkata, WB",
    timing: "10:00 AM – 9:00 PM",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80",
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
    location: "Chandni Chowk, Kolkata, WB",
    timing: "10:30 AM – 8:30 PM",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&auto=format&fit=crop&q=80",
  },
];

const getShopCategoryVisuals = (category) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("cafe") || cat.includes("dining") || cat.includes("coffee") || cat.includes("food") || cat.includes("restaurant")) {
    return {
      bg: "#fef3c7",
      color: "#92400e",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    };
  }
  if (cat.includes("health") || cat.includes("clinic") || cat.includes("doctor") || cat.includes("care")) {
    return {
      bg: "#e0f2fe",
      color: "#0369a1",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    };
  }
  if (cat.includes("fit") || cat.includes("gym") || cat.includes("spa")) {
    return {
      bg: "#dcfce7",
      color: "#15803d",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6.5 6.5 11 11" />
          <path d="m21 21-1-1" />
          <path d="m3 3 1 1" />
          <path d="m18 22 4-4" />
          <path d="m2 6 4-4" />
          <path d="m3 10 7-7" />
          <path d="m14 21 7-7" />
        </svg>
      ),
    };
  }
  if (cat.includes("retail") || cat.includes("book") || cat.includes("shop") || cat.includes("store")) {
    return {
      bg: "#fce7f3",
      color: "#be185d",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    };
  }
  return {
    bg: "#f1f5f9",
    color: "#475569",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  };
};

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter Tier",
    tagline: "Essential queue management for single standalone shops & clinics.",
    monthlyPrice: 999,
    annualPrice: 799,
    annualTotal: 9588,
    currency: "₹",
    subscribersCount: 45,
    popular: false,
    colorScheme: "blue",
    icon: "🚀",
    features: [
      { text: "1 Registered Shop Queue Location", included: true },
      { text: "Up to 150 Daily Queue Tokens", included: true },
      { text: "Live Public Display Screen URL", included: true },
      { text: "Automated SMS Token Alerts", included: true },
      { text: "Basic Daily Queue Analytics", included: true },
      { text: "Custom Shop Branding & Logo", included: false },
      { text: "WhatsApp Instant Alerts", included: false },
      { text: "Multi-Staff Counter Calling", included: false },
    ],
  },
  {
    id: "growth",
    name: "Pro Growth Plan",
    tagline: "High-volume queues with multi-counter staff & WhatsApp automation.",
    monthlyPrice: 2499,
    annualPrice: 1999,
    annualTotal: 23988,
    currency: "₹",
    subscribersCount: 68,
    popular: true,
    colorScheme: "purple",
    icon: "⚡",
    features: [
      { text: "Up to 5 Store / Branch Locations", included: true },
      { text: "Unlimited Daily Queue Tokens", included: true },
      { text: "Automated SMS & WhatsApp Alerts", included: true },
      { text: "QR Code Instant Visitor Check-in", included: true },
      { text: "Multi-Counter Calling Staff Seats (5)", included: true },
      { text: "Detailed Analytics & PDF/Excel Export", included: true },
      { text: "Priority 24/7 WhatsApp SLA Support", included: true },
      { text: "Dedicated Queue Kiosk Hardware Support", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Chain",
    tagline: "Custom infrastructure for hospital networks, franchises & shopping chains.",
    monthlyPrice: 4999,
    annualPrice: 3999,
    annualTotal: 47988,
    currency: "₹",
    subscribersCount: 15,
    popular: false,
    colorScheme: "emerald",
    icon: "👑",
    features: [
      { text: "Unlimited Shop Branches & Outlets", included: true },
      { text: "Custom White-Label Domain & Branding", included: true },
      { text: "Dedicated Kiosk Tablet App Support", included: true },
      { text: "Unlimited Staff Counter Accounts", included: true },
      { text: "Multi-Display Voice Audio Announcements", included: true },
      { text: "Custom Webhook & CRM Integration", included: true },
      { text: "Dedicated Account Manager & 99.9% SLA", included: true },
      { text: "Role-Based Security & Audit Logs", included: true },
    ],
  },
];

const DEFAULT_SUBSCRIBERS_DATA = [
  {
    id: "SUB-101",
    ownerName: "Ananya Das",
    shopName: "Coffee Hub & Apex Care",
    email: "ananya@example.com",
    phone: "+91 98765 43210",
    planId: "growth",
    planName: "Pro Growth Plan",
    billingCycle: "Annual",
    amount: "₹ 23,988 /yr",
    renewsOn: "12 Jun 2027",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-102",
    ownerName: "Rahul Sen",
    shopName: "Tasty Bites Restaurant",
    email: "rahul@example.com",
    phone: "+91 98765 43211",
    planId: "starter",
    planName: "Starter Tier",
    billingCycle: "Monthly",
    amount: "₹ 999 /mo",
    renewsOn: "15 Nov 2026",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-103",
    ownerName: "Priya Ghosh",
    shopName: "Quick Care Clinic",
    email: "priya@example.com",
    phone: "+91 98765 43212",
    planId: "growth",
    planName: "Pro Growth Plan",
    billingCycle: "Monthly",
    amount: "₹ 2,499 /mo",
    renewsOn: "18 Nov 2026",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-104",
    ownerName: "Arjun Roy",
    shopName: "The Book Nook Store",
    email: "arjun@example.com",
    phone: "+91 98765 43214",
    planId: "enterprise",
    planName: "Enterprise Multi-Chain",
    billingCycle: "Annual",
    amount: "₹ 47,988 /yr",
    renewsOn: "28 Oct 2027",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-105",
    ownerName: "Sujit Paul",
    shopName: "FitLife Gym & Spa",
    email: "sujit@example.com",
    phone: "+91 98765 43213",
    planId: "starter",
    planName: "Starter Tier",
    billingCycle: "Monthly",
    amount: "₹ 999 /mo",
    renewsOn: "05 Nov 2026",
    status: "Expiring Soon",
    autoRenew: false,
  },
  {
    id: "SUB-106",
    ownerName: "Dr. Sandip Roy",
    shopName: "Apex Dental Studio",
    email: "sandip@example.com",
    phone: "+91 98765 43215",
    planId: "growth",
    planName: "Pro Growth Plan",
    billingCycle: "Monthly",
    amount: "₹ 2,499 /mo",
    renewsOn: "21 Nov 2026",
    status: "Active",
    autoRenew: true,
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
    if (tab !== "owners") {
      setDetailModalOwner(null);
    }
    if (tab !== "shops") {
      setSelectedShopDetail(null);
    }
    if (tab !== "users") {
      setSelectedUserDetail(null);
    }
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

  // Owners List State (strictly real data from API — no demo data)
  const [ownersData, setOwnersData] = useState(() => {
    const saved = localStorage.getItem("ql_admin_owners_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasDemo =
          Array.isArray(parsed) &&
          parsed.some(
            (p) =>
              p.email === "ananya@example.com" ||
              p.name === "Ananya Das" ||
              p.email === "rahul@example.com"
          );
        if (!hasDemo && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isOwnersLoading, setIsOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState(null);

  // Users List State (strictly real data from /user/all API — only regular users, excluding Owner and Admin)
  const [usersData, setUsersData] = useState(() => {
    const saved = localStorage.getItem("ql_admin_users_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasDemo =
          Array.isArray(parsed) &&
          parsed.some(
            (u) =>
              u.name === "Sourav Ganguly" ||
              u.email === "sourav.ganguly@email.com" ||
              u.token === "QL-045"
          );
        if (!hasDemo && Array.isArray(parsed) && parsed.length > 0) {
          // Keep only regular users (exclude Admin and Owner)
          return parsed.filter((u) => {
            const r = (u.role || "").toLowerCase().trim();
            return r === "user" || r === "customer";
          });
        }
      } catch (e) {}
    }
    return [];
  });
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Fetch all owners from backend API (with automatic token refresh on 401)
  const fetchOwners = async () => {
    setIsOwnersLoading(true);
    setOwnersError(null);
    try {
      const res = await authFetch(OWNERS_API_URL, {
        method: "GET",
      });

      const data = await res.json().catch(() => null);

      if (res.ok && Array.isArray(data)) {
        const mapped = data.map(mapApiOwnerToDashboard);
        setOwnersData(mapped);
        localStorage.setItem("ql_admin_owners_list", JSON.stringify(mapped));
      } else if (res.status === 401 || res.status === 403) {
        console.warn("Owner API auth restriction:", data?.detail || res.statusText);
        setOwnersError(data?.detail || "Admin authentication required to load owners.");
        setOwnersData([]);
      } else {
        console.warn("Owner API failed:", data);
        setOwnersError(data?.detail || data?.message || "Failed to load owners.");
        setOwnersData([]);
      }
    } catch (err) {
      console.error("fetchOwners error:", err);
      setOwnersError("Could not connect to server. Please check your internet connection.");
      setOwnersData([]);
    } finally {
      setIsOwnersLoading(false);
    }
  };

  // Fetch All Users & Admin Profile from /user/all API
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const res = await authFetch(ALL_USERS_API_URL, {
        method: "GET",
      });

      const data = await res.json().catch(() => null);

      if (res.ok && Array.isArray(data)) {
        // Filter ONLY regular users (strictly role "user" / "customer", excluding Admin and Owner)
        const onlyRegularUsers = data.filter((u) => {
          const r = (u.role || "").toLowerCase().trim();
          return r === "user" || r === "customer";
        });

        const mapped = onlyRegularUsers.map(mapApiUserToDashboard);
        setUsersData(mapped);
        localStorage.setItem("ql_admin_users_list", JSON.stringify(mapped));

        let loggedUser = {};
        try {
          loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch (e) {}

        const adminFromApi = data.find(
          (u) =>
            (loggedUser.email && u.email?.toLowerCase() === loggedUser.email.toLowerCase()) ||
            (loggedUser.id && (u.user_id === loggedUser.id || u.user_id === loggedUser.userid)) ||
            (loggedUser.userid && (u.user_id === loggedUser.userid || u.user_id === loggedUser.id)) ||
            u.role?.toLowerCase() === "admin" ||
            u.role?.toLowerCase() === "super admin"
        );

        if (adminFromApi) {
          const apiName = (adminFromApi.full_name || adminFromApi.fullname || "").trim();
          const apiEmail = adminFromApi.email || loggedUser.email || "";
          const apiPhone = adminFromApi.phone || "";
          const apiAddress = adminFromApi.address || "";
          const apiImage = adminFromApi.profile_image || null;

          let formattedJoined = "Recently";
          if (adminFromApi.joined_date) {
            try {
              const d = new Date(adminFromApi.joined_date);
              if (!isNaN(d.getTime())) {
                formattedJoined = d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
              }
            } catch {}
          }

          setAdminProfile((prev) => {
            const updated = {
              ...prev,
              name: apiName || prev.name,
              email: apiEmail || prev.email,
              phone: apiPhone || prev.phone,
              address: apiAddress || prev.address,
              avatarImg: apiImage || prev.avatarImg,
              joinedOn: formattedJoined !== "Recently" ? formattedJoined : prev.joinedOn,
              status: adminFromApi.account_status !== undefined ? (adminFromApi.account_status ? "Active" : "Suspended") : prev.status,
              role: adminFromApi.role || prev.role || "Super Admin",
            };
            return updated;
          });

          // Sync localStorage 'user' so all components have latest db info
          try {
            const updatedUser = {
              ...loggedUser,
              id: adminFromApi.user_id,
              userid: adminFromApi.user_id,
              fullname: apiName || loggedUser.fullname,
              name: apiName || loggedUser.name,
              email: apiEmail,
              phone: apiPhone,
              address: apiAddress,
              profile_image: apiImage,
              role: adminFromApi.role,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {}
        }
      } else if (res.status === 401 || res.status === 403) {
        console.warn("User API auth restriction:", data?.detail || res.statusText);
        setUsersError(data?.detail || "Admin authentication required to view users list.");
        setUsersData([]);
      } else {
        console.warn("User API failed:", data);
        setUsersError(data?.detail || data?.message || "Failed to load users from database.");
        setUsersData([]);
      }
    } catch (err) {
      console.error("fetchUsers error:", err);
      setUsersError("Could not connect to server. Please check your internet connection.");
      setUsersData([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchAdminProfile = fetchUsers;

  useEffect(() => {
    fetchOwners();
    fetchUsers();
  }, []);

  // Modals & Forms State
  const [detailModalOwner, setDetailModalOwner] = useState(null);
  const [ownerProfileTab, setOwnerProfileTab] = useState("overview"); // 'overview' | 'shops'
  const [updatingOwnerStatusId, setUpdatingOwnerStatusId] = useState(null);
  const [dashboardToast, setDashboardToast] = useState(null);

  const showToast = (message, type = "success") => {
    setDashboardToast({ message, type });
    setTimeout(() => {
      setDashboardToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };
  const [addOwnerModalOpen, setAddOwnerModalOpen] = useState(false);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [addOwnerError, setAddOwnerError] = useState("");
  const [showAddOwnerPassword, setShowAddOwnerPassword] = useState(false);
  const [showAddOwnerConfirmPassword, setShowAddOwnerConfirmPassword] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    maxShops: 5,
    joinedDate: new Date().toISOString().split("T")[0],
    address: "",
  });

  // Prevent browser password manager from autofilling saved credentials into Address/Password fields
  useEffect(() => {
    if (addOwnerModalOpen) {
      setNewOwnerForm((prev) => ({
        ...prev,
        address: prev.address?.includes("@") ? "" : prev.address,
        password: "",
        confirmPassword: "",
      }));
      const clearTimer = setTimeout(() => {
        setNewOwnerForm((prev) => ({
          ...prev,
          address: prev.address?.includes("@") ? "" : prev.address,
          password: "",
          confirmPassword: "",
        }));
      }, 80);
      return () => clearTimeout(clearTimer);
    }
  }, [addOwnerModalOpen]);

  const handleOpenAddOwnerModal = () => {
    setNewOwnerForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      maxShops: 5,
      joinedDate: new Date().toISOString().split("T")[0],
      address: "",
    });
    setAddOwnerError("");
    setShowAddOwnerPassword(false);
    setShowAddOwnerConfirmPassword(false);
    setAddOwnerModalOpen(true);
  };

  const getOwnerPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  // Live Queue Modal State & Interactive Shops State
  const [selectedShopDetail, setSelectedShopDetail] = useState(null);
  const [queueModalFilter, setQueueModalFilter] = useState("All");
  const [queueTokensState, setQueueTokensState] = useState({});
  const [shopsData, setShopsData] = useState(() => {
    const saved = localStorage.getItem("ql_admin_shops_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ALL_SHOPS_DATA;
  });

  // Users Directory & Details State
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Subscriptions Hub State
  const [subscriptionPlans, setSubscriptionPlans] = useState(() => {
    const saved = localStorage.getItem("ql_admin_subscription_plans");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return SUBSCRIPTION_PLANS;
  });

  const [subscribersList, setSubscribersList] = useState(() => {
    const saved = localStorage.getItem("ql_admin_subscribers_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SUBSCRIBERS_DATA;
  });

  const [subsViewMode, setSubsViewMode] = useState("plans"); // 'plans' | 'subscribers'
  const [subsBillingCycle, setSubsBillingCycle] = useState("monthly"); // 'monthly' | 'annual'
  const [subsPlanFilter, setSubsPlanFilter] = useState("all");
  const [subsSearchQuery, setSubsSearchQuery] = useState("");
  const [editingPlanModal, setEditingPlanModal] = useState(null);
  const [changeSubscriberModal, setChangeSubscriberModal] = useState(null);

  const handleSaveEditedPlan = (updatedPlan) => {
    setSubscriptionPlans((prev) => {
      const next = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
      localStorage.setItem("ql_admin_subscription_plans", JSON.stringify(next));
      return next;
    });
    setEditingPlanModal(null);
    setSettingsSavedToast(true);
  };

  const handleChangeSubscriberPlan = (subId, newPlanId, newBillingCycle) => {
    const planObj = subscriptionPlans.find((p) => p.id === newPlanId);
    setSubscribersList((prev) => {
      const next = prev.map((sub) => {
        if (sub.id === subId) {
          const isAnnual = newBillingCycle === "annual";
          const amount = isAnnual
            ? `${planObj?.currency || "₹"} ${planObj?.annualTotal?.toLocaleString() || "23,988"} /yr`
            : `${planObj?.currency || "₹"} ${planObj?.monthlyPrice?.toLocaleString() || "2,499"} /mo`;
          return {
            ...sub,
            planId: newPlanId,
            planName: planObj?.name || sub.planName,
            billingCycle: isAnnual ? "Annual" : "Monthly",
            amount,
            status: "Active",
          };
        }
        return sub;
      });
      localStorage.setItem("ql_admin_subscribers_list", JSON.stringify(next));
      return next;
    });
    setChangeSubscriberModal(null);
    setSettingsSavedToast(true);
  };

  // Admin Profile State & Modals
  const [adminProfileModalOpen, setAdminProfileModalOpen] = useState(false);
  const [editAdminModalOpen, setEditAdminModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawCropImage, setRawCropImage] = useState(null);
  // Protect Admin Route: verify ql_admin_token
  useEffect(() => {
    const adminToken = localStorage.getItem("ql_admin_token");
    if (!adminToken) {
      window.location.href = "/login";
    }
  }, []);

  const [cropTarget, setCropTarget] = useState({ type: "admin" }); // { type: "admin" } or { type: "owner", ownerId: number }
  const [adminProfile, setAdminProfile] = useState(() => {
    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}

    // Only Department, Role Clearance, and Bio are persisted locally
    let localCustomFields = {
      department: "System Architecture & Operations",
      accessLevel: "Role Clearance (System Enforced)",
      bio: "Master administrator for QueueLess platform, token moderation, shop subscriptions & system configuration.",
    };

    const saved = localStorage.getItem("ql_admin_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          localCustomFields = {
            department: parsed.department || localCustomFields.department,
            accessLevel: parsed.accessLevel || localCustomFields.accessLevel,
            bio: parsed.bio !== undefined ? parsed.bio : localCustomFields.bio,
          };
        }
      } catch (e) {}
    }

    // ALL other profile fields come strictly from the database / logged-in user session
    const realName = loggedUser.fullname || loggedUser.name || "Sujit Kar";
    const realPhone = loggedUser.phone && loggedUser.phone !== "+91 98765 43210" ? loggedUser.phone : "";
    const realEmail = loggedUser.email || "admin@gmail.com";
    const realAddress = loggedUser.address || "";
    const realImage = loggedUser.profile_image || null;

    return {
      name: realName,
      username: loggedUser.username || "admin",
      email: realEmail,
      phone: realPhone,
      address: realAddress,
      role: loggedUser.role || "Super Admin",
      joinedOn: "12 Jan 2026",
      status: "Active",
      department: localCustomFields.department,
      accessLevel: localCustomFields.accessLevel,
      bio: localCustomFields.bio,
      avatarBg: "#1960f7",
      avatarColor: "#ffffff",
      avatarImg: realImage,
      twoFactor: "Enabled (Authenticator App)",
      lastLogin: "Today, 12:45 AM (Local IP)",
    };
  });

  const [editAdminForm, setEditAdminForm] = useState(adminProfile);
  const [isSavingAdminProfile, setIsSavingAdminProfile] = useState(false);
  const [adminProfileError, setAdminProfileError] = useState("");

  const handleOpenEditAdminModal = () => {
    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}

    const realName = loggedUser.fullname || loggedUser.name || (adminProfile.name !== "Super Admin" ? adminProfile.name : "Sujit Kar");
    const realPhone = loggedUser.phone || (adminProfile.phone !== "+91 98765 43210" ? adminProfile.phone : "") || "";
    const realEmail = loggedUser.email || adminProfile.email || "admin@gmail.com";
    const realAddress = loggedUser.address !== undefined && loggedUser.address !== null ? loggedUser.address : (adminProfile.address || "");
    const realImage = loggedUser.profile_image || adminProfile.avatarImg || null;

    setEditAdminForm({
      ...adminProfile,
      name: realName,
      phone: realPhone,
      email: realEmail,
      address: realAddress,
      avatarImg: realImage,
    });
    setAdminProfileError("");
    setEditAdminModalOpen(true);
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setRawCropImage(base64);
        setCropTarget({ type: "admin" });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleOwnerAvatarFileSelect = (e, ownerId) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setRawCropImage(base64);
        setCropTarget({ type: "owner", ownerId });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleCropExistingOwnerPhoto = (owner) => {
    if (owner && owner.avatarImg) {
      setRawCropImage(owner.avatarImg);
      setCropTarget({ type: "owner", ownerId: owner.id });
      setCropModalOpen(true);
    }
  };

  const handleRemoveOwnerAvatar = (ownerId) => {
    setOwnersData((prev) => {
      const updated = prev.map((o) => {
        if (o.id === ownerId) {
          const updatedOwner = { ...o, avatarImg: null, avatarRemoved: true };
          if (detailModalOwner && detailModalOwner.id === ownerId) {
            setDetailModalOwner(updatedOwner);
          }
          return updatedOwner;
        }
        return o;
      });
      localStorage.setItem("ql_admin_owners_list", JSON.stringify(updated));
      return updated;
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Auto-sync cropped or removed profile image directly to database via PUT /user/update
  const syncAdminProfileImageToDb = async (newImage) => {
    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}

    const payload = {
      fullname: loggedUser.fullname || loggedUser.name || adminProfile.name || "Sujit Kar",
      phone: (loggedUser.phone && loggedUser.phone !== "+91 98765 43210" ? loggedUser.phone : adminProfile.phone) || "",
      address: loggedUser.address || adminProfile.address || "",
      profile_image: newImage || "",
    };

    try {
      const targetUrl = loggedUser?.id
        ? `${USER_UPDATE_API_URL}?user_id=${loggedUser.id}`
        : USER_UPDATE_API_URL;

      const res = await authFetch(targetUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Profile image updated in database successfully!", "success");
        try {
          const updatedUser = { ...loggedUser, profile_image: newImage || null };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (e) {}
        fetchAdminProfile();
      } else {
        const data = await res.json().catch(() => null);
        console.warn("Could not sync profile image to database:", data);
      }
    } catch (err) {
      console.warn("syncAdminProfileImageToDb error:", err);
    }
  };

  const handleCropComplete = (croppedBase64) => {
    if (cropTarget?.type === "owner") {
      const ownerId = cropTarget.ownerId;
      setOwnersData((prev) => {
        const updated = prev.map((o) => {
          if (o.id === ownerId) {
            const updatedOwner = { ...o, avatarImg: croppedBase64, avatarRemoved: false };
            if (detailModalOwner && detailModalOwner.id === ownerId) {
              setDetailModalOwner(updatedOwner);
            }
            return updatedOwner;
          }
          return o;
        });
        localStorage.setItem("ql_admin_owners_list", JSON.stringify(updated));
        return updated;
      });
      setSettingsSavedToast(true);
      setCropModalOpen(false);
      setTimeout(() => setSettingsSavedToast(false), 3000);
      return;
    }

    setEditAdminForm((prev) => ({ ...prev, avatarImg: croppedBase64 }));
    setAdminProfile((prev) => ({ ...prev, avatarImg: croppedBase64 }));
    setSettingsSavedToast(true);
    setCropModalOpen(false);
    setTimeout(() => setSettingsSavedToast(false), 3000);

    // Persist new photo directly to database (not locally)
    syncAdminProfileImageToDb(croppedBase64);
  };

  const handleRemoveAvatar = () => {
    setEditAdminForm((prev) => ({ ...prev, avatarImg: null }));
    setAdminProfile((prev) => ({ ...prev, avatarImg: null }));
    // Persist removal directly to database (not locally)
    syncAdminProfileImageToDb("");
  };

  const handleSaveAdminProfile = async (e) => {
    if (e) e.preventDefault();
    if (isSavingAdminProfile) return;

    setIsSavingAdminProfile(true);
    setAdminProfileError("");

    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (err) {}

    // Exactly preserve whatever fields the user didn't change:
    const finalName = (
      editAdminForm.name?.trim() ||
      loggedUser.fullname ||
      loggedUser.name ||
      adminProfile.name ||
      "Sujit Kar"
    ).trim();

    const finalPhone = (
      editAdminForm.phone?.trim() ||
      loggedUser.phone ||
      (adminProfile.phone !== "+91 98765 43210" ? adminProfile.phone : "") ||
      ""
    ).trim();

    const finalAddress = (
      editAdminForm.address !== undefined
        ? editAdminForm.address.trim()
        : (loggedUser.address || adminProfile.address || "")
    ).trim();

    const finalImage =
      editAdminForm.avatarImg ||
      loggedUser.profile_image ||
      adminProfile.avatarImg ||
      "";

    try {
      // 1. Prepare exact UpdateUserRequest payload
      const updatePayload = {
        fullname: finalName,
        phone: finalPhone,
        address: finalAddress,
        profile_image: finalImage,
      };

      // Call PUT /user/update (with user_id query param if loggedUser.id is available)
      const targetUrl = loggedUser?.id
        ? `${USER_UPDATE_API_URL}?user_id=${loggedUser.id}`
        : USER_UPDATE_API_URL;

      const res = await authFetch(targetUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        if (typeof data?.detail === "string") {
          errorMsg = data.detail;
        } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
          errorMsg = `${data.detail[0].loc?.slice(-1)[0] || "Field"}: ${data.detail[0].msg}`;
        } else if (data?.message) {
          errorMsg = data.message;
        }
        throw new Error(errorMsg);
      }

      // 2. On success, update localStorage 'user' so all app components stay synced with the database
      const updatedUser = {
        ...loggedUser,
        fullname: finalName,
        name: finalName,
        phone: finalPhone,
        address: finalAddress,
        profile_image: finalImage,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 3. Update adminProfile state (database fields will refresh from fetchAdminProfile)
      const updatedProfile = {
        ...adminProfile,
        ...editAdminForm,
        name: finalName,
        phone: finalPhone,
        address: finalAddress,
        avatarImg: finalImage || null,
        email: adminProfile.email,
        department: editAdminForm.department || "System Architecture & Operations",
        accessLevel: editAdminForm.accessLevel || "Role Clearance (System Enforced)",
        bio: editAdminForm.bio || "",
      };
      setAdminProfile(updatedProfile);

      // Strictly ONLY Department, Role Clearance, and Bio are persisted locally
      localStorage.setItem(
        "ql_admin_profile",
        JSON.stringify({
          department: editAdminForm.department || "System Architecture & Operations",
          accessLevel: editAdminForm.accessLevel || "Role Clearance (System Enforced)",
          bio: editAdminForm.bio || "",
        })
      );

      showToast("Administrator profile updated successfully in database!", "success");
      setSettingsSavedToast(true);
      setEditAdminModalOpen(false);
      setTimeout(() => setSettingsSavedToast(false), 3000);
      fetchAdminProfile();
    } catch (err) {
      console.error("Admin profile update failed:", err);
      setAdminProfileError(err.message || "Failed to update administrator profile in database.");
      showToast(`Profile update failed: ${err.message || "Server error"}`, "error");
    } finally {
      setIsSavingAdminProfile(false);
    }
  };

  // Settings State
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Filter Owners
  const filteredOwners = ownersData
    .filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.status.toLowerCase().includes(q);

      const matchStatus = ownerFilterStatus === "All" || o.status === ownerFilterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => a.id - b.id);

  // Filter Shops
  const filteredShops = shopsData.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.owner.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);

    const matchCat = shopCategoryFilter === "All" || s.category === shopCategoryFilter;
    return matchSearch && matchCat;
  });

  // Helper to retrieve live queue tokens for a shop
  const getOrInitQueueTokens = (shop) => {
    if (!shop) return [];
    if (queueTokensState[shop.id]) {
      return queueTokensState[shop.id];
    }
    return [];
  };

  const handleCallNextToken = (shop) => {
    if (!shop) return;
    const currentList = queueTokensState[shop.id] || getOrInitQueueTokens(shop);
    const waitingItems = currentList.filter((t) => t.status === "Waiting");

    if (waitingItems.length === 0) {
      alert("No customers waiting in queue to call.");
      return;
    }

    const nextTokenObj = waitingItems[0];
    const updatedList = currentList.map((t) => {
      if (t.status === "Serving Now") {
        return { ...t, status: "Completed", position: 0 };
      }
      if (t.id === nextTokenObj.id) {
        return { ...t, status: "Serving Now", position: 0 };
      }
      if (t.status === "Waiting") {
        return { ...t, position: Math.max(1, t.position - 1) };
      }
      return t;
    });

    const prefix = nextTokenObj.token.split("-")[0] || "QL";
    const numPart = parseInt(nextTokenObj.token.split("-")[1], 10) || 1;
    // Add auto replenishing waiting visitor if queue gets low
    if (updatedList.filter((t) => t.status === "Waiting").length < 3) {
      const autoNum = numPart + 4;
      updatedList.push({
        id: `${shop.id}-auto-${Date.now()}`,
        name: "Dev Adhikari",
        phone: "+91 98311 55667",
        token: `${prefix}-${String(autoNum).padStart(3, "0")}`,
        position: updatedList.filter((t) => t.status === "Waiting").length + 1,
        status: "Waiting",
        bookedAt: "Just now",
      });
    }

    const remainingWaiting = updatedList.filter((t) => t.status === "Waiting").length;

    setQueueTokensState((prev) => ({
      ...prev,
      [shop.id]: updatedList,
    }));

    const updatedShop = {
      ...shop,
      currentServing: nextTokenObj.token,
      waitingCount: remainingWaiting,
      dailyTokens: Number(shop.dailyTokens || 0) + 1,
    };

    setShopsData((prev) => {
      const nextShops = prev.map((s) => (s.id === shop.id ? updatedShop : s));
      localStorage.setItem("ql_admin_shops_list", JSON.stringify(nextShops));
      return nextShops;
    });

    setQueueDetailsModalShop(updatedShop);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleAlertWaitingCustomers = (shop) => {
    alert(`🔔 SMS and WhatsApp alerts dispatched to all waiting customers of "${shop.name}".`);
  };

  const handleCallSpecificToken = (shop, tokenItem) => {
    const currentList = queueTokensState[shop.id] || getOrInitQueueTokens(shop);
    const updatedList = currentList.map((t) => {
      if (t.status === "Serving Now") {
        return { ...t, status: "Completed", position: 0 };
      }
      if (t.id === tokenItem.id) {
        return { ...t, status: "Serving Now", position: 0 };
      }
      if (t.status === "Waiting" && t.position > tokenItem.position) {
        return { ...t, position: t.position - 1 };
      }
      return t;
    });

    const remainingWaiting = updatedList.filter((t) => t.status === "Waiting").length;

    setQueueTokensState((prev) => ({
      ...prev,
      [shop.id]: updatedList,
    }));

    const updatedShop = {
      ...shop,
      currentServing: tokenItem.token,
      waitingCount: remainingWaiting,
      dailyTokens: Number(shop.dailyTokens || 0) + 1,
    };

    setShopsData((prev) => {
      const nextShops = prev.map((s) => (s.id === shop.id ? updatedShop : s));
      localStorage.setItem("ql_admin_shops_list", JSON.stringify(nextShops));
      return nextShops;
    });

    setQueueDetailsModalShop(updatedShop);
  };

  const handleCompleteToken = (shop, tokenItem) => {
    const currentList = queueTokensState[shop.id] || getOrInitQueueTokens(shop);
    const updatedList = currentList.map((t) => {
      if (t.id === tokenItem.id) {
        return { ...t, status: "Completed", position: 0 };
      }
      return t;
    });

    setQueueTokensState((prev) => ({
      ...prev,
      [shop.id]: updatedList,
    }));
  };

  // Filter Users (strictly only users with role "User" / "Customer", excluding Admin and Owner)
  const filteredUsers = usersData.filter((u) => {
    const r = (u.role || "").toLowerCase().trim();
    const isUserOnly = r === "user" || r === "customer";
    if (!isUserOnly) return false;

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && String(u.phone).includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.token && u.token.toLowerCase().includes(q)) ||
      (u.address && u.address.toLowerCase().includes(q)) ||
      (u.shop && u.shop.toLowerCase().includes(q));

    const matchStatus = userStatusFilter === "All" || u.status === userStatusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateUserStatus = (userId, newStatus) => {
    setUsersData((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const updatedUser = {
            ...u,
            status: newStatus,
            position: newStatus === "Waiting" ? (u.position || 1) : 0,
            approxWait:
              newStatus === "Serving Now"
                ? "Currently Serving"
                : newStatus === "Completed"
                ? "Completed"
                : newStatus === "Cancelled"
                ? "Cancelled"
                : "10-15 mins",
          };
          if (selectedUserDetail && selectedUserDetail.id === userId) {
            setSelectedUserDetail(updatedUser);
          }
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem("ql_admin_users_list", JSON.stringify(updated));
      return updated;
    });
    setSettingsSavedToast(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("ql_admin_token");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleToggleOwnerStatus = async (ownerId) => {
    if (!ownerId && ownerId !== 0) return;
    if (updatingOwnerStatusId !== null) return;

    // Find the current status of the owner
    const targetOwner =
      ownersData.find((o) => Number(o.id) === Number(ownerId)) ||
      (detailModalOwner && Number(detailModalOwner.id) === Number(ownerId) ? detailModalOwner : null);

    const isCurrentlyActive = targetOwner ? targetOwner.status === "Active" : true;
    const nextStatusBool = !isCurrentlyActive; // Active -> false (Suspended), Suspended -> true (Active)
    const nextStatusStr = nextStatusBool ? "Active" : "Suspended";

    setUpdatingOwnerStatusId(ownerId);

    try {
      const res = await authFetch(OWNER_STATUS_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: Number(ownerId),
          new_status: nextStatusBool,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        if (typeof data?.detail === "string") {
          errorMsg = data.detail;
        } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
          errorMsg = `${data.detail[0].loc?.slice(-1)[0] || "Field"}: ${data.detail[0].msg}`;
        } else if (data?.message) {
          errorMsg = data.message;
        }
        throw new Error(errorMsg);
      }

      // Update state in ownersData
      setOwnersData((prev) => {
        const updated = prev.map((o) => {
          if (Number(o.id) === Number(ownerId)) {
            return { ...o, status: nextStatusStr };
          }
          return o;
        });
        try {
          localStorage.setItem("ql_admin_owners_list", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Update state in detailModalOwner if open
      if (detailModalOwner && Number(detailModalOwner.id) === Number(ownerId)) {
        setDetailModalOwner((prev) => (prev ? { ...prev, status: nextStatusStr } : null));
      }

      showToast(`Owner status changed to "${nextStatusStr}" successfully!`, "success");
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 3000);
    } catch (err) {
      console.error("Owner status update error:", err);
      showToast(`Failed to update status: ${err.message || "Network error"}`, "error");
    } finally {
      setUpdatingOwnerStatusId(null);
    }
  };

  const handleDeleteOwner = (ownerId, ownerName) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete owner "${ownerName || 'this merchant'}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setOwnersData((prev) => {
      const updated = prev.filter((o) => o.id !== ownerId);
      localStorage.setItem("ql_admin_owners_list", JSON.stringify(updated));
      return updated;
    });

    if (detailModalOwner && detailModalOwner.id === ownerId) {
      setDetailModalOwner(null);
    }

    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleAddOwnerSubmit = async (e) => {
    e.preventDefault();
    setAddOwnerError("");

    const fullname = (newOwnerForm.name || "").trim();
    const email = (newOwnerForm.email || "").trim().toLowerCase();
    const cleanPhone = (newOwnerForm.phone || "").replace(/\D/g, "");
    const password = (newOwnerForm.password || "").trim();
    const confirmPassword = (newOwnerForm.confirmPassword || "").trim();
    const address = (newOwnerForm.address || "").trim();
    const maxShops = Number(newOwnerForm.maxShops || 5);

    if (!fullname) {
      setAddOwnerError("Please enter Owner Name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setAddOwnerError("Please enter a valid Email Address.");
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setAddOwnerError("Phone number must be exactly 10 digits.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    if (newOwnerForm.joinedDate && newOwnerForm.joinedDate > today) {
      setAddOwnerError("Joined Date cannot be in the future (cannot exceed today).");
      return;
    }
    if (!address) {
      setAddOwnerError("Please enter the Address.");
      return;
    }
    if (!password) {
      setAddOwnerError("Please enter a Password.");
      return;
    }
    if (getOwnerPasswordStrength(password) < 4) {
      setAddOwnerError("Password must be Strong before registering (at least 8 characters, uppercase, lowercase, number, and special character).");
      return;
    }
    if (!confirmPassword) {
      setAddOwnerError("Please confirm your Password.");
      return;
    }
    if (password !== confirmPassword) {
      setAddOwnerError("Password and Confirm Password do not match.");
      return;
    }

    const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const adminUserId = Number(loggedUser.user_id || loggedUser.userid || 1);

    setIsAddingOwner(true);

    try {
      const res = await authFetch(ADD_OWNER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_user_id: adminUserId,
          fullname,
          email,
          password,
          phone: cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10),
          address,
          max_shop_count: maxShops,
          backup_id: 1,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.status === "failed" || data?.status === "error") {
        const errorMsg =
          (Array.isArray(data?.detail)
            ? data.detail.map((d) => d.msg).join(", ")
            : data?.detail) ||
          data?.message ||
          data?.error ||
          "Failed to register owner in database.";
        setAddOwnerError(errorMsg);
        setIsAddingOwner(false);
        return;
      }

      // Success: refresh real owners from API
      await fetchOwners();
      setIsAddingOwner(false);
      setAddOwnerModalOpen(false);
      setNewOwnerForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        maxShops: 5,
        joinedDate: new Date().toISOString().split("T")[0],
        address: "",
      });
      setShowAddOwnerPassword(false);
      setShowAddOwnerConfirmPassword(false);
      showToast("New owner registered successfully in database!", "success");
    } catch (err) {
      setIsAddingOwner(false);
      setAddOwnerError(err?.message || "Could not connect to the backend server. Please try again.");
    }
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
                    adminProfile.name ? adminProfile.name.trim().charAt(0).toUpperCase() : "A"
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
                        adminProfile.name ? adminProfile.name.trim().charAt(0).toUpperCase() : "A"
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
                      setActiveTab("settings");
                      setSelectedShopDetail(null);
                      setDetailModalOwner(null);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span>👤</span> View Profile
                  </button>
                  <button
                    type="button"
                    className="ql-dropdown-item"
                    onClick={() => {
                      handleOpenEditAdminModal();
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
        <main className={`ql-admin-content ${activeTab === "owners" && detailModalOwner ? "ql-owner-page-active" : activeTab === "shops" && selectedShopDetail ? "ql-shop-page-active" : activeTab === "users" && selectedUserDetail ? "ql-user-page-active" : ""}`}>
          {/* Dynamic Page Heading */}
          {activeTab === "owners" && detailModalOwner ? (
            <div className="ql-owner-page-top-header">
              <div className="ql-owner-page-title-wrap">
                <div className="ql-owner-page-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1960f7" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h2>Owner Details</h2>
                </div>
                <div className="ql-owner-breadcrumbs">
                  <span className="crumb-home">🏠</span>
                  <span className="crumb-sep">&gt;</span>
                  <span
                    className="crumb-link"
                    onClick={() => {
                      setDetailModalOwner(null);
                    }}
                  >
                    Owners
                  </span>
                  <span className="crumb-sep">/</span>
                  <span className="crumb-active">Owner Details</span>
                </div>
              </div>
              <button
                type="button"
                className="ql-back-to-owners-btn"
                onClick={() => {
                  setDetailModalOwner(null);
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back to Owners</span>
              </button>
            </div>
          ) : (activeTab === "shops" && selectedShopDetail) || (activeTab === "users" && selectedUserDetail) ? null : (
            <div className="ql-page-header">
              <h1 className="ql-page-title">{currentHeader.title}</h1>
              <p className="ql-page-sub">{currentHeader.sub}</p>
            </div>
          )}

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
                        <div className="ql-stat-number">
                          {item.id === "owners"
                            ? isOwnersLoading && ownersData.length === 0
                              ? "..."
                              : String(ownersData.length)
                            : item.id === "users"
                            ? isUsersLoading && usersData.length === 0
                              ? "..."
                              : String(usersData.length)
                            : item.value}
                        </div>
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
                      View All ({filteredOwners.length}) &rarr;
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
                        {isOwnersLoading ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "28px", color: "var(--admin-text-muted)" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "16px",
                                  height: "16px",
                                  border: "2px solid #cbd5e1",
                                  borderTopColor: "#1960f7",
                                  borderRadius: "50%",
                                  animation: "qlModalSpin 0.7s linear infinite",
                                  verticalAlign: "middle",
                                  marginRight: "8px",
                                }}
                              />
                              Loading owners from API...
                            </td>
                          </tr>
                        ) : filteredOwners.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "32px 16px", color: "var(--admin-text-muted)" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontWeight: "600", fontSize: "13.5px", color: "var(--admin-text-main)" }}>No owners registered</span>
                                <span style={{ fontSize: "12px" }}>Real registered owners will appear here automatically.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredOwners.slice(0, 5).map((owner, index) => (
                            <tr key={owner.id}>
                              <td className="col-hide-mobile">{index + 1}</td>
                              <td>
                                <div
                                  className="ql-owner-info"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setActiveTab("owners");
                                    setDetailModalOwner(owner);
                                    setOwnerProfileTab("overview");
                                  }}
                                  title="Click to view Owner Profile & Details"
                                >
                                  <span
                                    className="ql-owner-avatar"
                                    style={{
                                      backgroundColor: owner.avatarBg,
                                      color: owner.avatarColor,
                                      overflow: "hidden",
                                    }}
                                  >
                                    {owner.avatarImg ? (
                                      <img src={owner.avatarImg} alt={owner.name} className="ql-avatar-fill-img" />
                                    ) : (
                                      owner.name ? owner.name.trim().charAt(0).toUpperCase() : (owner.initial || "O")
                                    )}
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
                                  style={{
                                    cursor: updatingOwnerStatusId === owner.id ? "wait" : "pointer",
                                    opacity: updatingOwnerStatusId === owner.id ? 0.6 : 1,
                                    userSelect: "none",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleOwnerStatus(owner.id);
                                  }}
                                  title={
                                    updatingOwnerStatusId === owner.id
                                      ? "Updating status on server..."
                                      : `Click to ${owner.status === "Active" ? "Suspend" : "Activate"} this owner`
                                  }
                                >
                                  {updatingOwnerStatusId === owner.id ? (
                                    <span className="ql-btn-spinner" style={{ width: "9px", height: "9px", borderWidth: "1.5px" }} />
                                  ) : (
                                    <span className="dot" />
                                  )}
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
                                    onClick={() => {
                                      setActiveTab("owners");
                                      setDetailModalOwner(owner);
                                      setOwnerProfileTab("overview");
                                    }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="ql-action-icon red"
                                    title="Delete Owner"
                                    onClick={() => handleDeleteOwner(owner.id, owner.name)}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
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
            detailModalOwner ? (() => {
              // Associated shops for this owner (real shops only, no mock shops)
              const ownerShops = ALL_SHOPS_DATA.filter(
                (s) => s.owner && s.owner.toLowerCase() === detailModalOwner.name.toLowerCase()
              );
              const apiShops = Array.isArray(detailModalOwner.parsedShopDetails)
                ? detailModalOwner.parsedShopDetails.map((sh, idx) => ({
                    id: sh.shop_id || `shop-api-${idx}`,
                    name: sh.shop_name || sh.name || "Counter",
                    category: sh.category || "Retail",
                    owner: detailModalOwner.name,
                    phone: detailModalOwner.phone,
                    status: detailModalOwner.status === "Suspended" ? "Closed" : "Active",
                    currentServing: sh.current_serving || `TK-${String(idx + 1).padStart(3, "0")}`,
                    waitingCount: sh.waiting_count || 0,
                    avgWaitTime: sh.avg_wait_time || "5 mins",
                    dailyTokens: sh.daily_tokens || 0,
                  }))
                : [];
              const displayShops = apiShops.length > 0 ? apiShops : ownerShops;

              const currentOwnerAvatar = detailModalOwner.avatarRemoved
                ? null
                : (detailModalOwner.avatarImg || null);

              return (
                <div className="ql-tab-view ql-owner-details-full-page">
                  {/* HERO BANNER CARD */}
                  <div className="ql-owner-hero-banner">
                    <div className="ql-owner-banner-left">
                      <div className="ql-owner-avatar-container">
                        <div
                          className="ql-owner-avatar-circle"
                          style={{
                            backgroundColor: detailModalOwner.avatarBg || "#dbeafe",
                            color: detailModalOwner.avatarColor || "#1d4ed8",
                          }}
                        >
                          {currentOwnerAvatar ? (
                            <img src={currentOwnerAvatar} alt={detailModalOwner.name} className="ql-avatar-fill-img" />
                          ) : (
                            detailModalOwner.name ? detailModalOwner.name.trim().charAt(0).toUpperCase() : (detailModalOwner.initial || "O")
                          )}
                        </div>
                      </div>

                      <div className="ql-owner-banner-meta">
                        <div className="ql-owner-banner-name-row">
                          <h3 className="ql-owner-banner-name">{detailModalOwner.name}</h3>
                          <span
                            className={`ql-owner-status-pill ${
                              detailModalOwner.status === "Active"
                                ? "active"
                                : detailModalOwner.status === "Expiring Soon"
                                ? "expiring"
                                : "suspended"
                            }`}
                            style={{
                              cursor: updatingOwnerStatusId === detailModalOwner.id ? "wait" : "pointer",
                              opacity: updatingOwnerStatusId === detailModalOwner.id ? 0.65 : 1,
                              userSelect: "none",
                            }}
                            onClick={() => handleToggleOwnerStatus(detailModalOwner.id)}
                            title={
                              updatingOwnerStatusId === detailModalOwner.id
                                ? "Updating status on server..."
                                : `Click to ${detailModalOwner.status === "Active" ? "Suspend" : "Activate"} this account`
                            }
                          >
                            {updatingOwnerStatusId === detailModalOwner.id ? (
                              <span className="ql-btn-spinner" style={{ width: "9px", height: "9px", borderWidth: "1.5px" }} />
                            ) : (
                              <span className="dot" />
                            )}
                            {detailModalOwner.status}
                          </span>
                        </div>

                        <div className="ql-owner-banner-sub-row">
                          <span className="ql-owner-code-label">{detailModalOwner.ownerCode || `OWN-000${detailModalOwner.id}`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative subtle background wave SVG */}
                    <div className="ql-owner-banner-wave-decor" aria-hidden="true">
                      <svg viewBox="0 0 400 160" fill="none" preserveAspectRatio="none">
                        <path d="M0,80 C120,20 220,120 320,60 C370,30 400,60 400,160 L0,160 Z" fill="rgba(25, 96, 247, 0.05)" />
                        <path d="M60,110 C160,50 260,130 350,80 C380,60 400,90 400,160 L60,160 Z" fill="rgba(25, 96, 247, 0.08)" />
                      </svg>
                    </div>
                  </div>

                  {/* TABS ROW */}
                  <div className="ql-owner-tabs-row">
                    <button
                      type="button"
                      className={`ql-owner-tab-btn ${ownerProfileTab === "overview" ? "active" : ""}`}
                      onClick={() => setOwnerProfileTab("overview")}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Profile & Overview</span>
                    </button>
                    <button
                      type="button"
                      className={`ql-owner-tab-btn ${ownerProfileTab === "shops" ? "active" : ""}`}
                      onClick={() => setOwnerProfileTab("shops")}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                        <path d="M2 7h20" />
                      </svg>
                      <span>Registered Shops ({displayShops.length})</span>
                    </button>
                  </div>

                  {/* TAB CONTENT: PROFILE & OVERVIEW */}
                  {ownerProfileTab === "overview" ? (
                    <div className="ql-owner-overview-content">
                      {/* 3 TOP KPI CARDS */}
                      <div className="ql-owner-kpis-grid">
                        {/* Card 1: Active Queues */}
                        <div className="ql-owner-kpi-card queues">
                          <div className="ql-owner-kpi-icon blue">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                              <path d="M2 7h20" />
                            </svg>
                          </div>
                          <div className="ql-owner-kpi-info">
                            <div className="ql-owner-kpi-val">{detailModalOwner.shops || 1}</div>
                            <div className="ql-owner-kpi-lbl">Active Queues</div>
                          </div>
                        </div>

                        {/* Card 2: Customers Served */}
                        <div className="ql-owner-kpi-card served">
                          <div className="ql-owner-kpi-icon red">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                              <path d="M13 5v2" />
                              <path d="M13 17v2" />
                              <path d="M13 11v2" />
                            </svg>
                          </div>
                          <div className="ql-owner-kpi-info">
                            <div className="ql-owner-kpi-val">{detailModalOwner.totalTokens || detailModalOwner.shops * 1420 + 350 || 4610}</div>
                            <div className="ql-owner-kpi-lbl">Customers Served</div>
                          </div>
                        </div>

                        {/* Card 3: Subscription Plan */}
                        <div className="ql-owner-kpi-card plan">
                          <div className="ql-owner-kpi-icon purple">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                          </div>
                          <div className="ql-owner-kpi-info">
                            <div className="ql-owner-kpi-val">{detailModalOwner.plan ? detailModalOwner.plan.split(" ")[0] : "Enterprise"}</div>
                            <div className="ql-owner-kpi-lbl">Subscription Plan</div>
                          </div>
                        </div>
                      </div>

                      {/* 2-COLUMN DETAIL INFO CARDS GRID (3 ROWS, 6 CARDS) */}
                      <div className="ql-owner-info-cards-grid">
                        {/* 1. Owner Email */}
                        <div className="ql-owner-info-card">
                          <div className="ql-owner-info-icon-box blue">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          </div>
                          <div className="ql-owner-info-text-col">
                            <span className="ql-owner-info-lbl">Owner Email</span>
                            <span className="ql-owner-info-val" title={detailModalOwner.email}>{detailModalOwner.email}</span>
                          </div>
                        </div>

                        {/* 2. Mobile Number */}
                        <div className="ql-owner-info-card">
                          <div className="ql-owner-info-icon-box green">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </div>
                          <div className="ql-owner-info-text-col">
                            <span className="ql-owner-info-lbl">Mobile Number</span>
                            <span className="ql-owner-info-val">{detailModalOwner.phone}</span>
                          </div>
                        </div>

                        {/* 3. Address (Changed from Location) */}
                        <div className="ql-owner-info-card">
                          <div className="ql-owner-info-icon-box red">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div className="ql-owner-info-text-col">
                            <span className="ql-owner-info-lbl">Address</span>
                            <span className="ql-owner-info-val" title={detailModalOwner.address || detailModalOwner.city || "Kolkata, WB"}>
                              {detailModalOwner.address || detailModalOwner.city || "Kolkata, WB"}
                            </span>
                          </div>
                        </div>

                        {/* 4. Subscription Billing */}
                        <div className="ql-owner-info-card">
                          <div className="ql-owner-info-icon-box purple">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          </div>
                          <div className="ql-owner-info-text-col">
                            <span className="ql-owner-info-lbl">Subscription Billing</span>
                            <span className="ql-owner-info-val">{detailModalOwner.billingCycle || "Annual (₹14,999/yr)"}</span>
                          </div>
                        </div>

                        {/* 5. Joined On */}
                        <div className="ql-owner-info-card">
                          <div className="ql-owner-info-icon-box blue">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          <div className="ql-owner-info-text-col">
                            <span className="ql-owner-info-lbl">Joined On</span>
                            <span className="ql-owner-info-val">{detailModalOwner.joinedOn}</span>
                          </div>
                        </div>

                        {/* 6. Last Active */}
                        <div className="ql-owner-info-card">
                          <div className="ql-owner-info-icon-box purple">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div className="ql-owner-info-text-col">
                            <span className="ql-owner-info-lbl">Last Active</span>
                            <span className="ql-owner-info-val">{detailModalOwner.lastActive || "Today, 11:30 AM"}</span>
                          </div>
                        </div>
                      </div>

                      {/* BOTTOM ACTIONS BAR */}
                      <div className="ql-owner-page-actions-bar">
                        <button
                          type="button"
                          className={detailModalOwner.status === "Active" ? "ql-owner-page-btn-suspend" : "ql-owner-page-btn-activate"}
                          disabled={updatingOwnerStatusId === detailModalOwner.id}
                          onClick={() => handleToggleOwnerStatus(detailModalOwner.id)}
                          title={
                            updatingOwnerStatusId === detailModalOwner.id
                              ? "Updating status on server..."
                              : detailModalOwner.status === "Active"
                              ? "Click to suspend account"
                              : "Click to activate account"
                          }
                        >
                          {updatingOwnerStatusId === detailModalOwner.id ? (
                            <>
                              <span className="ql-btn-spinner" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              {detailModalOwner.status === "Active" ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="6" y="4" width="4" height="16" rx="1" />
                                  <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                                </svg>
                              )}
                              <span>{detailModalOwner.status === "Active" ? "Suspend Account" : "Activate Account"}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="ql-owner-page-btn-delete"
                          onClick={() => handleDeleteOwner(detailModalOwner.id, detailModalOwner.name)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Delete Owner</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* TAB CONTENT: REGISTERED SHOPS */
                    <div className="ql-owner-shops-view">
                      <div className="ql-owner-shops-grid">
                        {displayShops.length === 0 ? (
                          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 16px", color: "var(--admin-text-muted)" }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "4px", color: "var(--admin-text-main)" }}>
                              No shops registered yet
                            </span>
                            <span style={{ fontSize: "12px" }}>
                              This owner currently has no registered shops in the database.
                            </span>
                          </div>
                        ) : (
                          displayShops.map((shop, idx) => (
                            <div key={shop.id || idx} className="ql-owner-shop-card">
                              <div className="ql-owner-shop-card-header">
                                <div className="ql-owner-shop-badge-icon">
                                  {shop.category?.includes("Cafe") || shop.category?.includes("Dining")
                                    ? "☕"
                                    : shop.category?.includes("Health")
                                    ? "🏥"
                                    : shop.category?.includes("Fitness")
                                    ? "💪"
                                    : "🏪"}
                                </div>
                                <div>
                                  <h4 className="ql-owner-shop-title">{shop.name}</h4>
                                  <p className="ql-owner-shop-category">{shop.category}</p>
                                </div>
                                <span className={`ql-badge-pill ${shop.status === "Active" ? "active" : "suspended"}`} style={{ marginLeft: "auto" }}>
                                  <span className="dot" />
                                  {shop.status}
                                </span>
                              </div>

                              <div className="ql-owner-shop-stats-row">
                                <div className="ql-owner-shop-stat-col">
                                  <span className="lbl">Current Serving</span>
                                  <span className="val" style={{ color: "var(--admin-blue)" }}>{shop.currentServing}</span>
                                </div>
                                <div className="ql-owner-shop-stat-col">
                                  <span className="lbl">Waiting Visitors</span>
                                  <span className="val">{shop.waitingCount} persons</span>
                                </div>
                                <div className="ql-owner-shop-stat-col">
                                  <span className="lbl">Avg Wait Time</span>
                                  <span className="val">{shop.avgWaitTime}</span>
                                </div>
                              </div>

                              <div className="ql-owner-shop-card-footer">
                                <button
                                  type="button"
                                  className="ql-btn-secondary"
                                  style={{ width: "100%", justifyContent: "center" }}
                                  onClick={() => {
                                    setActiveTab("shops");
                                    setSelectedShopDetail(shop);
                                  }}
                                >
                                  ⚡ View Shop & Live Queue
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : (
              /* REGULAR OWNERS TABLE VIEW */
              <div className="ql-tab-view">
                <div className="ql-tab-stats-bar">
                  <div className="ql-tab-stat-pill">
                    <span className="lbl">Total Registered Owners</span>
                    <span className="val">{isOwnersLoading ? "..." : ownersData.length}</span>
                  </div>
                  <div className="ql-tab-stat-pill">
                    <span className="lbl">Active Subscriptions</span>
                    <span className="val" style={{ color: "var(--admin-green)" }}>
                      {isOwnersLoading ? "..." : ownersData.filter((o) => o.status === "Active").length}
                    </span>
                  </div>
                  <div className="ql-tab-stat-pill">
                    <span className="lbl">Expiring Soon</span>
                    <span className="val" style={{ color: "var(--admin-amber)" }}>
                      {isOwnersLoading ? "..." : ownersData.filter((o) => o.status === "Expiring Soon").length}
                    </span>
                  </div>
                  <div className="ql-tab-stat-pill">
                    <span className="lbl">Suspended</span>
                    <span className="val" style={{ color: "var(--admin-red)" }}>
                      {isOwnersLoading ? "..." : ownersData.filter((o) => o.status === "Suspended").length}
                    </span>
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

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="ql-btn-secondary"
                      onClick={fetchOwners}
                      disabled={isOwnersLoading}
                      title="Sync with backend database"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: isOwnersLoading ? "wait" : "pointer",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          animation: isOwnersLoading ? "qlModalSpin 0.7s linear infinite" : "none",
                        }}
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <span>{isOwnersLoading ? "Syncing..." : "Refresh"}</span>
                    </button>
                    <button
                      type="button"
                      className="ql-btn-primary"
                      onClick={handleOpenAddOwnerModal}
                    >
                      <span>+</span> Add New Owner
                    </button>
                  </div>
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
                        {isOwnersLoading ? (
                          <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "48px 16px", color: "var(--admin-text-muted)" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "20px",
                                  height: "20px",
                                  border: "2.5px solid #cbd5e1",
                                  borderTopColor: "#1960f7",
                                  borderRadius: "50%",
                                  animation: "qlModalSpin 0.7s linear infinite",
                                  verticalAlign: "middle",
                                  marginRight: "10px",
                                }}
                              />
                              Fetching registered owners from API...
                            </td>
                          </tr>
                        ) : ownersError ? (
                          <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "36px 16px", color: "#ef4444" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontWeight: "600", fontSize: "14px" }}>{ownersError}</span>
                                <button
                                  type="button"
                                  onClick={fetchOwners}
                                  style={{
                                    padding: "6px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #ef4444",
                                    background: "#fee2e2",
                                    color: "#b91c1c",
                                    fontWeight: "600",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Retry Fetch
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : filteredOwners.length === 0 ? (
                          <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "48px 16px", color: "var(--admin-text-muted)" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--admin-text-main)" }}>No Owners Found</span>
                                <span style={{ fontSize: "13px" }}>There are currently no owners in the database.</span>
                                <button
                                  type="button"
                                  className="ql-btn-primary"
                                  style={{ marginTop: "8px" }}
                                  onClick={handleOpenAddOwnerModal}
                                >
                                  + Add First Owner
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredOwners.map((owner, index) => (
                          <tr key={owner.id}>
                            <td>{index + 1}</td>
                            <td>
                              <div
                                className="ql-owner-info"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setDetailModalOwner(owner);
                                  setOwnerProfileTab("overview");
                                }}
                                title="Click to view Owner Profile & Details"
                              >
                                <span
                                  className="ql-owner-avatar"
                                  style={{
                                    backgroundColor: owner.avatarBg,
                                    color: owner.avatarColor,
                                    overflow: "hidden",
                                  }}
                                >
                                  {owner.avatarImg ? (
                                    <img src={owner.avatarImg} alt={owner.name} className="ql-avatar-fill-img" />
                                  ) : (
                                    owner.name ? owner.name.trim().charAt(0).toUpperCase() : (owner.initial || "O")
                                  )}
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
                                style={{
                                  cursor: updatingOwnerStatusId === owner.id ? "wait" : "pointer",
                                  opacity: updatingOwnerStatusId === owner.id ? 0.6 : 1,
                                  userSelect: "none",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleOwnerStatus(owner.id);
                                }}
                                title={
                                  updatingOwnerStatusId === owner.id
                                    ? "Updating status on server..."
                                    : `Click to ${owner.status === "Active" ? "Suspend" : "Activate"} this owner`
                                }
                              >
                                {updatingOwnerStatusId === owner.id ? (
                                  <span className="ql-btn-spinner" style={{ width: "9px", height: "9px", borderWidth: "1.5px" }} />
                                ) : (
                                  <span className="dot" />
                                )}
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
                                  onClick={() => {
                                    setDetailModalOwner(owner);
                                    setOwnerProfileTab("overview");
                                  }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className="ql-action-icon red"
                                  title="Delete Owner"
                                  onClick={() => handleDeleteOwner(owner.id, owner.name)}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}

          {/* ═════════ TAB 3: REGISTERED SHOPS ═════════ */}
          {activeTab === "shops" && (
            selectedShopDetail ? (() => {
              const currentShop = shopsData.find((s) => s.id === selectedShopDetail.id) || selectedShopDetail;
              const tokens = queueTokensState[currentShop.id] || getOrInitQueueTokens(currentShop);
              const isShopOpen = currentShop.status === "Active" || currentShop.status === "Open Now";
              const isShopPaused = currentShop.status === "Paused";

              const filteredTokens = tokens.filter((t) => {
                if (queueModalFilter === "All") return true;
                return t.status.toLowerCase() === queueModalFilter.toLowerCase();
              });

              const servingCount = tokens.filter((t) => t.status === "Serving Now" || t.status === "Serving").length;
              const waitingCount = tokens.filter((t) => t.status === "Waiting").length;
              const completedCount = tokens.filter((t) => t.status === "Completed").length;

              return (
                <div className="ql-tab-view ql-shop-details-full-page">
                  {/* Top Breadcrumbs / Back Header */}
                  <div className="ql-shop-page-top-header">
                    <div className="ql-shop-breadcrumbs">
                      <button
                        type="button"
                        className="ql-shop-back-btn"
                        onClick={() => setSelectedShopDetail(null)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12" />
                          <polyline points="12 19 5 12 12 5" />
                        </svg>
                        <span>Back to Shops</span>
                      </button>
                      <span className="crumb-sep">&gt;</span>
                      <span className="crumb-active">{currentShop.name}</span>
                    </div>
                  </div>

                  {/* 1. HERO BANNER CARD */}
                  <div className="ql-shop-hero-card">
                    <div className="ql-shop-hero-left">
                      <div className="ql-shop-hero-img-wrap">
                        <img
                          src={currentShop.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80"}
                          alt={currentShop.name}
                          className="ql-shop-hero-img"
                        />
                      </div>
                      <div className="ql-shop-hero-info">
                        <div className="ql-shop-hero-title-row">
                          <h2 className="ql-shop-hero-name">{currentShop.name}</h2>
                          <span className={`ql-shop-hero-status-pill ${isShopPaused ? "paused" : isShopOpen ? "open" : "closed"}`}>
                            <span className="dot" />
                            {isShopPaused ? "Paused" : isShopOpen ? "Open Now" : "Closed"}
                          </span>
                        </div>

                        <div className="ql-shop-hero-sub-row">
                          <span className="ql-shop-hero-category">{currentShop.category || "Café & Dining"}</span>
                          <span className="ql-bullet">•</span>
                          <span className="ql-shop-hero-owner">Owner: {currentShop.owner}</span>
                        </div>

                        <div className="ql-shop-hero-meta-row">
                          <div className="ql-shop-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{currentShop.location || currentShop.address || "Contai, Purba Medinipur, WB"}</span>
                          </div>
                          <div className="ql-shop-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>{currentShop.phone || "+91 98765 43210"}</span>
                          </div>
                          <div className="ql-shop-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{currentShop.timing || "9:00 AM – 10:00 PM"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. 4 METRIC / KPI CARDS */}
                  <div className="ql-shop-kpis-grid">
                    {/* Card 1: Currently Serving */}
                    <div className="ql-shop-kpi-card blue">
                      <div className="ql-shop-kpi-icon blue">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="6" cy="12" r="1.5" />
                          <circle cx="18" cy="12" r="1.5" />
                          <line x1="10" y1="6" x2="10" y2="18" strokeDasharray="2 2" />
                        </svg>
                      </div>
                      <div className="ql-shop-kpi-text">
                        <div className="val blue">{currentShop.currentServing || "QL-042"}</div>
                        <div className="lbl">Currently Serving</div>
                      </div>
                    </div>

                    {/* Card 2: Customers Waiting */}
                    <div className="ql-shop-kpi-card orange">
                      <div className="ql-shop-kpi-icon orange">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div className="ql-shop-kpi-text">
                        <div className="val orange">{currentShop.waitingCount || 14}</div>
                        <div className="lbl">Customers Waiting</div>
                      </div>
                    </div>

                    {/* Card 3: Approx. Wait Time */}
                    <div className="ql-shop-kpi-card purple">
                      <div className="ql-shop-kpi-icon purple">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div className="ql-shop-kpi-text">
                        <div className="val purple">{currentShop.avgWaitTime || "8 mins"}</div>
                        <div className="lbl">Approx. Wait Time</div>
                      </div>
                    </div>

                    {/* Card 4: Served Today */}
                    <div className="ql-shop-kpi-card green">
                      <div className="ql-shop-kpi-icon green">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      </div>
                      <div className="ql-shop-kpi-text">
                        <div className="val green">{currentShop.dailyTokens || 128}</div>
                        <div className="lbl">Served Today</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. MAIN LOWER GRID: CURRENT QUEUE TABLE (LEFT) & CONTROLS / QUICK INFO (RIGHT) */}
                  <div className="ql-shop-lower-grid">
                    {/* LEFT: Live Queue Token Details Card (Full In-Page Queue Monitor) */}
                    <div className="ql-shop-queue-card">
                      <div className="ql-shop-card-header">
                        <div className="ql-shop-card-title-group">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3.5" />
                            <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3.5" />
                            <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3.5" />
                          </svg>
                          <h3 className="ql-shop-card-title">Live Queue Token Details</h3>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontWeight: "600" }}>
                            {waitingCount} waiting &bull; {completedCount} completed
                          </span>
                          <button
                            type="button"
                            className="ql-shop-refresh-btn"
                            onClick={() => {
                              setSettingsSavedToast(true);
                              setTimeout(() => setSettingsSavedToast(false), 2000);
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 4 23 10 17 10" />
                              <polyline points="1 20 1 14 7 14" />
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            <span>Refresh</span>
                          </button>
                        </div>
                      </div>

                      {/* Real-time Status Badge & Active Terminal */}
                      <div className="ql-queue-ctrl-row" style={{ margin: "2px 0 6px" }}>
                        <div className="ql-counter-pill">
                          <span className="pulse-dot" />
                          <span>Counter #01 &bull; Active Terminal</span>
                        </div>
                        <div className="ql-queue-terminal-badge">
                          <span>⚡ Real-Time Live Sync</span>
                        </div>
                      </div>

                      {/* Filter pill group: All, Serving Now, Waiting, Completed */}
                      <div className="ql-filter-pill-group" style={{ marginBottom: "6px" }}>
                        {["All", "Serving Now", "Waiting", "Completed"].map((flt) => (
                          <button
                            key={flt}
                            type="button"
                            className={`ql-filter-pill-btn ${queueModalFilter === flt ? "active" : ""}`}
                            onClick={() => setQueueModalFilter(flt)}
                          >
                            {flt}
                          </button>
                        ))}
                      </div>

                      {/* Complete Queue Table with all columns */}
                      <div className="ql-shop-table-wrapper">
                        <table className="ql-queue-table">
                          <thead>
                            <tr>
                              <th style={{ width: "95px", padding: "8px 12px" }}>Token #</th>
                              <th style={{ padding: "8px 12px" }}>Customer Name &amp; Phone</th>
                              <th style={{ textAlign: "center", width: "65px", padding: "8px 12px" }}>Pos</th>
                              <th style={{ padding: "8px 12px" }}>Booking Time</th>
                              <th style={{ textAlign: "right", width: "115px", padding: "8px 12px" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTokens.length === 0 ? (
                              <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "32px 0", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                                  No active queue tokens for this counter.
                                </td>
                              </tr>
                            ) : (
                              filteredTokens.map((tok, idx) => {
                                const isNow = tok.status === "Serving Now" || tok.status === "Serving";
                                const isWait = tok.status === "Waiting";
                                return (
                                  <tr key={tok.id || idx} className={isNow ? "row-serving" : ""}>
                                    <td style={{ padding: "9px 12px" }}>
                                      <span className="ql-queue-token-chip">{tok.token}</span>
                                    </td>
                                    <td style={{ padding: "9px 12px" }}>
                                      <div style={{ fontWeight: "700", color: "var(--admin-text-main)", fontSize: "13px" }}>
                                        {tok.name}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "1px" }}>
                                        {tok.phone}
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "center", padding: "9px 12px" }}>
                                      <span className={`ql-queue-pos-badge ${isNow ? "now" : ""}`}>
                                        {isNow ? "NOW" : tok.position > 0 ? `#${tok.position}` : "--"}
                                      </span>
                                    </td>
                                    <td style={{ padding: "9px 12px" }}>
                                      <span style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontWeight: "500" }}>
                                        {tok.bookedAt || tok.joinedAt || "5 mins ago"}
                                      </span>
                                    </td>
                                    <td style={{ textAlign: "right", padding: "9px 12px" }}>
                                      <span
                                        className={`ql-queue-status-chip ${
                                          isNow ? "serving" : isWait ? "waiting" : tok.status === "Completed" ? "completed" : "cancelled"
                                        }`}
                                      >
                                        <span
                                          style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            background: isNow ? "#0066ff" : isWait ? "#ea580c" : tok.status === "Completed" ? "#10b981" : "#ef4444",
                                          }}
                                        />
                                        {tok.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Info Monitor Status */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--admin-border-subtle, #f1f5f9)" }}>
                        <div style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                          <span>QueueLess Live WebSocket Sync &bull; Active Real-Time Monitor</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Queue Control & Quick Info */}
                    <div className="ql-shop-sidebar-col">
                      {/* 1. Queue Control */}
                      <div className="ql-shop-control-card">
                        <div className="ql-shop-control-header">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          <h3 className="ql-shop-card-title">Queue Control</h3>
                        </div>

                        <div className="ql-shop-ctrl-buttons-list">
                          {/* Pause Queue */}
                          <button
                            type="button"
                            className="ql-shop-ctrl-action-btn pause"
                            onClick={() => {
                              const updated = { ...currentShop, status: "Paused" };
                              setShopsData((prev) => {
                                const next = prev.map((s) => (s.id === updated.id ? updated : s));
                                localStorage.setItem("ql_admin_shops_list", JSON.stringify(next));
                                return next;
                              });
                              setSelectedShopDetail(updated);
                              alert(`Queue for "${currentShop.name}" is now PAUSED.`);
                            }}
                          >
                            <div className="icon-circle pause">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                              </svg>
                            </div>
                            <span>Pause Queue</span>
                          </button>

                          {/* Resume Queue */}
                          <button
                            type="button"
                            className="ql-shop-ctrl-action-btn resume"
                            onClick={() => {
                              const updated = { ...currentShop, status: "Active" };
                              setShopsData((prev) => {
                                const next = prev.map((s) => (s.id === updated.id ? updated : s));
                                localStorage.setItem("ql_admin_shops_list", JSON.stringify(next));
                                return next;
                              });
                              setSelectedShopDetail(updated);
                              alert(`Queue for "${currentShop.name}" is now RESUMED.`);
                            }}
                          >
                            <div className="icon-circle resume">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </div>
                            <span>Resume Queue</span>
                          </button>

                          {/* Close Queue */}
                          <button
                            type="button"
                            className="ql-shop-ctrl-action-btn close"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to CLOSE the queue for "${currentShop.name}"?`)) {
                                const updated = { ...currentShop, status: "Closed" };
                                setShopsData((prev) => {
                                  const next = prev.map((s) => (s.id === updated.id ? updated : s));
                                  localStorage.setItem("ql_admin_shops_list", JSON.stringify(next));
                                  return next;
                                });
                                setSelectedShopDetail(updated);
                              }
                            }}
                          >
                            <div className="icon-circle close">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                <line x1="12" y1="2" x2="12" y2="12" />
                              </svg>
                            </div>
                            <span>Close Queue</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Quick Info */}
                      <div className="ql-shop-quick-info-card">
                        <div className="ql-shop-control-header">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
                          </svg>
                          <h3 className="ql-shop-card-title">Quick Info</h3>
                        </div>

                        <div className="ql-shop-quick-info-grid">
                          <div className="ql-shop-quick-stat-box">
                            <div className="icon-blue">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                            <div className="stat-content">
                              <span className="lbl">Total Customers Today</span>
                              <span className="val">{currentShop.dailyTokens || 128}</span>
                            </div>
                          </div>

                          <div className="ql-shop-quick-stat-box">
                            <div className="icon-blue">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                            </div>
                            <div className="stat-content">
                              <span className="lbl">Current Avg. Wait Time</span>
                              <span className="val">{currentShop.avgWaitTime || "8 mins"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="ql-tab-view">
                <div className="ql-tab-filter-bar">
                  <div className="ql-tab-filter-left">
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>Category:</span>
                    <div className="ql-filter-pill-group">
                      {["All", "Café & Dining", "Healthcare", "Fitness", "Retail", "Services"].map((cat) => (
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
                  {filteredShops.map((shop) => {
                    const visuals = getShopCategoryVisuals(shop.category);
                    const isOpen = shop.status === "Active";

                    return (
                      <div
                        key={shop.id}
                        className="ql-shop-card"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedShopDetail(shop)}
                      >
                        {/* Top Row: Icon + Name / Subtitle & Status Pill */}
                        <div className="ql-shop-card-top">
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                            <div
                              className="ql-shop-icon-box"
                              style={{
                                backgroundColor: visuals.bg,
                                color: visuals.color,
                              }}
                            >
                              {visuals.icon}
                            </div>
                            <div className="ql-shop-title-col">
                              <h3 className="ql-shop-card-name">{shop.name}</h3>
                              <div className="ql-shop-card-sub">
                                <span>{shop.category}</span>
                                <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                                <span>Owner: {shop.owner}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`ql-shop-status-badge ${isOpen ? "open" : "closed"}`}>
                            <span className="dot" />
                            {isOpen ? "Open Now" : "Closed"}
                          </div>
                        </div>

                        {/* Middle Box: 3 Column Metric Cards with Dividers */}
                        <div className="ql-shop-metrics-card">
                          <div className="ql-shop-metric-col">
                            <div className="val serving">{shop.currentServing}</div>
                            <div className="lbl">Currently Serving</div>
                          </div>
                          <div className="ql-shop-metric-divider" />
                          <div className="ql-shop-metric-col">
                            <div className="val waiting">{shop.waitingCount}</div>
                            <div className="lbl">Customers Waiting</div>
                          </div>
                          <div className="ql-shop-metric-divider" />
                          <div className="ql-shop-metric-col">
                            <div className="val wait-time">{shop.avgWaitTime}</div>
                            <div className="lbl">Approx. Wait Time</div>
                          </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="ql-shop-card-dash" />

                        {/* Bottom Row: Served Today + View Queue Details CTA */}
                        <div className="ql-shop-card-bottom">
                          <div className="ql-shop-served-box">
                            <div className="ql-shop-chart-icon">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                              </svg>
                            </div>
                            <div>
                              <div className="served-num">{shop.dailyTokens}</div>
                              <div className="served-lbl">Customers Served Today</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="ql-shop-queue-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShopDetail(shop);
                            }}
                          >
                            View Queue Details &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ═════════ TAB 4: USERS DIRECTORY & USER DETAILS VIEW ═════════ */}
          {activeTab === "users" && (
            selectedUserDetail ? (
              <div className="ql-user-details-full-page">
                {/* 1. Header & Breadcrumbs */}
                <div className="ql-user-page-top-header">
                  <div className="ql-owner-page-title-wrap">
                    <div className="ql-owner-page-title">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <h2>User & Profile Details</h2>
                    </div>
                    <div className="ql-user-breadcrumbs">
                      <span className="crumb-home">🏠</span>
                      <span className="crumb-sep">&gt;</span>
                      <span
                        className="crumb-link"
                        style={{ cursor: "pointer", color: "var(--admin-blue)" }}
                        onClick={() => setSelectedUserDetail(null)}
                      >
                        Users Directory
                      </span>
                      <span className="crumb-sep">/</span>
                      <span className="crumb-active">{selectedUserDetail.token} - {selectedUserDetail.name}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ql-user-back-btn"
                    onClick={() => setSelectedUserDetail(null)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Back to Users Directory</span>
                  </button>
                </div>

                {/* 2. Hero Profile Banner */}
                <div className="ql-user-hero-card">
                  <div className="ql-user-hero-left">
                    <div className="ql-user-avatar-circle" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selectedUserDetail.avatarImg ? (
                        <img src={selectedUserDetail.avatarImg} alt={selectedUserDetail.name} className="ql-avatar-fill-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        selectedUserDetail.name ? selectedUserDetail.name.trim().charAt(0).toUpperCase() : (selectedUserDetail.initial || "U")
                      )}
                    </div>
                    <div className="ql-user-hero-info">
                      <div className="ql-user-hero-title-row">
                        <h3 className="ql-user-hero-name">{selectedUserDetail.name}</h3>
                        <span
                          className={`ql-badge-pill ${
                            selectedUserDetail.status === "Active" || selectedUserDetail.status === "Completed" || selectedUserDetail.status === "Serving Now"
                              ? "active"
                              : selectedUserDetail.status === "Waiting"
                              ? "expiring"
                              : "suspended"
                          }`}
                        >
                          <span className="dot" />
                          {selectedUserDetail.status}
                        </span>
                        <span
                          className="ql-badge-pill"
                          style={{
                            background:
                              selectedUserDetail.role?.toLowerCase() === "admin" || selectedUserDetail.role?.toLowerCase() === "super admin"
                                ? "#fef3c7"
                                : selectedUserDetail.role?.toLowerCase() === "owner"
                                ? "#e0e7ff"
                                : "#f1f5f9",
                            color:
                              selectedUserDetail.role?.toLowerCase() === "admin" || selectedUserDetail.role?.toLowerCase() === "super admin"
                                ? "#b45309"
                                : selectedUserDetail.role?.toLowerCase() === "owner"
                                ? "#4338ca"
                                : "#475569",
                            fontWeight: "700",
                            textTransform: "capitalize",
                          }}
                        >
                          {selectedUserDetail.role || "User"}
                        </span>
                      </div>
                      <div className="ql-user-hero-meta-row">
                        <span className="ql-user-meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {selectedUserDetail.phone}
                        </span>
                        <span className="ql-user-meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          {selectedUserDetail.email}
                        </span>
                        <span className="ql-user-meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {selectedUserDetail.city}
                        </span>
                        <span className="ql-user-meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Booked: {selectedUserDetail.bookedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ql-user-hero-actions">
                    {selectedUserDetail.status === "Waiting" && (
                      <button
                        type="button"
                        className="ql-btn-primary"
                        style={{ fontSize: "12.5px", padding: "8px 16px", gap: "6px" }}
                        onClick={() => handleUpdateUserStatus(selectedUserDetail.id, "Serving Now")}
                      >
                        🔔 Call to Counter (Serve Now)
                      </button>
                    )}
                    {selectedUserDetail.status === "Serving Now" && (
                      <button
                        type="button"
                        className="ql-btn-primary"
                        style={{ background: "#10b981", borderColor: "#10b981", fontSize: "12.5px", padding: "8px 16px", gap: "6px" }}
                        onClick={() => handleUpdateUserStatus(selectedUserDetail.id, "Completed")}
                      >
                        ✓ Mark Completed
                      </button>
                    )}
                    {selectedUserDetail.status === "Completed" && (
                      <span className="ql-badge-pill active" style={{ fontSize: "12px", padding: "6px 12px" }}>
                        ✓ Order Completed
                      </span>
                    )}
                    {selectedUserDetail.status === "Cancelled" && (
                      <span className="ql-badge-pill suspended" style={{ fontSize: "12px", padding: "6px 12px" }}>
                        ✕ Token Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. 4 KPI Metric Cards */}
                <div className="ql-user-kpis-grid">
                  <div className="ql-user-kpi-card">
                    <div className="ql-user-kpi-icon blue">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className="ql-user-kpi-text">
                      <span className="val blue">{selectedUserDetail.token}</span>
                      <span className="lbl">Token Pass ID</span>
                    </div>
                  </div>

                  <div className="ql-user-kpi-card">
                    <div className="ql-user-kpi-icon orange">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="ql-user-kpi-text">
                      <span className="val orange">
                        {selectedUserDetail.position === 0 ? (selectedUserDetail.status === "Serving Now" ? "Serving Now" : "—") : `#${selectedUserDetail.position}`}
                      </span>
                      <span className="lbl">Live Queue Position</span>
                    </div>
                  </div>

                  <div className="ql-user-kpi-card">
                    <div className="ql-user-kpi-icon purple">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4" />
                        <path d="M12 18v4" />
                        <path d="M4.93 4.93l2.83 2.83" />
                        <path d="M16.24 16.24l2.83 2.83" />
                        <path d="M2 12h4" />
                        <path d="M18 12h4" />
                      </svg>
                    </div>
                    <div className="ql-user-kpi-text">
                      <span className="val purple">{selectedUserDetail.approxWait}</span>
                      <span className="lbl">Estimated Wait Time</span>
                    </div>
                  </div>

                  <div className="ql-user-kpi-card">
                    <div className="ql-user-kpi-icon green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div className="ql-user-kpi-text">
                      <span className="val green" title={selectedUserDetail.shop}>{selectedUserDetail.shop}</span>
                      <span className="lbl">Assigned Store</span>
                    </div>
                  </div>
                </div>

                {/* 4. Lower Grid: Journey Stepper & Spec Table (Left) + Quick Controls (Right) */}
                <div className="ql-user-lower-grid">
                  {/* Left Main Card */}
                  <div className="ql-user-journey-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                        Queue Lifecycle & Progress Journey
                      </h4>
                      <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", fontWeight: "600" }}>
                        Real-time tracking enabled
                      </span>
                    </div>

                    {/* Interactive 4-step Stepper */}
                    <div className="ql-journey-stepper">
                      {/* Step 1 */}
                      <div className="ql-stepper-step done">
                        <div className="ql-stepper-badge">✓</div>
                        <span className="ql-stepper-title">Token Booked</span>
                        <span className="ql-stepper-sub">{selectedUserDetail.bookedAt}</span>
                      </div>

                      {/* Step 2 */}
                      <div
                        className={`ql-stepper-step ${
                          selectedUserDetail.status === "Serving Now" || selectedUserDetail.status === "Completed"
                            ? "done"
                            : selectedUserDetail.status === "Waiting"
                            ? "active"
                            : "pending"
                        }`}
                      >
                        <div className="ql-stepper-badge">
                          {selectedUserDetail.status === "Serving Now" || selectedUserDetail.status === "Completed" ? "✓" : "2"}
                        </div>
                        <span className="ql-stepper-title">Waiting in Line</span>
                        <span className="ql-stepper-sub">
                          {selectedUserDetail.status === "Waiting" ? `Position #${selectedUserDetail.position}` : "Passed"}
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div
                        className={`ql-stepper-step ${
                          selectedUserDetail.status === "Completed"
                            ? "done"
                            : selectedUserDetail.status === "Serving Now"
                            ? "active"
                            : "pending"
                        }`}
                      >
                        <div className="ql-stepper-badge">
                          {selectedUserDetail.status === "Completed" ? "✓" : "3"}
                        </div>
                        <span className="ql-stepper-title">At Service Counter</span>
                        <span className="ql-stepper-sub">
                          {selectedUserDetail.status === "Serving Now" ? "Currently Being Served" : "Counter Desk"}
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div
                        className={`ql-stepper-step ${
                          selectedUserDetail.status === "Completed"
                            ? "done"
                            : "pending"
                        }`}
                      >
                        <div className="ql-stepper-badge">
                          {selectedUserDetail.status === "Completed" ? "✓" : "4"}
                        </div>
                        <span className="ql-stepper-title">Token Completed</span>
                        <span className="ql-stepper-sub">
                          {selectedUserDetail.status === "Completed" ? "Done & Fulfilled" : "Pending fulfillment"}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Specifications Table */}
                    <div>
                      <h4 style={{ margin: "4px 0 10px", fontSize: "13px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                        Booking Specifications & Service Information
                      </h4>
                      <table className="ql-user-spec-table">
                        <tbody>
                          <tr>
                            <td className="label-col">Store Name:</td>
                            <td className="value-col" style={{ color: "var(--admin-blue)" }}>{selectedUserDetail.shop}</td>
                          </tr>
                          <tr>
                            <td className="label-col">Allocated Counter:</td>
                            <td className="value-col">{selectedUserDetail.counter}</td>
                          </tr>
                          <tr>
                            <td className="label-col">Service Purpose:</td>
                            <td className="value-col">{selectedUserDetail.serviceType}</td>
                          </tr>
                          <tr>
                            <td className="label-col">Queue Entry Method:</td>
                            <td className="value-col">{selectedUserDetail.joinedVia}</td>
                          </tr>
                          <tr>
                            <td className="label-col">City & Location:</td>
                            <td className="value-col">{selectedUserDetail.city}</td>
                          </tr>
                          <tr>
                            <td className="label-col">Visitor Note:</td>
                            <td className="value-col" style={{ color: "var(--admin-text-muted)", fontWeight: "500", fontStyle: "italic" }}>
                              "{selectedUserDetail.notes}"
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Sidebar Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Controls Card */}
                    <div className="ql-user-sidebar-card">
                      <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                        Counter Controls
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                        <button
                          type="button"
                          className="ql-btn-primary"
                          style={{ justifyContent: "center", fontSize: "12.5px", padding: "9px 12px" }}
                          disabled={selectedUserDetail.status === "Serving Now"}
                          onClick={() => handleUpdateUserStatus(selectedUserDetail.id, "Serving Now")}
                        >
                          🔔 Call to Counter (Serve Now)
                        </button>
                        <button
                          type="button"
                          className="ql-btn-secondary"
                          style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px 12px" }}
                          disabled={selectedUserDetail.status === "Completed"}
                          onClick={() => handleUpdateUserStatus(selectedUserDetail.id, "Completed")}
                        >
                          ✓ Mark as Completed
                        </button>
                        <button
                          type="button"
                          className="ql-btn-secondary"
                          style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px 12px" }}
                          disabled={selectedUserDetail.status === "Waiting"}
                          onClick={() => handleUpdateUserStatus(selectedUserDetail.id, "Waiting")}
                        >
                          ⏳ Move Back to Waiting
                        </button>
                        <button
                          type="button"
                          className="ql-btn-secondary danger"
                          style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px 12px", color: "#ef4444", borderColor: "#fca5a5" }}
                          disabled={selectedUserDetail.status === "Cancelled"}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel token ${selectedUserDetail.token}?`)) {
                              handleUpdateUserStatus(selectedUserDetail.id, "Cancelled");
                            }
                          }}
                        >
                          ✕ Cancel Token
                        </button>
                      </div>
                    </div>

                    {/* Automated Alert Delivery Logs & Backup */}
                    <div className="ql-user-sidebar-card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "800", color: "var(--admin-text-main)" }}>
                          Automated Alert Logs
                        </h4>
                        <span className="ql-auto-badge">
                          <span className="ql-auto-dot" /> Auto Active
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "11.5px", color: "var(--admin-text-muted)", lineHeight: "1.4" }}>
                        Queue alerts are automatically triggered and dispatched by the system engine.
                      </p>

                      <div className="ql-alert-logs-list">
                        {/* 1. Booking Confirmation */}
                        <div className="ql-alert-log-item delivered">
                          <div className="ql-alert-log-icon">✓</div>
                          <div className="ql-alert-log-body">
                            <div className="ql-alert-log-top">
                              <span className="ql-alert-title">Token Confirmation</span>
                              <span className="ql-alert-channel sms">SMS</span>
                            </div>
                            <span className="ql-alert-time">Delivered • {selectedUserDetail.bookedAt}</span>
                          </div>
                        </div>

                        {/* 2. Turn Approaching Alert */}
                        <div
                          className={`ql-alert-log-item ${
                            selectedUserDetail.position <= 2 && selectedUserDetail.status !== "Cancelled"
                              ? "delivered"
                              : "queued"
                          }`}
                        >
                          <div className="ql-alert-log-icon">
                            {selectedUserDetail.position <= 2 && selectedUserDetail.status !== "Cancelled" ? "✓" : "⏳"}
                          </div>
                          <div className="ql-alert-log-body">
                            <div className="ql-alert-log-top">
                              <span className="ql-alert-title">Turn Approaching Alert</span>
                              <span className="ql-alert-channel wa">WhatsApp</span>
                            </div>
                            <span className="ql-alert-time">
                              {selectedUserDetail.position <= 2 && selectedUserDetail.status !== "Cancelled"
                                ? "Delivered • Triggered at Pos #2"
                                : "Scheduled (Fires when Pos ≤ 2)"}
                            </span>
                          </div>
                        </div>

                        {/* 3. Counter Call Alert */}
                        <div
                          className={`ql-alert-log-item ${
                            selectedUserDetail.status === "Serving Now" || selectedUserDetail.status === "Completed"
                              ? "delivered"
                              : "queued"
                          }`}
                        >
                          <div className="ql-alert-log-icon">
                            {selectedUserDetail.status === "Serving Now" || selectedUserDetail.status === "Completed" ? "✓" : "⏳"}
                          </div>
                          <div className="ql-alert-log-body">
                            <div className="ql-alert-log-top">
                              <span className="ql-alert-title">Counter Calling Alert</span>
                              <span className="ql-alert-channel sms">SMS</span>
                            </div>
                            <span className="ql-alert-time">
                              {selectedUserDetail.status === "Serving Now" || selectedUserDetail.status === "Completed"
                                ? "Dispatched • Counter Call Alert"
                                : "Triggers on Call to Counter"}
                            </span>
                          </div>
                        </div>

                        {/* 4. Completion Receipt */}
                        <div
                          className={`ql-alert-log-item ${
                            selectedUserDetail.status === "Completed" ? "delivered" : "queued"
                          }`}
                        >
                          <div className="ql-alert-log-icon">
                            {selectedUserDetail.status === "Completed" ? "✓" : "⏳"}
                          </div>
                          <div className="ql-alert-log-body">
                            <div className="ql-alert-log-top">
                              <span className="ql-alert-title">Service Receipt & Feedback</span>
                              <span className="ql-alert-channel wa">WhatsApp</span>
                            </div>
                            <span className="ql-alert-time">
                              {selectedUserDetail.status === "Completed"
                                ? "Delivered • Thank you sent"
                                : "Triggers upon fulfillment"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Gateway status & Backup Resend button */}
                      <div className="ql-alert-footer-box">
                        <div className="ql-gateway-indicator">
                          <span className="ql-gateway-dot" />
                          <span>Gateway: <strong>SMS & WhatsApp Active</strong></span>
                        </div>

                        <button
                          type="button"
                          className="ql-resend-backup-btn"
                          onClick={() => alert(`Emergency backup alert re-sent to ${selectedUserDetail.name} (${selectedUserDetail.phone})`)}
                          title="Click to re-send alert if customer reported network issue"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 4v6h-6" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                          <span>Resend Last Alert (Backup)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ql-tab-view">
                {usersError && (
                  <div
                    className="ql-admin-banner-alert"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#991b1b",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                      <span>⚠️</span>
                      <span>{usersError}</span>
                    </div>
                    <button
                      type="button"
                      className="ql-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px", background: "#fff" }}
                      onClick={fetchUsers}
                    >
                      ↻ Retry
                    </button>
                  </div>
                )}

                <div className="ql-tab-filter-bar">
                  <div className="ql-tab-filter-left">
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>User Status:</span>
                    <div className="ql-filter-pill-group">
                      {["All", "Active", "Suspended"].map((st) => (
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

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--admin-text-muted)" }}>
                      Total Users: {filteredUsers.length}
                    </span>
                    <button
                      type="button"
                      className="ql-btn-secondary"
                      style={{ padding: "5px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                      onClick={fetchUsers}
                      disabled={isUsersLoading}
                      title="Refresh users from server"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ animation: isUsersLoading ? "spin 1s linear infinite" : "none" }}
                      >
                        <path d="M23 4v6h-6" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <span>{isUsersLoading ? "Loading..." : "Refresh"}</span>
                    </button>
                  </div>
                </div>

                <div className="ql-card" style={{ flex: 1, minHeight: "350px" }}>
                  <div className="ql-table-container">
                    <table className="ql-owners-table">
                      <thead>
                        <tr>
                          <th style={{ width: "40px" }}>#</th>
                          <th>User Name</th>
                          <th>Email Address</th>
                          <th>Contact Number</th>
                          <th>Role</th>
                          <th style={{ textAlign: "center" }}>User ID</th>
                          <th>Address</th>
                          <th>Status</th>
                          <th>Joined Date</th>
                          <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isUsersLoading && usersData.length === 0 ? (
                          <tr>
                            <td colSpan="10" style={{ textAlign: "center", padding: "48px 0" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                <div className="ql-btn-spinner" style={{ width: "24px", height: "24px", borderWidth: "2.5px" }} />
                                <span style={{ color: "var(--admin-text-muted)", fontSize: "14px", fontWeight: "600" }}>
                                  Fetching users from database...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="10" style={{ textAlign: "center", padding: "48px 0" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--admin-text-muted)" }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--admin-text-main)" }}>No Users Found</span>
                                <span style={{ fontSize: "13px" }}>There are currently no users matching your filter or search.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user, index) => (
                            <tr key={user.id}>
                              <td>{index + 1}</td>
                              <td>
                                <div
                                  className="ql-owner-info"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setSelectedUserDetail(user)}
                                  title="Click to view full user profile"
                                >
                                  <span
                                    className="ql-owner-avatar"
                                    style={{
                                      backgroundColor: "#eff6ff",
                                      color: "#2563eb",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {user.avatarImg ? (
                                      <img src={user.avatarImg} alt={user.name} className="ql-avatar-fill-img" />
                                    ) : (
                                      user.name ? user.name.trim().charAt(0).toUpperCase() : (user.initial || "U")
                                    )}
                                  </span>
                                  <span className="ql-owner-name">{user.name}</span>
                                </div>
                              </td>
                              <td style={{ color: "var(--admin-text-muted)" }}>{user.email || "—"}</td>
                              <td>{user.phone || "—"}</td>
                              <td>
                                <span
                                  className="ql-badge-pill"
                                  style={{
                                    background:
                                      user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "super admin"
                                        ? "#fef3c7"
                                        : user.role?.toLowerCase() === "owner"
                                        ? "#e0e7ff"
                                        : "#f1f5f9",
                                    color:
                                      user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "super admin"
                                        ? "#b45309"
                                        : user.role?.toLowerCase() === "owner"
                                        ? "#4338ca"
                                        : "#475569",
                                    fontWeight: "700",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {user.role || "User"}
                                </span>
                              </td>
                              <td style={{ textAlign: "center", fontWeight: "800" }}>{user.token}</td>
                              <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={user.address}>
                                {user.address || "—"}
                              </td>
                              <td>
                                <span
                                  className={`ql-badge-pill ${
                                    user.status === "Active" || user.status === "Completed" || user.status === "Serving Now"
                                      ? "active"
                                      : user.status === "Waiting"
                                      ? "expiring"
                                      : "suspended"
                                  }`}
                                >
                                  <span className="dot" />
                                  {user.status}
                                </span>
                              </td>
                              <td>{user.joinedOn || user.bookedAt}</td>
                              <td>
                                <div className="ql-row-actions">
                                  <button
                                    type="button"
                                    className="ql-action-icon blue"
                                    title="View User Details"
                                    onClick={() => setSelectedUserDetail(user)}
                                  >
                                    👁️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}

          {/* ═════════ TAB 5: SUBSCRIPTIONS & PLAN TIERS HUB ═════════ */}
          {activeTab === "subscriptions" && (
            <div className="ql-subs-container">
              {/* 1. TOP METRIC STATS CARDS */}
              <div className="ql-subs-kpis-grid">
                <div className="ql-subs-kpi-card">
                  <div className="ql-subs-kpi-icon blue">₹</div>
                  <div className="ql-subs-kpi-info">
                    <span className="ql-subs-kpi-val">₹ 2,89,600</span>
                    <span className="ql-subs-kpi-lbl">Monthly Recurring Revenue (MRR)</span>
                    <span className="ql-subs-kpi-trend">↗ +14.2% this month</span>
                  </div>
                </div>

                <div className="ql-subs-kpi-card">
                  <div className="ql-subs-kpi-icon purple">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="ql-subs-kpi-info">
                    <span className="ql-subs-kpi-val">128 Stores</span>
                    <span className="ql-subs-kpi-lbl">Active Paid Subscribers</span>
                    <span className="ql-subs-kpi-trend">↗ +8 new subscriptions</span>
                  </div>
                </div>

                <div className="ql-subs-kpi-card">
                  <div className="ql-subs-kpi-icon green">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="ql-subs-kpi-info">
                    <span className="ql-subs-kpi-val">₹ 2,262 /mo</span>
                    <span className="ql-subs-kpi-lbl">Avg. Revenue / Account (ARPU)</span>
                    <span className="ql-subs-kpi-trend">↗ +4.8% growth</span>
                  </div>
                </div>

                <div className="ql-subs-kpi-card">
                  <div className="ql-subs-kpi-icon amber">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="ql-subs-kpi-info">
                    <span className="ql-subs-kpi-val">96.4%</span>
                    <span className="ql-subs-kpi-lbl">Subscription Retention Rate</span>
                    <span className="ql-subs-kpi-trend" style={{ color: "#3b82f6" }}>● Low Churn (3.6%)</span>
                  </div>
                </div>
              </div>

              {/* 2. CONTROLS & FILTER BAR */}
              <div className="ql-subs-controls-bar">
                <div className="ql-subs-tab-pills">
                  <button
                    type="button"
                    className={`ql-subs-tab-btn ${subsViewMode === "plans" ? "active" : ""}`}
                    onClick={() => setSubsViewMode("plans")}
                  >
                    <span>💳</span> Plan Tiers & Pricing
                  </button>
                  <button
                    type="button"
                    className={`ql-subs-tab-btn ${subsViewMode === "subscribers" ? "active" : ""}`}
                    onClick={() => setSubsViewMode("subscribers")}
                  >
                    <span>👥</span> Subscribed Owners ({subscribersList.length})
                  </button>
                </div>

                {subsViewMode === "plans" ? (
                  <div className="ql-subs-billing-toggle">
                    <span>Billing Interval:</span>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={`ql-cycle-pill-btn ${subsBillingCycle === "monthly" ? "active" : ""}`}
                        onClick={() => setSubsBillingCycle("monthly")}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        className={`ql-cycle-pill-btn ${subsBillingCycle === "annual" ? "active" : ""}`}
                        onClick={() => setSubsBillingCycle("annual")}
                      >
                        Annual Billing <span className="ql-save-badge">Save 20%</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="ql-filter-pill-group">
                      {["all", "starter", "growth", "enterprise"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`ql-filter-pill-btn ${subsPlanFilter === f ? "active" : ""}`}
                          onClick={() => setSubsPlanFilter(f)}
                          style={{ textTransform: "capitalize" }}
                        >
                          {f === "all" ? "All Plans" : f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. VIEW 1: PLAN TIERS & PRICING MATRIX */}
              {subsViewMode === "plans" && (
                <div className="ql-subs-plans-grid">
                  {subscriptionPlans.map((plan) => {
                    const price = subsBillingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
                    const period = subsBillingCycle === "annual" ? "/month (billed annually)" : "/month";

                    return (
                      <div key={plan.id} className={`ql-subs-plan-card ${plan.popular ? "popular" : ""}`}>
                        {plan.popular && <div className="ql-popular-ribbon">★ Most Popular Tier</div>}

                        <div>
                          <div className="ql-plan-top-header">
                            <div className={`ql-plan-icon-circle ${plan.colorScheme}`}>
                              {plan.icon}
                            </div>
                            <span
                              className={`ql-plan-pill ${plan.id}`}
                              style={{ fontSize: "11.5px", padding: "4px 10px" }}
                            >
                              {plan.subscribersCount} Active Stores
                            </span>
                          </div>

                          <h3 className="ql-plan-tier-name">{plan.name}</h3>
                          <p className="ql-plan-tagline">{plan.tagline}</p>

                          <div className="ql-plan-price-block">
                            <span className="ql-plan-amount">
                              {plan.currency} {price.toLocaleString()}
                            </span>
                            <span className="ql-plan-interval">{period}</span>
                          </div>

                          {subsBillingCycle === "annual" ? (
                            <div className="ql-plan-billed-note">
                              ✓ {plan.currency} {plan.annualTotal.toLocaleString()} billed once a year (2 months free)
                            </div>
                          ) : (
                            <div className="ql-plan-billed-note" style={{ color: "var(--admin-text-muted)" }}>
                              ● Flexible monthly billing, cancel anytime
                            </div>
                          )}

                          <div className="ql-plan-features-block">
                            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--admin-text-main)", marginBottom: "10px" }}>
                              What's Included:
                            </div>
                            {plan.features.map((feat, i) => (
                              <div key={i} className={`ql-plan-feature-item ${feat.included ? "included" : "excluded"}`}>
                                <span style={{ color: feat.included ? "#10b981" : "#94a3b8", fontWeight: "900", fontSize: "13px" }}>
                                  {feat.included ? "✓" : "✕"}
                                </span>
                                <span>{feat.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="ql-plan-card-ctas">
                          <button
                            type="button"
                            className="ql-btn-primary"
                            style={{ justifyContent: "center", fontSize: "12.5px", padding: "9px 14px" }}
                            onClick={() => setEditingPlanModal(plan)}
                          >
                            ✏️ Edit Plan Tier & Pricing
                          </button>
                          <button
                            type="button"
                            className="ql-btn-secondary"
                            style={{ justifyContent: "center", fontSize: "12px", padding: "8px 12px" }}
                            onClick={() => {
                              setSubsPlanFilter(plan.id);
                              setSubsViewMode("subscribers");
                            }}
                          >
                            👥 View Subscribed Stores &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. VIEW 2: SUBSCRIBED OWNERS DIRECTORY */}
              {subsViewMode === "subscribers" && (
                <div className="ql-subs-table-card">
                  <div className="ql-table-container">
                    <table className="ql-owners-table">
                      <thead>
                        <tr>
                          <th>Store Owner & Brand</th>
                          <th>Contact Details</th>
                          <th>Subscribed Plan</th>
                          <th>Billing Cycle</th>
                          <th>Amount</th>
                          <th>Renewal Date</th>
                          <th>Auto-Renew</th>
                          <th>Status</th>
                          <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribersList
                          .filter((sub) => subsPlanFilter === "all" || sub.planId === subsPlanFilter)
                          .map((sub) => (
                            <tr key={sub.id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <div
                                    className="ql-avatar-circle sm"
                                    style={{
                                      backgroundColor: sub.planId === "growth" ? "#8b5cf6" : sub.planId === "enterprise" ? "#10b981" : "#2563eb",
                                      color: "#fff",
                                      fontWeight: "800",
                                    }}
                                  >
                                    {sub.ownerName.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: "800", color: "var(--admin-text-main)" }}>{sub.ownerName}</div>
                                    <div style={{ fontSize: "11.5px", color: "var(--admin-blue)", fontWeight: "600" }}>{sub.shopName}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: "12px" }}>{sub.phone}</div>
                                <div style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>{sub.email}</div>
                              </td>
                              <td>
                                <span className={`ql-plan-pill ${sub.planId}`}>{sub.planName}</span>
                              </td>
                              <td>
                                <span style={{ fontWeight: "700", fontSize: "12px" }}>{sub.billingCycle}</span>
                              </td>
                              <td style={{ fontWeight: "800" }}>{sub.amount}</td>
                              <td style={{ fontSize: "12px", fontWeight: "600" }}>{sub.renewsOn}</td>
                              <td>
                                <span style={{ fontSize: "11.5px", fontWeight: "700", color: sub.autoRenew ? "#10b981" : "#f59e0b" }}>
                                  {sub.autoRenew ? "✓ Enabled" : "○ Manual"}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`ql-badge-pill ${
                                    sub.status === "Active" ? "active" : sub.status === "Expiring Soon" ? "expiring" : "suspended"
                                  }`}
                                >
                                  <span className="dot" />
                                  {sub.status}
                                </span>
                              </td>
                              <td>
                                <div className="ql-row-actions" style={{ justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    className="ql-btn-secondary"
                                    style={{ fontSize: "11.5px", padding: "5px 10px", gap: "4px" }}
                                    onClick={() => setChangeSubscriberModal(sub)}
                                    title="Upgrade or switch subscription tier"
                                  >
                                    ⚡ Change Tier
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                          adminProfile.name ? adminProfile.name.trim().charAt(0).toUpperCase() : "A"
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
                          <>
                            <button
                              type="button"
                              className="ql-photo-crop-btn"
                              onClick={() => {
                                setRawCropImage(adminProfile.avatarImg);
                                setCropModalOpen(true);
                              }}
                              title="Crop and reposition your profile picture"
                            >
                              ✂️ Crop & Adjust
                            </button>
                            <button type="button" className="ql-photo-remove-btn" onClick={handleRemoveAvatar}>
                              🗑️ Remove Photo
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="ql-photo-edit-modal-btn"
                          onClick={() => {
                            handleOpenEditAdminModal();
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
                      <span className="ql-admin-info-label">Address / Location</span>
                      <span className="ql-admin-info-value">{adminProfile.address || "Kolkata, WB"}</span>
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
                <div
                  className="ql-admin-hero-avatar"
                  style={{
                    backgroundColor: adminProfile.avatarBg,
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    minHeight: 44,
                    fontSize: 18,
                  }}
                >
                  {adminProfile.avatarImg ? (
                    <img src={adminProfile.avatarImg} alt={adminProfile.name} className="ql-avatar-fill-img" />
                  ) : (
                    adminProfile.name ? adminProfile.name.trim().charAt(0).toUpperCase() : "A"
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--admin-text-main)" }}>
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

            <div className="ql-modal-body" style={{ padding: "12px 18px", gap: "10px" }}>
              <div className="ql-admin-modal-banner" style={{ margin: "0 0 4px 0", paddingBottom: "8px" }}>
                <span className="ql-admin-modal-tag">🛡️ Root Access</span>
                <span className="ql-admin-modal-tag">✓ 2FA Verified</span>
                <span className="ql-admin-modal-tag">⚡ Full Clearance</span>
              </div>

              <div className="ql-admin-profile-compact-grid">
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Address</span>
                  <span className="info-val" title={adminProfile.address || "Kolkata, WB"}>{adminProfile.address || "Kolkata, WB"}</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Official Email</span>
                  <span className="info-val" title={adminProfile.email}>{adminProfile.email}</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Phone Number</span>
                  <span className="info-val">{adminProfile.phone}</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Department</span>
                  <span className="info-val" title={adminProfile.department}>{adminProfile.department}</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">System Role</span>
                  <span className="info-val" style={{ color: "var(--admin-blue)" }}>Super Admin</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Access Clearance</span>
                  <span className="info-val">{adminProfile.accessLevel}</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Security 2FA</span>
                  <span className="info-val" style={{ color: "var(--admin-green)" }}>● {adminProfile.twoFactor}</span>
                </div>
                <div className="ql-profile-info-card">
                  <span className="info-lbl">Registration Date</span>
                  <span className="info-val">{adminProfile.joinedOn}</span>
                </div>
                <div className="ql-profile-info-card" style={{ gridColumn: "span 2" }}>
                  <span className="info-lbl">Last Active Session</span>
                  <span className="info-val">{adminProfile.lastLogin}</span>
                </div>
                <div className="ql-profile-info-card" style={{ gridColumn: "span 2" }}>
                  <span className="info-lbl">Bio & Responsibilities</span>
                  <span className="info-val" style={{ fontSize: "11px", lineHeight: "1.35", fontWeight: "500", color: "var(--admin-text-sub)", whiteSpace: "normal" }}>
                    {adminProfile.bio}
                  </span>
                </div>
              </div>
            </div>

            <div className="ql-modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="ql-btn-primary"
                style={{ background: "var(--admin-blue-light)", color: "var(--admin-blue)", border: "1px solid var(--admin-blue)" }}
                onClick={() => {
                  setAdminProfileModalOpen(false);
                  handleOpenEditAdminModal();
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
                      editAdminForm.name ? editAdminForm.name.trim().charAt(0).toUpperCase() : "A"
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
                        <>
                          <button
                            type="button"
                            className="ql-photo-crop-btn"
                            onClick={() => {
                              setRawCropImage(editAdminForm.avatarImg);
                              setCropModalOpen(true);
                            }}
                            title="Crop and adjust photo"
                          >
                            ✂️ Crop & Adjust
                          </button>
                          <button type="button" className="ql-photo-remove-btn" onClick={handleRemoveAvatar}>
                            🗑️ Remove Photo
                          </button>
                        </>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <label className="ql-form-label" style={{ margin: 0 }}>Official Email Address</label>
                      <span style={{ fontSize: "11px", color: "var(--admin-text-muted, #64748b)", display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: "600" }}>
                        🔒 Read-only
                      </span>
                    </div>
                    <input
                      type="email"
                      className="ql-form-input"
                      value={editAdminForm.email}
                      readOnly
                      disabled
                      title="Official Email Address cannot be changed"
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="ql-form-input"
                      value={editAdminForm.phone || ""}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Address / Location</label>
                    <input
                      type="text"
                      className="ql-form-input"
                      value={editAdminForm.address || ""}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, address: e.target.value })}
                      placeholder="e.g. Kolkata, WB"
                    />
                  </div>

                  <div>
                    <label className="ql-form-label">Department / Designation</label>
                    <input
                      type="text"
                      className="ql-form-input"
                      value={editAdminForm.department || ""}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, department: e.target.value })}
                      placeholder="e.g. System Architecture & Operations"
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
                      value={editAdminForm.bio || ""}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, bio: e.target.value })}
                      placeholder="Enter administrator responsibilities and bio..."
                    />
                  </div>
                </div>

                {adminProfileError && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>⚠️</span>
                    <span>{adminProfileError}</span>
                  </div>
                )}
              </div>

              <div className="ql-modal-footer" style={{ gap: "10px" }}>
                <button
                  type="button"
                  className="ql-btn-close"
                  onClick={() => setEditAdminModalOpen(false)}
                  disabled={isSavingAdminProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ql-btn-primary"
                  disabled={isSavingAdminProfile}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  {isSavingAdminProfile ? (
                    <>
                      <span className="ql-btn-spinner" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>💾 Save Profile & Photo</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD OWNER MODAL (PREMIUM REDESIGN) ─────────────────── */}
      {addOwnerModalOpen && (
        <div className="ql-premium-modal-backdrop" onClick={() => {
          setAddOwnerModalOpen(false);
          setAddOwnerError("");
        }}>
          <div className="ql-premium-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-accent-line" />

            {/* Modal Header */}
            <div className="ql-premium-modal-header">
              <div className="ql-modal-header-left">
                <div className="ql-modal-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div className="ql-modal-title-wrap">
                  <h3>Add New Owner</h3>
                  <p>Register a new verified business merchant &amp; setup counter queues</p>
                </div>
              </div>
              <button
                type="button"
                className="ql-premium-close-btn"
                onClick={() => {
                  setAddOwnerModalOpen(false);
                  setAddOwnerError("");
                }}
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Live Interactive Preview Strip */}
            <div className="ql-modal-preview-strip">
              <div className="ql-preview-left">
                <div className="ql-preview-avatar">
                  {newOwnerForm.name ? newOwnerForm.name.trim().charAt(0).toUpperCase() : "O"}
                </div>
                <div>
                  <div className="ql-preview-info-name">
                    {newOwnerForm.name || "Owner Name Preview"}
                  </div>
                  <div className="ql-preview-info-sub">
                    {(newOwnerForm.email ? newOwnerForm.email + " • " : "email@domain.com • ") + "Verified Merchant Setup"}
                  </div>
                </div>
              </div>
              <span className="ql-preview-badge">
                <span style={{ fontSize: "10px" }}>●</span>
                <span>Enterprise Ready</span>
              </span>
            </div>

            <form onSubmit={handleAddOwnerSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
              {/* Neutralize browser credential autofill targeting address/password */}
              <div style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0, overflow: "hidden" }}>
                <input type="text" name="fake_user_remembered" tabIndex={-1} autoComplete="off" />
                <input type="password" name="fake_pwd_remembered" tabIndex={-1} autoComplete="off" />
              </div>

              {addOwnerError && (
                <div style={{
                  margin: "8px 16px 0",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0
                }}>
                  <span>⚠️</span>
                  <span>{addOwnerError}</span>
                </div>
              )}

              <div className="ql-premium-modal-body">
                {/* Row 1: Owner Name & Email Address */}
                <div className="ql-modern-grid-2">
                  <div className="ql-input-group-modern">
                    <label className="ql-input-label-modern">
                      <span>Owner Name</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="ql-input-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        name="new_owner_name_field"
                        autoComplete="off"
                        required
                        className="ql-input-modern"
                        value={newOwnerForm.name}
                        onChange={(e) => {
                          setNewOwnerForm({ ...newOwnerForm, name: e.target.value });
                          if (addOwnerError) setAddOwnerError("");
                        }}
                        placeholder="e.g. Ramesh Kumar"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="ql-input-group-modern">
                    <label className="ql-input-label-modern">
                      <span>Email Address</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="ql-input-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <input
                        type="email"
                        name="new_owner_email_field"
                        autoComplete="off"
                        required
                        className="ql-input-modern"
                        value={newOwnerForm.email}
                        onChange={(e) => {
                          setNewOwnerForm({ ...newOwnerForm, email: e.target.value });
                          if (addOwnerError) setAddOwnerError("");
                        }}
                        placeholder="e.g. ramesh@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone Number & Joined Date */}
                <div className="ql-modern-grid-2">
                  <div className="ql-input-group-modern">
                    <label className="ql-input-label-modern">
                      <span>Phone Number</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="ql-input-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        type="tel"
                        name="new_owner_phone_field"
                        autoComplete="off"
                        required
                        className="ql-input-modern"
                        value={newOwnerForm.phone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setNewOwnerForm({ ...newOwnerForm, phone: digitsOnly });
                          if (addOwnerError) setAddOwnerError("");
                        }}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="ql-input-group-modern">
                    <label className="ql-input-label-modern">
                      <span>Joined Date</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="ql-input-icon-box">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <input
                        type="date"
                        name="new_owner_date_field"
                        autoComplete="off"
                        required
                        className="ql-input-modern"
                        value={newOwnerForm.joinedDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          const val = e.target.value;
                          const today = new Date().toISOString().split("T")[0];
                          if (val && val > today) {
                            setAddOwnerError("Joined Date cannot be in the future (cannot exceed today).");
                            return;
                          }
                          setNewOwnerForm({ ...newOwnerForm, joinedDate: val });
                          if (addOwnerError) setAddOwnerError("");
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Address (Full Width) */}
                <div className="ql-input-group-modern">
                  <label className="ql-input-label-modern">
                    <span>Address</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="ql-input-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      type="text"
                      name="new_owner_address_field"
                      id="new_owner_address_field"
                      autoComplete="street-address"
                      required
                      className="ql-input-modern"
                      value={newOwnerForm.address}
                      onChange={(e) => {
                        setNewOwnerForm({ ...newOwnerForm, address: e.target.value });
                        if (addOwnerError) setAddOwnerError("");
                      }}
                      placeholder="e.g. 12, Main Road, Contai, Purba Medinipur, West Bengal"
                    />
                  </div>
                </div>

                {/* Box: Create Login Credentials */}
                <div className="ql-cred-box">
                  <div className="ql-cred-header">
                    <div className="ql-cred-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div>
                      <div className="ql-cred-title">Create Login Credentials</div>
                      <div className="ql-cred-subtitle">Set the login password for the new owner account.</div>
                    </div>
                  </div>

                  <div className="ql-modern-grid-2">
                    <div className="ql-input-group-modern">
                      <label className="ql-input-label-modern">
                        <span>Password</span>
                        <span className="required-star">*</span>
                      </label>
                      <div className="ql-input-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          type={showAddOwnerPassword ? "text" : "password"}
                          name="new_owner_credential_password"
                          id="new_owner_credential_password"
                          autoComplete="new-password"
                          required
                          className="ql-input-modern"
                          style={{ paddingRight: "36px" }}
                          value={newOwnerForm.password}
                          onChange={(e) => {
                            setNewOwnerForm({ ...newOwnerForm, password: e.target.value });
                            if (addOwnerError) setAddOwnerError("");
                          }}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="ql-input-eye-btn"
                          onClick={() => setShowAddOwnerPassword(!showAddOwnerPassword)}
                          tabIndex={-1}
                          title={showAddOwnerPassword ? "Hide password" : "Show password"}
                        >
                          {showAddOwnerPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                              <line x1="2" y1="22" x2="22" y2="2" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="ql-input-group-modern">
                      <label className="ql-input-label-modern">
                        <span>Confirm Password</span>
                        <span className="required-star">*</span>
                      </label>
                      <div className="ql-input-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                          type={showAddOwnerConfirmPassword ? "text" : "password"}
                          name="new_owner_credential_confirm"
                          id="new_owner_credential_confirm"
                          autoComplete="new-password"
                          required
                          className="ql-input-modern"
                          style={{ paddingRight: "36px" }}
                          value={newOwnerForm.confirmPassword}
                          onChange={(e) => {
                            setNewOwnerForm({ ...newOwnerForm, confirmPassword: e.target.value });
                            if (addOwnerError) setAddOwnerError("");
                          }}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          className="ql-input-eye-btn"
                          onClick={() => setShowAddOwnerConfirmPassword(!showAddOwnerConfirmPassword)}
                          tabIndex={-1}
                          title={showAddOwnerConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showAddOwnerConfirmPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                              <line x1="2" y1="22" x2="22" y2="2" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength & Policy Hint */}
                  <div className="ql-cred-footer-bar">
                    <div className="ql-cred-strength-wrap" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="ql-cred-strength-lbl">Password Strength:</span>
                      <div className="ql-cred-strength-bars">
                        {[1, 2, 3, 4].map((step) => {
                          const strength = getOwnerPasswordStrength(newOwnerForm.password);
                          const isActive = strength >= step;
                          let barColor = "#cbd5e1";
                          if (isActive) {
                            if (strength <= 1) barColor = "#ef4444";
                            else if (strength === 2) barColor = "#f97316";
                            else if (strength === 3) barColor = "#eab308";
                            else barColor = "#22c55e";
                          }
                          return (
                            <span
                              key={step}
                              className="ql-cred-strength-bar"
                              style={{ backgroundColor: barColor }}
                            />
                          );
                        })}
                      </div>
                      {(() => {
                        const strength = getOwnerPasswordStrength(newOwnerForm.password);
                        if (!newOwnerForm.password) return null;
                        if (strength <= 1) return <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: "700" }}>Weak</span>;
                        if (strength === 2) return <span style={{ color: "#f97316", fontSize: "11px", fontWeight: "700" }}>Fair</span>;
                        if (strength === 3) return <span style={{ color: "#eab308", fontSize: "11px", fontWeight: "700" }}>Good</span>;
                        return <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: "700" }}>Strong ✓</span>;
                      })()}
                    </div>

                    <div className="ql-cred-divider" />

                    <div className="ql-cred-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>
                        {getOwnerPasswordStrength(newOwnerForm.password) === 4
                          ? "✓ Strong password set. Register button is unlocked."
                          : "Register button is locked until password is Strong (min 8 chars, uppercase, lowercase, number, and special character)."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="ql-premium-modal-footer">
                <div className="ql-modal-footer-note">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  <span>Encrypted merchant registration</span>
                </div>
                <div className="ql-modal-footer-btns">
                  <button
                    type="button"
                    className="ql-btn-secondary-modern"
                    onClick={() => {
                      setAddOwnerModalOpen(false);
                      setAddOwnerError("");
                    }}
                    disabled={isAddingOwner}
                  >
                    Cancel
                  </button>
                  {(() => {
                    const isPasswordStrong = getOwnerPasswordStrength(newOwnerForm.password) === 4;
                    const canSubmit = !isAddingOwner && isPasswordStrong;
                    return (
                      <button
                        type="submit"
                        className="ql-btn-primary-modern"
                        disabled={!canSubmit}
                        style={{
                          opacity: canSubmit ? 1 : 0.55,
                          cursor: isAddingOwner ? "wait" : !isPasswordStrong ? "not-allowed" : "pointer",
                        }}
                        title={
                          !isPasswordStrong
                            ? "Password must be Strong before you can register"
                            : "Click to register owner"
                        }
                      >
                        {isAddingOwner ? (
                          <>
                            <span
                              style={{
                                display: "inline-block",
                                width: "14px",
                                height: "14px",
                                border: "2px solid rgba(255,255,255,0.4)",
                                borderTopColor: "#ffffff",
                                borderRadius: "50%",
                                animation: "qlModalSpin 0.7s linear infinite",
                              }}
                            />
                            <span>Registering on Server...</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Register Owner</span>
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT SUBSCRIPTION PLAN TIER MODAL ─────────────────── */}
      {editingPlanModal && (
        <div className="ql-modal-backdrop-modern" onClick={() => setEditingPlanModal(null)}>
          <div className="ql-modal-card-modern" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header-modern">
              <div className="ql-modal-header-left">
                <div className="ql-modal-header-icon blue">✏️</div>
                <div>
                  <h3 className="ql-modal-title-modern">Edit Plan Tier & Pricing</h3>
                  <p className="ql-modal-sub-modern">Update pricing, tagline and quotas for this subscription tier.</p>
                </div>
              </div>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setEditingPlanModal(null)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEditedPlan(editingPlanModal);
              }}
              className="ql-modal-form-modern"
            >
              <div className="ql-modal-body-scrollable">
                <div className="ql-input-group-modern">
                  <label className="ql-input-label-modern">Plan Tier Name</label>
                  <input
                    type="text"
                    required
                    className="ql-input-modern"
                    value={editingPlanModal.name}
                    onChange={(e) => setEditingPlanModal({ ...editingPlanModal, name: e.target.value })}
                  />
                </div>

                <div className="ql-input-group-modern">
                  <label className="ql-input-label-modern">Tagline Description</label>
                  <input
                    type="text"
                    required
                    className="ql-input-modern"
                    value={editingPlanModal.tagline}
                    onChange={(e) => setEditingPlanModal({ ...editingPlanModal, tagline: e.target.value })}
                  />
                </div>

                <div className="ql-modern-grid-2">
                  <div className="ql-input-group-modern">
                    <label className="ql-input-label-modern">Monthly Price (₹ /mo)</label>
                    <input
                      type="number"
                      required
                      className="ql-input-modern"
                      value={editingPlanModal.monthlyPrice}
                      onChange={(e) => setEditingPlanModal({ ...editingPlanModal, monthlyPrice: Number(e.target.value) })}
                    />
                  </div>

                  <div className="ql-input-group-modern">
                    <label className="ql-input-label-modern">Annual Price (₹ /mo billed yr)</label>
                    <input
                      type="number"
                      required
                      className="ql-input-modern"
                      value={editingPlanModal.annualPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditingPlanModal({
                          ...editingPlanModal,
                          annualPrice: val,
                          annualTotal: val * 12,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="ql-input-group-modern">
                  <label className="ql-input-label-modern">Active Subscribers (Stores)</label>
                  <input
                    type="number"
                    className="ql-input-modern"
                    value={editingPlanModal.subscribersCount}
                    onChange={(e) => setEditingPlanModal({ ...editingPlanModal, subscribersCount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="ql-premium-modal-footer">
                <div className="ql-modal-footer-note">
                  <span>Changes apply to new and upcoming renewals.</span>
                </div>
                <div className="ql-modal-footer-btns">
                  <button
                    type="button"
                    className="ql-btn-secondary-modern"
                    onClick={() => setEditingPlanModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ql-btn-primary-modern">
                    ✓ Save Plan Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CHANGE SUBSCRIBER TIER MODAL ────────────────────────── */}
      {changeSubscriberModal && (
        <div className="ql-modal-backdrop-modern" onClick={() => setChangeSubscriberModal(null)}>
          <div className="ql-modal-card-modern" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ql-modal-header-modern">
              <div className="ql-modal-header-left">
                <div className="ql-modal-header-icon purple">⚡</div>
                <div>
                  <h3 className="ql-modal-title-modern">Change Subscription Tier</h3>
                  <p className="ql-modal-sub-modern">
                    Upgrade or switch tier for <strong>{changeSubscriberModal.ownerName}</strong> ({changeSubscriberModal.shopName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ql-modal-close-btn"
                onClick={() => setChangeSubscriberModal(null)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const newPlanId = form.selectedPlan.value;
                const newCycle = form.selectedCycle.value;
                handleChangeSubscriberPlan(changeSubscriberModal.id, newPlanId, newCycle);
              }}
              className="ql-modal-form-modern"
            >
              <div className="ql-modal-body-scrollable">
                <div className="ql-input-group-modern">
                  <label className="ql-input-label-modern">Select Subscription Tier</label>
                  <select
                    name="selectedPlan"
                    defaultValue={changeSubscriberModal.planId}
                    className="ql-input-modern"
                    style={{ cursor: "pointer", fontWeight: "700" }}
                  >
                    {subscriptionPlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.monthlyPrice}/mo (₹{p.annualTotal}/yr)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ql-input-group-modern">
                  <label className="ql-input-label-modern">Select Billing Cycle</label>
                  <select
                    name="selectedCycle"
                    defaultValue={changeSubscriberModal.billingCycle.toLowerCase()}
                    className="ql-input-modern"
                    style={{ cursor: "pointer", fontWeight: "700" }}
                  >
                    <option value="monthly">Monthly Billing</option>
                    <option value="annual">Annual Billing (20% Discounted)</option>
                  </select>
                </div>

                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "var(--admin-hover-bg, #f8fafc)", border: "1px solid var(--admin-border-subtle, #e2e8f0)", fontSize: "12px", color: "var(--admin-text-muted)" }}>
                  💡 Plan change will take effect immediately. Customer's renewal date and billing will adjust automatically.
                </div>
              </div>

              <div className="ql-premium-modal-footer">
                <button
                  type="button"
                  className="ql-btn-secondary-modern"
                  onClick={() => setChangeSubscriberModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="ql-btn-primary-modern">
                  ✓ Confirm Plan Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE PROFILE IMAGE CROP MODAL ────────────────── */}
      <AdminImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawCropImage}
        userName={cropTarget?.type === "owner" ? (detailModalOwner?.name || "Owner") : adminProfile.name}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {/* ── GLOBAL FLOATING TOAST NOTIFICATION ──────────────────── */}
      {dashboardToast && (
        <div className={`ql-floating-toast ${dashboardToast.type || "success"}`}>
          <span className="ql-toast-icon">
            {dashboardToast.type === "error" ? "⚠️" : "✓"}
          </span>
          <span className="ql-toast-text">{dashboardToast.message}</span>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
