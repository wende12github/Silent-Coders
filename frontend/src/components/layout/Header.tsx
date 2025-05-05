import { useState } from "react";
import { Clock, Menu } from "lucide-react";
import Button from "../ui/Button";
import { useLogout } from "../../hooks/hooks";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUsers, faTrophy, faChartSimple, faUser } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  const onLogout = () => {
    logout().then(() => navigate("/"));
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-0 md:px-16 px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <div className="flex items-center gap-2">
            <Clock className="text-[28px] text-primary" />
            <h1 className="text-2xl font-bold text-primary">TimeBank</h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 px-4">
          <NavLink
              to="/"
              className={({ isActive }) => 
                `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}`
              }
            >
            Home
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) => 
              `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Groups
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => 
              `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => 
              `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => 
              `transition duration-200 py-2 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}`
            }
          >
            Profile
          </NavLink>
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
          <div className="flex flex-col space-y-3">
            <NavLink
                to="/"
                className={({ isActive }) => 
                  `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'} flex gap-6 items-center`
                }
              >
              <FontAwesomeIcon icon={faHouse} />
              Home
            </NavLink>
            <NavLink
              to="/groups"
              className={({ isActive }) => 
                `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}  flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faUsers} />
              Groups
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) => 
                `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}  flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faTrophy} />
              Leaderboard
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => 
                `transition duration-200 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}  flex gap-6 items-center`
              }
            >
              <FontAwesomeIcon icon={faChartSimple} />
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) => 
                `transition duration-200 py-2 ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-700 hover:text-primary'}  flex gap-6 items-center`
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
