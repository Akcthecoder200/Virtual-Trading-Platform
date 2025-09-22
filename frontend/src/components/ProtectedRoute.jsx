import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
