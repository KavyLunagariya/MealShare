const RESERVATIONS_STORAGE_KEY = "mealshare_reservations";

function readReservations() {
  try {
    const stored = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveReservations(reservations) {
  localStorage.setItem(
    RESERVATIONS_STORAGE_KEY,
    JSON.stringify(reservations)
  );

  window.dispatchEvent(
    new CustomEvent("mealshare:reservations-updated")
  );
}

export function getReservations() {
  return readReservations();
}

export function createReservation({
  user,
  items,
}) {
  const reservations = readReservations();

  const createdAt = new Date().toISOString();

  const newReservations = items.map((item) => ({
    id: `reservation-${Date.now()}-${item.id}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    userId: user.id,
    userName: user.name,
    userEmail: user.email,

    mealId: item.id,
    mealName: item.name,
    mealImage: item.image,

    provider: item.provider,
    address: item.address,
    phone: item.phone,

    quantity: item.cartQuantity || 1,
    price: item.price,
    totalAmount:
      Number(item.price || 0) * (item.cartQuantity || 1),

    status: "Reserved",
    createdAt,
  }));

  const updatedReservations = [
    ...reservations,
    ...newReservations,
  ];

  saveReservations(updatedReservations);

  return newReservations;
}

export function getReservationsForProvider(provider) {
  return readReservations().filter(
    (reservation) =>
      reservation.provider === provider
  );
}

export function getReservationsForUser(userId) {
  return readReservations().filter(
    (reservation) =>
      reservation.userId === userId
  );
}