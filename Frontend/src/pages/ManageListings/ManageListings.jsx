
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ManageListings.css";

const API_URL = "http://localhost:5000/api/meals";

function getListingStatus(listing) {
  const quantity = Number(listing.quantity ?? listing.mealsLeft ?? 0);

  if (quantity <= 0) return "Ended";

  if (listing.pickupDate) {
    const pickupDate = new Date(`${listing.pickupDate}T00:00:00`);

    if (!Number.isNaN(pickupDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickupDate > today) return "Scheduled";
      if (pickupDate < today) return "Ended";
    }
  }

  return "Active";
}

function formatPickup(listing) {
  if (!listing.pickupDate) {
    return listing.pickupTime || "Pickup time not set";
  }

  const date = new Date(`${listing.pickupDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return listing.pickupTime || "Pickup time not set";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dateLabel;

  if (date.getTime() === today.getTime()) {
    dateLabel = "Today";
  } else if (date.getTime() === tomorrow.getTime()) {
    dateLabel = "Tomorrow";
  } else {
    dateLabel = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return listing.pickupTime
    ? `${dateLabel}, ${listing.pickupTime}`
    : dateLabel;
}

function normalizeListing(meal) {
  const quantity = Number(meal.quantity ?? meal.mealsLeft ?? 0);
  const price = Number(meal.price ?? meal.discountedPrice ?? 0);

  return {
    ...meal,
    id: meal._id || meal.id,
    name: meal.title || meal.name || "Untitled meal",
    restaurantName: meal.business || meal.restaurantName || "",
    meals: quantity,
    mealsLeft: quantity,
    price,
    originalPrice: Number(meal.oldPrice ?? meal.originalPrice ?? 0),
    category: meal.category || "Other",
    image: meal.image || "",
    pickup: formatPickup(meal),
    status: getListingStatus(meal),
  };
}

function ManageListings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("Newest First");
  const [deletingId, setDeletingId] = useState("");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/food-lister-dashboard");
    }
  };

  const loadListings = useCallback(async () => {
    if (!user?.id) {
      setListings([]);
      setError("Your account ID is missing. Please log out and log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

     const token = localStorage.getItem("mealshare_token");

const response = await fetch(
  `${API_URL}/restaurant/${encodeURIComponent(user.id)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your listings.");
      }

      const meals = Array.isArray(result.meals) ? result.meals : [];
      setListings(meals.map(normalizeListing));
    } catch (err) {
      console.error("Manage Listings loading error:", err);
      setError(
        err.message ||
          "Unable to connect to the backend. Please check that it is running."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadListings();

    const refresh = () => loadListings();

    window.addEventListener("focus", refresh);
    window.addEventListener("mealshare:listings-updated", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("mealshare:listings-updated", refresh);
    };
  }, [loadListings]);

  const normalizedListings = useMemo(
    () => listings.map(normalizeListing),
    [listings]
  );

  const listingCounts = useMemo(
    () => ({
      All: normalizedListings.length,
      Active: normalizedListings.filter((item) => item.status === "Active")
        .length,
      Scheduled: normalizedListings.filter(
        (item) => item.status === "Scheduled"
      ).length,
      Ended: normalizedListings.filter((item) => item.status === "Ended")
        .length,
    }),
    [normalizedListings]
  );

  const categoryOptions = useMemo(
    () => [
      ...new Set(
        normalizedListings.map((item) => item.category).filter(Boolean)
      ),
    ],
    [normalizedListings]
  );

  const filteredListings = useMemo(() => {
    let result = [...normalizedListings];

    if (activeTab !== "All") {
      result = result.filter((item) => item.status === activeTab);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.restaurantName?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    if (category !== "All Categories") {
      result = result.filter((item) => item.category === category);
    }

    if (status !== "All Status") {
      result = result.filter((item) => item.status === status);
    }

    if (sort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "Meals: High to Low") {
      result.sort((a, b) => b.meals - a.meals);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [normalizedListings, activeTab, search, category, status, sort]);

  const handleEdit = (listing) => {
    navigate("/create-listing", {
      state: {
        listing: {
          ...listing,
          _id: listing.id,
          title: listing.name,
          name: listing.name,
          quantity: listing.meals,
          price: listing.price,
          oldPrice: listing.originalPrice,
          business: listing.restaurantName,
        },
      },
    });
  };

  const handleDelete = async (listing) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(listing.id);

     const token = localStorage.getItem("mealshare_token");

const response = await fetch(`${API_URL}/${listing.id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete this meal.");
      }

      setListings((current) =>
        current.filter((item) => item.id !== listing.id)
      );

      window.dispatchEvent(new CustomEvent("mealshare:listings-updated"));
    } catch (err) {
      console.error("Delete listing error:", err);
      window.alert(err.message || "Unable to delete this listing.");
    } finally {
      setDeletingId("");
    }
  };

  const handleCreateListing = () => {
    navigate("/create-listing");
  };

  return (
    <main className="manage-listings-page">
      <div className="manage-listings-container">
        <button
          type="button"
          className="manage-listings-back-button"
          onClick={handleBack}
        >
          ← Back
        </button>

        <div className="manage-listings-breadcrumb">
          <span>Dashboard</span>
          <b>›</b>
          <strong>Manage Listings</strong>
        </div>

        <section className="manage-listings-header">
          <div>
            <h1>Your Food Listings</h1>
            <p>Manage, edit or remove your active and past listings.</p>
          </div>

          <button
            type="button"
            className="manage-create-button"
            onClick={handleCreateListing}
          >
            <span>＋</span>
            Create New Listing
          </button>
        </section>

        <section className="manage-listings-panel">
          <div className="manage-tabs">
            {["All", "Active", "Scheduled", "Ended"].map((tab) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span>{listingCounts[tab]}</span>
              </button>
            ))}
          </div>

          <div className="manage-filters">
            <label className="manage-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search listings..."
                aria-label="Search listings"
              />
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option>All Categories</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Scheduled</option>
              <option>Ended</option>
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort listings"
            >
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Meals: High to Low</option>
            </select>
          </div>

          {loading && (
            <div className="manage-empty">
              Loading your listings from MongoDB...
            </div>
          )}

          {!loading && error && (
            <div className="manage-empty" role="alert">
              <p>{error}</p>
              <button type="button" onClick={loadListings}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="manage-listings-grid">
                {filteredListings.map((listing) => (
                  <article
                    className="manage-listing-card"
                    key={listing.id}
                  >
                    <div className="manage-listing-image">
                      {listing.image ? (
                        <img src={listing.image} alt={listing.name} />
                      ) : (
                        <div
                          role="img"
                          aria-label="No meal image"
                          style={{
                            display: "grid",
                            placeItems: "center",
                            width: "100%",
                            height: "100%",
                            minHeight: "150px",
                            background: "#f8e9df",
                            fontSize: "42px",
                          }}
                        >
                          🍽️
                        </div>
                      )}

                      <span
                        className={`listing-status ${listing.status.toLowerCase()}`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    <div className="manage-listing-content">
                      <span className="manage-listing-category">
                        {listing.category}
                      </span>

                      <h2>{listing.name}</h2>

                      <div className="manage-price-row">
                        <strong>₹{listing.price}</strong>

                        {listing.originalPrice > listing.price && (
                          <del>₹{listing.originalPrice}</del>
                        )}

                        {listing.status === "Active" && (
                          <span>{listing.meals} left</span>
                        )}
                      </div>

                      <p>Pickup: {listing.pickup}</p>

                      <div className="manage-card-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(listing)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          aria-label={`Delete ${listing.name}`}
                          disabled={deletingId === listing.id}
                          onClick={() => handleDelete(listing)}
                        >
                          {deletingId === listing.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filteredListings.length === 0 && (
                <div className="manage-empty">
                  {normalizedListings.length === 0
                    ? "You have no listings in the database yet. Create a new listing to get started."
                    : "No listings match your current filters."}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default ManageListings;
