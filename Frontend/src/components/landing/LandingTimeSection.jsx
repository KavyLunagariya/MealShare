import timeBg from "../../assets/time-bg.png";
import LandingClock from "./LandingClock";

function LandingTimeSection() {
  const year = new Date().getFullYear();

  return (
    <section
      id="landing-tonight"
      className="landing-time-section"
    >

      {/* Background */}
      <img
        src={timeBg}
        alt="A paper bag of rescued food"
        className="landing-time-bg"
      />

      {/* Dark overlay */}
      <div className="landing-time-overlay" />


      {/* Giant year */}
      <span
        className="landing-year"
        aria-hidden="true"
      >
        {year}
      </span>


      {/* Content */}
      <div className="landing-time-content">

        <div className="landing-time-message">

          <p className="landing-right-now">
            Right now
          </p>

          <h2>
            Kitchens are closing.
            <br />
            The surplus is still warm.
          </h2>

          <p className="landing-time-description">
            Bundles are posted through the evening and claimed within
            minutes. Pick-up windows are short — the clock is part of
            the deal.
          </p>

        </div>


        <LandingClock />

      </div>

    </section>
  );
}

export default LandingTimeSection;