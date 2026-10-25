
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginFormInputs from "./home/components/LoginFormInputs";
import LoginButton from "./home/components/LoginButton";
import SignUpLink from "./home/components/SignUpLink";

import { getDashboardPath, useAuth } from "../context/AuthContext";

import "./home/login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("donors");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = username.trim();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        email,
        password,
        role,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate(getDashboardPath(result.user.role), {
        replace: true,
      });
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* LEFT SECTION — LOGIN FORM */}
        <div className="login-left-section">
          {/* PAGE TITLE */}
          <h1 className="login-page-title">Login</h1>

          {/* ROLE SELECTION TABS */}
          <div className="role-tabs-wrapper">
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab-btn ${
                  role === "donors" ? "active" : ""
                }`}
                onClick={() => {
                  setRole("donors");
                  setError("");
                }}
                disabled={loading}
              >
                Donors
              </button>

              <button
                type="button"
                className={`role-tab-btn ${
                  role === "receivers" ? "active" : ""
                }`}
                onClick={() => {
                  setRole("receivers");
                  setError("");
                }}
                disabled={loading}
              >
                Receivers
              </button>
            </div>

            <p className="role-description">
              {role === "donors"
                ? "For restaurants, hotels, bakeries, hostel messes, cafeterias and other food providers who list surplus food."
                : "For NGOs, charitable organizations and authorized people who reserve surplus food for distribution."}
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit}>
            <LoginFormInputs
              role={role}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
            />

            {error && (
              <p className="login-error-message" role="alert">
                {error}
              </p>
            )}

            <LoginButton role={role} />

            {loading && (
              <p role="status" aria-live="polite">
                Logging in...
              </p>
            )}

            <SignUpLink />
          </form>
        </div>

        {/* RIGHT SECTION — IMAGE WITH DIAGONAL CLIP + RED OVERLAY */}
        <div className="login-right-section">
          <img
            src={
              role === "donors"
                ? "/image/login-donor.jpeg"
                : "/image/login-receiver.jpeg"
            }
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/image/login-food.png";
            }}
            alt={
              role === "donors"
                ? "Surplus food donation donor"
                : "Meal sharing receiver group"
            }
            className="right-section-bg"
          />

          <div className="right-section-overlay" />
        </div>
      </div>
    </div>
  );
}

export default Login;
