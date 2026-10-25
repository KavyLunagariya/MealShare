import "../MealCard.css";
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";

function MealCard({
  meal,
  image,
  category,
  name,
  description,
  rating,
  reviews,
  provider,
  distance,
  location,
  quantity,
  stock,
  price,
  originalPrice,
  cartQuantity = 0,
  onAddToCart,
}) {
  const [justAdded, setJustAdded] = useState(false);

  const item = meal || {
    image,
    category,
    name,
    description,
    rating,
    reviews,
    provider,
    distance: distance || location,
    quantity,
    stock,
    price,
    originalPrice,
  };

  const displayImage = item.image || "/image/meal1.png";
  const displayCategory = item.category || "Other";
  const displayName = item.name || "";
  const displayDesc = item.description || "";
  const displayRating = item.rating ?? "";
  const displayReviews = item.reviews ?? "";
  const displayProvider = item.provider || "";
  const displayDistance = item.distance || item.location || "";

  const maxStock = Number(item.stock ?? parseInt(item.quantity, 10) ?? 0);
  const remainingStock = Math.max(0, maxStock - cartQuantity);

  const formatPrice = (val) => {
    if (val === undefined || val === null) return "";
    if (typeof val === "number") return `₹${val}`;
    return String(val).startsWith("₹") ? val : `₹${val}`;
  };

  const displayPrice = formatPrice(item.price);
  const displayOriginalPrice = formatPrice(item.originalPrice);

  const handleAddClick = () => {
    if (cartQuantity >= maxStock) return;

    if (onAddToCart) {
      onAddToCart(item);
    }

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const isLimitReached = cartQuantity >= maxStock;

  return (
    <div className={`meal-card ${isLimitReached ? "card-stock-full" : ""}`}>
      <div className="meal-card-image-wrapper">
        <img src={displayImage} alt={displayName} className="meal-card-image" />
        <span className="meal-card-category-badge">{displayCategory}</span>
        {remainingStock <= 3 && remainingStock > 0 && (
          <span className="stock-alert-pill">⚡ Only {remainingStock} left!</span>
        )}
      </div>

      <div className="meal-card-body">
        <div className="meal-card-top">
          <span className="meal-card-category">{displayCategory}</span>
          {(displayRating || displayReviews) && (
            <div className="meal-card-rating">
              {displayRating && <><span className="star-icon">★</span><span className="rating-score">{displayRating}</span></>}
              {displayReviews && <span className="reviews-count">({displayReviews})</span>}
            </div>
          )}
        </div>

        <h3 className="meal-card-title">{displayName}</h3>
        <p className="meal-card-description">{displayDesc}</p>

        {displayProvider && (
          <div className="meal-card-provider">
            <span className="provider-prefix">By</span>{" "}
            <span className="provider-name">{displayProvider}</span>
          </div>
        )}

        <div className="meal-card-meta">
          {displayDistance && <><span className="meta-item">📍 {displayDistance}</span><span className="meta-separator">•</span></>}
          <span className="meta-item stock-meta-tag">
            {remainingStock > 0 ? (
              <>{remainingStock} available</>
            ) : (
              <span className="stock-zero">Stock limit reached</span>
            )}
          </span>
        </div>

        <div className="meal-card-footer">
          <div className="meal-card-price-group">
            <span className="discounted-price">{displayPrice}</span>
            {displayOriginalPrice && (
              <span className="original-price">{displayOriginalPrice}</span>
            )}
          </div>

          <button
            className={`meal-card-btn ${
              isLimitReached
                ? "stock-full-btn"
                : justAdded
                ? "added-btn"
                : cartQuantity > 0
                ? "in-cart-btn"
                : ""
            }`}
            type="button"
            disabled={isLimitReached}
            onClick={handleAddClick}
          >
            {isLimitReached ? (
              <>
                <AlertCircle size={14} /> Max Added ({maxStock})
              </>
            ) : justAdded ? (
              <>
                <Check size={14} /> Added
              </>
            ) : cartQuantity > 0 ? (
              <>+ Add ({cartQuantity}/{maxStock})</>
            ) : (
              <>🛒 Add</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealCard;
