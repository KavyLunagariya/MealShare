import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "../../components/AccountMenu";
import { useAuth } from "../../context/AuthContext";
import "./ReserverDashboard.css";

const API_URL = "http://localhost:5000/api";

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status) {
  return String(status || "Pending").toLowerCase().replace(/\s+/g, "-");
}

function ReserverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [mealPrices, setMealPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReservations = useCallback(async (signal) => {
    if (!user?.id) {
      setReservations([]);
      setLoading(false);
      setError("Please log in to view your reservations.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      
const token = localStorage.getItem("mealshare_token");

const response = await fetch(
  `${API_URL}/reservations/customer/${encodeURIComponent(user.id)}`,
  {
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load reservations.");
      }

      const reservationList = Array.isArray(data.reservations)
        ? data.reservations
        : [];

      setReservations(reservationList);

      // Fetch current meal prices to help older reservations
      // whose saved items do not contain oldPrice.
      const missingPriceMealIds = [
        ...new Set(
          reservationList.flatMap((reservation) =>
            (reservation.items || [])
              .filter((item) => item.oldPrice == null || Number(item.oldPrice) <= 0)
              .map((item) => String(item.mealId || ""))
              .filter(Boolean)
          )
        ),
      ];

      if (missingPriceMealIds.length > 0) {
        try {
          const mealsResponse = await fetch(`${API_URL}/meals`, { signal });
          const mealsData = await mealsResponse.json();

          if (mealsResponse.ok && mealsData.success) {
            const priceMap = {};

            (mealsData.meals || []).forEach((meal) => {
              priceMap[String(meal._id || meal.id)] = {
                oldPrice: Number(meal.oldPrice || 0),
                price: Number(meal.price || 0),
              };
            });

            setMealPrices(priceMap);
          }
        } catch (priceError) {
          if (priceError.name === "AbortError") throw priceError;
          console.warn("Could not retrieve current meal prices.");
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Could not connect to MealShare.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchReservations(controller.signal);
    return () => controller.abort();
  }, [fetchReservations]);

  const pickedUpReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status === "Picked Up"),
    [reservations]
  );

  const mealsRescued = pickedUpReservations.reduce(
    (total, reservation) =>
      total +
      (reservation.items || []).reduce(
        (itemTotal, item) => itemTotal + Math.max(0, Number(item.quantity || 0)),
        0
      ),
    0
  );

  const moneySaved = pickedUpReservations.reduce(
    (total, reservation) =>
      total +
      (reservation.items || []).reduce((itemTotal, item) => {
        const savedOriginalPrice = Number(item.oldPrice || 0);
        const currentMealPrice = mealPrices[String(item.mealId)] || {};

        const originalPrice =
          savedOriginalPrice > 0
            ? savedOriginalPrice
            : Number(currentMealPrice.oldPrice || 0);

        const discountedPrice = Number(item.price || currentMealPrice.price || 0);
        const quantity = Math.max(0, Number(item.quantity || 0));

        if (
          !Number.isFinite(originalPrice) ||
          !Number.isFinite(discountedPrice) ||
          originalPrice <= discountedPrice
        ) {
          return itemTotal;
        }

        return itemTotal + (originalPrice - discountedPrice) * quantity;
      }, 0),
    0
  );

  const upcomingReservation = reservations.find(
    (reservation) =>
      reservation.status !== "Cancelled" &&
      reservation.status !== "Picked Up"
  );

  const recentReservations = reservations.slice(0, 5);

  const handleFindMeal = () => navigate("/meals");

  const handleSavedMeals = () =>
    navigate("/meals", { state: { openCart: true } });

  const handleViewReservation = () => {
    document.querySelector(".recent-reservations-card")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleMyImpact = () => {
    document.querySelector(".impact-preview-card")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const dashboardStats = [
    {
      value: loading ? "…" : String(mealsRescued),
      label: "Meals Rescued",
      description: "Meals from completed pickups",
      icon: "♧",
    },
    {
      value: loading ? "…" : `₹${moneySaved.toLocaleString("en-IN")}`,
      label: "Money Saved",
      description: "Savings from recorded original prices",
      icon: "◉",
    },
    {
      value: "—",
      label: "CO₂ Prevented",
      description: "Shown when verified impact data is available",
      icon: "⌁",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">MY DASHBOARD</span>
            <h1>
              Welcome back, <span>{user?.name || "MealSharer"}.</span>
            </h1>
            <p>Every meal you rescue makes a small difference.</p>
          </div>

          <div className="dashboard-profile">
            <AccountMenu />
          </div>
        </header>

        <section className="dashboard-stats">
          {dashboardStats.map((stat) => (
            <article className="dashboard-stat-card" key={stat.label}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <strong>{stat.value}</strong>
                <h2>{stat.label}</h2>
                <p>{stat.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="dashboard-main-grid">
          <article className="dashboard-card upcoming-meal-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="card-eyebrow">UP NEXT</span>
                <h2>Your rescued meal</h2>
              </div>

              {upcomingReservation && (
                <span className="meal-status">
                  {upcomingReservation.status}
                </span>
              )}
            </div>

            <div className="upcoming-meal-content">
              {loading ? (
                <p>Loading your reservations…</p>
              ) : error ? (
                <p>{error}</p>
              ) : upcomingReservation ? (
                <>
                  {(upcomingReservation.items || []).map((item) => (
                    <div
                      key={item.mealId || item.title}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        margin: "20px 0",
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: 88,
                            height: 88,
                            objectFit: "cover",
                            borderRadius: 14,
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <div>
                        <h3 style={{ margin: "0 0 8px" }}>{item.title}</h3>
                        <p style={{ margin: "4px 0" }}>{item.business}</p>
                        <p style={{ margin: "4px 0" }}>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}

                  <p>
                    Pickup: {upcomingReservation.pickupAddress || "Address not provided"}
                  </p>
                  <p>Reserved on: {formatDate(upcomingReservation.createdAt)}</p>
                  <p>
                    Total: ₹
                    {Number(upcomingReservation.totalAmount || 0).toLocaleString("en-IN")}
                  </p>
                </>
              ) : (
                <p>
                  {reservations.length
                    ? "You have no upcoming reservations. Check your recent reservation history below."
                    : "Your upcoming meal will appear here after you make a real reservation."}
                </p>
              )}
            </div>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={upcomingReservation ? handleViewReservation : handleFindMeal}
            >
              {upcomingReservation ? "View Reservations" : "Find Meals"}
              <span>→</span>
            </button>
          </article>

          <article className="dashboard-card impact-preview-card">
            <span className="card-eyebrow">YOUR IMPACT</span>
            <h2>
              Small actions.
              <br />
              <span>Real change.</span>
            </h2>

            <div className="impact-circle">
              <strong>{loading ? "…" : mealsRescued}</strong>
              <span>meals rescued</span>
            </div>

            <p>
              You're helping good food reach people instead of going to waste.
            </p>

            <button
              type="button"
              className="dashboard-text-button"
              onClick={handleMyImpact}
            >
              See your impact <span>→</span>
            </button>
          </article>
        </section>

        <section className="dashboard-card recent-reservations-card">
          <div className="dashboard-card-heading">
            <div>
              <span className="card-eyebrow">YOUR ACTIVITY</span>
              <h2>Recent reservations</h2>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={handleViewReservation}
            >
              View all <span>→</span>
            </button>
          </div>

          <div className="recent-reservations">
            {loading ? (
              <p>Loading reservation history…</p>
            ) : error ? (
              <p>{error}</p>
            ) : recentReservations.length === 0 ? (
              <p>You don't have any reservations yet. Find a meal to get started!</p>
            ) : (
              recentReservations.map((reservation) => {
                const items = reservation.items || [];
                const firstItem = items[0];

                return (
                  <article
                    key={reservation._id}
                    className="receiver-reservation-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 0",
                      borderBottom: "1px solid #eee0d7",
                    }}
                  >
                    {firstItem?.image && (
                      <img
                        src={firstItem.image}
                        alt={firstItem.title || "Reserved meal"}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 11,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>
                        {items.map((item) => item.title).filter(Boolean).join(", ") ||
                          "Reserved meal"}
                      </strong>

                      <p style={{ margin: "6px 0" }}>
                        {formatDate(reservation.createdAt)} · ₹
                        {Number(reservation.totalAmount || 0).toLocaleString("en-IN")}
                      </p>

                      <span
                        className={`reservation-status reservation-status-${getStatusClass(
                          reservation.status
                        )}`}
                      >
                        {reservation.status || "Pending"}
                      </span>
                    </div>

                    <span style={{ color: "#8c2032", fontSize: 12 }}>
                      {items.reduce(
                        (total, item) => total + Number(item.quantity || 0),
                        0
                      )}{" "}
                      item(s)
                    </span>
                  </article>
                );
              })
            )}
          </div>

          {!loading && error && (
            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() => fetchReservations()}
            >
              Try Again
            </button>
          )}
        </section>

        <section className="dashboard-card quick-actions-card">
          <div className="dashboard-card-heading">
            <div>
              <span className="card-eyebrow">MAKE A DIFFERENCE</span>
              <h2>Quick actions</h2>
            </div>
          </div>

          <div className="quick-actions">
            <button type="button" className="quick-action" onClick={handleFindMeal}>
              <span className="quick-action-icon">⌕</span>
              <span className="quick-action-content">
                <strong>Find a meal</strong>
                <small>Discover rescued food near you</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </button>

            <button type="button" className="quick-action" onClick={handleSavedMeals}>
              <span className="quick-action-icon">♡</span>
              <span className="quick-action-content">
                <strong>Saved meals</strong>
                <small>View your favorite meals</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </button>

            <button type="button" className="quick-action" onClick={handleMyImpact}>
              <span className="quick-action-icon">◉</span>
              <span className="quick-action-content">
                <strong>My impact</strong>
                <small>See your food rescue journey</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ReserverDashboard;
