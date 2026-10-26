
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_ENDPOINTS } from "../config/api";

const AUTH_STORAGE_KEY = "mealshare_auth";
const TOKEN_STORAGE_KEY = "mealshare_token";
const AUTH_EVENT = "mealshare-auth-changed";

const API_URL = API_ENDPOINTS.AUTH;

const AuthContext = createContext(null);

function readAuth() {
  try {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    return savedAuth ? JSON.parse(savedAuth) : null;
  } catch {
    return null;
  }
}

function readToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function normalizeRole(role) {
  if (role === "donors" || role === "food-lister") {
    return "food-lister";
  }

  if (role === "receivers" || role === "reserver") {
    return "reserver";
  }

  return null;
}

function saveSession(user, token) {
  const sessionUser = {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(sessionUser)
  );

  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  window.dispatchEvent(new Event(AUTH_EVENT));

  return sessionUser;
}

export function getDashboardPath(role) {
  if (role === "reserver" || role === "receivers") {
    return "/reserver-dashboard";
  }

  return "/food-lister-dashboard";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readAuth());

  useEffect(() => {
    const syncAuth = () => {
      setUser(readAuth());
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener(AUTH_EVENT, syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(AUTH_EVENT, syncAuth);
    };
  }, []);

  const signup = async ({
    name,
    email,
    password,
    role,
  }) => {
    try {
      const normalizedRole = normalizeRole(role);

      if (!normalizedRole) {
        return {
          success: false,
          message: "Please select a valid account role.",
        };
      }

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: normalizedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Registration failed.",
        };
      }

      const sessionUser = saveSession(data.user, data.token);
      setUser(sessionUser);

      return {
        success: true,
        user: sessionUser,
      };
    } catch (error) {
      console.error("Registration request failed:", error);

      return {
        success: false,
        message:
          "Cannot connect to MealShare server. Make sure the backend is running.",
      };
    }
  };

  const login = async ({
    email,
    password,
    role,
  }) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Login failed.",
        };
      }

      const selectedRole = role ? normalizeRole(role) : null;

      if (selectedRole && data.user.role !== selectedRole) {
        return {
          success: false,
          message:
            selectedRole === "food-lister"
              ? "This account is not registered as a donor."
              : "This account is not registered as a receiver.",
        };
      }

      const sessionUser = saveSession(data.user, data.token);
      setUser(sessionUser);

      return {
        success: true,
        user: sessionUser,
      };
    } catch (error) {
      console.error("Login request failed:", error);

      return {
        success: false,
        message:
          "Cannot connect to MealShare server. Make sure the backend is running.",
      };
    }
  };

  const googleAuth = async ({ credential, role, profile }) => {
    try {
      const response = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
          role,
          profile,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Google authentication failed.",
        };
      }

      const sessionUser = saveSession(data.user, data.token);
      setUser(sessionUser);

      return {
        success: true,
        user: sessionUser,
      };
    } catch (error) {
      console.error("Google authentication request failed:", error);

      return {
        success: false,
        message:
          "Cannot connect to MealShare server. Make sure the backend is running.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    setUser(null);
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  const value = {
    user,
    isAuthenticated: Boolean(user && readToken()),
    signup,
    login,
    googleAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
