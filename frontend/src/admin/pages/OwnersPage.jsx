import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";

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

  // Filter owners by search and status
  const filteredOwners = ownersData.filter((o) => {
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

  return (
    <div className="adm-page-body">
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Shop Owners Directory</h1>
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

        <div className="adm-pill-filters">
          {["All", "Active", "Suspended"].map((st) => (
            <button
              key={st}
              type="button"
              className={`adm-pill-btn ${ownerFilterStatus === st ? "active" : ""}`}
              onClick={() => setOwnerFilterStatus(st)}
            >
              {st}
            </button>
          ))}
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
      <div className="adm-card">
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
              {isOwnersLoading && ownersData.length === 0 ? (
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
                    <tr key={owner.id}>
                      <td style={{ textAlign: "center", padding: "8px 6px", color: "var(--adm-text-faint)", width: "36px" }}>
                        {index + 1}
                      </td>
                      <td>
                        <div
                          className="adm-user-cell"
                          onClick={() => {
                            setDetailModalOwner(owner);
                            navigate(`/admin/owners/${owner.id}`);
                          }}
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
                        <span className="adm-badge adm-badge-neutral">{owner.maxShops || 5} Shops</span>
                      </td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                          {owner.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--adm-text-muted)", whiteSpace: "nowrap", fontSize: "12px" }}>
                        {owner.joinedOn}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap", position: "relative" }}>
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
                                className="adm-action-item adm-action-item-danger"
                                disabled={deletingOwnerId === owner.id}
                                onClick={() => {
                                  setOpenMenuOwnerId(null);
                                  handleDeleteOwner(owner.id, owner.name);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                <span>Delete Owner</span>
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
          <span>Showing {filteredOwners.length} of {ownersData.length} total owners</span>
          <span className="adm-text-muted">Live synchronization with database</span>
        </div>
      </div>
    </div>
  );
}

