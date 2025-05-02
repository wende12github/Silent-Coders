
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Login from "./pages/Login";
import GroupsPage from "./pages/GroupsPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import { Toaster } from "sonner";
function Layout() {
  const location = useLocation();

  const hideLayout = location.pathname.includes("/dashboard");

  return (
    <>
      {!hideLayout && <Header />}
      <AppRoutes />
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Login/>
      <SignUp/>
     <Toaster position="top-center" richColors  />
      
    </BrowserRouter>
  );
}

export default App;
