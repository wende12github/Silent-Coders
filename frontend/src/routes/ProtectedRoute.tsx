import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LandingPage from '../pages/LandingPage';

function ProtectedRoute() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return isLoggedIn ? <Outlet /> : <LandingPage />;
}

export default ProtectedRoute;
