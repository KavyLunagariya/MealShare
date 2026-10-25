import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PartnerProfile.css";

const DEFAULT_PROFILE = {
  restaurantName: "The Green Bowl",
  ownerName: "Green Bowl Team",
  email: "contact@greenbowl.com",
  phone: "+91 98765 43210",
  address: "Alkapuri",
  city: "Vadodara",
  description:
    "Fresh, healthy meals prepared with care and shared with the community.",
};

const PROFILE_STORAGE_KEY = "mealshare_partner_profile";

function PartnerProfile() {
    const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/food-lister-dashboard");
  };
  const [profile, setProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (error) {
      console.error("Unable to load partner profile:", error);
    }

    return DEFAULT_PROFILE;
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error("Unable to save partner profile:", error);
    }
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );

      setSaved(true);
    } catch (error) {
      console.error("Unable to save partner profile:", error);
    }
  };

  return (
    <main className="partner-profile-page">
       <button
      type="button"
      className="partner-profile-back-button"
      onClick={handleBack}
    >
      ← Back
    </button>
      <section className="partner-profile-header">
       
        <div>
          <p className="partner-profile-eyebrow">
            Partner Dashboard
          </p>

          <h1>Partner Profile</h1>

          <p>
            Manage your restaurant information and contact details.
          </p>
        </div>

        <div className="partner-profile-avatar">
          GB
        </div>
      </section>

      <form
        className="partner-profile-card"
        onSubmit={handleSubmit}
      >
        <div className="partner-profile-section">
          <div className="partner-profile-section-heading">
            <h2>Restaurant Information</h2>

            <p>
              This information will be visible to MealShare users.
            </p>
          </div>

          <div className="partner-profile-grid">
            <label>
              Restaurant Name
              <input
                type="text"
                name="restaurantName"
                value={profile.restaurantName}
                onChange={handleChange}
              />
            </label>

            <label>
              Contact Person
              <input
                type="text"
                name="ownerName"
                value={profile.ownerName}
                onChange={handleChange}
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              Address
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
              />
            </label>

            <label>
              City
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleChange}
              />
            </label>

            <label className="partner-profile-full-width">
              About Your Restaurant
              <textarea
                name="description"
                value={profile.description}
                onChange={handleChange}
                rows="4"
              />
            </label>
          </div>
        </div>

        <div className="partner-profile-footer">
          {saved && (
            <span className="partner-profile-success">
              Profile updated successfully.
            </span>
          )}

          <button type="submit">
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}

export default PartnerProfile;