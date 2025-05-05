import { Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
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
import GroupsPage from "../pages/GroupsPage";
import Notifications from "../pages/Notifications";
import ChatBotWidget from "../components/ChatBotWidget";
import ChatLayout from "../components/privateChat/ChatLayout";

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <LandingPage />}
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupPage />} />
          <Route element={<DashboarLayot />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/myskills" element={<MySkills />} />
            <Route path="/dashboard/sessions" element={<Sessions />} />
            <Route path="/dashboard/wallet" element={<Walet />} />
            <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
            <Route
              path="/dashboard/notifications"
              element={<Notifications />}
            />
            <Route path="/dashboard/chat" element={<ChatLayout />} />
            <Route path="/dashboard/chat" element={<ChatLayout />} />
          </Route>
        </Route>
      </Routes>
      {isAuthenticated &&  location.pathname !== "/dashboard/chat" && <ChatBotWidget />}
    </>
  );
}
export default AppRoutes;
