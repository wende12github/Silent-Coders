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
import Walet from "../components/dashboard/Wallet";
import { useAuthStore } from "../store/authStore";
import HomePage from "../pages/HomePage";
import SignUp from "../pages/SignUp";
import GroupPage from "../pages/GroupPage";
import UserProfilePage from "../pages/UserProfilePage";
import GroupsPage from "../pages/GroupsPage";

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={isAuthenticated ? <HomePage /> : <LandingPage />}
      />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/groups/:groupId" element={<GroupPage />} />
      <Route path="/user/:userId" element={<UserProfilePage />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboarLayot />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/myskills" element={<MySkills />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/wallet" element={<Walet />} />
          <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default AppRoutes;
