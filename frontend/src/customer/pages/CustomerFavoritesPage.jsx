import React from "react";
import { useNavigate } from "react-router";
import { useCustomer } from "../CustomerContext";

export function CustomerFavoritesPage() {
  const navigate = useNavigate();
  const { shops, favoriteShopIds, toggleFavoriteShop, openBookModal } = useCustomer();

  const favoriteShops = shops.filter((s) => favoriteShopIds.includes(s.id));

  return (
    <div className="cst-content-body">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px" }}>
          Saved Favorite Shops
        </h1>
        <p style={{ margin: 0, color: "var(--cst-text-muted)", fontSize: "14px" }}>
          Quickly access and book tokens for your most visited shops and clinics.
        </p>
      </div>

      {favoriteShops.length > 0 ? (
        <div className="cst-shops-grid">
          {favoriteShops.map((shop) => (
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
                  className="cst-btn-favorite active"
                  onClick={() => toggleFavoriteShop(shop.id)}
                  title="Remove from favorites"
                >
                  ♥
                </button>
              </div>

              <div className="cst-shop-card-body">
                <div className="cst-shop-location">
                  <span>📍</span>
                  <span>{shop.location}</span>
                </div>

                <div className="cst-shop-queue-stats">
                  <div>
                    <div className="cst-q-stat-label">Serving</div>
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
              </div>

              <div className="cst-shop-card-footer">
                <button
                  type="button"
                  className="cst-btn-card-book"
                  onClick={() => openBookModal(shop)}
                >
                  <span>Book Token</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--cst-surface)",
            borderRadius: "var(--cst-radius-xl)",
            border: "1px dashed var(--cst-border)",
            color: "var(--cst-text-muted)",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>❤️</div>
          <h3 style={{ margin: "0 0 6px", color: "var(--cst-text)" }}>No Favorite Shops Saved Yet</h3>
          <p style={{ margin: "0 0 18px", fontSize: "14px" }}>
            Click the heart icon on any shop in the directory to save it here for instant 1-click booking.
          </p>
          <button
            type="button"
            className="cst-btn-quick-book"
            onClick={() => navigate("/customer/shops")}
          >
            Explore All Shops
          </button>
        </div>
      )}
    </div>
  );
}

