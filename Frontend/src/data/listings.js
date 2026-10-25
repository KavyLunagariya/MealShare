const STORAGE_KEY = "mealshare_listings";

// These IDs/names were demo listings bundled with the original frontend.
// Remove them during migration so old browser storage does not keep showing them.
const DEMO_IDS = new Set([
  "green-bowl",
  "bake-affairs",
  "spice-stories",
  "healthy-bites",
  "daily-kitchen",
  "dashboard-biryani",
  "dashboard-pastries",
  "dashboard-sandwich",
]);

const DEMO_NAMES = new Set([
  "the green bowl",
  "bake affairs",
  "spice stories",
  "healthy bites",
  "daily kitchen",
  "paneer biryani",
  "assorted pastries",
  "veg sandwich pack",
]);

function isDemoListing(item) {
  const id = String(item?.id ?? "");
  const name = String(item?.name ?? item?.title ?? "").trim().toLowerCase();
  return DEMO_IDS.has(id) || DEMO_NAMES.has(name);
}

function notifyListingsChanged() {
  window.dispatchEvent(new CustomEvent("mealshare:listings-updated"));
}

export function getListings() {
  try {
    const savedListings = localStorage.getItem(STORAGE_KEY);
    if (!savedListings) return [];

    const parsedListings = JSON.parse(savedListings);
    if (!Array.isArray(parsedListings)) return [];

    const realListings = parsedListings.filter((item) => item && !isDemoListing(item));
    if (realListings.length !== parsedListings.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(realListings));
    }
    return realListings;
  } catch (error) {
    console.error("Unable to load MealShare listings:", error);
    return [];
  }
}

export function saveListings(listings) {
  const realListings = Array.isArray(listings)
    ? listings.filter((item) => item && !isDemoListing(item))
    : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(realListings));
  notifyListingsChanged();
}

export function addListing(listing) {
  const existingListings = getListings();
  const updatedListings = [...existingListings, listing];
  saveListings(updatedListings);
  return listing;
}

export function updateListing(updatedListing) {
  const existingListings = getListings();
  const updatedListings = existingListings.map((listing) =>
    listing.id === updatedListing.id ? updatedListing : listing
  );
  saveListings(updatedListings);
  return updatedListing;
}

export function saveListing(listing) {
  if (listing.id) {
    const existingListings = getListings();
    if (existingListings.some((item) => item.id === listing.id)) {
      return updateListing(listing);
    }
  }
  return addListing(listing);
}
