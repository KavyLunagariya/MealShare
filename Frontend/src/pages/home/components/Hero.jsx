import { Link } from "react-router-dom";
import "../hero.css";

import heroImage from "../../../assets/images/hero.jpg";
import rescuedImage from "../../../assets/images/handoff.jpg";

function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="hero-overlay" />

      <div className="hero-content">
        {/* Hero Text */}
        <div className="hero-text">
          <div className="hero-label">
            ✦ &nbsp; Meal Sharing
          </div>

          <h1>
            Good food shouldn’t go to waste. Together, we can rescue surplus
            meals and share hope, not hunger.
          </h1>

          <Link to="/meals" className="hero-button">
            Get Involved
          </Link>
        </div>

        {/* Rescued Meal Card */}
        <div className="rescued-card">
          <img
            src={rescuedImage}
            alt="Freshly rescued meals"
          />

          <div className="rescued-card-content">
            <h3>
              Freshly
              <br />
              Rescued
            </h3>

            <p>From local businesses</p>

            <span className="rescued-arrow">→</span>
          </div>
        </div>
      </div>

      {/* Background Typography */}
      <div className="rescue-text">Rescue</div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <span>SCROLL</span>
      </div>
    </section>
  );
}

export default Hero;