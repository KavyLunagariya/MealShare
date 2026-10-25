import "../filterbar.css";
import {
  Search,
  MapPin,
  Utensils,
  Soup,
  Croissant,
  CupSoda,
  Cookie,
  Carrot,
  Cake,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

const CATEGORY_ITEMS = [
  { id: "All", label: "All", icon: Utensils },
  { id: "Full Meals", label: "Full Meals", icon: Soup },
  { id: "Bakery", label: "Bakery", icon: Croissant },
  { id: "Beverages", label: "Beverages", icon: CupSoda },
  { id: "Snacks", label: "Snacks", icon: Cookie },
  { id: "Fruits & Vegetables", label: "Fruits & Vegetables", icon: Carrot },
  { id: "Desserts", label: "Desserts", icon: Cake },
];

function FilterBar({
  selectedCategory = "All",
  setSelectedCategory,
  onCategoryChange,
  distance = 10,
  setDistance,
  searchTerm = "",
  setSearchTerm,
  categoryCounts = {},
  filteredCount = 0,
  onReset,
  cartItemCount = 0,
  cartTotalAmount = 0,
  onOpenCart,
}) {
  const handleCategoryClick = (categoryLabel) => {
    if (setSelectedCategory) {
      setSelectedCategory(categoryLabel);
    } else if (onCategoryChange) {
      onCategoryChange(categoryLabel);
    }
  };

  const handleResetClick = () => {
    if (onReset) {
      onReset();
    } else {
      if (setSelectedCategory) setSelectedCategory("All");
      if (onCategoryChange) onCategoryChange("All");
      if (setDistance) setDistance(10);
      if (setSearchTerm) setSearchTerm("");
    }
  };

  return (
    <section className="filter-section">
      <div className="filter-bar">
        {/* =========================
            TOP FILTER ROW
        ========================= */}
        <div className="filter-top-row">
          {/* Search Input */}
          <div className="filter-search">
            <Search className="search-icon-svg" size={20} />
            <input
              type="text"
              placeholder="Search surplus menu (e.g., Sourdough, Paneer, Juice)"
              value={searchTerm}
              onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            />
          </div>

          {/* Distance Slider */}
          <div className="distance-filter">
            <div className="filter-header-row">
              <div className="filter-label">
                <MapPin className="location-icon-svg" size={18} />
                <span>Distance Radius:</span>
              </div>
              <span className="distance-badge">Within {distance} km</span>
            </div>

            <div className="distance-content">
              <span className="distance-value">1 km</span>
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={distance}
                  onChange={(e) => setDistance && setDistance(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #c62828 0%, #c62828 ${
                      ((distance - 1) / 14) * 100
                    }%, #ebdcd0 ${((distance - 1) / 14) * 100}%, #ebdcd0 100%)`,
                  }}
                />
              </div>
              <span className="distance-value">15 km</span>
            </div>
          </div>

          {/* VIEW CART BUTTON (Replaces Sort By) */}
          <div className="cart-filter">
            <button
              type="button"
              className="view-cart-btn-trigger"
              onClick={onOpenCart}
            >
              <div className="cart-trigger-icon-box">
                <ShoppingBag size={20} className="cart-trigger-icon" />
                {cartItemCount > 0 && (
                  <span className="cart-trigger-badge">{cartItemCount}</span>
                )}
              </div>

              <div className="cart-trigger-info">
                <span className="cart-trigger-title">View Cart</span>
                <span className="cart-trigger-subtitle">
                  {cartItemCount > 0
                    ? `₹${cartTotalAmount} • ${cartItemCount} item${cartItemCount > 1 ? "s" : ""}`
                    : "0 items reserved"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* =========================
            CATEGORY FILTERS (CHIPS)
        ========================= */}
        <div className="category-container">
          <div className="category-row">
            {CATEGORY_ITEMS.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.label;
              const count = categoryCounts[cat.label] !== undefined ? categoryCounts[cat.label] : 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-pill ${isActive ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat.label)}
                >
                  <IconComponent className="category-icon-svg" size={18} />
                  <span className="category-label">{cat.label}</span>
                  <span className="category-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================
            BOTTOM SUMMARY ROW
        ========================= */}
        <div className="filter-bottom-row">
          <p className="meal-count">
            Showing <strong>{filteredCount}</strong> surplus meals available within{" "}
            <strong>{distance} km</strong>
            {selectedCategory !== "All" && (
              <>
                {" "}in <em>{selectedCategory}</em>
              </>
            )}
          </p>

          <button className="reset-button" type="button" onClick={handleResetClick}>
            <RotateCcw size={15} className="reset-icon-svg" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;