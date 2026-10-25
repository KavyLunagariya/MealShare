import { Link } from "react-router-dom";
import heroBg from "../../assets/hero-bg.png";

function LandingHero() {
  return (
    <section className="landing-hero">

      {/* Background image */}
      <img
        src={heroBg}
        alt="Bakery window at dusk with unsold bread"
        className="landing-hero-bg"
      />

      {/* Dark overlay */}
      <div className="landing-hero-overlay" />

      <div className="landing-hero-content">

        {/* Animated cooking pot */}
        <svg
          className="landing-pot"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <g
            fill="none"
            stroke="var(--landing-ink)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          >

            {/* Main horizontal line + pot */}
            <path
              className="draw-path"
              d="M0 280 H480 C468 240 472 212 486 200 L714 200 C728 212 732 240 720 280 H1200"
            />

            {/* Pot rim */}
            <path
              className="draw-detail"
              style={{ animationDelay: "2.4s" }}
              d="M486 200 Q600 184 714 200"
            />

            {/* Left handle */}
            <path
              className="draw-detail"
              style={{ animationDelay: "2.7s" }}
              d="M486 212 C455 208 450 240 478 244"
            />

            {/* Right handle */}
            <path
              className="draw-detail"
              style={{ animationDelay: "2.7s" }}
              d="M714 212 C745 208 750 240 722 244"
            />

            {/* Steam 1 */}
            <path
              className="draw-detail"
              style={{ animationDelay: "3s" }}
              d="M560 190 C545 172 575 160 558 140 C548 126 566 116 560 104"
            />

            {/* Steam 2 */}
            <path
              className="draw-detail"
              style={{ animationDelay: "3.2s" }}
              d="M600 188 C585 168 615 156 598 136 C588 122 606 112 600 100"
            />

            {/* Steam 3 */}
            <path
              className="draw-detail"
              style={{ animationDelay: "3.4s" }}
              d="M640 190 C625 172 655 160 638 140 C628 126 646 116 640 104"
            />

            {/* Heart */}
            <path
              className="draw-detail"
              style={{ animationDelay: "3.7s" }}
              d="M600 92 C558 56 544 20 574 12 C592 7 600 24 600 34 C600 24 608 7 626 12 C656 20 642 56 600 92"
            />

          </g>
        </svg>


        {/* Main content */}
        <div className="landing-hero-text">

          <h1
            className="landing-title landing-rise"
            style={{ animationDelay: "4.6s" }}
          >
            MealShare
          </h1>

          <p
            className="landing-description landing-rise"
            style={{ animationDelay: "5s" }}
          >
            Surplus from the bakery on your corner, the kitchen down the
            block, the grocer two doors down — rescued before the shutters
            come down.
          </p>

          <div
            className="landing-buttons landing-rise"
            style={{ animationDelay: "5.4s" }}
          >

            <Link
              to="/home"
              className="landing-primary-btn"
            >
              Find food tonight
            </Link>

            <Link
              to="/home"
              className="landing-secondary-btn"
            >
              List surplus
            </Link>

          </div>

        </div>

      </div>


      {/* Scroll indicator */}
      <span className="landing-scroll">
        Scroll
      </span>

    </section>
  );
}

export default LandingHero;