import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "../../components/AccountMenu";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck2,
  ChevronDown,
  ClipboardList,
  Settings,
  Sparkles,
  UserRound,
  X,
  Search,
  Plus,
} from "lucide-react";
import "./FoodListerDashboard.css";

const API_URL = "http://localhost:5000/api";

const statCards = [
  {
    label: "Meals Listed",
    className: "listed",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=85",
  },
  {
    label: "Meals Rescued",
    className: "rescued",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=85",
  },
  {
    label: "Food Saved",
    className: "saved",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=85",
  },
  {
    label: "Preparing",
    className: "preparing",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=500&q=85",
  },
];

function normalizeMeal(meal) {
  return {
    ...meal,
    id: meal._id || meal.id,
    name: meal.title || meal.name || "Untitled meal",
    image: meal.image || "",
    mealsLeft: Number(meal.quantity ?? meal.mealsLeft ?? 0),
    price: Number(meal.price ?? 0),
    oldPrice: Number(meal.oldPrice ?? 0),
    category: meal.category || "Meal",
    description: meal.description || "",
    pickupTime: meal.pickupTime || "Pickup time available",
    restaurantName: meal.business || "",
  };
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FoodListerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");

  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservationsError, setReservationsError] = useState("");

  const [trendPeriod, setTrendPeriod] = useState("This Week");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const restaurantName =
    user?.restaurantName ||
    user?.businessName ||
    user?.name ||
    "Member";

  // ==========================================
  // LOAD REAL MEAL LISTINGS
  // ==========================================
  const loadListings = useCallback(async () => {
    if (!user?.id) {
      setListings([]);
      setListingsError(
        "Your account ID is missing. Please log out and log in again."
      );
      setLoadingListings(false);
      return;
    }

    try {
      setListingsError("");
      setLoadingListings(true);

      
        const token = localStorage.getItem("mealshare_token");

if (!token) {
  throw new Error("Your login session has expired. Please log in again.");
}

const response = await fetch(
  `${API_URL}/meals/restaurant/${encodeURIComponent(user.id)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load your listings.");
      }

      setListings(
        Array.isArray(result.meals)
          ? result.meals.map(normalizeMeal)
          : []
      );
    } catch (error) {
      console.error("Load donor listings error:", error);

      setListingsError(
        error.message ||
          "Unable to load listings. Check that your backend is running."
      );
    } finally {
      setLoadingListings(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadListings();

    const refreshListings = () => loadListings();

    window.addEventListener("mealshare:listings-updated", refreshListings);
    window.addEventListener("focus", refreshListings);

    return () => {
      window.removeEventListener(
        "mealshare:listings-updated",
        refreshListings
      );
      window.removeEventListener("focus", refreshListings);
    };
  }, [loadListings]);

  // ==========================================
  // LOAD REAL RESERVATIONS FROM MONGODB
  // ==========================================
  const loadReservations = useCallback(async (signal) => {
    if (!user?.id) {
      setReservations([]);
      setReservationsError(
        "Your account ID is missing. Please log in again."
      );
      setLoadingReservations(false);
      return;
    }

    try {
      setReservationsError("");
      setLoadingReservations(true);

      
const token = localStorage.getItem("mealshare_token");

const response = await fetch(
  `${API_URL}/reservations/restaurant/${encodeURIComponent(user.id)}`,
  {
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not load your reservations."
        );
      }

      setReservations(
        Array.isArray(result.reservations)
          ? result.reservations
          : []
      );
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Load donor reservations error:", error);

      setReservationsError(
        error.message || "Unable to load reservation information."
      );
    } finally {
      if (!signal?.aborted) {
        setLoadingReservations(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();

    loadReservations(controller.signal);

    const refreshReservations = () => {
      loadReservations();
    };

    window.addEventListener("mealshare:reservations-updated", refreshReservations);
    window.addEventListener("focus", refreshReservations);

    return () => {
      controller.abort();
      window.removeEventListener(
        "mealshare:reservations-updated",
        refreshReservations
      );
      window.removeEventListener("focus", refreshReservations);
    };
  }, [loadReservations]);

  // ==========================================
  // REAL DASHBOARD STATISTICS
  // ==========================================

  // Count meal quantities that have actually been picked up.
  const mealsRescued = useMemo(
    () =>
      reservations
        .filter((reservation) => reservation.status === "Picked Up")
        .reduce(
          (total, reservation) =>
            total +
            (reservation.items || []).reduce(
              (sum, item) => sum + Math.max(0, Number(item.quantity || 0)),
              0
            ),
          0
        ),
    [reservations]
  );

  // Calculate discounts using original prices saved in reservations.
  const foodSaved = useMemo(
    () =>
      reservations
        .filter((reservation) => reservation.status === "Picked Up")
        .reduce(
          (total, reservation) =>
            total +
            (reservation.items || []).reduce((sum, item) => {
              const oldPrice = Number(item.oldPrice || 0);
              const currentPrice = Number(item.price || 0);
              const quantity = Math.max(0, Number(item.quantity || 0));

              if (oldPrice <= currentPrice) return sum;

              return sum + (oldPrice - currentPrice) * quantity;
            }, 0),
          0
        ),
    [reservations]
  );

  // Pending and confirmed reservation quantities are being prepared.
  const mealsPreparing = useMemo(
    () =>
      reservations
        .filter((reservation) =>
          ["Pending", "Confirmed"].includes(reservation.status)
        )
        .reduce(
          (total, reservation) =>
            total +
            (reservation.items || []).reduce(
              (sum, item) => sum + Math.max(0, Number(item.quantity || 0)),
              0
            ),
          0
        ),
    [reservations]
  );

  const statValues = {
    "Meals Listed": listings.length,
    "Meals Rescued": mealsRescued,
    "Food Saved": formatCurrency(foodSaved),
    Preparing: mealsPreparing,
  };

  // ==========================================
  // SEARCH LISTINGS
  // ==========================================
  const filteredListings = listings.filter((listing) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return true;

    return (
      listing.name.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query)
    );
  });

  // ==========================================
  // NOTIFICATIONS FROM REAL RESERVATIONS
  // ==========================================
  const reservationNotifications = useMemo(
    () =>
      reservations.slice(0, 10).map((reservation) => {
        const items = reservation.items || [];

        const mealNames = items
          .map((item) => item.title)
          .filter(Boolean)
          .join(", ");

        const quantity = items.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        );

        return {
          id: reservation._id,
          title: "Reservation received",
          subtitle: `${reservation.customerName || "A receiver"} reserved ${
            quantity
          } ${quantity === 1 ? "meal" : "meals"}${
            mealNames ? ` — ${mealNames}` : ""
          }`,
        };
      }),
    [reservations]
  );

  // ==========================================
  // RECENT ACTIVITY FROM REAL RESERVATIONS
  // ==========================================
  const visibleActivities = useMemo(() => {
    const activities = reservations.map((reservation) => {
      const items = reservation.items || [];

      const mealNames = items
        .map((item) => item.title)
        .filter(Boolean)
        .join(", ");

      const quantity = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

      const status = reservation.status || "Pending";

      let type = "reservation";
      let title = "Reservation received";

      if (status === "Picked Up") {
        type = "success";
        title = "Meal picked up";
      } else if (status === "Cancelled") {
        type = "impact";
        title = "Reservation cancelled";
      } else if (status === "Confirmed") {
        title = "Reservation confirmed";
      }

      return {
        id: reservation._id,
        type,
        title,
        subtitle: `${reservation.customerName || "Receiver"} · ${
          mealNames || `${quantity} meal(s)`
        }`,
        time: formatDate(reservation.createdAt),
        createdAt: reservation.createdAt
          ? new Date(reservation.createdAt).getTime()
          : 0,
      };
    });

    activities.sort((a, b) => b.createdAt - a.createdAt);

    return showAllActivity ? activities : activities.slice(0, 4);
  }, [reservations, showAllActivity]);

  // Weekly trend uses actual picked-up reservations.
  const currentTrend = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() + mondayOffset);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);

    const start = trendPeriod === "This Week"
      ? startOfThisWeek
      : startOfLastWeek;

    const end = trendPeriod === "This Week"
      ? endOfThisWeek
      : startOfThisWeek;

    const weekReservations = reservations.filter((reservation) => {
      if (reservation.status !== "Picked Up" || !reservation.createdAt) {
        return false;
      }

      const date = new Date(reservation.createdAt);
      return date >= start && date < end;
    });

    const values = Array(7).fill(0);

    weekReservations.forEach((reservation) => {
      const date = new Date(reservation.createdAt);
      const mondayBasedDay = (date.getDay() + 6) % 7;

      const quantity = (reservation.items || []).reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      values[mondayBasedDay] += quantity;
    });

    return {
      total: values.reduce((sum, value) => sum + value, 0),
      values,
    };
  }, [reservations, trendPeriod]);

  // ==========================================
  // LISTING ACTIONS
  // ==========================================
  const handleEdit = (listing) => {
    navigate("/create-listing", {
      state: {
        listing: {
          ...listing,
          _id: listing.id,
          name: listing.name,
          quantity: listing.mealsLeft,
          originalPrice: listing.oldPrice ?? listing.price,
          discountedPrice: listing.price,
          restaurantName: listing.restaurantName || restaurantName,
        },
      },
    });
  };

  const handleDelete = async (listing) => {
    const confirmed = window.confirm(
      `Remove "${listing.name}" from your listings?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("mealshare_token");

      const response = await fetch(`${API_URL}/meals/${listing.id}`, {
      method: "DELETE",
      headers: {
      Authorization: `Bearer ${token}`,
              },
    });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete this listing.");
      }

      setListings((current) =>
        current.filter((item) => item.id !== listing.id)
      );

      setOpenMenu(null);

      window.dispatchEvent(new CustomEvent("mealshare:listings-updated"));
    } catch (error) {
      console.error("Delete listing error:", error);

      window.alert(
        error.message || "Unable to delete the listing. Please try again."
      );
    }
  };

  const scrollToListings = () => {
    document.getElementById("active-listings")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="food-lister-dashboard">
      <main className="food-lister-main">
        {/* TOP HEADER */}
        <header className="food-lister-topbar">
          <div className="food-lister-welcome">
            <span>Welcome back,</span>
            <h1>
              {restaurantName}
              <i aria-hidden="true">⌁</i>
            </h1>
            <p>Share good food. Create real impact in Vadodara.</p>
          </div>

          <div className="food-lister-topbar-actions">
            <label className="food-lister-search">
              <Search size={18} strokeWidth={2} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search listings, reservations..."
                aria-label="Search listings and reservations"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="food-lister-notification-wrap">
              <button
                type="button"
                className="food-lister-notification"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={20} strokeWidth={2} aria-hidden="true" />
                {reservationNotifications.length > 0 && (
                  <span className="food-lister-notification-dot" />
                )}
              </button>

              {notificationsOpen && (
                <div className="food-lister-notification-panel">
                  <div className="food-lister-notification-header">
                    <div>
                      <strong>Notifications</strong>
                      <span>
                        {reservationNotifications.length}{" "}
                        {reservationNotifications.length === 1
                          ? "reservation"
                          : "reservations"}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Close notifications"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="food-lister-notification-list">
                    {loadingReservations ? (
                      <div className="food-lister-notification-item">
                        <span>Loading reservations…</span>
                      </div>
                    ) : reservationsError ? (
                      <div className="food-lister-notification-item">
                        <span>{reservationsError}</span>
                      </div>
                    ) : reservationNotifications.length > 0 ? (
                      reservationNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className="food-lister-notification-item"
                          onClick={() => navigate("/reservations")}
                        >
                          <span className="notification-item-icon reservation">
                            <CalendarCheck2 size={17} />
                          </span>
                          <span>
                            <strong>{notification.title}</strong>
                            <small>{notification.subtitle}</small>
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="food-lister-notification-item">
                        <span className="notification-item-icon reservation">
                          <CalendarCheck2 size={17} />
                        </span>
                        <span>
                          <strong>No reservations yet</strong>
                          <small>New reservations will appear here.</small>
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="food-lister-notification-item"
                      onClick={() => navigate("/manage-listings")}
                    >
                      <span className="notification-item-icon listing">
                        <ClipboardList size={17} />
                      </span>
                      <span>
                        <strong>Manage your listings</strong>
                        <small>Review your published meals.</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="food-lister-notification-item"
                      onClick={() => navigate("/partner-settings")}
                    >
                      <span className="notification-item-icon update">
                        <Settings size={17} />
                      </span>
                      <span>
                        <strong>Partner settings</strong>
                        <small>Review your account settings.</small>
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="food-lister-notification-footer"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Close notifications
                  </button>
                </div>
              )}
            </div>

            <AccountMenu showSettings />
          </div>
        </header>

        {/* STATISTICS */}
        <section className="food-lister-stat-grid">
          {statCards.map((stat) => (
            <article
              key={stat.label}
              className={`food-lister-stat ${stat.className}`}
            >
              <div className="food-lister-stat-text">
                <div className="food-lister-stat-title">
                  <span className="food-lister-stat-icon">
                    {stat.label === "Meals Listed" && "🍴"}
                    {stat.label === "Meals Rescued" && "⌁"}
                    {stat.label === "Food Saved" && "♨"}
                    {stat.label === "Preparing" && "♨"}
                  </span>
                  <span>{stat.label}</span>
                </div>

                <strong>
                  {stat.label === "Meals Listed"
                    ? loadingListings
                      ? "…"
                      : statValues[stat.label]
                    : loadingReservations
                      ? "…"
                      : statValues[stat.label]}
                </strong>

                <p>
                  {stat.label === "Meals Listed"
                    ? "Your saved database listings"
                    : stat.label === "Meals Rescued"
                      ? "Quantities from completed pickups"
                      : stat.label === "Food Saved"
                        ? "Discount savings from completed pickups"
                        : "Meals in pending or confirmed reservations"}
                </p>
              </div>

              <div className="food-lister-stat-image">
                <img src={stat.image} alt="" />
              </div>
            </article>
          ))}
        </section>

        {/* CONTENT GRID */}
        <section className="food-lister-content-grid">
          {/* ACTIVE LISTINGS */}
          <article
            className="food-lister-active-card"
            id="active-listings"
          >
            <div className="food-lister-section-heading">
              <div>
                <div className="food-lister-heading-row">
                  <span className="food-lister-heading-icon">▤</span>
                  <h2>Active Listings</h2>
                </div>
                <p>Your current food listings available for reservation.</p>
              </div>

              <button
                type="button"
                className="food-lister-outline-button"
                onClick={() => navigate("/manage-listings")}
              >
                View All Listings <span>→</span>
              </button>
            </div>

            {listingsError && (
              <div role="alert" className="food-lister-load-error">
                <p>{listingsError}</p>
                <button type="button" onClick={loadListings}>
                  Try again
                </button>
              </div>
            )}

            <div className="food-lister-listings-grid">
              {loadingListings && (
                <p>Loading your listings from MongoDB...</p>
              )}

              {!loadingListings &&
                !listingsError &&
                filteredListings.length === 0 && (
                  <p>
                    {searchTerm
                      ? "No listings match your search."
                      : "No donor listings yet. Create a listing to show real meals here."}
                  </p>
                )}

              {filteredListings.map((listing) => (
                <article
                  className="food-lister-listing-card"
                  key={listing.id}
                >
                  <div className="food-lister-listing-image">
                    {listing.image ? (
                      <img src={listing.image} alt={listing.name} />
                    ) : (
                      <div
                        className="food-lister-listing-image-placeholder"
                        role="img"
                        aria-label="No food image uploaded"
                      >
                        🍽️
                      </div>
                    )}

                    <span className="food-lister-left-badge">
                      {listing.mealsLeft}{" "}
                      {listing.mealsLeft === 1 ? "meal left" : "meals left"}
                    </span>

                    <span className="food-lister-active-badge">
                      <i />
                      {listing.mealsLeft > 0 ? "Active" : "Unavailable"}
                    </span>
                  </div>

                  <div className="food-lister-listing-body">
                    <h3>{listing.name}</h3>

                    <p className="food-lister-listing-description">
                      {listing.description}
                    </p>

                    <div className="food-lister-listing-info">
                      <span>🍴 {listing.category}</span>
                      <span>♧ {listing.mealsLeft} meals left</span>
                      <span>◷ {listing.pickupTime}</span>
                      <strong>◇ {formatCurrency(listing.price)}</strong>
                    </div>

                    <div className="food-lister-listing-buttons">
                      <button
                        type="button"
                        onClick={() => handleEdit(listing)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        aria-label={`Options for ${listing.name}`}
                        aria-expanded={openMenu === listing.id}
                        onClick={() =>
                          setOpenMenu((current) =>
                            current === listing.id ? null : listing.id
                          )
                        }
                      >
                        •••
                      </button>
                    </div>

                    {openMenu === listing.id && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "10px",
                          borderRadius: "10px",
                          background: "#fff5f1",
                          border: "1px solid #ead2cf",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#51202a",
                          }}
                        >
                          Listing options
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDelete(listing)}
                          style={{
                            border: 0,
                            background: "transparent",
                            color: "#7d1f2a",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </article>

          {/* RIGHT COLUMN */}
          <aside className="food-lister-right-column">
            {/* QUICK ACTIONS */}
            <article className="food-lister-side-card quick-actions-card">
              <div className="food-lister-side-heading quick-actions-heading">
                <span>
                  <Sparkles size={18} strokeWidth={2} />
                </span>
                <h2>Quick Actions</h2>
              </div>

              <button
                type="button"
                className="food-lister-create-button"
                onClick={() => navigate("/create-listing")}
              >
                <span>
                  <Plus size={19} strokeWidth={2.5} />
                </span>
                Create a New Listing
                <b>
                  <ArrowRight size={18} strokeWidth={2} />
                </b>
              </button>

              <button
                type="button"
                className="food-lister-manage-button"
                onClick={() => navigate("/manage-listings")}
              >
                <span>
                  <ClipboardList size={18} strokeWidth={2} />
                </span>
                Manage My Listings
                <b>
                  <ArrowRight size={18} strokeWidth={2} />
                </b>
              </button>

              <button
                type="button"
                className="food-lister-manage-button"
                onClick={() => navigate("/reservations")}
              >
                <span>
                  <CalendarCheck2 size={18} strokeWidth={2} />
                </span>
                Manage Reservations
                <b>
                  <ArrowRight size={18} strokeWidth={2} />
                </b>
              </button>

              <button
                type="button"
                className="food-lister-manage-button"
                onClick={() => navigate("/partner-profile")}
              >
                <span>
                  <UserRound size={18} strokeWidth={2} />
                </span>
                Partner Profile
                <b>
                  <ArrowRight size={18} strokeWidth={2} />
                </b>
              </button>

              <button
                type="button"
                className="food-lister-manage-button"
                onClick={() => navigate("/partner-settings")}
              >
                <span>
                  <Settings size={18} strokeWidth={2} />
                </span>
                Partner Settings
                <b>
                  <ArrowRight size={18} strokeWidth={2} />
                </b>
              </button>
            </article>

            {/* WEEKLY TREND */}
            <article className="food-lister-side-card trend-card">
              <div className="food-lister-side-heading">
                <div>
                  <span>
                    <BarChart3 size={18} strokeWidth={2} />
                  </span>
                  <h2>Weekly Rescue Trend</h2>
                </div>

                <button
                  type="button"
                  className="trend-period-button"
                  onClick={() =>
                    setTrendPeriod((period) =>
                      period === "This Week" ? "Last Week" : "This Week"
                    )
                  }
                  aria-label={`Showing ${trendPeriod}. Click to switch period.`}
                >
                  {trendPeriod}
                  <ChevronDown size={15} strokeWidth={2} />
                </button>
              </div>

              <div className="food-lister-trend-summary">
                <strong>
                  {loadingReservations ? "…" : currentTrend.total}
                </strong>
                <div>
                  <span>Meals Rescued</span>
                  <p>
                    {reservationsError
                      ? "Reservation data unavailable"
                      : "Based on completed pickups"}
                  </p>
                </div>
              </div>

              <div className="food-lister-chart">
                {currentTrend.values.map((value, index) => {
                  const maxValue = Math.max(
                    1,
                    ...currentTrend.values
                  );

                  return (
                    <div
                      className="food-lister-chart-column"
                      key={index}
                    >
                      <div
                        className="food-lister-chart-bar"
                        style={{
                          height: `${Math.max(4, (value / maxValue) * 80)}px`,
                        }}
                        title={`${value} meals`}
                      />
                      <span>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* RECENT ACTIVITY */}
            <article className="food-lister-side-card activity-card">
              <div className="food-lister-side-heading">
                <div>
                  <span>◷</span>
                  <h2>Recent Activity</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllActivity((show) => !show)}
                >
                  {showAllActivity ? "Show Less" : "View All"}
                </button>
              </div>

              <div className="food-lister-activity-list">
                {loadingReservations && (
                  <p>Loading real reservation activity...</p>
                )}

                {!loadingReservations && reservationsError && (
                  <p>{reservationsError}</p>
                )}

                {!loadingReservations &&
                  !reservationsError &&
                  visibleActivities.length === 0 && (
                    <p>
                      Activity will appear here when a receiver reserves one
                      of your meals.
                    </p>
                  )}

                {visibleActivities.map((activity) => (
                  <div
                    className="food-lister-activity"
                    key={activity.id}
                  >
                    <div
                      className={`food-lister-activity-icon ${activity.type}`}
                    >
                      {activity.type === "success" && "✓"}
                      {activity.type === "impact" && "♥"}
                      {activity.type === "reservation" && "🛒"}
                    </div>

                    <div>
                      <strong>{activity.title}</strong>
                      <span>{activity.subtitle}</span>
                    </div>

                    <time>{activity.time}</time>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default FoodListerDashboard;
