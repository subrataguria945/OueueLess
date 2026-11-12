import React from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";

export function ShopsPage() {
  const navigate = useNavigate();
  const {
    shopsData,
    searchQuery,
    setSearchQuery,
    shopCategoryFilter,
    setShopCategoryFilter,
    setSelectedShopDetail,
  } = useAdmin();

  const categories = ["All", "Café & Dining", "Healthcare", "Fitness", "Retail", "Services"];

  const filteredShops = shopsData.filter((shop) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      shop.owner.toLowerCase().includes(q) ||
      shop.location.toLowerCase().includes(q) ||
      shop.category.toLowerCase().includes(q);

    const matchCategory = shopCategoryFilter === "All" || shop.category === shopCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="adm-page-body">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Registered Shops & Queues</h1>
          <p className="adm-page-desc">Real-time status of merchant store locations and counter queues.</p>
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
            placeholder="Search shops by name, category, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="adm-pill-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`adm-pill-btn ${shopCategoryFilter === cat ? "active" : ""}`}
              onClick={() => setShopCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Shops Grid */}
      <div className="adm-shops-grid">
        {filteredShops.map((shop) => {
          const isOpen = shop.status === "Active";
          return (
            <div key={shop.id} className="adm-shop-card">
              <div className="adm-shop-card-image-wrap">
                <img src={shop.image} alt={shop.name} className="adm-shop-card-img" />
                <span className={`adm-badge ${isOpen ? "adm-badge-success" : "adm-badge-neutral"} adm-shop-status-badge`}>
                  {shop.status}
                </span>
              </div>

              <div className="adm-shop-card-body">
                <div className="adm-shop-cat">{shop.category}</div>
                <h3 className="adm-shop-title">{shop.name}</h3>
                <div className="adm-shop-sub">Owner: {shop.owner} • {shop.location}</div>

                <div className="adm-shop-metrics">
                  <div className="adm-shop-metric-item">
                    <span className="adm-shop-metric-label">Serving</span>
                    <span className="adm-shop-metric-val" style={{ color: "#2563eb" }}>{shop.currentServing}</span>
                  </div>
                  <div className="adm-shop-metric-item">
                    <span className="adm-shop-metric-label">Waiting</span>
                    <span className="adm-shop-metric-val">{shop.waitingCount}</span>
                  </div>
                  <div className="adm-shop-metric-item">
                    <span className="adm-shop-metric-label">Avg Wait</span>
                    <span className="adm-shop-metric-val">{shop.avgWaitTime}</span>
                  </div>
                </div>

                <div className="adm-shop-card-actions">
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedShopDetail(shop);
                      navigate(`/admin/shops/${shop.id}`);
                    }}
                  >
                    View Live Queue &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

