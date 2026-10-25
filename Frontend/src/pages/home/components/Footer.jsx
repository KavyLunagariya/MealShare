import "../footer.css";

const exploreLinks = [
  "Browse Meals",
  "How It Works",
  "Our Impact",
  "Our Story",
];

const partnerLinks = [
  "For Donors",
  "For Businesses",
  "Community",
  "Get Involved",
];

const supportLinks = [
  "Help Center",
  "FAQs",
  "Safety & Trust",
  "Contact Us",
];

function Footer() {
  return (
    <footer className="mealshare-footer">

      {/* Animated decorative elements */}
      <div className="footer-orbit footer-orbit-one" />
      <div className="footer-orbit footer-orbit-two" />

      <span className="footer-spark footer-spark-one">✦</span>
      <span className="footer-spark footer-spark-two">✦</span>
      <span className="footer-heart">♥</span>

      <div className="footer-container">

        {/* =================================================
            TOP FOOTER
            ================================================= */}

        <div className="footer-main">

          {/* BRAND */}
          <div className="footer-brand">

            <div className="footer-logo">

              <span className="footer-logo-mark">
                ↯
              </span>

              <span>
                MealShare
              </span>

            </div>

            <h2>
              Rescue food.
              <br />
              <span>Share hope.</span>
            </h2>

            <p>
              Good food deserves another table.
              Together, we connect surplus meals
              with people who can use them.
            </p>

            <a
              href="#meals"
              className="footer-primary-link"
            >
              Explore Rescued Meals
              <span>→</span>
            </a>

          </div>


          {/* EXPLORE */}
          <div className="footer-column">

            <h3>
              Explore
            </h3>

            <ul>
              {exploreLinks.map((link) => (
                <li key={link}>
                  <a href="#top">
                    {link}
                  </a>
                </li>
              ))}
            </ul>

          </div>


          {/* PARTNERS */}
          <div className="footer-column">

            <h3>
              For Partners
            </h3>

            <ul>
              {partnerLinks.map((link) => (
                <li key={link}>
                  <a href="#top">
                    {link}
                  </a>
                </li>
              ))}
            </ul>

          </div>


          {/* SUPPORT */}
          <div className="footer-column">

            <h3>
              Support
            </h3>

            <ul>
              {supportLinks.map((link) => (
                <li key={link}>
                  <a href="#top">
                    {link}
                  </a>
                </li>
              ))}
            </ul>

          </div>

        </div>


        {/* =================================================
            LARGE WORDMARK
            ================================================= */}

        <div className="footer-wordmark">

          <div className="footer-wordmark-line">
            <span />
            <strong>♥</strong>
            <span />
          </div>

          <div className="footer-wordmark-text">
            MealShare
          </div>

          <p>
            LESS WASTE
            <span>•</span>
            MORE SHARING
            <span>•</span>
            MORE HOPE
          </p>

        </div>


        {/* =================================================
            BOTTOM
            ================================================= */}

        <div className="footer-bottom">

          <span>
            © 2026 MealShare
          </span>

          <div>

            <a href="#privacy">
              Privacy
            </a>

            <a href="#terms">
              Terms
            </a>

            <a href="#accessibility">
              Accessibility
            </a>

          </div>

          <span>
            Made for the community.
          </span>

        </div>

      </div>

    </footer>
  );
}

export default Footer;