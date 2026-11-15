// Admin Data & API Configuration
export const OWNERS_API_URL =
  import.meta.env.VITE_OWNERS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/admin/owners/all`;

export const ADD_OWNER_API_URL =
  import.meta.env.VITE_ADD_OWNER_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/add`;

export const OWNER_STATUS_API_URL =
  import.meta.env.VITE_OWNER_STATUS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/status`;

export const OWNER_DELETE_API_URL =
  import.meta.env.VITE_OWNER_DELETE_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/delete`;

export const OWNER_UPDATE_API_URL =
  import.meta.env.VITE_OWNER_UPDATE_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/update`;

export const USER_UPDATE_API_URL =
  import.meta.env.VITE_USER_UPDATE_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/user/update`;

export const ALL_USERS_API_URL =
  import.meta.env.VITE_ALL_USERS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/admin/users/all`;

export const ALL_SHOPS_API_URL =
  import.meta.env.VITE_SHOPS_API_URL ||
  `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/admin/shops/all`;

export const STAT_METRICS = [
  { id: "owners", label: "Total Owners", value: "128", trend: "+12%", context: "from last month" },
  { id: "shops", label: "Total Shops", value: "342", trend: "+18%", context: "from last month" },
  { id: "users", label: "Total Users", value: "12,480", trend: "+25%", context: "from last month" },
  { id: "revenue", label: "Total Revenue", value: "₹ 2,45,680", trend: "+32%", context: "from last month" },
  { id: "subs", label: "Active Subscriptions", value: "96", trend: "+15%", context: "from last month" },
];

export const TOP_SHOPS = [
  { rank: 1, name: "Coffee Hub", owner: "Ananya Das", users: 128, max: 128 },
  { rank: 2, name: "Tasty Bites", owner: "Rahul Sen", users: 96, max: 128 },
  { rank: 3, name: "Quick Care Clinic", owner: "Priya Ghosh", users: 84, max: 128 },
  { rank: 4, name: "FitLife Gym", owner: "Sujit Paul", users: 72, max: 128 },
  { rank: 5, name: "Book Nook", owner: "Arjun Roy", users: 68, max: 128 },
];

export const REVENUE_BARS = [
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

export const ALL_SHOPS_DATA = [];

export const SUBSCRIPTION_PLANS = [
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

export const DEFAULT_SUBSCRIBERS_DATA = [
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

export const TRANSACTIONS_DATA = [
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

export const TIMELINE_ACTIVITIES = [
  { id: 1, title: "New shop owner registered", desc: "Sujit Kar registered merchant account", time: "Just now" },
  { id: 2, title: "Shop queue token created", desc: "Coffee Hub processed token QL-042", time: "15 mins ago" },
  { id: 3, title: "Subscription renewed", desc: "Ananya Das renewed Pro Growth plan", time: "2 hours ago" },
  { id: 4, title: "User verified check-in", desc: "Arpita Jana checked into queue", time: "4 hours ago" },
  { id: 5, title: "Payment cleared", desc: "₹ 24,990 received via UPI", time: "1 day ago" },
];

export function mapApiOwnerToDashboard(apiOwner) {
  const id = Number(apiOwner.owner_id ?? apiOwner.id ?? 0);
  const name = (apiOwner.full_name || apiOwner.name || "").trim() || "Owner";
  const initial = name ? name.charAt(0).toUpperCase() : "O";
  const avatarImg = apiOwner.profile_image || apiOwner.avatarImg || null;
  const email = apiOwner.email || "";
  const phone = apiOwner.phone || "N/A";
  const address = apiOwner.address || "N/A";
  const shops = Number(
    apiOwner.shop_count ??
    (Array.isArray(apiOwner.shops) ? apiOwner.shops.length : apiOwner.shops) ??
    (Array.isArray(apiOwner.shop_details) ? apiOwner.shop_details.length : 0) ??
    0
  );
  const maxShops =
    apiOwner.max_shop_count !== undefined && apiOwner.max_shop_count !== null
      ? Number(apiOwner.max_shop_count)
      : 0;
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

  let parsedShopDetails = [];
  if (Array.isArray(apiOwner.shops) && apiOwner.shops.length > 0) {
    parsedShopDetails = apiOwner.shops;
  } else if (apiOwner.shop_details) {
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
    avatarImg,
    email,
    phone,
    address,
    shops,
    maxShops,
    status,
    joinedOn,
    plan: "",
    city: address && address !== "N/A" ? address : "—",
    kycStatus: "KYC Verified",
    billingCycle: "Standard",
    totalTokens: shops,
    monthlyRevenue: "₹ 0",
    lastActive: "Today",
    notes: "",
    shopDetails: apiOwner.shop_details,
    parsedShopDetails,
  };
}

export function getRoleBadgeClass(role) {
  const r = (role || "").toLowerCase().trim();
  if (r.includes("admin")) return "adm-badge-role-admin";
  if (r.includes("owner")) return "adm-badge-role-owner";
  return "adm-badge-role-user";
}

export function isRegularUser(user, ownersList = []) {
  if (!user) return false;

  const email = String(user.email || "").toLowerCase().trim();
  const name = String(user.name || user.full_name || user.fullname || "").toLowerCase().trim();
  const r = String(user.role || "").toLowerCase().trim();
  const rawRole =
    user.user_role !== undefined
      ? user.user_role
      : user.rawUser?.user_role !== undefined
      ? user.rawUser.user_role
      : user.role_id;
  const roleNum = Number(rawRole);

  // 1. Exclude Admin
  if (
    roleNum === 1 ||
    r === "admin" ||
    r === "super admin" ||
    email === "admin@gmail.com" ||
    email.startsWith("admin@") ||
    name === "admin"
  ) {
    return false;
  }

  // 2. Exclude Shop Owner by role / email
  if (
    roleNum === 3 ||
    r === "owner" ||
    r === "shop owner" ||
    email.includes(".owner@")
  ) {
    return false;
  }

  // 3. Exclude if present in registered owners list
  let owners = Array.isArray(ownersList) && ownersList.length > 0 ? ownersList : [];
  if (owners.length === 0) {
    try {
      const saved = localStorage.getItem("ql_admin_owners_list");
      if (saved) owners = JSON.parse(saved) || [];
    } catch (_) {}
  }

  if (owners.length > 0) {
    const isOwner = owners.some((o) => {
      const oEmail = String(o.email || "").toLowerCase().trim();
      const oPhone = String(o.phone || "").replace(/\D/g, "");
      const uPhone = String(user.phone || "").replace(/\D/g, "");
      const oId = Number(o.id || o.owner_id);
      const uId = Number(user.id || user.user_id);

      return (
        (oEmail && email && oEmail === email) ||
        (oPhone && uPhone && oPhone.length >= 10 && oPhone === uPhone) ||
        (oId > 0 && uId > 0 && oId === uId && o.name?.toLowerCase() === name)
      );
    });

    if (isOwner) return false;
  }

  return true;
}

export function mapApiUserToDashboard(apiUser) {
  const id = Number(apiUser.user_id ?? apiUser.userid ?? apiUser.id ?? 0);
  const name = (apiUser.full_name || apiUser.fullname || apiUser.name || "").trim() || "User";
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  const avatarImg = apiUser.profile_image || apiUser.profileimage || apiUser.avatarImg || null;
  const email = (apiUser.email || "").trim().toLowerCase();
  const phone = apiUser.phone || "N/A";
  const address = apiUser.address || "N/A";

  // Determine user role (1 = Admin, 3 = Shop Owner, 2 = Customer/User)
  let role = "User";
  const rawRole = apiUser.user_role !== undefined ? apiUser.user_role : apiUser.role_id;
  const roleNum = Number(rawRole);
  const roleStr = String(apiUser.role || apiUser.role_name || "").toLowerCase().trim();

  // Check if this user is in cached owners list
  let isOwnerFromList = false;
  try {
    const savedOwners = JSON.parse(localStorage.getItem("ql_admin_owners_list") || "[]");
    if (Array.isArray(savedOwners)) {
      isOwnerFromList = savedOwners.some(
        (o) => o.email && email && o.email.toLowerCase().trim() === email
      );
    }
  } catch (_) {}

  if (
    roleNum === 1 ||
    roleStr === "admin" ||
    roleStr === "super admin" ||
    email === "admin@gmail.com" ||
    email.startsWith("admin@") ||
    name.toLowerCase() === "admin"
  ) {
    role = "Admin";
  } else if (
    roleNum === 3 ||
    roleStr === "owner" ||
    roleStr === "shop owner" ||
    email.includes(".owner@") ||
    isOwnerFromList
  ) {
    role = "Owner";
  } else if (roleNum === 2 || roleStr === "user" || roleStr === "customer") {
    role = "User";
  } else if (apiUser.role && typeof apiUser.role === "string" && apiUser.role.trim()) {
    role = apiUser.role.trim();
  }
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
    shop: "General Queue",
    counter: "General Desk",
    serviceType: apiUser.email_verified || apiUser.isemailverified ? "Verified Member" : "Registered User",
    position: 0,
    approxWait: status === "Active" ? "Active Now" : "Inactive",
    status,
    bookedAt: joinedOn,
    joinedOn,
    joinedVia: "QueueLess Portal",
    notes: `Registered user in QueueLess database.`,
    emailVerified: Boolean(apiUser.email_verified || apiUser.isemailverified),
    rawUser: apiUser,
  };
}

export function getOwnerPasswordStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  return score;
}

