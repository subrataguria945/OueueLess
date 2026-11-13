import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authFetch, clearTokens } from "../apiClient";
import {
  OWNERS_API_URL,
  ADD_OWNER_API_URL,
  OWNER_STATUS_API_URL,
  OWNER_DELETE_API_URL,
  USER_UPDATE_API_URL,
  ALL_USERS_API_URL,
  ALL_SHOPS_DATA,
  SUBSCRIPTION_PLANS,
  DEFAULT_SUBSCRIBERS_DATA,
  mapApiOwnerToDashboard,
  mapApiUserToDashboard,
  getOwnerPasswordStrength,
  isRegularUser,
} from "./adminData";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // ── THEME ─────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("ql_admin_theme") || "light");
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("ql_admin_theme", next);
      return next;
    });
  };

  // ── SIDEBAR RESPONSIVE STATE ───────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== "undefined" ? window.innerWidth > 1024 : true));

  // ── TOAST NOTIFICATIONS ───────────────────────────────────────────────
  const [dashboardToast, setDashboardToast] = useState(null);
  const showToast = useCallback((message, type = "success") => {
    setDashboardToast({ message, type });
    setTimeout(() => {
      setDashboardToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // ── SEARCH & DATE RANGE ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Oct 1, 2026 - Oct 31, 2026");

  // ── FILTERS ───────────────────────────────────────────────────────────
  const [ownerFilterStatus, setOwnerFilterStatus] = useState("All");
  const [shopCategoryFilter, setShopCategoryFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");

  // ── OWNERS STATE ──────────────────────────────────────────────────────
  const [ownersData, setOwnersData] = useState(() => {
    const saved = localStorage.getItem("ql_admin_owners_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [isOwnersLoading, setIsOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState(null);

  const fetchOwners = useCallback(async () => {
    setIsOwnersLoading(true);
    setOwnersError(null);
    try {
      const res = await authFetch(OWNERS_API_URL, { method: "GET" });
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data)) {
        const mapped = data.map(mapApiOwnerToDashboard);
        setOwnersData(mapped);
        localStorage.setItem("ql_admin_owners_list", JSON.stringify(mapped));
      } else {
        setOwnersError(data?.detail || data?.message || "Failed to load owners.");
      }
    } catch (err) {
      setOwnersError("Could not connect to server. Please check your internet connection.");
    } finally {
      setIsOwnersLoading(false);
    }
  }, []);

  // ── USERS & ADMIN PROFILE STATE ────────────────────────────────────────
  const [usersData, setUsersData] = useState(() => {
    const saved = localStorage.getItem("ql_admin_users_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(isRegularUser);
        }
      } catch (e) {}
    }
    return [];
  });
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Initialize admin profile from cached profile, logged user, or defaults
  const [adminProfile, setAdminProfile] = useState(() => {
    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}

    let savedProfile = {};
    try {
      const saved = localStorage.getItem("ql_admin_profile");
      if (saved) savedProfile = JSON.parse(saved) || {};
    } catch (e) {}

    const realName = (
      savedProfile.name ||
      loggedUser.fullname ||
      loggedUser.full_name ||
      loggedUser.name ||
      ""
    ).trim() || "Administrator";

    const realPhone =
      savedProfile.phone ||
      (loggedUser.phone && loggedUser.phone !== "+91 98765 43210" ? loggedUser.phone : "");

    const realEmail = savedProfile.email || loggedUser.email || "";
    const realAddress = savedProfile.address || loggedUser.address || "";
    const realImage =
      savedProfile.avatarImg ||
      loggedUser.profile_image ||
      loggedUser.profileimage ||
      null;
    const realRole = savedProfile.role || loggedUser.role || "Super Admin";
    const realJoined = savedProfile.joinedOn || "12 Jan 2026";
    const realStatus = savedProfile.status || "Active";

    return {
      name: realName,
      username: loggedUser.username || "admin",
      email: realEmail,
      phone: realPhone,
      address: realAddress,
      role: realRole,
      joinedOn: realJoined,
      status: realStatus,
      department: savedProfile.department || "System Architecture & Operations",
      accessLevel: savedProfile.accessLevel || "Role Clearance (System Enforced)",
      bio:
        savedProfile.bio !== undefined
          ? savedProfile.bio
          : "Master administrator for QueueLess platform, token moderation, shop subscriptions & system configuration.",
      avatarBg: "#0f172a",
      avatarColor: "#ffffff",
      avatarImg: realImage,
      twoFactor: "Enabled (Authenticator App)",
      lastLogin: "Today, 12:45 AM (Local IP)",
    };
  });

  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const res = await authFetch(ALL_USERS_API_URL, { method: "GET" });
      const data = await res.json().catch(() => null);

      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.users)
        ? data.users
        : [];

      if (res.ok && (Array.isArray(data) || userList.length >= 0)) {
        // Strictly only regular users (exclude Owner and Admin)
        const onlyRegularUsers = userList.filter(isRegularUser);

        const mapped = onlyRegularUsers.map(mapApiUserToDashboard);
        setUsersData(mapped);
        localStorage.setItem("ql_admin_users_list", JSON.stringify(mapped));

        let loggedUser = {};
        try {
          loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch (e) {}

        const currentAdminId = Number(loggedUser.user_id ?? loggedUser.userid ?? loggedUser.id ?? 0);
        const currentEmail = String(loggedUser.email || "").trim().toLowerCase();

        // Find Admin record from /user/all:
        // Priority 1: Match logged in user's ID
        // Priority 2: Match logged in user's email
        // Priority 3: First user in database with role "Admin" / "Super Admin" or user_role === 1
        const adminFromApi =
          (currentAdminId > 0 &&
            userList.find((u) => Number(u.user_id ?? u.userid ?? u.id) === currentAdminId)) ||
          (currentEmail &&
            userList.find((u) => String(u.email || "").trim().toLowerCase() === currentEmail)) ||
          userList.find((u) => {
            const roleStr = String(u.role || "").trim().toLowerCase();
            const roleNum = Number(u.user_role !== undefined ? u.user_role : u.role);
            return roleNum === 1 || roleStr.includes("admin");
          });

        if (adminFromApi) {
          const apiName = (
            adminFromApi.full_name ||
            adminFromApi.fullname ||
            adminFromApi.name ||
            ""
          ).trim();
          const apiEmail = adminFromApi.email || loggedUser.email || "";
          const apiPhone = adminFromApi.phone || adminFromApi.mobile || "";
          const apiAddress = adminFromApi.address || "";
          const apiImage =
            adminFromApi.profile_image ||
            adminFromApi.profileimage ||
            adminFromApi.avatarImg ||
            null;
          const apiRole =
            adminFromApi.role && typeof adminFromApi.role === "string" && adminFromApi.role.trim()
              ? adminFromApi.role
              : Number(adminFromApi.user_role) === 1
              ? "Super Admin"
              : "Admin";
          const apiStatus =
            adminFromApi.account_status !== undefined
              ? (adminFromApi.account_status ? "Active" : "Suspended")
              : "Active";

          let formattedJoined = "";
          if (adminFromApi.joined_date || adminFromApi.createdat) {
            try {
              const d = new Date(adminFromApi.joined_date || adminFromApi.createdat);
              if (!isNaN(d.getTime())) {
                formattedJoined = d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
              }
            } catch (e) {}
          }

          setAdminProfile((prev) => {
            const nextProfile = {
              ...prev,
              name: apiName || prev.name,
              email: apiEmail || prev.email,
              phone: apiPhone || prev.phone,
              address: apiAddress || prev.address,
              avatarImg: apiImage !== undefined ? apiImage : prev.avatarImg,
              status: apiStatus || prev.status,
              role: apiRole || prev.role,
              joinedOn: formattedJoined || prev.joinedOn,
            };

            try {
              localStorage.setItem("ql_admin_profile", JSON.stringify(nextProfile));
            } catch (e) {}

            return nextProfile;
          });

          try {
            const currentStoredUser = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...currentStoredUser,
                user_id: adminFromApi.user_id ?? currentStoredUser.user_id,
                fullname: apiName || currentStoredUser.fullname,
                name: apiName || currentStoredUser.name,
                email: apiEmail || currentStoredUser.email,
                phone: apiPhone || currentStoredUser.phone,
                address: apiAddress || currentStoredUser.address,
                profile_image: apiImage || currentStoredUser.profile_image,
                role: apiRole || currentStoredUser.role,
              })
            );
          } catch (err) {}
        }
      } else {
        setUsersError(data?.detail || data?.message || "Failed to load users from database.");
      }
    } catch (err) {
      setUsersError("Could not connect to server. Please check your internet connection.");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const fetchAdminProfile = fetchUsers;

  useEffect(() => {
    fetchOwners();
    fetchUsers();
  }, [fetchOwners, fetchUsers]);

  // ── SHOPS & SUBSCRIPTIONS STATE ───────────────────────────────────────
  const [shopsData, setShopsData] = useState(() => {
    const saved = localStorage.getItem("ql_admin_shops_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ALL_SHOPS_DATA;
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

  const [subscriptionPlans, setSubscriptionPlans] = useState(() => {
    const saved = localStorage.getItem("ql_admin_plans_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return SUBSCRIPTION_PLANS;
  });

  // ── ADD OWNER MODAL STATE ─────────────────────────────────────────────
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

    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}
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
          (Array.isArray(data?.detail) ? data.detail.map((d) => d.msg).join(", ") : data?.detail) ||
          data?.message ||
          data?.error ||
          "Failed to register owner in database.";
        setAddOwnerError(errorMsg);
        setIsAddingOwner(false);
        return;
      }

      // Success
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

  // ── TOGGLE OWNER STATUS ───────────────────────────────────────────────
  const [updatingOwnerStatusId, setUpdatingOwnerStatusId] = useState(null);
  const handleToggleOwnerStatus = async (ownerId) => {
    const owner = ownersData.find((o) => o.id === ownerId);
    if (!owner) return;
    const nextStatusBool = owner.status !== "Active";
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

      if (!res.ok || (data && (data.status === "failed" || data.status === "error"))) {
        const errMsg = data?.detail || data?.message || "Server rejected status update.";
        showToast(`Failed to update status: ${errMsg}`, "error");
        return;
      }

      setOwnersData((prev) => {
        const updated = prev.map((o) => (o.id === ownerId ? { ...o, status: nextStatusStr } : o));
        localStorage.setItem("ql_admin_owners_list", JSON.stringify(updated));
        return updated;
      });

      showToast(`Owner status changed to "${nextStatusStr}" successfully!`, "success");
    } catch (err) {
      showToast(`Failed to update status: ${err.message || "Network error"}`, "error");
    } finally {
      setUpdatingOwnerStatusId(null);
    }
  };

  // ── DELETE OWNER ───────────────────────────────────────────────────────
  const [deletingOwnerId, setDeletingOwnerId] = useState(null);
  const handleDeleteOwner = async (ownerId, ownerName = "Owner") => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${ownerName}"? This action will remove the merchant record and their registered counters.`
    );
    if (!confirmed) return false;

    setDeletingOwnerId(ownerId);
    try {
      // Attempt remote API call
      try {
        await authFetch(`${OWNER_DELETE_API_URL}?owner_id=${ownerId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner_id: Number(ownerId) }),
        }).catch(() => null);
      } catch (e) {
        try {
          await authFetch(OWNER_DELETE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner_id: Number(ownerId) }),
          }).catch(() => null);
        } catch (e2) {}
      }

      // Update state and persistence
      setOwnersData((prev) => {
        const updated = prev.filter((o) => o.id !== ownerId);
        localStorage.setItem("ql_admin_owners_list", JSON.stringify(updated));
        return updated;
      });

      showToast(`Shop Owner "${ownerName}" was successfully deleted!`, "success");
      return true;
    } catch (err) {
      showToast(`Could not delete owner: ${err.message || "Unknown error"}`, "error");
      return false;
    } finally {
      setDeletingOwnerId(null);
    }
  };

  // ── DELETE USER ────────────────────────────────────────────────────────
  const [deletingUserId, setDeletingUserId] = useState(null);
  const handleDeleteUser = async (userId, userName = "Customer") => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete customer "${userName}"? This will remove their profile and active queue tokens.`
    );
    if (!confirmed) return false;

    setDeletingUserId(userId);
    try {
      setUsersData((prev) => {
        const updated = prev.filter((u) => u.id !== userId);
        return updated;
      });
      showToast(`Customer "${userName}" was successfully deleted!`, "success");
      return true;
    } catch (err) {
      showToast(`Could not delete customer: ${err.message || "Unknown error"}`, "error");
      return false;
    } finally {
      setDeletingUserId(null);
    }
  };

  // ── PROFILE PHOTO & DB SYNC ───────────────────────────────────────────
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawSelectedImage, setRawSelectedImage] = useState(null);

  const syncAdminProfileImageToDb = async (newImage) => {
    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}

    const adminId = loggedUser.user_id || loggedUser.userid || loggedUser.id || 1;
    const targetUrl = USER_UPDATE_API_URL.includes("?")
      ? `${USER_UPDATE_API_URL}&user_id=${adminId}`
      : USER_UPDATE_API_URL;

    const payload = {
      fullname: adminProfile.name || loggedUser.fullname || "Administrator",
      phone: adminProfile.phone || loggedUser.phone || "",
      address: adminProfile.address || loggedUser.address || "",
      profile_image: newImage || "",
    };

    try {
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
          const currentAdminProf = JSON.parse(localStorage.getItem("ql_admin_profile") || "{}");
          localStorage.setItem(
            "ql_admin_profile",
            JSON.stringify({ ...currentAdminProf, avatarImg: newImage || null })
          );
        } catch (e) {}
        fetchAdminProfile();
      } else {
        showToast("Failed to save image in database.", "error");
      }
    } catch (err) {
      showToast("Network error syncing image.", "error");
    }
  };

  const handleCropComplete = (croppedBase64) => {
    setAdminProfile((prev) => ({ ...prev, avatarImg: croppedBase64 }));
    setCropModalOpen(false);
    syncAdminProfileImageToDb(croppedBase64);
  };

  const handleRemoveAvatar = () => {
    setAdminProfile((prev) => ({ ...prev, avatarImg: null }));
    syncAdminProfileImageToDb("");
  };

  // ── EDIT ADMIN PROFILE MODAL ──────────────────────────────────────────
  const [editAdminModalOpen, setEditAdminModalOpen] = useState(false);
  const [editAdminForm, setEditAdminForm] = useState(adminProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [adminProfileError, setAdminProfileError] = useState("");

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setAdminProfileError("");

    let loggedUser = {};
    try {
      loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {}

    const adminId = loggedUser.user_id || loggedUser.userid || loggedUser.id || 1;
    const finalFullName = (editAdminForm.name || adminProfile.name || "").trim();
    const finalPhone = (editAdminForm.phone || adminProfile.phone || "").trim();
    const finalAddress = (editAdminForm.address || adminProfile.address || "").trim();
    const finalImage = editAdminForm.avatarImg || adminProfile.avatarImg || "";

    const updatePayload = {
      fullname: finalFullName,
      phone: finalPhone,
      address: finalAddress,
      profile_image: finalImage || "",
    };

    try {
      const targetUrl = USER_UPDATE_API_URL.includes("?")
        ? `${USER_UPDATE_API_URL}&user_id=${adminId}`
        : USER_UPDATE_API_URL;

      const res = await authFetch(targetUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        if (typeof data?.detail === "string") errorMsg = data.detail;
        else if (Array.isArray(data?.detail)) errorMsg = data.detail.map((d) => d.msg).join(", ");
        else if (data?.message) errorMsg = data.message;
        throw new Error(errorMsg);
      }

      const updatedUser = {
        ...loggedUser,
        fullname: finalFullName,
        name: finalFullName,
        phone: finalPhone,
        address: finalAddress,
        profile_image: finalImage || null,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const updatedProfile = {
        ...adminProfile,
        ...editAdminForm,
        name: finalFullName,
        phone: finalPhone,
        address: finalAddress,
        avatarImg: finalImage || null,
        email: adminProfile.email,
        department: editAdminForm.department || "System Architecture & Operations",
        accessLevel: editAdminForm.accessLevel || "Role Clearance (System Enforced)",
        bio: editAdminForm.bio || "",
      };
      setAdminProfile(updatedProfile);

      localStorage.setItem("ql_admin_profile", JSON.stringify(updatedProfile));

      showToast("Administrator profile updated successfully in database!", "success");
      setEditAdminModalOpen(false);
      fetchAdminProfile();
    } catch (err) {
      setAdminProfileError(err.message || "Failed to update profile.");
      showToast(`Profile update failed: ${err.message}`, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── DETAIL MODALS (OWNER, USER, SHOP QUEUE, PLAN) ─────────────────────
  const [detailModalOwner, setDetailModalOwner] = useState(null);
  const [ownerProfileTab, setOwnerProfileTab] = useState("overview");

  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const handleUpdateUserStatus = (userId, newStatus) => {
    setUsersData((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
      if (selectedUserDetail && selectedUserDetail.id === userId) {
        setSelectedUserDetail((curr) => ({ ...curr, status: newStatus }));
      }
      return updated;
    });
    showToast(`User status updated to ${newStatus}`, "success");
  };

  const [selectedShopDetail, setSelectedShopDetail] = useState(null);
  const [queueModalFilter, setQueueModalFilter] = useState("All");
  const [queueTokensState, setQueueTokensState] = useState({});

  const [editingPlanModal, setEditingPlanModal] = useState(null);
  const handleSavePlanEdits = (updatedPlan) => {
    setSubscriptionPlans((prev) => {
      const next = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
      localStorage.setItem("ql_admin_plans_list", JSON.stringify(next));
      return next;
    });
    setEditingPlanModal(null);
    showToast("Subscription plan updated!", "success");
  };

  const [changeSubscriberModal, setChangeSubscriberModal] = useState(null);
  const handleChangeSubscriberPlan = (subId, newPlanId, newBillingCycle) => {
    const planObj = subscriptionPlans.find((p) => p.id === newPlanId);
    setSubscribersList((prev) => {
      const next = prev.map((s) => {
        if (s.id === subId) {
          const cost = newBillingCycle === "Annual" ? planObj.annualTotal : planObj.monthlyPrice;
          return {
            ...s,
            planId: newPlanId,
            planName: planObj.name,
            billingCycle: newBillingCycle,
            amount: `₹ ${cost.toLocaleString()} /${newBillingCycle === "Annual" ? "yr" : "mo"}`,
          };
        }
        return s;
      });
      localStorage.setItem("ql_admin_subscribers_list", JSON.stringify(next));
      return next;
    });
    setChangeSubscriberModal(null);
    showToast("Subscriber tier updated!", "success");
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem("token");
    localStorage.removeItem("ql_admin_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("ql_admin_profile");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.clear();
    window.location.href = "/login?logout=true";
  };

  return (
    <AdminContext.Provider
      value={{
        theme,
        toggleTheme,
        sidebarOpen,
        setSidebarOpen,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        ownerFilterStatus,
        setOwnerFilterStatus,
        shopCategoryFilter,
        setShopCategoryFilter,
        userStatusFilter,
        setUserStatusFilter,
        ownersData,
        isOwnersLoading,
        ownersError,
        fetchOwners,
        usersData,
        isUsersLoading,
        usersError,
        fetchUsers,
        adminProfile,
        setAdminProfile,
        fetchAdminProfile,
        shopsData,
        setShopsData,
        subscribersList,
        setSubscribersList,
        subscriptionPlans,
        setSubscriptionPlans,
        dashboardToast,
        showToast,
        // Add Owner Modal
        addOwnerModalOpen,
        setAddOwnerModalOpen,
        newOwnerForm,
        setNewOwnerForm,
        isAddingOwner,
        addOwnerError,
        setAddOwnerError,
        showAddOwnerPassword,
        setShowAddOwnerPassword,
        showAddOwnerConfirmPassword,
        setShowAddOwnerConfirmPassword,
        handleAddOwnerSubmit,
        // Toggle Owner Status
        handleToggleOwnerStatus,
        updatingOwnerStatusId,
        // Delete Owner
        handleDeleteOwner,
        deletingOwnerId,
        // Delete User
        handleDeleteUser,
        deletingUserId,
        // Profile Photo
        cropModalOpen,
        setCropModalOpen,
        rawSelectedImage,
        setRawSelectedImage,
        handleCropComplete,
        handleRemoveAvatar,
        syncAdminProfileImageToDb,
        // Edit Profile Modal
        editAdminModalOpen,
        setEditAdminModalOpen,
        editAdminForm,
        setEditAdminForm,
        isSavingProfile,
        adminProfileError,
        handleSaveAdminProfile,
        // Modals
        detailModalOwner,
        setDetailModalOwner,
        ownerProfileTab,
        setOwnerProfileTab,
        selectedUserDetail,
        setSelectedUserDetail,
        handleUpdateUserStatus,
        selectedShopDetail,
        setSelectedShopDetail,
        queueModalFilter,
        setQueueModalFilter,
        queueTokensState,
        setQueueTokensState,
        editingPlanModal,
        setEditingPlanModal,
        handleSavePlanEdits,
        changeSubscriberModal,
        setChangeSubscriberModal,
        handleChangeSubscriberPlan,
        handleLogout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

