
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./CreateListing.css";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const API_URL = API_ENDPOINTS.MEALS;
const DEFAULT_LOCATION = [22.3072, 73.1812];

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function CreateListing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const editingListing = location.state?.listing || null;

  const [mealName, setMealName] = useState(editingListing?.name || "");
  const [category, setCategory] = useState(
    editingListing?.category || "Main Course"
  );
  const [description, setDescription] = useState(
    editingListing?.description || ""
  );
  const [quantity, setQuantity] = useState(
    editingListing?.mealsLeft ?? editingListing?.quantity ?? ""
  );
  const [originalPrice, setOriginalPrice] = useState(
    editingListing?.originalPrice ?? editingListing?.price ?? ""
  );
  const [discountedPrice, setDiscountedPrice] = useState(
    editingListing?.discountedPrice ?? editingListing?.price ?? ""
  );
  const [pickupDate, setPickupDate] = useState(
    editingListing?.pickupDate || ""
  );
  const [pickupTime, setPickupTime] = useState(
    editingListing?.pickupTime || "4:00 PM – 7:00 PM"
  );
  const [restaurantName, setRestaurantName] = useState(
    editingListing?.restaurantName ||
      user?.restaurantName ||
      user?.businessName ||
      user?.name ||
      ""
  );
  const [address, setAddress] = useState(
    editingListing?.address || user?.address || ""
  );
  const [selectedLocation, setSelectedLocation] = useState(
    editingListing?.position || null
  );
  const [photo, setPhoto] = useState(editingListing?.image || "");
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/food-lister-dashboard");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Please choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");

    const reader = new FileReader();

    reader.onload = () => setPhoto(reader.result);
    reader.onerror = () =>
      setErrorMessage("Could not read this image. Please try another.");

    reader.readAsDataURL(file);
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!user?.id) {
      setErrorMessage(
        "Your login session does not contain a user ID. Please log in again."
      );
      return;
    }

    if (!mealName.trim()) {
      setErrorMessage("Please enter a meal name.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please add a description for the meal.");
      return;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      setErrorMessage("Please enter a valid quantity of at least 1.");
      return;
    }

    if (
      discountedPrice === "" ||
      !Number.isFinite(Number(discountedPrice)) ||
      Number(discountedPrice) < 0
    ) {
      setErrorMessage("Please enter a valid discounted price.");
      return;
    }

    if (
      originalPrice !== "" &&
      (!Number.isFinite(Number(originalPrice)) ||
        Number(originalPrice) < 0)
    ) {
      setErrorMessage("Please enter a valid original price.");
      return;
    }

    if (!pickupDate) {
      setErrorMessage("Please select a pickup date.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Please enter the pickup address.");
      return;
    }

    if (!restaurantName.trim()) {
      setErrorMessage("Please enter your restaurant name.");
      return;
    }

    // The current Meal API expects an image URL or string.
    // A browser data URL can be too large for production storage.
    // We enforce a conservative limit until image hosting is connected.
    if (photo.startsWith("data:") && photo.length > 700000) {
      setErrorMessage(
        "This image is too large to send directly. Please upload a smaller image."
      );
      return;
    }

    const listing = {
      title: mealName.trim(),
      description: description.trim(),
      category,
      image: photo,
      price: Number(discountedPrice),
      oldPrice: Number(originalPrice || discountedPrice),
      quantity: Number(quantity),
      available: Number(quantity) > 0,
      business: restaurantName.trim(),
      restaurantId: user.id,
      address: address.trim(),
      phone: user.phone || "",
      pickupTime: `${pickupDate} · ${pickupTime}`,
    };

    try {
      setIsPublishing(true);

      // Existing backend has POST /api/meals for creating listings.
      // Editing requires a backend PUT endpoint, which has not been added yet.
      if (editingListing) {
        setErrorMessage(
          "Editing existing database listings is not connected yet. Create a new listing for now."
        );
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listing),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not save the meal to MongoDB."
        );
      }

      window.dispatchEvent(new CustomEvent("mealshare:listings-updated"));

      navigate("/food-lister-dashboard", { replace: true });
    } catch (error) {
      console.error("Publish meal error:", error);

      setErrorMessage(
        error.message ||
          "Unable to connect to MealShare. Check that the backend is running."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    setErrorMessage(
      "Draft saving is not connected to MongoDB yet. Your meal has not been saved as a draft."
    );
  };

  const discountPercentage =
    Number(originalPrice) > 0 && Number(discountedPrice) >= 0
      ? Math.max(
          0,
          Math.round(
            ((Number(originalPrice) - Number(discountedPrice)) /
              Number(originalPrice)) *
              100
          )
        )
      : 0;

  return (
    <main className="create-listing-page">
      <div className="create-listing-container">
        <div className="create-listing-breadcrumb">
          <span>Dashboard</span>
          <b>›</b>
          <strong>
            {editingListing ? "Edit Listing" : "Create Listing"}
          </strong>
        </div>

        <header className="create-listing-header">
          <div className="create-listing-header-main">
            <button
              type="button"
              className="create-listing-back-button"
              onClick={handleBack}
            >
              <span>←</span>
              Back
            </button>

            <div>
              <h1>
                {editingListing
                  ? "Edit Your Listing"
                  : "Create a New Listing"}
              </h1>
              <p>
                List your surplus food and help it reach someone who needs it.
              </p>
            </div>
          </div>
        </header>

        <form
          className="create-listing-layout"
          onSubmit={handlePublish}
        >
          <div className="create-listing-form-column">
            <section className="listing-card">
              <div className="listing-card-heading">
                <div>
                  <span>01</span>
                  <div>
                    <h2>Food Details</h2>
                    <p>
                      Tell MealSharers what food you have available.
                    </p>
                  </div>
                </div>
              </div>

              <div className="listing-fields-grid">
                <div className="listing-field full-width">
                  <label htmlFor="meal-name">
                    Meal Name <span>*</span>
                  </label>
                  <input
                    id="meal-name"
                    type="text"
                    value={mealName}
                    onChange={(event) => setMealName(event.target.value)}
                    placeholder="e.g. Veggie Delight Box"
                    required
                  />
                </div>

                <div className="listing-field">
                  <label htmlFor="meal-category">
                    Category <span>*</span>
                  </label>
                  <select
                    id="meal-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  >
                    <option>Main Course</option>
                    <option>Healthy Meal</option>
                    <option>Bakery</option>
                    <option>Snacks</option>
                    <option>Desserts</option>
                    <option>Beverages</option>
                  </select>
                </div>

                <div className="listing-field">
                  <label htmlFor="meal-quantity">
                    Quantity Available <span>*</span>
                  </label>
                  <div className="input-with-suffix">
                    <input
                      id="meal-quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      placeholder="10"
                      required
                    />
                    <span>boxes</span>
                  </div>
                </div>

                <div className="listing-field full-width">
                  <label htmlFor="meal-description">
                    Description <span>*</span>
                  </label>
                  <textarea
                    id="meal-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value.slice(0, 300))
                    }
                    placeholder="Describe the food, ingredients, portions, and anything MealSharers should know."
                    rows="4"
                    required
                  />
                  <small className="field-counter">
                    {description.length}/300
                  </small>
                </div>

                <div className="listing-field">
                  <label htmlFor="original-price">Original Price (₹)</label>
                  <div className="input-with-prefix">
                    <span>₹</span>
                    <input
                      id="original-price"
                      type="number"
                      min="0"
                      value={originalPrice}
                      onChange={(event) =>
                        setOriginalPrice(event.target.value)
                      }
                      placeholder="250"
                    />
                  </div>
                </div>

                <div className="listing-field">
                  <label htmlFor="discounted-price">
                    Discounted Price (₹) <span>*</span>
                  </label>
                  <div className="price-input-row">
                    <div className="input-with-prefix">
                      <span>₹</span>
                      <input
                        id="discounted-price"
                        type="number"
                        min="0"
                        value={discountedPrice}
                        onChange={(event) =>
                          setDiscountedPrice(event.target.value)
                        }
                        placeholder="80"
                        required
                      />
                    </div>

                    {discountPercentage > 0 && (
                      <span className="discount-pill">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="listing-field full-width">
                  <label htmlFor="meal-photo">
                    Food Photo <span className="optional">(optional)</span>
                  </label>
                  <label className="photo-upload-box" htmlFor="meal-photo">
                    {photo ? (
                      <img src={photo} alt="Food preview" />
                    ) : (
                      <>
                        <span className="upload-icon">↑</span>
                        <strong>Upload a food photo</strong>
                        <small>JPG, PNG or WEBP · Maximum 5 MB</small>
                      </>
                    )}
                    <input
                      id="meal-photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="listing-card">
              <div className="listing-card-heading">
                <div>
                  <span>02</span>
                  <div>
                    <h2>Pickup Details</h2>
                    <p>
                      Tell MealSharers when and where they can collect it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="listing-fields-grid">
                <div className="listing-field">
                  <label htmlFor="pickup-date">
                    Pickup Date <span>*</span>
                  </label>
                  <input
                    id="pickup-date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={pickupDate}
                    onChange={(event) => setPickupDate(event.target.value)}
                    required
                  />
                </div>

                <div className="listing-field">
                  <label htmlFor="pickup-time">
                    Pickup Time Slot <span>*</span>
                  </label>
                  <select
                    id="pickup-time"
                    value={pickupTime}
                    onChange={(event) => setPickupTime(event.target.value)}
                    required
                  >
                    <option>4:00 PM – 7:00 PM</option>
                    <option>12:00 PM – 3:00 PM</option>
                    <option>5:00 PM – 8:00 PM</option>
                    <option>6:00 PM – 9:00 PM</option>
                  </select>
                </div>

                <div className="listing-field">
                  <label htmlFor="restaurant-name">
                    Store / Restaurant Name <span>*</span>
                  </label>
                  <input
                    id="restaurant-name"
                    type="text"
                    value={restaurantName}
                    onChange={(event) =>
                      setRestaurantName(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="listing-field">
                  <label htmlFor="pickup-address">
                    Pickup Address <span>*</span>
                  </label>
                  <input
                    id="pickup-address"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter full pickup address"
                    required
                  />
                </div>
              </div>

              <div className="listing-map-section">
                <div className="map-heading">
                  <div>
                    <strong>Pickup Location</strong>
                    <span>
                      Click anywhere on the map to set the exact pickup
                      location.
                    </span>
                  </div>
                  {selectedLocation && (
                    <span className="location-selected">
                      ✓ Location selected
                    </span>
                  )}
                </div>

                <div className="listing-map">
                  <MapContainer
                    center={selectedLocation || DEFAULT_LOCATION}
                    zoom={14}
                    scrollWheelZoom={false}
                    zoomControl
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onSelect={setSelectedLocation} />
                    {selectedLocation && (
                      <CircleMarker
                        center={selectedLocation}
                        radius={10}
                        pathOptions={{
                          color: "#7d1f2a",
                          fillColor: "#ef5361",
                          fillOpacity: 0.9,
                          weight: 3,
                        }}
                      />
                    )}
                  </MapContainer>

                  {!selectedLocation && (
                    <div className="map-instruction">
                      <span>⌖</span>
                      Click the map to select pickup location
                    </div>
                  )}
                </div>
              </div>
            </section>

            {errorMessage && (
              <div className="listing-error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="listing-form-actions">
              <button
                type="submit"
                className="publish-listing-button"
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish Listing"}
                <span>→</span>
              </button>

              <button
                type="button"
                className="save-draft-button"
                onClick={handleSaveDraft}
                disabled={isPublishing}
              >
                Save as Draft
              </button>
            </div>
          </div>

          <aside className="create-listing-preview-column">
            <section className="listing-preview-card">
              <div className="preview-heading">
                <div>
                  <span>PREVIEW</span>
                  <h2>Listing Preview</h2>
                </div>
                <span className="preview-live">Live</span>
              </div>

              <div className="preview-meal-card">
                <div className="preview-meal-image">
                  {photo && <img src={photo} alt={mealName || "Meal preview"} />}
                  <span className="preview-pickup-badge">✓ Pickup Only</span>
                </div>

                <div className="preview-meal-content">
                  <span className="preview-category">{category}</span>
                  <h3>{mealName || "Your meal name"}</h3>

                  <div className="preview-price-row">
                    <strong>₹{discountedPrice || "0"}</strong>
                    {Number(originalPrice) > Number(discountedPrice) &&
                      Number(originalPrice) > 0 && (
                        <del>₹{originalPrice}</del>
                      )}
                    {discountPercentage > 0 && (
                      <span>{discountPercentage}% OFF</span>
                    )}
                  </div>
                </div>

                <div className="preview-meal-details">
                  <div>
                    <span>▣</span>
                    <div>
                      <strong>{quantity || "0"} boxes available</strong>
                      <small>Fresh surplus food</small>
                    </div>
                  </div>

                  <div>
                    <span>◷</span>
                    <div>
                      <strong>{pickupTime}</strong>
                      <small>{pickupDate || "Select pickup date"}</small>
                    </div>
                  </div>

                  <div>
                    <span>⌖</span>
                    <div>
                      <strong>{restaurantName || "Restaurant name"}</strong>
                      <small>{address || "Pickup address"}</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="listing-tips-card">
              <div className="tips-heading">
                <span>✦</span>
                <h2>Tips for a good listing</h2>
              </div>

              <ul>
                <li>
                  <span>✓</span>
                  <p>Add a clear and attractive photo.</p>
                </li>
                <li>
                  <span>✓</span>
                  <p>Mention accurate quantity and pickup time.</p>
                </li>
                <li>
                  <span>✓</span>
                  <p>Include key ingredients or allergens.</p>
                </li>
                <li>
                  <span>✓</span>
                  <p>Set a fair and affordable price.</p>
                </li>
                <li>
                  <span>✓</span>
                  <p>Make sure the food is safe to consume.</p>
                </li>
              </ul>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default CreateListing;
