import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";

export function ShopsPage() {
  const navigate = useNavigate();
  const {
    shopsData,
    isShopsLoading,
    fetchShops,
    searchQuery,
    setSearchQuery,
    shopCategoryFilter,
    setShopCategoryFilter,
    setSelectedShopDetail,
    handleToggleShopOpen,
  } = useAdmin();

  const [shopStatusFilter, setShopStatusFilter] = useState("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("ql_admin_shops_view") || "grid";
  });

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isCategoryOpen) return;
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryOpen]);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("ql_admin_shops_view", mode);
    } catch (_) {}
  };

  const categories = ["All", "Café & Dining", "Healthcare", "Fitness", "Retail", "Services"];
  const uniqueCategories = Array.from(
    new Set([
      "All",
      ...categories.filter((c) => c !== "All"),
      ...(shopsData || []).map((s) => s.category).filter(Boolean),
    ])
  );
  const statusFilters = ["All", "Open Now", "Closed", "Active Outlets"];

  // Metrics
  const totalShopsCount = shopsData.length;
  const openShopsCount = shopsData.filter((s) => s.isOpen !== undefined ? s.isOpen : (s.status === "Open" || s.status === "Active")).length;
  const closedShopsCount = totalShopsCount - openShopsCount;
  const activeShopsCount = shopsData.filter((s) => s.isActive !== undefined ? s.isActive : (s.status !== "Inactive" && s.status !== "Suspended")).length;

  const filteredShops = shopsData.filter((shop) => {
    const isOpen = shop.isOpen !== undefined ? shop.isOpen : (shop.status === "Open" || shop.status === "Active");
    const isActive = shop.isActive !== undefined ? shop.isActive : (shop.status !== "Inactive" && shop.status !== "Suspended");

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      shop.owner.toLowerCase().includes(q) ||
      shop.location.toLowerCase().includes(q) ||
      shop.category.toLowerCase().includes(q);

    const matchCategory = shopCategoryFilter === "All" || shop.category === shopCategoryFilter;

    let matchStatus = true;
    if (shopStatusFilter === "Open Now") matchStatus = isOpen;
    else if (shopStatusFilter === "Closed") matchStatus = !isOpen;
    else if (shopStatusFilter === "Active Outlets") matchStatus = isActive;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className={`adm-page-body ${viewMode === "table" ? "adm-table-page-body" : ""}`}>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Registered Shops & Queues</h1>
          <p className="adm-page-desc">Real-time status of merchant store locations, counter queues, and operating hours.</p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="adm-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Total Outlets</span>
            <span className="adm-stat-trend">Live</span>
          </div>
          <div className="adm-stat-value">{totalShopsCount}</div>
          <div className="adm-stat-context">registered in platform</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Currently Open</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
              Serving
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#059669" }}>{openShopsCount}</div>
          <div className="adm-stat-context">counters active now</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Currently Closed</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>
              Offline
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#dc2626" }}>{closedShopsCount}</div>
          <div className="adm-stat-context">queue halted</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Verified Active</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>
              Active
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#2563eb" }}>{activeShopsCount}</div>
          <div className="adm-stat-context">active merchant accounts</div>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="adm-shops-toolbar">
        {/* Top Controls Row: Search + Category + View Switcher */}
        <div className="adm-shops-toolbar-row">
          <div className="adm-search-box" style={{ maxWidth: "420px", flex: 1 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="adm-search-input"
              placeholder="Search shops by name, category, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="adm-search-clear" onClick={() => setSearchQuery("")} title="Clear search">
                ✕
              </button>
            )}
          </div>

          <div className="adm-shops-toolbar-actions">
            {/* Custom Category Dropdown */}
            <div className="adm-custom-dropdown-wrap" ref={categoryDropdownRef}>
              <button
                type="button"
                className={`adm-custom-dropdown-btn ${isCategoryOpen ? "active" : ""}`}
                onClick={() => setIsCategoryOpen((prev) => !prev)}
                title="Filter by category"
                aria-expanded={isCategoryOpen}
              >
                <span>{shopCategoryFilter === "All" ? "All Categories" : shopCategoryFilter}</span>
                <svg
                  className="adm-custom-dropdown-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isCategoryOpen && (
                <div className="adm-custom-dropdown-menu">
                  {uniqueCategories.map((cat) => {
                    const isSelected = shopCategoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`adm-custom-dropdown-item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setShopCategoryFilter(cat);
                          setIsCategoryOpen(false);
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          <span>{cat === "All" ? "All Categories" : cat}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="adm-toolbar-divider" />

            {/* View Mode Toggle: Cards vs Table */}
            <div className="adm-view-toggle">
              <button
                type="button"
                className={`adm-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => handleSetViewMode("grid")}
                title="Card Grid View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                <span>Cards</span>
              </button>
              <button
                type="button"
                className={`adm-view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => handleSetViewMode("table")}
                title="Table List View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Status Filter Row */}
        <div className="adm-shops-toolbar-subrow">
          <div className="adm-pill-filters">
            <button
              type="button"
              className={`adm-pill-btn ${shopStatusFilter === "All" ? "active" : ""}`}
              onClick={() => setShopStatusFilter("All")}
            >
              All Outlets ({totalShopsCount})
            </button>
            <button
              type="button"
              className={`adm-pill-btn ${shopStatusFilter === "Open Now" ? "active" : ""}`}
              onClick={() => setShopStatusFilter("Open Now")}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block", marginRight: "4px" }} />
              Open Now ({openShopsCount})
            </button>
            <button
              type="button"
              className={`adm-pill-btn ${shopStatusFilter === "Closed" ? "active" : ""}`}
              onClick={() => setShopStatusFilter("Closed")}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#94a3b8", display: "inline-block", marginRight: "4px" }} />
              Closed ({closedShopsCount})
            </button>
            <button
              type="button"
              className={`adm-pill-btn ${shopStatusFilter === "Active Outlets" ? "active" : ""}`}
              onClick={() => setShopStatusFilter("Active Outlets")}
            >
              ✓ Active ({activeShopsCount})
            </button>
          </div>

          <div className="adm-toolbar-meta">
            <span>
              Showing <strong>{filteredShops.length}</strong> of <strong>{shopsData.length}</strong> outlets
            </span>
            {(searchQuery || shopCategoryFilter !== "All" || shopStatusFilter !== "All") && (
              <button
                type="button"
                className="adm-toolbar-reset"
                onClick={() => {
                  setSearchQuery("");
                  setShopCategoryFilter("All");
                  setShopStatusFilter("All");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shops Grid or Empty State */}
      {isShopsLoading ? (
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <div className="adm-loading-spinner" />
          <h3 style={{ marginTop: "12px", fontSize: "16px", color: "var(--adm-text)" }}>Loading Registered Shops...</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px" }}>Connecting with counter stores database</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>🏪</span>
          <h3 style={{ margin: "14px 0 6px", fontSize: "18px", color: "var(--adm-text)" }}>
            {searchQuery || shopCategoryFilter !== "All" ? "No Matching Shops Found" : "No Registered Shops"}
          </h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", maxWidth: "420px", margin: "0 auto 16px" }}>
            {searchQuery || shopCategoryFilter !== "All"
              ? "No store counters match your current filter or search criteria."
              : "There are currently no store outlets or counter queues registered in the system."}
          </p>
          {(searchQuery || shopCategoryFilter !== "All") && (
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setShopCategoryFilter("All");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="adm-card adm-table-card">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: "36px", textAlign: "center", padding: "10px 6px" }}>#</th>
                  <th style={{ minWidth: "190px" }}>Shop & Outlet</th>
                  <th style={{ minWidth: "130px" }}>Owner</th>
                  <th style={{ whiteSpace: "nowrap" }}>Category</th>
                  <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Queue Status</th>
                  <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Account</th>
                  <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Serving</th>
                  <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Waiting</th>
                  <th style={{ whiteSpace: "nowrap" }}>Avg Wait</th>
                  <th style={{ maxWidth: "160px" }}>Location</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop, index) => {
                  const isOpen = shop.isOpen !== undefined ? shop.isOpen : (shop.status === "Open" || shop.status === "Active");
                  const isActive = shop.isActive !== undefined ? shop.isActive : (shop.status !== "Inactive" && shop.status !== "Suspended");

                  return (
                    <tr
                      key={shop.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedShopDetail(shop);
                        navigate(`/admin/shops/${shop.id}`);
                      }}
                      title={`Click to view details & live queue for ${shop.name}`}
                    >
                      <td style={{ textAlign: "center", padding: "8px 6px", color: "var(--adm-text-faint)", width: "36px" }}>
                        {index + 1}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={shop.image}
                            alt={shop.name}
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              flexShrink: 0,
                              border: "1px solid var(--adm-border)",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--adm-text)", fontSize: "13.5px" }}>
                              {shop.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>
                              ID: {shop.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: "var(--adm-text)", fontSize: "13px" }}>
                          {shop.owner}
                        </div>
                      </td>
                      <td>
                        <span className="adm-code-pill" style={{ fontSize: "11.5px" }}>
                          {shop.category}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`adm-badge ${isOpen ? "adm-badge-success" : "adm-badge-neutral"}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontWeight: 700,
                            fontSize: "11px",
                            padding: "3px 8px",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: isOpen ? "#10b981" : "#94a3b8",
                              boxShadow: isOpen ? "0 0 6px #10b981" : "none",
                            }}
                          />
                          <span>{isOpen ? "OPEN NOW" : "CLOSED"}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`adm-badge ${isActive ? "adm-badge-role-admin" : "adm-badge-danger"}`}
                          style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px" }}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "12.5px",
                            color: isOpen ? "#2563eb" : "var(--adm-text-muted)",
                          }}
                        >
                          {isOpen ? shop.currentServing : "--"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className="adm-code-pill"
                          style={{
                            fontWeight: 600,
                            backgroundColor: isOpen && shop.waitingCount > 0 ? "rgba(245, 158, 11, 0.12)" : "var(--adm-surface-raised)",
                            color: isOpen && shop.waitingCount > 0 ? "#d97706" : "var(--adm-text-muted)",
                          }}
                        >
                          {isOpen ? shop.waitingCount : 0}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>
                        {isOpen ? shop.avgWaitTime : "--"}
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          color: "var(--adm-text-muted)",
                          maxWidth: "160px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={shop.location}
                      >
                        {shop.location}
                      </td>
                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            style={{ padding: "4px 9px", fontSize: "11.5px" }}
                            onClick={() => {
                              setSelectedShopDetail(shop);
                              navigate(`/admin/shops/${shop.id}`);
                            }}
                            title="View shop details and live queue"
                          >
                            Live Queue &rarr;
                          </button>
                          <button
                            type="button"
                            className={`adm-btn adm-btn-sm ${isOpen ? "adm-btn-secondary" : "adm-btn-primary"}`}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              borderColor: isOpen ? "#fca5a5" : undefined,
                              color: isOpen ? "#dc2626" : undefined,
                            }}
                            onClick={() => handleToggleShopOpen(shop.id)}
                            title={isOpen ? "Temporarily halt queue tokens" : "Open counter for queue tokens"}
                          >
                            {isOpen ? "Close" : "Open"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="adm-table-footer">
            <span>
              Showing <strong>{filteredShops.length}</strong> of <strong>{shopsData.length}</strong> registered shops
            </span>
          </div>
        </div>
      ) : (
        <div className="adm-shops-grid">
          {filteredShops.map((shop) => {
            const isOpen = shop.isOpen !== undefined ? shop.isOpen : (shop.status === "Open" || shop.status === "Active");
            const isActive = shop.isActive !== undefined ? shop.isActive : (shop.status !== "Inactive" && shop.status !== "Suspended");

            return (
              <div
                key={shop.id}
                className="adm-shop-card"
                onClick={() => {
                  setSelectedShopDetail(shop);
                  navigate(`/admin/shops/${shop.id}`);
                }}
                style={{ cursor: "pointer" }}
                title={`Click to view details & live queue for ${shop.name}`}
              >
                <div className="adm-shop-card-image-wrap">
                  <img src={shop.image} alt={shop.name} className="adm-shop-card-img" />

                  {/* Open / Closed Live Badge (Top-Right) */}
                  <span
                    className={`adm-badge ${isOpen ? "adm-badge-success" : "adm-badge-neutral"} adm-shop-status-badge`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: 700,
                      fontSize: "11px",
                      padding: "3px 8px",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: isOpen ? "#10b981" : "#94a3b8",
                        boxShadow: isOpen ? "0 0 6px #10b981" : "none",
                      }}
                    />
                    <span>{isOpen ? "OPEN NOW" : "CLOSED"}</span>
                  </span>

                  {/* Active / Inactive Registration Badge (Top-Left) */}
                  <span
                    className={`adm-badge ${isActive ? "adm-badge-role-admin" : "adm-badge-danger"}`}
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {isActive ? "✓ Active" : "✕ Inactive"}
                  </span>
                </div>

                <div className="adm-shop-card-body">
                  <div className="adm-shop-cat-row">
                    <span className="adm-shop-cat">{shop.category}</span>
                    <span style={{ fontSize: "11px", color: "var(--adm-text-faint)", fontWeight: 500 }}>
                      ID: #{shop.id}
                    </span>
                  </div>

                  <h3 className="adm-shop-title" title={shop.name}>{shop.name}</h3>
                  <div className="adm-shop-sub" title={`Owner: ${shop.owner} • ${shop.location}`}>
                    Owner: <strong>{shop.owner}</strong> • {shop.location}
                  </div>

                  <div className="adm-shop-metrics">
                    <div className="adm-shop-metric-item">
                      <span className="adm-shop-metric-label">Serving</span>
                      <span className="adm-shop-metric-val" style={{ color: isOpen ? "#2563eb" : "var(--adm-text-muted)" }}>
                        {isOpen ? shop.currentServing : "--"}
                      </span>
                    </div>
                    <div className="adm-shop-metric-item">
                      <span className="adm-shop-metric-label">Waiting</span>
                      <span className="adm-shop-metric-val">{isOpen ? shop.waitingCount : 0}</span>
                    </div>
                    <div className="adm-shop-metric-item">
                      <span className="adm-shop-metric-label">Avg Wait</span>
                      <span className="adm-shop-metric-val">{isOpen ? shop.avgWaitTime : "--"}</span>
                    </div>
                  </div>

                  <div className="adm-shop-card-actions">
                    <button
                      type="button"
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ flex: 1, height: "32px", fontSize: "12px", justifyContent: "center" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedShopDetail(shop);
                        navigate(`/admin/shops/${shop.id}`);
                      }}
                    >
                      View Live Queue &rarr;
                    </button>
                    <button
                      type="button"
                      className={`adm-btn adm-btn-sm ${isOpen ? "adm-btn-secondary" : "adm-btn-primary"}`}
                      style={{
                        height: "32px",
                        padding: "0 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderColor: isOpen ? "#fca5a5" : undefined,
                        color: isOpen ? "#dc2626" : undefined,
                      }}
                      title={isOpen ? "Temporarily halt queue tokens" : "Open counter for queue tokens"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleShopOpen(shop.id);
                      }}
                    >
                      {isOpen ? "Close" : "Open"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

