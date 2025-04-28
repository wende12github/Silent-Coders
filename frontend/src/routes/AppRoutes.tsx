import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Profile";
// import MyBookings from "../pages/MyBookings";
import Leaderboard from "../pages/Leaderboard";
import LandingPage from "../pages/LandingPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/dshboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                {/* <Route path="/bookings" element={<MyBookings />} /> */}
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
        </Routes>
    );
}
export default AppRoutes;
