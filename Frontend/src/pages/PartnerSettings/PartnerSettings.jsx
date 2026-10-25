import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PartnerSettings.css";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  reservationNotifications: true,
  listingUpdates: true,
  weeklySummary: false,
};

const SETTINGS_STORAGE_KEY = "mealshare_partner_settings";

function PartnerSettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("Unable to load partner settings:", error);
    }

    return DEFAULT_SETTINGS;
  });

  const [saved, setSaved] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/food-lister-dashboard");
  };

  const handleToggle = (name) => {
    setSettings((current) => ({
      ...current,
      [name]: !current[name],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);
    } catch (error) {
      console.error("Unable to save partner settings:", error);
    }
  };

  return (
    <main className="partner-settings-page">
      <button
        type="button"
        className="partner-settings-back-button"
        onClick={handleBack}
      >
        ← Back
      </button>

      <section className="partner-settings-header">
        <div>
          <p className="partner-settings-eyebrow">
            Partner Dashboard
          </p>

          <h1>Settings</h1>

          <p>
            Manage your notification preferences and account settings.
          </p>
        </div>
      </section>

      <section className="partner-settings-card">
        <div className="partner-settings-section">
          <div className="partner-settings-section-heading">
            <h2>Notifications</h2>

            <p>
              Choose which updates you would like to receive.
            </p>
          </div>

          <div className="partner-settings-options">
            <div className="partner-setting-row">
              <div>
                <h3>Email Notifications</h3>
                <p>Receive important updates by email.</p>
              </div>

              <button
                type="button"
                className={`partner-toggle ${
                  settings.emailNotifications ? "active" : ""
                }`}
                onClick={() =>
                  handleToggle("emailNotifications")
                }
                aria-label="Toggle email notifications"
              >
                <span />
              </button>
            </div>

            <div className="partner-setting-row">
              <div>
                <h3>Reservation Notifications</h3>
                <p>
                  Get notified when a customer makes a reservation.
                </p>
              </div>

              <button
                type="button"
                className={`partner-toggle ${
                  settings.reservationNotifications ? "active" : ""
                }`}
                onClick={() =>
                  handleToggle("reservationNotifications")
                }
                aria-label="Toggle reservation notifications"
              >
                <span />
              </button>
            </div>

            <div className="partner-setting-row">
              <div>
                <h3>Listing Updates</h3>
                <p>Receive updates about your food listings.</p>
              </div>

              <button
                type="button"
                className={`partner-toggle ${
                  settings.listingUpdates ? "active" : ""
                }`}
                onClick={() =>
                  handleToggle("listingUpdates")
                }
                aria-label="Toggle listing updates"
              >
                <span />
              </button>
            </div>

            <div className="partner-setting-row">
              <div>
                <h3>Weekly Summary</h3>
                <p>
                  Receive a weekly summary of your MealShare activity.
                </p>
              </div>

              <button
                type="button"
                className={`partner-toggle ${
                  settings.weeklySummary ? "active" : ""
                }`}
                onClick={() =>
                  handleToggle("weeklySummary")
                }
                aria-label="Toggle weekly summary"
              >
                <span />
              </button>
            </div>
          </div>
        </div>

        <div className="partner-settings-footer">
          {saved && (
            <span className="partner-settings-success">
              Settings saved successfully.
            </span>
          )}

          <button
            type="button"
            className="partner-settings-save"
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      </section>
    </main>
  );
}

export default PartnerSettings;