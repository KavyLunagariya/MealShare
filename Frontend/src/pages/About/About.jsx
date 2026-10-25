import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    {
      number: "01",
      title: "Food Rescue",
      text: "Surplus food gets a second chance instead of becoming waste.",
    },
    {
      number: "02",
      title: "Local Community",
      text: "Connect food providers with nearby people and organizations.",
    },
    {
      number: "03",
      title: "Easy Pickup",
      text: "Reserve available meals and collect them from the listed location.",
    },
    {
      number: "04",
      title: "Social Impact",
      text: "Every rescued meal helps reduce waste and support communities.",
    },
  ];

  const benefits = [
    {
      icon: "♻",
      title: "Reduce Food Waste",
      text: "Give perfectly good surplus food a meaningful second chance.",
    },
    {
      icon: "🤝",
      title: "Connect Communities",
      text: "Bring food providers, NGOs and community organizations together.",
    },
    {
      icon: "📍",
      title: "Discover Nearby Food",
      text: "Find surplus meals available close to you.",
    },
    {
      icon: "💰",
      title: "Recover Value",
      text: "Food providers can recover value from their surplus food.",
    },
    {
      icon: "🌱",
      title: "Support Sustainability",
      text: "Help create a more sustainable and responsible food system.",
    },
    {
      icon: "❤️",
      title: "Create Social Impact",
      text: "Turn an extra meal into an opportunity to help someone.",
    },
  ];

  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>

        <div className="about-hero-content">
          <span className="about-eyebrow">
            MEALSHARE
          </span>

          <h1>About Us</h1>

          <p>
            Good Food Deserves a
            <br />
            <em>Second Chance.</em>
          </p>

          <div className="about-breadcrumb">
            MealShare <span>›</span> About Us
          </div>
        </div>
      </section>


      {/* ABOUT MEALSHARE */}
      <section className="about-section about-intro">

        <div className="about-container about-two-column">

          <div className="about-image-stack">

            <div className="about-main-image">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"
                alt="Fresh food"
              />
            </div>

            <div className="about-small-image">
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=85"
                alt="Healthy meal"
              />
            </div>

            <div className="about-experience-badge">
              <strong>100%</strong>
              <span>
                Community
                <br />
                Focused
              </span>
            </div>

          </div>


          <div className="about-content">

            <span className="section-label">
              ABOUT MEALSHARE
            </span>

            <h2>
              Good food should never
              <br />
              <em>go to waste.</em>
            </h2>

            <p className="large-text">
              At MealShare, we believe that perfectly good food
              should never go to waste when someone else could
              benefit from it.
            </p>

            <p>
              MealShare is a surplus-food rescue platform that
              connects restaurants, bakeries, hotels, cafeterias,
              hostel messes and other food providers with NGOs
              and community organizations.
            </p>

            <p>
              Our platform makes it easier to discover available
              surplus food, reserve it and collect it locally —
              creating a simple connection between food that
              might otherwise be wasted and people who can benefit
              from it.
            </p>

            <button
              className="about-primary-btn"
              onClick={() => navigate("/meals")}
            >
              FIND MEALS <span>→</span>
            </button>

          </div>

        </div>

      </section>


      {/* IMPACT STRIP */}
      <section className="impact-strip">

        <div className="impact-item">
          <span className="impact-icon">♻</span>

          <div>
            <strong>LESS</strong>
            <small>FOOD WASTE</small>
          </div>
        </div>

        <div className="impact-item">
          <span className="impact-icon">🍱</span>

          <div>
            <strong>MORE</strong>
            <small>MEALS SHARED</small>
          </div>
        </div>

        <div className="impact-item">
          <span className="impact-icon">🤝</span>

          <div>
            <strong>STRONGER</strong>
            <small>COMMUNITIES</small>
          </div>
        </div>

        <div className="impact-item">
          <span className="impact-icon">🌱</span>

          <div>
            <strong>BETTER</strong>
            <small>FUTURE</small>
          </div>
        </div>

      </section>


      {/* MISSION */}
      <section className="about-section mission-section">

        <div className="about-container about-two-column mission-grid">

          <div className="about-content">

            <span className="section-label">
              OUR MISSION
            </span>

            <h2>
              Turning surplus food
              <br />
              into <em>meaningful impact.</em>
            </h2>

            <p className="large-text">
              Reduce food waste and help surplus food reach the
              people who need it.
            </p>

            <p>
              Every day, food businesses can have perfectly
              edible food left over at the end of their operations.
              Instead of allowing that food to become waste,
              MealShare creates a simple way to connect it with
              people and organizations in the community.
            </p>

            <div className="mission-points">

              <div>
                <span>✓</span>
                <p>Rescue edible surplus food</p>
              </div>

              <div>
                <span>✓</span>
                <p>Connect local communities</p>
              </div>

              <div>
                <span>✓</span>
                <p>Make food recovery simple</p>
              </div>

            </div>

          </div>


          <div className="mission-image-wrap">

            <img
              src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1000&q=85"
              alt="Community food sharing"
            />

            <div className="mission-floating-card">

              <span>♥</span>

              <div>
                <strong>Good Food</strong>
                <small>No Food Waste.</small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* HOW MEALSHARE WORKS */}
      <section className="about-section works-section">

        <div className="about-container">

          <div className="section-heading center-heading">

            <span className="section-label">
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


          <div className="works-grid">

            {stats.map((item) => (

              <div
                className="work-card"
                key={item.number}
              >

                <div className="work-number">
                  {item.number}
                </div>

                <div className="work-line"></div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* WHO CAN USE MEALSHARE */}
      <section className="about-section users-section">

        <div className="about-container">

          <div className="section-heading">

            <span className="section-label">
              WHO CAN USE MEALSHARE
            </span>

            <h2>
              Everyone has a role
              <br />
              in <em>sharing good food.</em>
            </h2>

          </div>


          <div className="users-grid">

            <div className="user-card provider-card">

              <div className="user-icon">
                🍽️
              </div>

              <span className="user-number">
                01
              </span>

              <h3>
                Food Providers
              </h3>

              <p>
                Restaurants, bakeries, hotels, cafeterias,
                hostel messes and other food businesses can
                list their available surplus food.
              </p>

              <div className="user-list">
                <span>✓ List surplus food</span>
                <span>✓ Reduce daily food waste</span>
                <span>✓ Recover value from surplus</span>
              </div>

            </div>


            <div className="user-card receiver-card">

              <div className="user-icon">
                🤝
              </div>

              <span className="user-number">
                02
              </span>

              <h3>
                Receivers
              </h3>

              <p>
                NGOs and community organizations can discover
                available surplus food and help connect it with
                people who need it.
              </p>

              <div className="user-list">
                <span>✓ Discover nearby food</span>
                <span>✓ Reserve available meals</span>
                <span>✓ Collect and share locally</span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* WHY MEALSHARE */}
      <section className="about-section benefits-section">

        <div className="about-container">

          <div className="section-heading center-heading">

            <span className="section-label">
              WHY MEALSHARE
            </span>

            <h2>
              Small actions.
              <br />
              <em>Meaningful change.</em>
            </h2>

          </div>


          <div className="benefits-grid">

            {benefits.map((benefit, index) => (

              <div
                className="benefit-card"
                key={index}
              >

                <div className="benefit-icon">
                  {benefit.icon}
                </div>

                <div>

                  <h3>
                    {benefit.title}
                  </h3>

                  <p>
                    {benefit.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* VISION */}
      <section className="vision-section">

        <div className="vision-image"></div>

        <div className="vision-overlay"></div>

        <div className="vision-content">

          <span className="section-label light-label">
            OUR VISION
          </span>

          <h2>
            A community where
            <br />
            surplus food is seen as
            <br />
            an <em>opportunity.</em>
          </h2>

          <p>
            We envision a community where surplus food is seen
            as an opportunity, not waste.
          </p>

          <p>
            With MealShare, every extra meal has the potential
            to make a difference.
          </p>

        </div>

      </section>


      {/* MOTTO */}
      <section className="motto-section">

        <div className="motto-decoration">
          ♻
        </div>

        <span className="section-label">
          OUR MOTTO
        </span>

        <h2>
          Share Food.
          <br />
          Reduce Waste.
          <br />
          <em>Create Impact.</em>
        </h2>

      </section>


      {/* FINAL CTA */}
      <section className="about-cta">

        <div className="cta-decoration cta-two">
          ♻
        </div>

        <div className="cta-content">

          <span className="section-label light-label">
            BE PART OF THE CHANGE
          </span>

          <h2>
            One meal can make
            <br />
            <em>a difference.</em>
          </h2>

          <p>
            Find surplus food near you or become part of
            the MealShare community.
          </p>

          <div className="cta-buttons">

            <button
              className="cta-white-btn"
              onClick={() => navigate("/meals")}
            >
              FIND MEALS →
            </button>

            <button
              className="cta-outline-btn"
              onClick={() => navigate("/signup")}
            >
              GET STARTED →
            </button>

          </div>

        </div>

      </section>

    </main>
  );
};

export default About;