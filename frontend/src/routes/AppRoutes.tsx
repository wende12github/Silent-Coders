import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Profile";
import Leaderboard from "../pages/Leaderboard";
import LandingPage from "../pages/LandingPage";
import Settings from "../components/dashboard/Settings";
import DashboarLayot from "../components/dashboard/DashboarLayot";
import MySkills from "../components/dashboard/MySkills";
import Sessions from "../components/dashboard/Sessions";
import TimeWalet from "../components/dashboard/TimeWalet";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<LandingPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboarLayot />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/myskills" element={<MySkills />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/wallet" element={<TimeWalet />} />
          <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
        </Route>
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>
    </Routes>
  );
}
export default AppRoutes;
