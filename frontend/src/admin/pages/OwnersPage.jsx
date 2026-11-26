import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";
import { isDemoOwner } from "../adminData";

export function OwnersPage() {
  const navigate = useNavigate();
  const {
    ownersData,
    isOwnersLoading,
    ownersError,
    fetchOwners,
    searchQuery,
    setSearchQuery,
    ownerFilterStatus,
    setOwnerFilterStatus,
    setAddOwnerModalOpen,
    setDetailModalOwner,
    handleToggleOwnerStatus,
    updatingOwnerStatusId,
    handleOpenEditOwner,
    handleDeleteOwner,
    deletingOwnerId,
  } = useAdmin();

  // State to track which owner's action menu is open
  const [openMenuOwnerId, setOpenMenuOwnerId] = useState(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    if (!openMenuOwnerId) return;
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".adm-action-menu-wrap")) {
        setOpenMenuOwnerId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenMenuOwnerId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuOwnerId]);

  // Filter out any demo / test seeded owners
  const realOwners = (ownersData || []).filter((o) => !isDemoOwner(o));

  // Filter owners by search and status
  const filteredOwners = realOwners.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.email && o.email.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q)) ||
      (o.ownerCode && o.ownerCode.toLowerCase().includes(q));

    const matchStatus = ownerFilterStatus === "All" || o.status === ownerFilterStatus;
    return matchSearch && matchStatus;
  });

  // Metrics
  const totalOwnersCount = realOwners.length;
  const activeOwnersCount = realOwners.filter((o) => o.status === "Active").length;
  const suspendedOwnersCount = realOwners.filter((o) => o.status === "Suspended" || o.status === "Inactive").length;

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
              Shop Owners Directory
            </span>
            <span
              className="adm-badge adm-badge-role-owner"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: "9999px",
                boxShadow: "0 1px 2px rgba(99, 102, 241, 0.1)",
              }}
              title={`Total ${totalOwnersCount} registered business merchants`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>
                {isOwnersLoading && totalOwnersCount === 0
                  ? "..."
                  : filteredOwners.length !== totalOwnersCount
                  ? `(${filteredOwners.length} of ${totalOwnersCount} Owners)`
                  : `(${totalOwnersCount} ${totalOwnersCount === 1 ? "Owner" : "Owners"})`}
              </span>
            </span>
          </h1>
          <p className="adm-page-desc">
            Monitor and manage registered business merchants and their queue limits.
          </p>
        </div>
        <div className="adm-header-actions">
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => setAddOwnerModalOpen(true)}
          >
            <span>+</span>
            <span>Add New Owner</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="adm-stats-grid adm-stats-grid-3" style={{ marginBottom: "18px" }}>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Total Owners</span>
            <span className="adm-stat-trend">Merchants</span>
          </div>
          <div className="adm-stat-value">{totalOwnersCount}</div>
          <div className="adm-stat-context">registered business accounts</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Active Accounts</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
              Active
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#059669" }}>{activeOwnersCount}</div>
          <div className="adm-stat-context">verified platform merchants</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Suspended</span>
            <span className="adm-stat-trend" style={{ backgroundColor: suspendedOwnersCount > 0 ? "#fef2f2" : "var(--adm-surface-subtle)", color: suspendedOwnersCount > 0 ? "#dc2626" : "var(--adm-text-muted)" }}>
              {suspendedOwnersCount > 0 ? "Alert" : "Clean"}
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: suspendedOwnersCount > 0 ? "#dc2626" : "var(--adm-text)" }}>
            {suspendedOwnersCount}
          </div>
          <div className="adm-stat-context">accounts restricted</div>
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
            placeholder="Search by owner name, email, phone or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="adm-search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div className="adm-pill-filters">
            {[
              { id: "All", label: `All (${totalOwnersCount})` },
              { id: "Active", label: `Active (${activeOwnersCount})` },
              { id: "Suspended", label: `Suspended (${suspendedOwnersCount})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`adm-pill-btn ${ownerFilterStatus === st.id ? "active" : ""}`}
                onClick={() => setOwnerFilterStatus(st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {ownersError && (
        <div className="adm-alert adm-alert-danger">
          <span>⚠️ {ownersError}</span>
          <button type="button" className="adm-btn adm-btn-sm adm-btn-secondary" onClick={fetchOwners}>
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
                  <th style={{ minWidth: "170px" }}>Owner & Email</th>
                  <th style={{ whiteSpace: "nowrap" }}>Contact</th>
                  <th style={{ maxWidth: "140px" }}>Address</th>
                  <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Outlets</th>
                  <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap" }}>Registered</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isOwnersLoading && realOwners.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="adm-table-empty">
                      <div className="adm-loading-spinner" />
                      <span>Loading registered owners from database...</span>
                    </td>
                  </tr>
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="adm-table-empty">
                      <span style={{ fontSize: "24px" }}>👥</span>
                      <h4>No Owners Found</h4>
                      <p>There are currently no owners matching your search or filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner, index) => {
                    const isActive = owner.status === "Active";
                    const isUpdating = updatingOwnerStatusId === owner.id;
                    return (
                      <tr
                        key={owner.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setDetailModalOwner(owner);
                          navigate(`/admin/owners/${owner.id}`);
                        }}
                        title={`Click to view details for ${owner.name}`}
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
                              {owner.avatarImg ? (
                                <img src={owner.avatarImg} alt={owner.name} />
                              ) : (
                                owner.initial || "O"
                              )}
                            </div>
                            <div style={{ minWidth: 0, overflow: "hidden" }}>
                              <div className="adm-user-name" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{owner.name}</span>
                                {owner.ownerCode && (
                                  <span className="adm-code-pill" style={{ flexShrink: 0 }}>{owner.ownerCode}</span>
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
                                title={owner.email || ""}
                              >
                                {owner.email || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--adm-text)", whiteSpace: "nowrap" }}>{owner.phone || "—"}</td>
                        <td
                          style={{
                            color: "var(--adm-text-secondary)",
                            maxWidth: "135px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={owner.address || ""}
                        >
                          {owner.address || "—"}
                        </td>
                        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          <span className="adm-badge adm-badge-neutral">{owner.maxShops ?? 0} Shops</span>
                        </td>
                        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                            {owner.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--adm-text-muted)", whiteSpace: "nowrap", fontSize: "12px" }}>
                          {owner.joinedOn}
                        </td>
                        <td
                          style={{ textAlign: "right", whiteSpace: "nowrap", position: "relative" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={`adm-action-menu-wrap ${openMenuOwnerId === owner.id ? "active" : ""}`}>
                            <button
                              type="button"
                              className={`adm-action-dots-btn ${openMenuOwnerId === owner.id ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuOwnerId((prev) => (prev === owner.id ? null : owner.id));
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

                            {openMenuOwnerId === owner.id && (
                              <div
                                className={`adm-action-dropdown ${
                                  index >= 2 && index >= filteredOwners.length - 2 ? "open-up" : ""
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="adm-action-item"
                                  onClick={() => {
                                    setOpenMenuOwnerId(null);
                                    setDetailModalOwner(owner);
                                    navigate(`/admin/owners/${owner.id}`);
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
                                  disabled={isUpdating}
                                  onClick={() => {
                                    setOpenMenuOwnerId(null);
                                    handleToggleOwnerStatus(owner.id);
                                  }}
                                >
                                  {isActive ? (
                                    <>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="10" y1="15" x2="10" y2="9" />
                                        <line x1="14" y1="15" x2="14" y2="9" />
                                      </svg>
                                      <span>Suspend Owner</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polygon points="10 8 16 12 10 16 10 8" />
                                      </svg>
                                      <span>Activate Owner</span>
                                    </>
                                  )}
                                </button>

                                <div className="adm-action-divider" />

                                <button
                                  type="button"
                                  className="adm-action-item"
                                  onClick={() => {
                                    setOpenMenuOwnerId(null);
                                    handleOpenEditOwner(owner);
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Edit Owner</span>
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
          <span>Showing {filteredOwners.length} of {totalOwnersCount} total owners</span>
          <span className="adm-text-muted">Live synchronization with database</span>
        </div>
      </div>
    </div>
  );
}

