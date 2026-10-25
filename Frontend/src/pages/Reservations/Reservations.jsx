
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Reservations.css";

const API_URL = "http://localhost:5000/api/reservations";

const STATUSES = ["Pending", "Confirmed", "Picked Up", "Cancelled"];

function normalizeReservation(item) {
  const firstMeal = item.items?.[0] || {};
  const createdAt = item.createdAt ? new Date(item.createdAt) : null;
  const validDate = createdAt && !Number.isNaN(createdAt.getTime());

  const food =
    item.items?.length > 1
      ? `${firstMeal.title || "Meal"} + ${item.items.length - 1} more`
      : firstMeal.title || item.mealName || "Meal reservation";

  return {
    ...item,
    id: String(item._id || item.id || ""),
    customer: item.customerName || item.userName || "Account user",
    customerEmail: item.customerEmail || "",
    food,
    category: firstMeal.category || item.category || "Other",
    date: validDate
      ? createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Not available",
    time: validDate
      ? createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    status: STATUSES.includes(item.status) ? item.status : "Pending",
    image: firstMeal.image || item.mealImage || "",
    pickupTime: item.pickupTime || firstMeal.pickupTime || "",
    pickupAddress: item.pickupAddress || "",
    totalAmount: Number(item.totalAmount || 0),
    items: item.items || [],
  };
}

function Reservations() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [pickupFilter, setPickupFilter] = useState("All Dates");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [menuReservationId, setMenuReservationId] = useState("");

  const loadReservations = useCallback(async () => {
    if (!user?.id) {
      setReservations([]);
      setError("Your account ID is missing. Please log out and log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("mealshare_token");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

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
        throw new Error(result.message || "Could not load reservations.");
      }

      const rows = Array.isArray(result.reservations)
        ? result.reservations.map(normalizeReservation)
        : [];

      setReservations(rows);

      setSelectedReservation((current) => {
        if (!current) return null;
        return rows.find((item) => item.id === current.id) || null;
      });
    } catch (err) {
      console.error("Load reservations error:", err);
      setError(
        err.message ||
          "Unable to load reservations. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReservations();

    const refresh = () => loadReservations();

    window.addEventListener("focus", refresh);
    window.addEventListener("mealshare:reservations-updated", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("mealshare:reservations-updated", refresh);
    };
  }, [loadReservations]);

  const counts = useMemo(() => {
    const result = { All: reservations.length };

    for (const status of STATUSES) {
      result[status] = reservations.filter(
        (item) => item.status === status
      ).length;
    }

    return result;
  }, [reservations]);

  const categories = useMemo(
    () => [
      ...new Set(reservations.map((item) => item.category).filter(Boolean)),
    ],
    [reservations]
  );

  const dates = useMemo(
    () => [
      ...new Set(
        reservations
          .map((item) => item.date)
          .filter((date) => date && date !== "Not available")
      ),
    ],
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    let result = [...reservations];

    if (activeTab !== "All") {
      result = result.filter((item) => item.status === activeTab);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter(
        (item) =>
          item.customer.toLowerCase().includes(query) ||
          item.food.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.customerEmail.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (pickupFilter !== "All Dates") {
      result = result.filter((item) => item.date === pickupFilter);
    }

    if (categoryFilter !== "All Categories") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    return result;
  }, [
    reservations,
    activeTab,
    search,
    statusFilter,
    pickupFilter,
    categoryFilter,
  ]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/food-lister-dashboard");
    }
  };

  const handleStatusChange = async (reservation, newStatus) => {
    if (!STATUSES.includes(newStatus)) return;

    try {
      setUpdatingId(reservation.id);
      setError("");

      const token = localStorage.getItem("mealshare_token");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(reservation.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not update reservation status."
        );
      }

      const updated = normalizeReservation(
        result.reservation || { ...reservation, status: newStatus }
      );

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id ? updated : item
        )
      );

      setSelectedReservation(updated);
      setMenuReservationId("");

      window.dispatchEvent(
        new CustomEvent("mealshare:reservations-updated")
      );
    } catch (err) {
      console.error("Update reservation status error:", err);
      setError(
        err.message ||
          "Could not update the reservation. Please try again."
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="reservations-page">
      <div className="reservations-container">
        <div className="reservations-breadcrumb">
          <button
            type="button"
            onClick={handleBack}
            className="reservations-back-button"
          >
            ← Back
          </button>
          <span>Dashboard</span>
          <b>›</b>
          <strong>Reservations</strong>
        </div>

        <section className="reservations-header">
          <div>
            <h1>Reservations</h1>
            <p>View and manage all meal reservations from customers.</p>
          </div>

          <button
            type="button"
            className="reservations-date-button"
            onClick={loadReservations}
            disabled={loading}
          >
            <span>↻</span>
            {loading ? "Refreshing..." : "Refresh"}
            <b>⌄</b>
          </button>
        </section>

        <section className="reservations-panel">
          <div className="reservations-tabs">
            {["All", ...STATUSES].map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span>{counts[tab] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="reservations-filters">
            <label className="reservations-search">
              <span>⌕</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by customer name or meal..."
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Status</option>
              {STATUSES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              value={pickupFilter}
              onChange={(event) => setPickupFilter(event.target.value)}
            >
              <option>All Dates</option>
              {dates.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All Categories</option>
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="reservations-empty" role="alert">
              <strong>Unable to complete request</strong>
              <p>{error}</p>
              <button type="button" onClick={loadReservations}>
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="reservations-empty">
              <strong>Loading reservations...</strong>
              <p>Getting reservation records from MongoDB.</p>
            </div>
          ) : (
            <div className="reservations-table-wrapper">
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Food Item</th>
                    <th>Pickup Date &amp; Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>
                        <div className="reservation-customer">
                          <div className="reservation-avatar">
                            {reservation.customer.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{reservation.customer}</strong>
                            <span>#{reservation.id.slice(-8)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="reservation-food">
                          {reservation.image ? (
                            <img
                              src={reservation.image}
                              alt={reservation.food}
                            />
                          ) : (
                            <div
                              className="reservation-avatar"
                              aria-label="No meal image"
                            >
                              🍽️
                            </div>
                          )}
                          <div>
                            <strong>{reservation.food}</strong>
                            <span>{reservation.category}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="reservation-pickup">
                          <strong>{reservation.date}</strong>
                          <span>
                            {reservation.pickupTime || reservation.time}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`reservation-status reservation-status-${reservation.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {reservation.status}
                        </span>
                      </td>

                      <td>
                        <div className="reservation-actions">
                          <button
                            type="button"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="reservation-more-button"
                            aria-label={`More options for ${reservation.customer}`}
                            onClick={() =>
                              setMenuReservationId((current) =>
                                current === reservation.id
                                  ? ""
                                  : reservation.id
                              )
                            }
                          >
                            •••
                          </button>
                        </div>

                        {menuReservationId === reservation.id && (
                          <div className="reservation-status-menu">
                            {STATUSES.map((value) => (
                              <button
                                type="button"
                                key={value}
                                disabled={
                                  updatingId === reservation.id ||
                                  value === reservation.status
                                }
                                onClick={() =>
                                  handleStatusChange(reservation, value)
                                }
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredReservations.length === 0 && !error && (
                <div className="reservations-empty">
                  <span>◌</span>
                  <strong>
                    {reservations.length === 0
                      ? "No reservations found"
                      : "No matching reservations"}
                  </strong>
                  <p>
                    {reservations.length === 0
                      ? "Reservations created by receivers will appear here."
                      : "Try changing your filters or search term."}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {selectedReservation && (
          <div
            className="reservation-modal-overlay"
            onClick={() => setSelectedReservation(null)}
          >
            <div
              className="reservation-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="reservation-modal-close"
                onClick={() => setSelectedReservation(null)}
              >
                ×
              </button>

              <span className="reservation-modal-label">
                RESERVATION DETAILS
              </span>

              <h2>{selectedReservation.food}</h2>

              <div className="reservation-modal-customer">
                <div className="reservation-avatar">
                  {selectedReservation.customer.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedReservation.customer}</strong>
                  <span>{selectedReservation.customerEmail}</span>
                  <span>#{selectedReservation.id}</span>
                </div>
              </div>

              <div className="reservation-modal-details">
                <div>
                  <span>Created</span>
                  <strong>
                    {selectedReservation.date}
                    <br />
                    {selectedReservation.time}
                  </strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{selectedReservation.category}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedReservation.status}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>₹{selectedReservation.totalAmount}</strong>
                </div>
                <div>
                  <span>Pickup address</span>
                  <strong>
                    {selectedReservation.pickupAddress || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="reservation-modal-status-actions">
                <label htmlFor="reservation-status">Update status</label>
                <select
                  id="reservation-status"
                  value={selectedReservation.status}
                  disabled={updatingId === selectedReservation.id}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedReservation,
                      event.target.value
                    )
                  }
                >
                  {STATUSES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="reservation-modal-done"
                onClick={() => setSelectedReservation(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Reservations;
