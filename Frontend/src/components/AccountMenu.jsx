import {
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  useAuth,
} from "../context/AuthContext";

import "./AccountMenu.css";

function AccountMenu({
  showSettings = false,
}) {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);

    logout();

    navigate("/", {
      replace: true,
    });
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MS";

  return (
    <div className="mealshare-account-menu">
      <button
        type="button"
        className="mealshare-account-trigger"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-expanded={open}
      >
        <span className="mealshare-account-avatar">
          {initials}
        </span>

        <span className="mealshare-account-info">
          <strong>
            {user?.name || "Account"}
          </strong>

          <small>
            {user?.role === "reserver"
              ? "MealSharer"
              : "Restaurant Partner"}
          </small>
        </span>

        <ChevronDown
          size={17}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="mealshare-account-dropdown">
          <button
            type="button"
            onClick={() => {
              setOpen(false);

              navigate(
                user?.role === "food-lister"
                  ? "/partner-profile"
                  : "/reserver-dashboard"
              );
            }}
          >
            <UserRound size={16} />
            <span>Profile</span>
          </button>

          {showSettings &&
            user?.role === "food-lister" && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);

                  navigate(
                    "/partner-settings"
                  );
                }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            )}

          <div className="mealshare-account-divider" />

          <button
            type="button"
            className="mealshare-account-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;