import "../ourImpact.css";

const impactStats = [
  {
    number: "12,450+",
    label: "Meals Rescued",
    icon: "◉",
  },
  {
    number: "5.2 Tons",
    label: "CO₂ Prevented",
    icon: "♧",
  },
  {
    number: "8,700+",
    label: "People Impacted",
    icon: "♧",
  },
  {
    number: "320+",
    label: "Local Partners",
    icon: "▦",
  },
];

function OurImpact() {
  return (
    <section className="our-impact">
      <div className="our-impact-container">
        {/* Our Impact introduction */}
        <div className="our-impact-intro">
          <div className="impact-leaf">⌁</div>

          <div>
            <h2>Our Impact</h2>
            <p>Real change. Together.</p>
          </div>
        </div>

        {/* Demo statistics — Our Impact section only */}
        <div className="impact-stats">
          {impactStats.map((stat) => (
            <div className="impact-stat" key={stat.label}>
              <div className="impact-stat-icon">
                {stat.icon}
              </div>

              <div>
                <strong>{stat.number}</strong>
                <span>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurImpact;