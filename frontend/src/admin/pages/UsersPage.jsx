import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";
import { getRoleBadgeClass, isRegularUser } from "../adminData";

export function UsersPage() {
  const navigate = useNavigate();
  const {
    usersData,
    ownersData,
    isUsersLoading,
    usersError,
    fetchUsers,
    searchQuery,
    setSearchQuery,
    userStatusFilter,
    setUserStatusFilter,
    setSelectedUserDetail,
    handleUpdateUserStatus,
    handleOpenEditUser,
    handleDeleteUser,
    deletingUserId,
  } = useAdmin();

  // State to track which user's action menu is open
  const [openMenuUserId, setOpenMenuUserId] = useState(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    if (!openMenuUserId) return;
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".adm-action-menu-wrap")) {
        setOpenMenuUserId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenMenuUserId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuUserId]);

  // Strictly filter: ONLY regular Users/Customers (exclude Admin and Shop Owners)
  const regularUsers = (usersData || []).filter((u) => isRegularUser(u, ownersData));
  const totalUsersCount = regularUsers.length;
  const activeUsersCount = regularUsers.filter((u) => u.status === "Active").length;
  const suspendedUsersCount = regularUsers.filter((u) => u.status === "Suspended" || u.status === "Inactive").length;

  const filteredUsers = regularUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.address && u.address.toLowerCase().includes(q)) ||
      (u.token && u.token.toLowerCase().includes(q));

    const matchStatus = userStatusFilter === "All" || u.status === userStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="adm-page-body adm-table-page-body">
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1
            className="adm-page-title"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: "default",
              caretColor: "transparent",
            }}
          >
            <span style={{ userSelect: "none", WebkitUserSelect: "none", cursor: "default", caretColor: "transparent" }}>
              Users Directory
            </span>
            <span
              className="adm-badge adm-badge-role-user"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: "9999px",
                boxShadow: "0 1px 2px rgba(2, 132, 199, 0.1)",
              }}
              title={`Total ${totalUsersCount} registered platform customer users`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>
                {isUsersLoading && totalUsersCount === 0
                  ? "..."
                  : filteredUsers.length !== totalUsersCount
                  ? `(${filteredUsers.length} of ${totalUsersCount})`
                  : `(${totalUsersCount})`}
              </span>
            </span>
          </h1>
          <p className="adm-page-desc">
            Monitor and manage registered platform customer users and queue accounts.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="adm-filter-bar">
        <div className="adm-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="adm-search-input"
            placeholder="Search by user name, email, contact number or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="adm-search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="adm-pill-filters">
          {[
            { id: "All", label: `All (${totalUsersCount})` },
            { id: "Active", label: `Active (${activeUsersCount})` },
            { id: "Suspended", label: `Suspended (${suspendedUsersCount})` },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              className={`adm-pill-btn ${userStatusFilter === st.id ? "active" : ""}`}
              onClick={() => setUserStatusFilter(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert if any */}
      {usersError && (
        <div className="adm-alert adm-alert-danger">
          <span>⚠️ {usersError}</span>
          <button type="button" className="adm-btn adm-btn-sm adm-btn-secondary" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="adm-card adm-table-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: "36px", textAlign: "center", padding: "10px 6px" }}>#</th>
                <th style={{ minWidth: "170px" }}>Customer & Email</th>
                <th style={{ whiteSpace: "nowrap" }}>Contact</th>
                <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Role</th>
                <th style={{ maxWidth: "140px" }}>Address</th>
                <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                <th style={{ whiteSpace: "nowrap" }}>Joined</th>
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isUsersLoading && totalUsersCount === 0 ? (
                <tr>
                  <td colSpan="8" className="adm-table-empty">
                    <div className="adm-loading-spinner" />
                    <span>Fetching users from database...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="adm-table-empty">
                    <span style={{ fontSize: "24px" }}>👤</span>
                    <h4>No Users Found</h4>
                    <p>There are currently no regular users matching your search or filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const isActive = user.status === "Active";
                  return (
                    <tr
                      key={user.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedUserDetail(user);
                        navigate(`/admin/users/${user.id}`);
                      }}
                      title={`Click to view details for ${user.name}`}
                    >
                      <td style={{ textAlign: "center", padding: "8px 6px", color: "var(--adm-text-faint)", width: "36px" }}>
                        {index + 1}
                      </td>
                      <td>
                        <div
                          className="adm-user-cell"
                          title="Click to view details"
                        >
                          <div className="adm-avatar-small">
                            {user.avatarImg ? (
                              <img src={user.avatarImg} alt={user.name} />
                            ) : (
                              user.initial || "U"
                            )}
                          </div>
                          <div style={{ minWidth: 0, overflow: "hidden" }}>
                            <div className="adm-user-name" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
                              {user.token && (
                                <span className="adm-code-pill" style={{ flexShrink: 0 }}>{user.token}</span>
                              )}
                            </div>
                            <div
                              className="adm-user-sub"
                              style={{
                                color: "var(--adm-text-muted)",
                                fontSize: "11.5px",
                                marginTop: "1px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "210px",
                              }}
                              title={user.email || ""}
                            >
                              {user.email || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--adm-text)", whiteSpace: "nowrap" }}>{user.phone || "—"}</td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <span className={getRoleBadgeClass(user.role)}>{user.role || "User"}</span>
                      </td>
                      <td
                        style={{
                          color: "var(--adm-text-secondary)",
                          maxWidth: "135px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={user.address || ""}
                      >
                        {user.address || "—"}
                      </td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--adm-text-muted)", whiteSpace: "nowrap", fontSize: "12px" }}>
                        {user.joinedOn}
                      </td>
                      <td
                        style={{ textAlign: "right", whiteSpace: "nowrap", position: "relative" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={`adm-action-menu-wrap ${openMenuUserId === user.id ? "active" : ""}`}>
                          <button
                            type="button"
                            className={`adm-action-dots-btn ${openMenuUserId === user.id ? "active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuUserId((prev) => (prev === user.id ? null : user.id));
                            }}
                            title="More Actions"
                            aria-label="More Actions"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2.2" />
                              <circle cx="12" cy="12" r="2.2" />
                              <circle cx="12" cy="19" r="2.2" />
                            </svg>
                          </button>

                          {openMenuUserId === user.id && (
                            <div
                              className={`adm-action-dropdown ${
                                index >= 2 && index >= filteredUsers.length - 2 ? "open-up" : ""
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="adm-action-item"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  setSelectedUserDetail(user);
                                  navigate(`/admin/users/${user.id}`);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>View Profile</span>
                              </button>

                              <button
                                type="button"
                                className={`adm-action-item ${isActive ? "adm-action-item-warning" : "adm-action-item-success"}`}
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  handleUpdateUserStatus(user.id, isActive ? "Suspended" : "Active");
                                }}
                              >
                                {isActive ? (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="10" y1="15" x2="10" y2="9" />
                                      <line x1="14" y1="15" x2="14" y2="9" />
                                    </svg>
                                    <span>Suspend Account</span>
                                  </>
                                ) : (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <polygon points="10 8 16 12 10 16 10 8" />
                                    </svg>
                                    <span>Activate Account</span>
                                  </>
                                )}
                              </button>

                              <div className="adm-action-divider" />

                              <button
                                type="button"
                                className="adm-action-item"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  handleOpenEditUser(user);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <span>Edit Customer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="adm-table-footer">
          <span>Showing {filteredUsers.length} of {totalUsersCount} total registered user{totalUsersCount === 1 ? "" : "s"}</span>
          <span className="adm-text-muted">Live synchronization with database</span>
        </div>
      </div>
    </div>
  );
}

