import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAdmin } from "../AdminContext";
import { getRoleBadgeClass } from "../adminData";
import { authFetch } from "../../apiClient";

export function OwnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    ownersData,
    isOwnersLoading,
    handleToggleOwnerStatus,
    updatingOwnerStatusId,
    shopsData,
    detailModalOwner,
    fetchOwners,
    handleOpenEditOwner,
    handleDeleteOwner,
    deletingOwnerId,
  } = useAdmin();

  // Find owner by ID or OwnerCode
  const owner =
    ownersData.find((o) => String(o.id) === String(id) || String(o.ownerCode) === String(id)) ||
    (detailModalOwner && (String(detailModalOwner.id) === String(id) || String(detailModalOwner.ownerCode) === String(id))
      ? detailModalOwner
      : null);

  // Real backend shops for this owner
  const [ownerShops, setOwnerShops] = useState(() => {
    if (Array.isArray(owner?.parsedShopDetails) && owner.parsedShopDetails.length > 0) {
      return owner.parsedShopDetails;
    }
    return [];
  });
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  useEffect(() => {
    if (!owner?.id) return;
    let isMounted = true;

    const fetchOwnerShops = async () => {
      setIsLoadingShops(true);
      try {
        let fetchedList = [];

        // 1. Try GET /owner/shops?owner_id=${owner.id}
        try {
          const res1 = await authFetch(
            `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/owner/shops?owner_id=${owner.id}`,
            { method: "GET" }
          );
          if (res1.ok) {
            const data1 = await res1.json().catch(() => null);
            const list1 = Array.isArray(data1)
              ? data1
              : Array.isArray(data1?.shops)
              ? data1.shops
              : Array.isArray(data1?.data)
              ? data1.data
              : [];
            if (list1.length > 0) fetchedList = list1;
          }
        } catch (_) {}

        // 2. Try GET /shop/owner/${owner.id}
        if (fetchedList.length === 0) {
          try {
            const res2 = await authFetch(
              `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/shop/owner/${owner.id}`,
              { method: "GET" }
            );
            if (res2.ok) {
              const data2 = await res2.json().catch(() => null);
              const list2 = Array.isArray(data2)
                ? data2
                : Array.isArray(data2?.shops)
                ? data2.shops
                : Array.isArray(data2?.data)
                ? data2.data
                : [];
              if (list2.length > 0) fetchedList = list2;
            }
          } catch (_) {}
        }

        // 3. Fallback to owner's embedded shop details if returned with owner profile
        if (
          fetchedList.length === 0 &&
          Array.isArray(owner.parsedShopDetails) &&
          owner.parsedShopDetails.length > 0
        ) {
          fetchedList = owner.parsedShopDetails;
        }

        // 4. Fallback: match from global shopsData or fetch /admin/shops/all
        if (fetchedList.length === 0) {
          let sourceShops = Array.isArray(shopsData) && shopsData.length > 0 ? shopsData : [];
          if (sourceShops.length === 0) {
            try {
              const resAll = await authFetch(
                `${import.meta.env.VITE_API_URL || "https://queueless-backend-b2qh.onrender.com"}/admin/shops/all`,
                { method: "GET" }
              );
              if (resAll.ok) {
                const dataAll = await resAll.json().catch(() => null);
                sourceShops = Array.isArray(dataAll)
                  ? dataAll
                  : Array.isArray(dataAll?.shops)
                  ? dataAll.shops
                  : Array.isArray(dataAll?.data)
                  ? dataAll.data
                  : [];
              }
            } catch (_) {}
          }

          const oId = Number(owner.id);
          const oEmail = (owner.email || "").toLowerCase().trim();
          const oName = (owner.name || "").toLowerCase().trim();

          const matched = sourceShops.filter((s) => {
            const sOwnerId = s.ownerId ?? s.owner_id;
            const sEmail = (s.ownerEmail || s.owner_email || s.email || "").toLowerCase().trim();
            const sName = (s.owner || s.owner_name || "").toLowerCase().trim();

            return (
              (sOwnerId !== undefined && sOwnerId !== null && Number(sOwnerId) === oId) ||
              (sEmail && oEmail && sEmail === oEmail) ||
              (sName && oName && sName === oName)
            );
          });

          if (matched.length > 0) {
            fetchedList = matched;
          }
        }

        if (isMounted) {
          setOwnerShops(fetchedList);
        }
      } catch (err) {
        console.warn("Could not fetch owner shops:", err);
      } finally {
        if (isMounted) setIsLoadingShops(false);
      }
    };

    fetchOwnerShops();
    return () => {
      isMounted = false;
    };
  }, [owner?.id, owner?.parsedShopDetails, shopsData]);

  if (isOwnersLoading && !owner) {
    return (
      <div className="adm-page-body">
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <div className="adm-loading-spinner" />
          <h3 style={{ marginTop: "12px", fontSize: "16px", color: "var(--adm-text)" }}>Loading Merchant Profile...</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px" }}>Connecting with shop owner database</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="adm-page-body">
        <div className="adm-detail-nav">
          <button type="button" className="adm-back-link" onClick={() => navigate("/admin/owners")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Shop Owners</span>
          </button>
        </div>
        <div className="adm-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>🏢</span>
          <h3 style={{ margin: "14px 0 6px", fontSize: "18px", color: "var(--adm-text)" }}>Merchant Not Found</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", maxWidth: "420px", margin: "0 auto 20px" }}>
            The business owner record with ID <code>{id}</code> could not be found.
          </p>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => navigate("/admin/owners")}>
            Return to Shop Owners
          </button>
        </div>
      </div>
    );
  }

  const isActive = owner.status === "Active";
  const isUpdating = updatingOwnerStatusId === owner.id;
  // Real active outlets count: strictly 0 if no outlets exist
  const activeShopsCount = ownerShops.length > 0 ? ownerShops.length : (owner.shops ?? 0);
  const maxShopsCount = owner.maxShops !== undefined && owner.maxShops !== null ? owner.maxShops : 0;

  return (
    <div className="adm-page-body">
      {/* Top Back Navigation */}
      <div className="adm-detail-nav">
        <button type="button" className="adm-back-link" onClick={() => navigate("/admin/owners")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Shop Owners</span>
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="adm-hero-card">
        <div className="adm-hero-left">
          <div className="adm-hero-avatar">
            {owner.avatarImg ? (
              <img src={owner.avatarImg} alt={owner.name} />
            ) : (
              owner.initial || (owner.name ? owner.name.charAt(0).toUpperCase() : "O")
            )}
          </div>
          <div className="adm-hero-meta">
            <div className="adm-hero-title-row">
              <h1 className="adm-hero-title">{owner.name}</h1>
              <span className={getRoleBadgeClass("Owner")}>Shop Owner</span>
              <span className={`adm-badge ${isActive ? "adm-badge-success" : "adm-badge-danger"}`}>
                {owner.status}
              </span>
            </div>
            <p className="adm-hero-subtitle">
              <span>{owner.email || "No email registered"}</span>
              <span>•</span>
              <span>Code: <strong style={{ color: "var(--adm-text)" }}>{owner.ownerCode || `OWN-${String(owner.id).padStart(4, "0")}`}</strong></span>
              <span>•</span>
              <span>Contact: {owner.phone || "—"}</span>
              <span>•</span>
              <span>Joined: {owner.joinedOn || "Recently"}</span>
            </p>
          </div>
        </div>

        <div className="adm-hero-actions">
          <button
            type="button"
            className={`adm-btn adm-btn-sm ${isActive ? "adm-btn-secondary" : "adm-btn-primary"}`}
            disabled={isUpdating}
            onClick={() => handleToggleOwnerStatus(owner.id)}
          >
            {isUpdating
              ? "Updating..."
              : isActive
              ? "Suspend Account"
              : "Reactivate Account"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-secondary"
            onClick={() => handleOpenEditOwner(owner)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit Owner</span>
          </button>
        </div>
      </div>

      {/* 4 Highlight Stat Cards - 100% Real DB Data */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Outlets Capacity</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>Quota</span>
          </div>
          <div className="adm-stat-value">
            <span>{maxShopsCount}</span>
            <span className="adm-stat-unit">Stores</span>
          </div>
          <div className="adm-stat-context">Maximum permitted counter stores</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Active Outlets</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }}>Live</span>
          </div>
          <div className="adm-stat-value">
            <span style={{ color: "#2563eb" }}>{activeShopsCount}</span>
            <span className="adm-stat-unit">Outlets Active</span>
          </div>
          <div className="adm-stat-context">Currently configured stores</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Business Location</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={owner.address || ""}>
            {owner.address && owner.address !== "N/A" ? owner.address : "Not Specified"}
          </div>
          <div className="adm-stat-context">Registered business address</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Member Since</span>
          </div>
          <div className="adm-stat-value" style={{ fontSize: "15px" }}>
            {owner.joinedOn || "Recently"}
          </div>
          <div className="adm-stat-context">Initial merchant onboarding</div>
        </div>
      </div>

      {/* Registered Outlets Section Header */}
      <div className="adm-detail-section-header" style={{ margin: "26px 0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "16.5px", fontWeight: "700", margin: 0, color: "var(--adm-text)" }}>
            🏪 Registered Outlets ({activeShopsCount})
          </h3>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--adm-text-muted)" }}>
            Counter stores and queue desks registered under this merchant
          </p>
        </div>
      </div>

      {/* Outlets Grid / Real State */}
      <div>
        {isLoadingShops ? (
          <div className="adm-card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div className="adm-loading-spinner" />
            <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", marginTop: "12px" }}>
              Checking merchant outlets...
            </p>
          </div>
        ) : ownerShops.length > 0 ? (
          <div className="adm-shops-grid">
            {ownerShops.map((shop, idx) => {
              const shopId = shop.shop_id || shop.id || `shop-${idx}`;
              const shopName = shop.shop_name || shop.name || "Counter Store";
              const shopCategory = shop.category || "General";
              const shopLocation = shop.address || shop.location || "Store Location";
              const shopCode = shop.shop_code || shop.code || "";
              const defaultImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80";
              const shopImg = shop.image || shop.profile_image || shop.shop_image || defaultImage;
              const isShopActive =
                shop.status === "Active" ||
                shop.status === "Open" ||
                shop.is_active === true ||
                shop.account_status === true;
              const currentToken = shop.current_token || shop.currentServing || shop.current_serving || "--";
              const waitingCount = shop.waiting_count ?? shop.waitingCount ?? 0;
              const avgWait = shop.average_wait_time ? `${shop.average_wait_time} mins` : (shop.avgWaitTime || "--");

              return (
                <div key={shopId} className="adm-shop-card">
                  <div className="adm-shop-card-image-wrap">
                    <img
                      src={shopImg}
                      alt={shopName}
                      className="adm-shop-card-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultImage;
                      }}
                    />
                    <span className={`adm-badge ${isShopActive ? "adm-badge-success" : "adm-badge-neutral"} adm-shop-status-badge`}>
                      {isShopActive ? "Active" : "Closed"}
                    </span>
                  </div>
                  <div className="adm-shop-card-body">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span className="adm-shop-cat">{shopCategory}</span>
                      {shopCode && (
                        <span className="adm-code-pill" style={{ fontSize: "10px", padding: "1px 6px" }}>
                          {shopCode}
                        </span>
                      )}
                    </div>
                    <h3 className="adm-shop-title" title={shopName}>{shopName}</h3>
                    <div className="adm-shop-sub" title={shopLocation}>
                      <span>📍 {shopLocation}</span>
                      {shop.phone && <span> • 📞 {shop.phone}</span>}
                    </div>

                    <div className="adm-shop-metrics">
                      <div className="adm-shop-metric-item">
                        <span className="adm-shop-metric-label">Serving</span>
                        <span className="adm-shop-metric-val" style={{ color: "#2563eb" }}>{currentToken}</span>
                      </div>
                      <div className="adm-shop-metric-item">
                        <span className="adm-shop-metric-label">Waiting</span>
                        <span className="adm-shop-metric-val">{waitingCount}</span>
                      </div>
                      <div className="adm-shop-metric-item">
                        <span className="adm-shop-metric-label">Avg Wait</span>
                        <span className="adm-shop-metric-val">{avgWait}</span>
                      </div>
                    </div>

                    <div className="adm-shop-card-actions">
                      <Link
                        to={`/admin/shops/${shopId}`}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
                      >
                        View Live Queue &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="adm-card" style={{ padding: "50px 20px", textAlign: "center" }}>
            <span style={{ fontSize: "36px" }}>🏪</span>
            <h4 style={{ margin: "12px 0 4px", fontSize: "16px", color: "var(--adm-text)" }}>No Outlets Registered</h4>
            <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", maxWidth: "420px", margin: "0 auto" }}>
              This merchant has not registered any store counter or outlet yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

