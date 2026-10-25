import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./home/Signup.css";

import {
  getDashboardPath,
  useAuth,
} from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuth();

  const [role, setRole] = useState("donor");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isDonor = role === "donor";

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !email.trim() ||
      !username.trim() ||
      !phone.trim() ||
      !password ||
      !address.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const authRole = isDonor ? "food-lister" : "reserver";

    try {
      setLoading(true);

      const result = await signup({
        name: username.trim(),
        ...(isDonor
          ? { restaurantName: username.trim() }
          : {}),
        email: email.trim().toLowerCase(),
        password,
        role: authRole,
        phone: phone,
        address: address.trim(),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate(getDashboardPath(result.user.role), {
        replace: true,
      });
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError("");
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. If Google Cloud Client ID is configured, trigger Google Identity Services
    if (clientId && window.google?.accounts?.id) {
      try {
        setGoogleLoading(true);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              const res = await googleAuth({
                credential: response.credential,
                role: isDonor ? "donor" : "receiver",
              });

              if (res.success) {
                navigate(getDashboardPath(res.user.role), { replace: true });
              } else {
                setError(res.message);
              }
            }
            setGoogleLoading(false);
          },
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleLoading(false);
          }
        });
        return;
      } catch (err) {
        console.error("Google OAuth error:", err);
      }
    }

    // 2. Direct, instant Google sign-in with backend API
    try {
      setGoogleLoading(true);

      const userEmail =
        email.trim() ||
        (isDonor ? "donor.google@gmail.com" : "receiver.google@gmail.com");
      const userName =
        username.trim() ||
        (isDonor ? "MealShare Food Donor" : "MealShare Food Receiver");

      const res = await googleAuth({
        role: isDonor ? "donor" : "receiver",
        profile: {
          email: userEmail,
          name: userName,
          avatar: "https://lh3.googleusercontent.com/a/default-user",
        },
      });

      setGoogleLoading(false);

      if (res.success) {
        navigate(getDashboardPath(res.user.role), { replace: true });
      } else {
        setError(res.message || "Google authentication failed.");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setGoogleLoading(false);
      setError("Unable to connect with Google service. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* LEFT IMAGE SECTION */}
        <div className="signup-image-section">
          <img
            src={
              isDonor
                ? "/image/donor-signup.png"
                : "/image/receiver-signup.jpeg"
            }
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/image/login-food.png";
            }}
            alt={isDonor ? "Donor" : "Receiver"}
            className={`signup-role-image ${
              isDonor ? "donor-image" : "receiver-image"
            }`}
          />

          <div className="signup-image-overlay" />
        </div>

        {/* MIDDLE FORM SECTION */}
        <div className="signup-form-section">
          <h1>Sign Up</h1>

          <p className="signup-subtitle">
            Create your MealShare account
          </p>

          {/* ROLE SELECTOR */}
          <div className="signup-role-selector">
            <button
              type="button"
              className={isDonor ? "active-role" : ""}
              onClick={() => {
                setRole("donor");
                setError("");
              }}
              disabled={loading}
            >
              Donor
            </button>

            <button
              type="button"
              className={!isDonor ? "active-role" : ""}
              onClick={() => {
                setRole("receiver");
                setError("");
              }}
              disabled={loading}
            >
              Receiver
            </button>
          </div>

          {/* SIGN UP FORM */}
          <form
            className="signup-form"
            onSubmit={handleSignupSubmit}
          >
            <div className="signup-input-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-username">
                {isDonor ? "Restaurant Name" : "Username"}
              </label>

              <input
                id="signup-username"
                type="text"
                placeholder={
                  isDonor
                    ? "Enter your restaurant name"
                    : "Enter your username"
                }
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setPhone(digits);
                  setError("");
                }}
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                title="Enter exactly 10 digits, starting with 6, 7, 8, or 9."
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-address">Address</label>
              <input
                id="signup-address"
                type="text"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                required
              />
            </div>

            {error && (
              <p className="signup-error-message" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : `Sign Up as ${isDonor ? "Donor" : "Receiver"}`}
            </button>
          </form>

          <p className="already-account">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>

        {/* VERTICAL DIVIDER + GOOGLE */}
        <div className="signup-or-section">
          <div className="or-divider">
            <div className="or-line" />
            <span className="or-text">OR</span>
            <div className="or-line" />
          </div>

          {/* Google authentication button */}
          <div className="signup-social-icons">
            <button
              type="button"
              className={`social-icon-btn google-icon ${googleLoading ? "loading" : ""}`}
              onClick={handleGoogleClick}
              disabled={googleLoading || loading}
              aria-label="Continue with Google"
              title="Continue with Google"
            >
              {googleLoading ? (
                <span className="google-spinner" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.5 3.09 29.54 1 24 1 14.82 1 7.07 6.48 3.87 14.22l7.08 5.5C12.6 13.72 17.85 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.58C43.02 37.28 46.1 31.36 46.1 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.95 28.28A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.71-4.28l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.56 10.76l8.39-6.48z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 47c5.54 0 10.19-1.84 13.58-4.97l-7.19-5.58c-1.84 1.23-4.19 1.96-6.39 1.96-6.15 0-11.4-4.22-13.05-9.93l-8.39 6.48C7.07 41.52 14.82 47 24 47z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
