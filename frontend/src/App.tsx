import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(fas, far, fab);
import Header from "./components/layout/Header";
import { useAuthStore } from "./store/authStore";
import { LandingHeader } from "./components/landing/LandingHeader";
import { LandingFooter } from "./components/landing/LandingFooter";
import { Toaster } from "sonner";

function Layout() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const hideLayout = location.pathname.includes("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideLayout && (isAuthenticated ? <Header /> : <LandingHeader />)}
      <AppRoutes />
      {!hideLayout && isAuthenticated && <LandingFooter />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
