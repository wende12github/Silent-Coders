import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
// import LandingPage from '../pages/LandingPage';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Outlet />; // <LandingPage /> if not logged in
}

export default ProtectedRoute;
