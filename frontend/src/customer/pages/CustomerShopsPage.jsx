import React, { useState } from "react";
import { useCustomer } from "../CustomerContext";

export function CustomerShopsPage() {
  const { shops, openBookModal, toggleFavoriteShop, favoriteShopIds } = useCustomer();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "health", label: "🏥 Clinics & Health" },
    { id: "salon", label: "💈 Salons & Spas" },
    { id: "dining", label: "🍽️ Cafés & Dining" },
    { id: "retail", label: "🛍️ Retail & Supermarkets" },
    { id: "bank", label: "🏦 Banking & Services" },
  ];

  const filteredShops = shops.filter((shop) => {
    const matchesCat = activeCategory === "all" || shop.category === activeCategory;
    const matchesSearch =
      searchTerm.trim() === "" ||
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="cst-content-body">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px" }}>
          Explore Shops &amp; Book Tokens
        </h1>
        <p style={{ margin: 0, color: "var(--cst-text-muted)", fontSize: "14px" }}>
          Browse popular locations, view live queue counters, and secure your token in seconds.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by shop name, service, or locality (e.g., Salt Lake, clinic, salon)..."
          className="cst-shop-select-box"
          style={{ padding: "12px 16px", fontSize: "14px", borderRadius: "var(--cst-radius-lg)" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter Chips */}
      <div className="cst-category-chips">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`cst-cat-chip ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shops Grid */}
      <div className="cst-shops-grid">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="cst-shop-card">
            <div className="cst-shop-card-head">
              <div className="cst-shop-badge-and-name">
                <div className="cst-shop-avatar-icon">{shop.icon}</div>
                <div>
                  <h3 className="cst-shop-name">{shop.name}</h3>
                  <span className="cst-shop-category">{shop.categoryLabel}</span>
                </div>
              </div>
              <button
                type="button"
                className={`cst-btn-favorite ${favoriteShopIds.includes(shop.id) ? "active" : ""}`}
                onClick={() => toggleFavoriteShop(shop.id)}
                title="Toggle Favorite"
              >
                ♥
              </button>
            </div>

            <div className="cst-shop-card-body">
              <div className="cst-shop-location">
                <span>📍</span>
                <span>{shop.location}</span>
              </div>

              {/* Live Queue Status Box */}
              <div className="cst-shop-queue-stats">
                <div>
                  <div className="cst-q-stat-label">Now Serving</div>
                  <div className="cst-q-stat-val" style={{ color: "var(--cst-primary)" }}>
                    {shop.currentServing}
                  </div>
                </div>
                <div>
                  <div className="cst-q-stat-label">In Line</div>
                  <div className="cst-q-stat-val">{shop.peopleInQueue}</div>
                </div>
                <div>
                  <div className="cst-q-stat-label">Est. Wait</div>
                  <div className="cst-q-stat-val" style={{ color: "var(--cst-green-text)" }}>
                    {shop.estWait}
                  </div>
                </div>
              </div>

              {/* Counters Info */}
              <div style={{ fontSize: "12px", color: "var(--cst-text-muted)" }}>
                Active Counters: <strong>{shop.counters.length}</strong> • Rating: ⭐ {shop.rating}
              </div>
            </div>

            <div className="cst-shop-card-footer">
              <button
                type="button"
                className="cst-btn-card-book"
                onClick={() => openBookModal(shop)}
              >
                <span>Book Token Online</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "var(--cst-surface)",
            borderRadius: "var(--cst-radius-xl)",
            border: "1px dashed var(--cst-border)",
            color: "var(--cst-text-muted)",
          }}
        >
          <h3>No shops matched your search</h3>
          <p>Try searching for a different keyword or select "All Categories".</p>
        </div>
      )}
    </div>
  );
}

