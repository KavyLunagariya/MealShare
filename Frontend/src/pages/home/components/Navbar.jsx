import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const linkStyle = {
    color: "#51202a",
    textDecoration: "none",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    padding: "0",
    margin: "0",
  };

  const buttonStyle = {
    height: "40px",
    padding: "0 24px",
    borderRadius: "999px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    cursor: "pointer",
    boxSizing: "border-box",
    margin: "0",
  };

  return (
    <header
      className="navbar"
      style={{
        position: "relative",
        zIndex: 1000,
        width: "100%",
        height: "72px",
        background: "#f7f1e8",
        borderBottom: "1px solid rgba(81, 32, 42, 0.08)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="navbar-container"
        style={{
          width: "calc(100% - 80px)",
          maxWidth: "none",
          height: "72px",
          margin: "0 auto",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >

        {/* =====================================================
            LOGO — FAR LEFT
        ===================================================== */}

        <button
          type="button"
          className="navbar-logo"
          onClick={() => navigate("/")}
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            margin: "0",
            padding: "0",
            border: "0",
            background: "transparent",
            color: "#51202a",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "25px",
            fontWeight: 700,
            lineHeight: 1,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="navbar-logo-mark"
            style={{
              display: "inline-block",
              color: "#ef5361",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "31px",
              lineHeight: 1,
              transform: "rotate(-25deg)",
            }}
          >
            ⌁
          </span>

          <span>MealShare</span>
        </button>


        {/* =====================================================
            ALL NAVIGATION — FAR RIGHT
        ===================================================== */}

        <nav
          className="navbar-right"
          style={{
            marginLeft: "auto",
            marginRight: "0",
            padding: "0",
            width: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "30px",
            flex: "0 0 auto",
          }}
        >

          {/* MAIN LINKS */}

          <div
            className="navbar-links"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "28px",
              margin: "0",
              padding: "0",
              width: "auto",
              flex: "0 0 auto",
            }}
          >

            <NavLink
              to="/"
              style={({ isActive }) => ({
                ...linkStyle,
                color: isActive ? "#7d1f2a" : "#51202a",
                fontWeight: isActive ? 700 : 600,
              })}
            >
              Home
            </NavLink>

            <NavLink
              to="/meals"
              style={({ isActive }) => ({
                ...linkStyle,
                color: isActive ? "#7d1f2a" : "#51202a",
                fontWeight: isActive ? 700 : 600,
              })}
            >
              Meals
            </NavLink>

            <NavLink
              to="/about"
              style={({ isActive }) => ({
                ...linkStyle,
                color: isActive ? "#7d1f2a" : "#51202a",
                fontWeight: isActive ? 700 : 600,
              })}
            >
              About Us
            </NavLink>

          </div>


          {/* ACTION BUTTONS */}

          <div
            className="navbar-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              margin: "0",
              padding: "0",
              width: "auto",
              flex: "0 0 auto",
            }}
          >

            {/* LOGIN */}

            <button
              type="button"
              className="login-button"
              onClick={() => navigate("/login")}
              style={{
                ...buttonStyle,
                border: "1px solid rgba(81, 32, 42, 0.2)",
                background: "transparent",
                color: "#51202a",
              }}
            >
              Login
            </button>


            {/* SIGN UP */}

            <button
              type="button"
              className="signup-button"
              onClick={() => navigate("/signup")}
              style={{
                ...buttonStyle,
                border: "1px solid rgba(81, 32, 42, 0.2)",
                background: "transparent",
                color: "#51202a",
              }}
            >
              Sign Up
            </button>


            {/* DASHBOARD */}

            <button
              type="button"
              className="dashboard-button"
              onClick={() => navigate("/food-lister-dashboard")}
              style={{
                ...buttonStyle,
                minWidth: "125px",
                border: "1px solid #7d1f2a",
                background: "#7d1f2a",
                color: "#ffffff",
                paddingLeft: "28px",
                paddingRight: "28px",
              }}
            >
              Dashboard
            </button>

          </div>

        </nav>

      </div>
    </header>
  );
}

export default Navbar;