import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LandingPage from '../pages/LandingPage';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <LandingPage /> ;
}

export default ProtectedRoute;
