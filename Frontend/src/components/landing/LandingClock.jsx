import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function LandingClock() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const time = now
    ? now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "--:--";

  const date = now
    ? now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const timezone = now
    ? Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone
        .replace(/_/g, " ")
    : "";

  return (
    <div className="landing-clock">

      <p className="landing-clock-time">
        {time}
      </p>

      <p className="landing-clock-zone">
        {timezone}
      </p>

      <p className="landing-clock-date">
        {date}
      </p>

      <Link to="/home" className="landing-enter-btn">
        Enter MealShare →
      </Link>

    </div>
  );
}

export default LandingClock;