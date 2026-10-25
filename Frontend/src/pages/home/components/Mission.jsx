import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../mission.css";

import missionImage from "../../../assets/images/carousel_nourishing_bowls.jpg";
import { getListings } from "../../../data/listings";

function Mission() {
  const navigate = useNavigate();
  const [impactData, setImpactData] = useState(() => calculateImpact());

  function calculateImpact() {
    const listings = getListings();
    const totalMeals = listings.reduce(
      (sum, m) => sum + (Number(m.mealsLeft ?? m.quantity ?? 1) || 0),
      0
    );
    const activePartners = new Set(
      listings.map((m) => m.donorName || m.name).filter(Boolean)
    ).size;

    return {
      totalMeals,
      activePartners,
      co2Kg: Math.round(totalMeals * 2.5),
    };
  }

  useEffect(() => {
    const handleUpdate = () => {
      setImpactData(calculateImpact());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("mealshare:listings-updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("mealshare:listings-updated", handleUpdate);
    };
  }, []);

  return (
    <section className="mission">
      <div className="mission-container">

        {/* Image */}
        <div className="mission-image-wrapper">
          <img
            src={missionImage}
            alt="Healthy meal"
            className="mission-image"
          />

          {/* Today's Impact Card */}
          <div className="mission-impact-card">
            <div className="mission-impact-circle">
              <span>{impactData.totalMeals > 0 ? impactData.totalMeals : "24+"}</span>
              <small>{impactData.totalMeals > 0 ? "Meals Live" : "Active"}</small>
            </div>

            <div className="mission-impact-content">
              <h3>Today’s Impact</h3>

              <p>
                {impactData.totalMeals > 0
                  ? `${impactData.totalMeals} surplus meals available today across Vadodara partners`
                  : "Connecting surplus food with communities across Vadodara today"}
              </p>

              <div className="mission-impact-stats">
                <span>🍃 {impactData.co2Kg > 0 ? `~${impactData.co2Kg}kg CO₂ saved` : "Zero Food Waste"}</span>
                <span>•</span>
                <span>{impactData.activePartners > 0 ? `${impactData.activePartners} Partners Live` : "Vadodara City"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Content */}
        <div className="mission-content">
          <span className="mission-label">
            Our Mission
          </span>

          <h2>
            Good Food,
            <br />
            Greater Impact
          </h2>

          <p>
            We connect surplus food with people who need it most.
            Together, we reduce waste, fight hunger, and build a
            healthier planet.
          </p>

          <button
            type="button"
            className="mission-button"
            onClick={() => navigate("/about")}
          >
            Learn More →
          </button>

          <div className="mission-features">
            <div className="mission-feature">
              <span>🍃</span>
              <p>Fresh<br />Ingredients</p>
            </div>

            <div className="mission-feature">
              <span>🥗</span>
              <p>Balanced<br />Nutrition</p>
            </div>

            <div className="mission-feature">
              <span>◷</span>
              <p>Time<br />Savings</p>
            </div>

            <div className="mission-feature">
              <span>♥</span>
              <p>Community<br />Support</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Mission;