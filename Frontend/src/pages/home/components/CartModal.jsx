import "../cart.css";

import {
  X,
  ShoppingBag,
  Trash2,
  MapPin,
  Phone,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../config/api";

const API_URL = API_BASE_URL;

function CartModal({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const getPrice = (item) => {
    if (typeof item.price === "number") {
      return item.price;
    }

    return (
      parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0
    );
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + getPrice(item) * (item.cartQuantity || 1);
  }, 0);

  const totalItemsCount = cartItems.reduce(
    (sum, item) => sum + (item.cartQuantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (isSubmitting) return;

    setError("");

    if (!isAuthenticated || !user) {
      onClose();

      navigate("/login", {
        state: {
          from: "/meals",
          message: "Please log in to reserve food.",
        },
      });

      return;
    }

    if (!user.id) {
      setError("Your account session is invalid. Please log in again.");
      return;
    }

    if (user.role !== "reserver") {
      setError("Please log in with a receiver account to reserve meals.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const items = cartItems.map((item) => ({
      mealId: item.id,
      quantity: Number(item.cartQuantity || 1),
    }));

    const invalidItem = items.some(
      (item) =>
        !item.mealId ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    );

    if (invalidItem) {
      setError("One or more meals have invalid details. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("mealshare_token");

      if (!token) {
        throw new Error("Your login session has expired. Please log in again.");
        }

      const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
       },
        body: JSON.stringify({
        customerId: user.id,
        items,
        pickupAddress:
          cartItems.find((item) => item.address)?.address || "",
        pickupTime:
          cartItems.find((item) => item.pickupTime)?.pickupTime || "",
      }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create your reservation. Please try again."
        );
      }

      setIsSuccess(true);

      // Clear the cart only after the backend confirms success.
      window.setTimeout(() => {
        onClearCart();
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (checkoutError) {
      setError(
        checkoutError.message ||
          "Could not connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div
        className="cart-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="cart-modal-header">
          <div className="cart-header-title">
            <ShoppingBag className="cart-header-icon" size={22} />

            <h2>Your Reserved Food</h2>

            <span className="cart-header-badge">
              {totalItemsCount}
            </span>
          </div>

          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="cart-modal-body">
          {isSuccess ? (
            <div className="cart-success-state">
              <CheckCircle className="success-icon" size={60} />

              <h3>Reservation Confirmed!</h3>

              <p>
                Your surplus food reservation has been placed
                successfully. Please pick up your meals at the
                specified locations.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon-wrapper">
                <ShoppingBag
                  size={48}
                  className="empty-cart-icon"
                />
              </div>

              <h3>Your Cart is Empty</h3>

              <p>
                Browse surplus meals nearby and click "Add" to
                reserve food at up to 70% off!
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemPriceNum = getPrice(item);

                const quantity = item.cartQuantity || 1;
                const itemTotal = itemPriceNum * quantity;

                const maxStock =
                  Number(item.stock) ||
                  Number(item.quantity) ||
                  10;

                const isMaxReached = quantity >= maxStock;

                return (
                  <div
                    key={item.id}
                    className="cart-item-card"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image || "/image/meal1.png"}
                      alt={item.name}
                      className="cart-item-image"
                    />

                    {/* Item Details */}
                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <span className="cart-item-category">
                          {item.category || "Other"}
                        </span>

                        <span className="cart-item-provider">
                          By {item.provider || "Local donor"}
                        </span>
                      </div>

                      <h4 className="cart-item-title">
                        {item.name}
                      </h4>

                      {/* Pickup address & contact */}
                      <div className="cart-item-pickup">
                        <div className="cart-item-pickup-row">
                          <MapPin
                            size={12}
                            className="pickup-icon"
                          />

                          <span>
                            {item.address ||
                              `${item.distance || "Local pickup"} • Vadodara`}
                          </span>
                        </div>

                        {item.phone && (
                          <div className="cart-item-pickup-row">
                            <Phone
                              size={12}
                              className="pickup-icon"
                            />

                            <a
                              href={`tel:${item.phone}`}
                              className="cart-item-phone"
                            >
                              {item.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Stock limit notice */}
                      {isMaxReached ? (
                        <div className="cart-stock-warning">
                          <AlertTriangle size={12} />

                          <span>
                            Max surplus limit reached ({maxStock} max)
                          </span>
                        </div>
                      ) : (
                        <div className="cart-stock-info">
                          <span>
                            {maxStock - quantity} surplus portion
                            {maxStock - quantity > 1 ? "s" : ""} left
                          </span>
                        </div>
                      )}

                      {/* Quantity & Price row */}
                      <div className="cart-item-action-row">
                        <div className="cart-quantity-controls">
                          <button
                            type="button"
                            className="qty-btn"
                            disabled={quantity <= 1}
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                quantity - 1
                              )
                            }
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="qty-number">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            className={`qty-btn ${
                              isMaxReached ? "qty-disabled" : ""
                            }`}
                            disabled={isMaxReached}
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                quantity + 1
                              )
                            }
                            title={
                              isMaxReached
                                ? `Maximum available stock reached (${maxStock})`
                                : "Increase quantity"
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="cart-item-price-group">
                          <span className="cart-item-price">
                            ₹{itemTotal.toFixed(2)}
                          </span>

                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() => onRemoveItem(item.id)}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Checkout error */}
          {error && !isSuccess && (
            <p
              role="alert"
              style={{
                color: "#dc2626",
                padding: "12px 16px",
                margin: 0,
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* FOOTER */}
        {!isSuccess && cartItems.length > 0 && (
          <div className="cart-modal-footer">
            <div className="cart-total-row">
              <span className="total-label">Total Amount</span>

              <span className="total-value">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="cart-footer-buttons">
              <button
                type="button"
                className="clear-cart-btn"
                onClick={() => {
                  setError("");
                  onClearCart();
                }}
                disabled={isSubmitting}
              >
                Clear All
              </button>

              <button
                type="button"
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing Reservation..."
                  : `Confirm Reservation (₹${totalAmount.toFixed(2)})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;