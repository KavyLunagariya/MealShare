import { Navigate } from "react-router-dom";
import {
  getDashboardPath,
  useAuth,
} from "../context/AuthContext";

function ProtectedRoute({
  children,
  allowedRole,
}) {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRole &&
    user?.role !== allowedRole
  ) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;