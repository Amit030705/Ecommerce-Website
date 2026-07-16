import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// wraps a page and redirects to /login if there's no logged in user
// pass role="seller" to also restrict the page to sellers only
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="page-loading">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
