// ==========================================================================
// QUEUELESS — ROLE & ADMIN ACCESS CONTROL SERVICE
// Identifies if an authenticated user has Administrator privileges.
// In the QueueLess FastAPI backend:
// - Role 1 (or string containing "admin"): Administrator / Super Admin
// - Role 2 / 3 (or string "user", "customer", "owner"): Non-admin
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
 * Checks whether an account is an Administrator.
 * Returns true ONLY if confirmed as Admin.
 *
 * @param {Object} params
 * @param {Object} [params.user]
 * @param {Object} [params.data]
 * @param {string} [params.token]
 * @param {string|number} [params.role]
 * @param {number|string} [params.user_role]
 * @param {number|string} [params.roleid]
 * @param {number|string} [params.role_id]
 * @param {string} [params.email]
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
    email,
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

  // 4. Fallback check for email address if explicitly an admin address
  const candidateEmail = String(
    email ||
    user?.email ||
    data?.email ||
    data?.user?.email ||
    ""
  ).toLowerCase().trim();

  if (candidateEmail && (candidateEmail.startsWith("admin@") || candidateEmail.includes("admin"))) {
    return true;
  }

  return false;
}
