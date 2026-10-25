import "./home/Meals.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FilterBar from "./home/components/FilterBar";
import MealCard from "./home/components/MealCard";
import CartModal from "./home/components/CartModal";

const API_URL = "http://localhost:5000/api";

function normalizeListing(listing) {
  const quantity = Number(
    listing.quantity ?? listing.stock ?? listing.mealsLeft ?? 0
  );

  return {
    ...listing,
    id: listing._id ?? listing.id,
    name: listing.title ?? listing.name ?? "",
    category: listing.category ?? "Other",
    description: listing.description ?? "",
    provider:
      listing.business ??
      listing.restaurantName ??
      listing.provider ??
      "Local Donor",
    distance: listing.distance ?? "",
    address: listing.address ?? "",
    phone: listing.phone ?? "",
    quantity,
    stock: quantity,
    price: Number(listing.price ?? 0),
    originalPrice:
      Number(listing.oldPrice) > 0
        ? Number(listing.oldPrice)
        : undefined,
    image: listing.image ?? "",
  };
}

function Meals() {
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [distance, setDistance] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [sampleMeals, setSampleMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealsError, setMealsError] = useState("");

  // Fetch real meals from the backend
  useEffect(() => {
    const controller = new AbortController();

    async function fetchMeals() {
      try {
        setMealsLoading(true);
        setMealsError("");

        const response = await fetch(`${API_URL}/meals`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load meals.");
        }

        const realMeals = (data.meals || [])
          .map(normalizeListing)
          .filter((meal) => meal.id && meal.quantity > 0);

        setSampleMeals(realMeals);
      } catch (error) {
        if (error.name !== "AbortError") {
          setMealsError(
            error.message ||
              "Unable to connect to the MealShare backend."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setMealsLoading(false);
        }
      }
    }

    fetchMeals();

    return () => controller.abort();
  }, []);

  // CART STATE
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openCart) {
      setIsCartOpen(true);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  // Dynamic Category Counts
  const categoryCounts = {
    All: sampleMeals.length,
    "Full Meals": sampleMeals.filter(
      (m) => m.category === "Full Meals"
    ).length,
    Bakery: sampleMeals.filter(
      (m) => m.category === "Bakery"
    ).length,
    Beverages: sampleMeals.filter(
      (m) => m.category === "Beverages"
    ).length,
    Snacks: sampleMeals.filter(
      (m) => m.category === "Snacks"
    ).length,
    "Fruits & Vegetables": sampleMeals.filter(
      (m) => m.category === "Fruits & Vegetables"
    ).length,
    Desserts: sampleMeals.filter(
      (m) => m.category === "Desserts"
    ).length,
  };

  // Filter meals
  const filteredMeals = sampleMeals.filter((meal) => {
    const matchesCategory =
      selectedCategory === "All" ||
      meal.category === selectedCategory;

    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      meal.name.toLowerCase().includes(search) ||
      meal.description.toLowerCase().includes(search) ||
      meal.provider.toLowerCase().includes(search) ||
      meal.category.toLowerCase().includes(search);

    const mealDist = parseFloat(meal.distance);

    // Distance is not stored in the current Meal schema.
    // Do not hide meals when no distance is available.
    const matchesDistance =
      Number.isNaN(mealDist) || mealDist <= distance;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesDistance &&
      meal.quantity > 0
    );
  });

  // Add meal to cart
  const handleAddToCart = (meal) => {
    const maxStock = Number(meal.stock ?? meal.quantity ?? 0);

    if (maxStock < 1) return;

    setCartItems((prevItems) => {
      const existing = prevItems.find(
        (item) => item.id === meal.id
      );

      if (existing) {
        if ((existing.cartQuantity || 1) >= maxStock) {
          return prevItems;
        }

        return prevItems.map((item) =>
          item.id === meal.id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
              }
            : item
        );
      }

      return [
        ...prevItems,
        {
          ...meal,
          stock: maxStock,
          cartQuantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (mealId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(mealId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== mealId) return item;

        const maxStock = Number(
          item.stock ?? item.quantity ?? 0
        );

        return {
          ...item,
          cartQuantity: Math.min(newQuantity, maxStock),
        };
      })
    );
  };

  const handleRemoveItem = (mealId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== mealId)
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = cartItems.reduce(
    (sum, item) => sum + (item.cartQuantity || 1),
    0
  );

  const cartTotalAmount = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * (item.cartQuantity || 1),
    0
  );

  const handleReset = () => {
    setSelectedCategory("All");
    setDistance(10);
    setSearchTerm("");
  };

  return (
    <div className="meals-page">
      {/* DOODLE HERO SECTION */}
      <div className="meals-doodle-wrapper">
        <img
          src="/image/doodles.png"
          alt=""
          className="meals-doodle-background"
        />

        <div className="meals-content">
          <div className="meals-badge">
            <span className="badge-icon">🌱</span>
            <span>SURPLUS FOOD RESCUE • VADODARA</span>
          </div>

          <h1>Find Meals Near You</h1>

          <p className="meals-description">
            Discover and reserve available surplus food nearby from
            local bakeries, kitchens, and grocers before it goes to
            waste. Prices and quantities are provided by the donors.
          </p>

          <div className="meals-info">
            <div className="info-pill">
              <span>📍</span>
              <span>Vadodara City</span>
            </div>

            <div className="info-pill">
              <span>🛍️</span>
              <span>
                {sampleMeals.length} Surplus Meals Available
              </span>
            </div>

            <div className="info-pill">
              <span>🏷️</span>
              <span>Donor-listed meals only</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        distance={distance}
        setDistance={setDistance}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryCounts={categoryCounts}
        filteredCount={filteredMeals.length}
        onReset={handleReset}
        cartItemCount={cartItemCount}
        cartTotalAmount={cartTotalAmount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* MEAL CARDS */}
      <section className="meals-grid-section">
        {mealsLoading ? (
          <div className="no-meals-found">
            <h3>Loading surplus meals...</h3>
            <p>Fetching the latest listings from local donors.</p>
          </div>
        ) : mealsError ? (
          <div className="no-meals-found">
            <h3>Unable to load meals</h3>
            <p>{mealsError}</p>
            <button
              className="reset-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filteredMeals.length > 0 ? (
          <div className="meals-grid">
            {filteredMeals.map((meal) => {
              const inCartItem = cartItems.find(
                (item) => item.id === meal.id
              );

              return (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  cartQuantity={
                    inCartItem ? inCartItem.cartQuantity : 0
                  }
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        ) : (
          <div className="no-meals-found">
            <h3>No surplus meals found</h3>

            <p>
              We couldn't find any surplus meals matching your
              filters within <strong>{distance} km</strong>
              {selectedCategory !== "All" && (
                <>
                  {" "}for <strong>{selectedCategory}</strong>
                </>
              )}
              .
            </p>

            <button
              className="reset-button"
              type="button"
              onClick={handleReset}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* CART MODAL */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default Meals;