import React from "react";
import "../howItWorks.css";

const steps = [
  {
    number: "01",
    title: "Choose Your Plan",
    description:
      "Select a meal plan that fits your needs and discover available surplus food nearby.",
    icon: "▤",
  },
  {
    number: "02",
    title: "Discover & Reserve",
    description:
      "Browse nearby meals, check the details, and reserve what you would like to rescue.",
    icon: "⌕",
  },
  {
    number: "03",
    title: "Pick Up Your Meal",
    description:
      "Visit the local restaurant or store at the selected time and collect your rescued meal.",
    icon: "⌖",
  },
  {
    number: "04",
    title: "Enjoy & Make an Impact",
    description:
      "Enjoy good food while helping reduce waste and supporting your local community.",
    icon: "♟",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works">

      <div className="how-it-works-container">

        {/* ================= HEADING ================= */}

        <div className="how-it-works-heading">

          <span className="how-it-works-label">
            HOW IT WORKS
          </span>

          <h2>
            From surplus food to
            <br />
            <em>shared meals.</em>
          </h2>

          <p>
            MealShare makes food rescue simple, local and accessible.
          </p>

        </div>


        {/* ================= PROCESS ================= */}

        <div className="how-it-works-process">

          {/* REAL SVG CURVED LINE */}
          <svg
            className="process-svg"
            viewBox="0 0 1200 260"
            preserveAspectRatio="none"
            aria-hidden="true"
          >

            {/* soft shadow line */}
            <path
              className="process-path-shadow"
              d="
                M 20 150
                C 120 150, 150 210, 300 210
                C 430 210, 455 55, 600 55
                C 745 55, 770 210, 900 210
                C 1040 210, 1080 115, 1180 115
              "
            />

            {/* main line */}
            <path
              className="process-path"
              d="
                M 20 138
                C 120 138, 150 198, 300 198
                C 430 198, 455 43, 600 43
                C 745 43, 770 198, 900 198
                C 1040 198, 1080 103, 1180 103
              "
            />

            {/* start dot */}
            <circle
              className="process-dot"
              cx="20"
              cy="138"
              r="6"
            />

            {/* end dot */}
            <circle
              className="process-dot"
              cx="1180"
              cy="103"
              r="6"
            />

          </svg>


          {/* ================= FOUR STEPS ================= */}

          <div className="how-it-works-steps">

            {steps.map((step, index) => (

              <div
                className={`how-it-works-step step-${index + 1}`}
                key={step.number}
              >

                {/* faded number */}

                <span className="step-background-number">
                  {step.number}
                </span>


                {/* icon */}

                <div className="step-icon-position">

                  <div className="step-icon">
                    {step.icon}
                  </div>

                </div>


                {/* text */}

                <div className="step-content">

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;