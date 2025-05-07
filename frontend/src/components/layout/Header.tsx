import { useState } from "react";
import { Clock, Menu } from "lucide-react";
import Button from "../ui/Button";
import { useLogout } from "../../hooks/hooks";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUsers,
  faTrophy,
  faChartSimple,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeToggle } from "../dashboard/DashboardHeader";

const Header = () => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  const onLogout = () => {
    logout().then(() => navigate("/"));
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-foreground shadow-sm sticky top-0 z-50 dark:bg-background-dark dark:text-foreground-dark dark:shadow-lg">
      <div className="mx-0 md:px-16 px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <div className="flex items-center gap-2">
            <Clock className="text-[28px] text-primary dark:text-primary-dark" />
            <h1 className="text-2xl font-bold text-primary dark:text-primary-dark">
              TimeBank
            </h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 px-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                ${
                  isActive
                    ? "text-primary dark:text-primary-dark font-medium"
                    : "hover:text-primary dark:hover:text-primary-dark"
                }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                ${
                  isActive
                    ? "text-primary dark:text-primary-dark font-medium"
                    : "hover:text-primary dark:hover:text-primary-dark"
                }`
            }
          >
            Groups
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                ${
                  isActive
                    ? "text-primary dark:text-primary-dark font-medium"
                    : "hover:text-primary dark:hover:text-primary-dark"
                }`
            }
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                ${
                  isActive
                    ? "text-primary dark:text-primary-dark font-medium"
                    : "hover:text-primary dark:hover:text-primary-dark"
                }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `transition duration-200 py-2 text-muted-foreground dark:text-muted-foreground-dark
                ${
                  isActive
                    ? "text-primary dark:text-primary-dark font-medium"
                    : "hover:text-primary dark:hover:text-primary-dark"
                }`
            }
          >
            Profile
          </NavLink>
          <ThemeToggle />

          <Button onClick={onLogout} variant="gradient">
            Logout
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-accent dark:hover:bg-accent-dark px-3 py-2 rounded-md text-foreground dark:text-foreground-dark"
          >
            <Menu />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background dark:bg-background-dark py-4 px-4 border-t border-border dark:border-border-dark animate-fade-in">
          <div className="flex flex-col space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                  ${
                    isActive
                      ? "text-primary dark:text-primary-dark font-medium"
                      : "hover:text-primary dark:hover:text-primary-dark"
                  } flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faHouse} />
              Home
            </NavLink>
            <NavLink
              to="/groups"
              className={({ isActive }) =>
                `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                  ${
                    isActive
                      ? "text-primary dark:text-primary-dark font-medium"
                      : "hover:text-primary dark:hover:text-primary-dark"
                  } flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faUsers} />
              Groups
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                  ${
                    isActive
                      ? "text-primary dark:text-primary-dark font-medium"
                      : "hover:text-primary dark:hover:text-primary-dark"
                  } flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faTrophy} />
              Leaderboard
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `transition duration-200 text-muted-foreground dark:text-muted-foreground-dark
                  ${
                    isActive
                      ? "text-primary dark:text-primary-dark font-medium"
                      : "hover:text-primary dark:hover:text-primary-dark"
                  } flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faChartSimple} />
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `transition duration-200 py-2 text-muted-foreground dark:text-muted-foreground-dark
                  ${
                    isActive
                      ? "text-primary dark:text-primary-dark font-medium"
                      : "hover:text-primary dark:hover:text-primary-dark"
                  } flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faUser} />
              Profile
            </NavLink>
            <Button onClick={onLogout} variant="destructive" size="lg">
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
