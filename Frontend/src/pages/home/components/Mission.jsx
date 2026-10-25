import "../mission.css";

import missionImage from "../../../assets/images/carousel_nourishing_bowls.jpg";

function Mission() {
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
          <div className="impact-card">
            <div className="impact-circle">
              <span>—</span>
              <small>verified</small>
            </div>

            <div className="impact-content">
              <h3>Today’s Impact</h3>

              <p>
                Verified totals will appear as real meal activity is recorded
              </p>

              <div className="impact-stats">
                <span>Verified activity only</span>
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

          <button className="mission-button">
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