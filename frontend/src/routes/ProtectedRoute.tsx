import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LandingPage from "../pages/LandingPage";
import { useEffect } from "react";

function ProtectedRoute() {
  const isAuthenticated = useAuthStore().isAuthenticated;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  return isAuthenticated ? <Outlet /> : <LandingPage />;
}

export default ProtectedRoute;
