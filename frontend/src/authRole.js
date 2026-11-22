// ==========================================================================
// QUEUELESS — ROLE & ACCESS CONTROL SERVICE
// In the QueueLess FastAPI backend:
// - Role 1 (or string containing "admin"): Administrator / Super Admin -> Can access /admin
// - Role 2 (or string "user", "customer"): Customer / General User -> Can access / and /profile
// - Role 3 (or string containing "owner"): Shop Owner -> BLOCKED from customer portal
// ==========================================================================

/**
 * Decodes the payload portion of a JWT token safely.
 */
export function decodeJwt(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks whether an account is an Administrator (user_role === 1).
 * Returns true ONLY if confirmed as Admin.
 *
 * @param {Object} params
 * @returns {boolean}
 */
export function checkIsAdmin(params = {}) {
  if (!params) return false;

  const {
    user,
    data,
    token,
    role,
    user_role,
    roleid,
    role_id,
  } = params;

  // 1. Check numeric user_role / roleid across all candidates
  const candidateNums = [
    user_role,
    roleid,
    role_id,
    user?.user_role,
    user?.roleid,
    user?.role_id,
    data?.user_role,
    data?.roleid,
    data?.role_id,
    data?.data?.user_role,
  ];

  for (const n of candidateNums) {
    if (n !== undefined && n !== null && n !== "") {
      const parsed = Number(n);
      if (parsed === 1) return true;
      if (parsed === 2 || parsed === 3) return false;
    }
  }

  // 2. Check role strings
  const candidateStrings = [
    role,
    user?.role,
    user?.role_name,
    user?.roleName,
    data?.role,
    data?.user_role,
    data?.data?.role,
    data?.role_name,
    data?.roleName,
  ];

  for (const s of candidateStrings) {
    if (s && typeof s === "string") {
      const lower = s.toLowerCase().trim();
      if (lower.includes("admin")) return true;
      if (lower === "user" || lower === "customer" || lower.includes("owner")) return false;
    }
  }

  // 3. Inspect JWT token payload if available
  const jwtToken = token || user?.token || data?.token || data?.access_token;
  if (jwtToken) {
    const jwt = decodeJwt(jwtToken);
    if (jwt) {
      const jwtRoleNum = Number(jwt.user_role ?? jwt.role_id ?? jwt.roleid ?? jwt.role);
      if (jwtRoleNum === 1) return true;
      if (jwtRoleNum === 2 || jwtRoleNum === 3) return false;

      const jwtRoleStr = String(jwt.role || jwt.user_role || jwt.role_name || "").toLowerCase().trim();
      if (jwtRoleStr.includes("admin")) return true;
      if (jwtRoleStr === "user" || jwtRoleStr === "customer" || jwtRoleStr.includes("owner")) return false;
    }
  }

  return false;
}

/**
 * Checks whether an account is a Shop Owner (user_role === 3).
 * Returns true if confirmed as Shop Owner.
 *
 * @param {Object} params
 * @returns {boolean}
 */
export function checkIsOwner(params = {}) {
  if (!params) return false;

  const {
    user,
    data,
    token,
    role,
    user_role,
    roleid,
    role_id,
  } = params;

  // 1. Check numeric user_role / roleid across all candidates
  const candidateNums = [
    user_role,
    roleid,
    role_id,
    user?.user_role,
    user?.roleid,
    user?.role_id,
    data?.user_role,
    data?.roleid,
    data?.role_id,
    data?.data?.user_role,
  ];

  for (const n of candidateNums) {
    if (n !== undefined && n !== null && n !== "") {
      const parsed = Number(n);
      if (parsed === 3) return true;
      if (parsed === 1 || parsed === 2) return false;
    }
  }

  // 2. Check role strings
  const candidateStrings = [
    role,
    user?.role,
    user?.role_name,
    user?.roleName,
    data?.role,
    data?.user_role,
    data?.data?.role,
    data?.role_name,
    data?.roleName,
  ];

  for (const s of candidateStrings) {
    if (s && typeof s === "string") {
      const lower = s.toLowerCase().trim();
      if (lower.includes("owner") || lower === "shop_owner" || lower === "shopowner") return true;
      if (lower.includes("admin") || lower === "user" || lower === "customer") return false;
    }
  }

  // 3. Inspect JWT token payload if available
  const jwtToken = token || user?.token || data?.token || data?.access_token;
  if (jwtToken) {
    const jwt = decodeJwt(jwtToken);
    if (jwt) {
      const jwtRoleNum = Number(jwt.user_role ?? jwt.role_id ?? jwt.roleid ?? jwt.role);
      if (jwtRoleNum === 3) return true;
      if (jwtRoleNum === 1 || jwtRoleNum === 2) return false;

      const jwtRoleStr = String(jwt.role || jwt.user_role || jwt.role_name || "").toLowerCase().trim();
      if (jwtRoleStr.includes("owner") || jwtRoleStr === "shop_owner" || jwtRoleStr === "shopowner") return true;
      if (jwtRoleStr.includes("admin") || jwtRoleStr === "user" || jwtRoleStr === "customer") return false;
    }
  }

  return false;
}

/**
 * Checks whether an account is a Customer / General User (user_role === 2).
 *
 * @param {Object} params
 * @returns {boolean}
 */
export function checkIsCustomer(params = {}) {
  if (!params) return false;
  if (checkIsAdmin(params)) return false;
  if (checkIsOwner(params)) return false;
  return true;
}

/**
 * Formats ISO timestamp to human friendly member date (e.g. "15 Nov 2026").
 */
export function formatMemberSince(isoDate) {
  if (!isoDate) return "Recently";
  try {
    const d = new Date(isoDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    }
  } catch {}
  return "Recently";
}

/**
 * Formats a raw user name to proper Title Case (e.g. "SUJIT KAR" -> "Sujit Kar").
 */
export function formatName(str) {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
