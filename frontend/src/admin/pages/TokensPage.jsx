import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAdmin } from "../AdminContext";
import { isDemoToken } from "../adminData";

export function TokensPage() {
  const navigate = useNavigate();
  const { shopsData, showToast } = useAdmin();

  const [tokens, setTokens] = useState(() => {
    try {
      const saved = localStorage.getItem("ql_admin_live_tokens");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const nonDemo = parsed.filter((t) => !isDemoToken(t));
          if (nonDemo.length !== parsed.length) {
            localStorage.setItem("ql_admin_live_tokens", JSON.stringify(nonDemo));
          }
          return nonDemo;
        }
      }
    } catch (_) {}
    return [];
  });

  const [tokenSearch, setTokenSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedShopFilter, setSelectedShopFilter] = useState("All");
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const shopDropdownRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isShopDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
        setIsShopDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsShopDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShopDropdownOpen]);

  // Walk-in modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newShopName, setNewShopName] = useState("");
  const [newCounter, setNewCounter] = useState("Counter A");

  const saveTokens = (next) => {
    setTokens(next);
    try {
      localStorage.setItem("ql_admin_live_tokens", JSON.stringify(next));
    } catch (_) {}
  };

  // Metrics (Platform Overall)
  const totalTokensCount = tokens.length;
  const servingCount = tokens.filter((t) => t.status === "Serving").length;
  const waitingCount = tokens.filter((t) => t.status === "Waiting").length;
  const completedCount = tokens.filter((t) => t.status === "Completed").length;

  // Filter-scoped metrics for pill badges
  const scopedTokens =
    selectedShopFilter === "All"
      ? tokens
      : tokens.filter((t) => t.shop === selectedShopFilter);
  const displayTotalCount = scopedTokens.length;
  const displayServingCount = scopedTokens.filter((t) => t.status === "Serving").length;
  const displayWaitingCount = scopedTokens.filter((t) => t.status === "Waiting").length;
  const displayCompletedCount = scopedTokens.filter((t) => t.status === "Completed").length;

  // Actions
  const handleCallNext = () => {
    const firstWaitingIndex = tokens.findIndex((t) => t.status === "Waiting");
    if (firstWaitingIndex === -1) {
      if (showToast) showToast("No waiting tokens in the queue right now.", "error");
      else alert("No waiting tokens in the queue right now.");
      return;
    }

    const updated = [...tokens];
    const calledToken = updated[firstWaitingIndex];
    updated[firstWaitingIndex] = {
      ...calledToken,
      status: "Serving",
      wait: "Serving Now",
    };
    saveTokens(updated);

    const msg = `Now calling Token ${calledToken.token} (${calledToken.customer}) at ${calledToken.counter}!`;
    if (showToast) showToast(msg, "success");
    else alert(msg);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = tokens.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          wait: newStatus === "Completed" ? "Completed" : newStatus === "Serving" ? "Serving Now" : "~5 mins",
        };
      }
      return t;
    });
    saveTokens(updated);
    if (showToast) showToast(`Token updated to ${newStatus}`, "success");
  };

  const handleIssueToken = (e) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      if (showToast) showToast("Please enter customer name", "error");
      return;
    }
    const targetShop = shopsData.find((s) => s.name === newShopName) || shopsData[0];
    const newTokenNum = tokens.length + 1;
    const tokenCode = `QL-${String(newTokenNum).padStart(3, "0")}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newToken = {
      id: Date.now(),
      token: tokenCode,
      customer: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || "--",
      shopId: targetShop?.id || 1,
      shop: targetShop?.name || newShopName || "Store Counter",
      counter: newCounter || "Counter A",
      wait: tokens.filter((t) => t.status === "Waiting").length === 0 ? "Next in line" : `~${tokens.filter((t) => t.status === "Waiting").length * 5} mins`,
      status: "Waiting",
      time: timeStr,
    };

    const nextTokens = [newToken, ...tokens];
    saveTokens(nextTokens);
    setIsIssueModalOpen(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    if (showToast) showToast(`Token ${tokenCode} issued successfully!`, "success");
  };

  // Unique shops for filtering
  const shopOptions = Array.from(
    new Set([
      ...(shopsData || []).map((s) => s.name),
      ...tokens.map((t) => t.shop),
    ])
  ).filter(Boolean);

  // Filtered tokens
  const filteredTokens = tokens.filter((t) => {
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchShop = selectedShopFilter === "All" || t.shop === selectedShopFilter;
    const q = tokenSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.token.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.shop.toLowerCase().includes(q) ||
      t.counter.toLowerCase().includes(q) ||
      (t.phone && t.phone.includes(q));

    return matchStatus && matchShop && matchSearch;
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
              Live Tokens Directory
            </span>
            <span
              className="adm-badge adm-badge-role-admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: "9999px",
              }}
            >
              <span>({totalTokensCount})</span>
            </span>
          </h1>
          <p className="adm-page-desc">
            Monitor real-time queue tokens, counter allocations, and customer tickets across all stores.
          </p>
        </div>
        <div className="adm-header-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => {
              if (shopsData && shopsData.length > 0) {
                setNewShopName(shopsData[0].name);
              }
              setIsIssueModalOpen(true);
            }}
          >
            <span>+</span>
            <span>Issue Walk-in Token</span>
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={handleCallNext}
            disabled={waitingCount === 0}
            title={waitingCount === 0 ? "No waiting tokens in queue" : "Call next waiting token to counter"}
          >
            <span>📢</span>
            <span>Call Next Token</span>
          </button>
        </div>
      </div>

      {/* Highlight Stats Strip */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Active Serving</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}>
              Live
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#2563eb" }}>{servingCount}</div>
          <div className="adm-stat-context">at service counters</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Waiting in Queue</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fde68a" }}>
              In Line
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#d97706" }}>{waitingCount}</div>
          <div className="adm-stat-context">estimated wait ~8 mins</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Completed Today</span>
            <span className="adm-stat-trend" style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
              Settled
            </span>
          </div>
          <div className="adm-stat-value" style={{ color: "#059669" }}>{completedCount}</div>
          <div className="adm-stat-context">successfully served</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <span className="adm-stat-label">Total Daily Tokens</span>
            <span className="adm-stat-trend">24h</span>
          </div>
          <div className="adm-stat-value">{totalTokensCount}</div>
          <div className="adm-stat-context">generated platform tickets</div>
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
            placeholder="Search by token ID (e.g. QL-042), customer, shop or counter..."
            value={tokenSearch}
            onChange={(e) => setTokenSearch(e.target.value)}
          />
          {tokenSearch && (
            <button type="button" className="adm-search-clear" onClick={() => setTokenSearch("")}>
              ✕
            </button>
          )}
        </div>

        {/* Shop selector filter + Status Pill Filters */}
        <div className="adm-filter-actions-group">
          {/* Custom Shop Dropdown */}
          <div className="adm-custom-dropdown-wrap" ref={shopDropdownRef}>
            <button
              type="button"
              className={`adm-custom-dropdown-btn pill-variant ${isShopDropdownOpen ? "active" : ""}`}
              onClick={() => setIsShopDropdownOpen((prev) => !prev)}
              title="Filter tokens by shop outlet"
              aria-expanded={isShopDropdownOpen}
            >
              <span>{selectedShopFilter === "All" ? "All Shops" : selectedShopFilter}</span>
              <svg
                className="adm-custom-dropdown-chevron"
                width="12"
                height="12"
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

            {isShopDropdownOpen && (
              <div className="adm-custom-dropdown-menu">
                <button
                  type="button"
                  className={`adm-custom-dropdown-item ${selectedShopFilter === "All" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedShopFilter("All");
                    setIsShopDropdownOpen(false);
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {selectedShopFilter === "All" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span>All Shops</span>
                  </span>
                </button>

                {shopOptions.map((s) => {
                  const isSelected = selectedShopFilter === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`adm-custom-dropdown-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedShopFilter(s);
                        setIsShopDropdownOpen(false);
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        <span>{s}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="adm-pill-filters">
            {[
              { id: "All", label: `All (${displayTotalCount})` },
              { id: "Serving", label: `Serving (${displayServingCount})` },
              { id: "Waiting", label: `Waiting (${displayWaitingCount})` },
              { id: "Completed", label: `Completed (${displayCompletedCount})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`adm-pill-btn ${statusFilter === st.id ? "active" : ""}`}
                onClick={() => setStatusFilter(st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="adm-card adm-table-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: "36px", textAlign: "center", padding: "10px 6px" }}>#</th>
                <th style={{ minWidth: "120px" }}>Token No.</th>
                <th style={{ minWidth: "160px" }}>Customer / Visitor</th>
                <th style={{ minWidth: "140px" }}>Store Outlet</th>
                <th style={{ whiteSpace: "nowrap" }}>Counter</th>
                <th style={{ whiteSpace: "nowrap" }}>Wait Estimate</th>
                <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                <th style={{ whiteSpace: "nowrap" }}>Issued Time</th>
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan="9" className="adm-table-empty">
                    <span style={{ fontSize: "28px" }}>🎫</span>
                    <h4>No Live Queue Tokens</h4>
                    <p>There are currently no customer tokens in the queue. Click "Issue Walk-in Token" above or wait for visitors to check in.</p>
                  </td>
                </tr>
              ) : (
                filteredTokens.map((t, index) => {
                  const isServing = t.status === "Serving";
                  const isWaiting = t.status === "Waiting";
                  const isCompleted = t.status === "Completed";

                  return (
                    <tr key={t.id}>
                      <td style={{ textAlign: "center", padding: "8px 6px", color: "var(--adm-text-faint)", width: "36px" }}>
                        {index + 1}
                      </td>
                      <td>
                        <span
                          className="adm-code-pill"
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "0.5px",
                            backgroundColor: isServing ? "rgba(37, 99, 235, 0.1)" : isWaiting ? "rgba(217, 119, 6, 0.1)" : "var(--adm-surface-raised)",
                            color: isServing ? "#2563eb" : isWaiting ? "#d97706" : "var(--adm-text)",
                            border: isServing ? "1px solid rgba(37, 99, 235, 0.3)" : "1px solid var(--adm-border)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {t.token}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--adm-text)" }}>{t.customer}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>{t.phone}</div>
                      </td>
                      <td>
                        <Link
                          to={`/admin/shops/${t.shopId}`}
                          style={{
                            fontWeight: 500,
                            color: "var(--adm-primary)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="View store queue"
                        >
                          <span>{t.shop}</span>
                          <span style={{ fontSize: "10px" }}>↗</span>
                        </Link>
                      </td>
                      <td style={{ color: "var(--adm-text-secondary)", whiteSpace: "nowrap" }}>
                        <span className="adm-badge adm-badge-neutral">{t.counter}</span>
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "12.5px", color: isServing ? "#2563eb" : "var(--adm-text-muted)" }}>
                        {t.wait}
                      </td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <span
                          className={`adm-badge ${
                            isServing
                              ? "adm-badge-role-admin"
                              : isWaiting
                              ? "adm-badge-warning"
                              : isCompleted
                              ? "adm-badge-success"
                              : "adm-badge-neutral"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--adm-text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {t.time}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          {isWaiting && (
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm adm-btn-primary"
                              onClick={() => handleUpdateStatus(t.id, "Serving")}
                              title="Call customer to counter now"
                            >
                              Call Now
                            </button>
                          )}
                          {isServing && (
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              onClick={() => handleUpdateStatus(t.id, "Completed")}
                              style={{ color: "#059669", borderColor: "#a7f3d0" }}
                              title="Mark customer served"
                            >
                              ✓ Complete
                            </button>
                          )}
                          {!isCompleted && (
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm adm-btn-secondary"
                              onClick={() => handleUpdateStatus(t.id, "Cancelled")}
                              style={{ color: "#ef4444" }}
                              title="Cancel token"
                            >
                              ✕
                            </button>
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
          <span>Showing {filteredTokens.length} of {tokens.length} total tokens</span>
          <span className="adm-text-muted">Real-time counter token dispatcher</span>
        </div>
      </div>

      {/* Issue Token Modal */}
      {isIssueModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsIssueModalOpen(false)}>
          <div className="adm-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Issue Walk-in Token</h3>
                <p className="adm-modal-subtitle">Generate a live counter queue token for a visitor.</p>
              </div>
              <button type="button" className="adm-modal-close" onClick={() => setIsIssueModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueToken} className="adm-modal-form">
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="adm-field">
                  <label className="adm-label">Customer / Visitor Name *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    placeholder="e.g. Deepjyoti Das"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label">Contact Phone Number</label>
                  <input
                    type="tel"
                    className="adm-input"
                    placeholder="e.g. 9876543210"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label">Store Outlet *</label>
                  <select
                    className="adm-input"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                  >
                    {(shopsData && shopsData.length > 0
                      ? shopsData
                      : [{ id: 1, name: "General Store Counter" }]
                    ).map((s) => (
                      <option key={s.id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="adm-field">
                  <label className="adm-label">Counter Desk</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. Counter A"
                    value={newCounter}
                    onChange={(e) => setNewCounter(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setIsIssueModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

