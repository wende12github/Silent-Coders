import { useState } from "react";

import { Clock, Menu } from "lucide-react";
import Button from "../ui/Button";
import { useLogout } from "../../hooks/hooks";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { logoutUser } = useLogout();
  const navigate = useNavigate();

  const onLogout = () => {
    logoutUser().then(() => navigate("/"));
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-0 md:px-16 px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <div className="flex items-center gap-[8px]">
            <Clock className="text-[28px] text-primary" />
            <h1 className="text-2xl font-bold text-primary">TimeBank</h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-[16px]">
          <a
            href="/dashboard"
            className="text-gray-700 hover:text-primary transition duration-200"
          >
            Dashboard
          </a>
          <a
            href="/dashboard/settings"
            className="text-gray-700 hover:text-primary transition duration-200"
          >
            Profile
          </a>
          <a
            href="/dashboard/settings"
            className="text-gray-700 hover:text-primary transition duration-200"
          >
            Settings
          </a>

          <Button onClick={onLogout} variant="gradient" className="">
            Logout
          </Button>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-muted px-3 py-2 rounded-md"
          >
            <Menu />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 border-t animate-fade-in border-t-primary">
          <div className="flex flex-col space-y-1">
            <a
              href="/dashboard"
              className="text-gray-700 hover:text-primary transition duration-200 py-2"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="text-gray-700 hover:text-primary transition duration-200 py-2"
            >
              Profile
            </a>
            <a
              href="/settings"
              className="text-gray-700 hover:text-primary transition duration-200 py-2"
            >
              Settings
            </a>

            <Button variant="destructive" size="lg">
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
