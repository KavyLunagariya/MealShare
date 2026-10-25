// Centralized API configuration for MealShare
// In production, configure VITE_API_URL in your hosting platform (e.g. https://your-backend.onrender.com/api)
// In development, defaults to local backend at http://localhost:5000/api

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/auth`,
  MEALS: `${API_BASE_URL}/meals`,
  RESERVATIONS: `${API_BASE_URL}/reservations`,
};

export default API_BASE_URL;
