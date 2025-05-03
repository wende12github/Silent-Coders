import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/DropdownMenu";

import Button from "../ui/Button";

export const LandingHeader = () => {
  const location = useLocation();
  const showLinks =
    !location.pathname.includes("/signup") &&
    !location.pathname.includes("/login");

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-0 md:px-16 px-4 py-4 flex justify-between items-center">
        <Link to={"/"}>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClock}
              className="text-[28px] text-primary"
            />
            <h1 className="text-2xl font-bold text-primary">TimeBank</h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {showLinks && (
            <>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-primary transition duration-200"
              >
                How It Works
              </a>
              <a
                href="#about-us"
                className="text-gray-700 hover:text-primary transition duration-200"
              >
                About Us
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-primary transition duration-200"
              >
                Testimonials
              </a>
            </>
          )}
          {location.pathname !== "/login" && (
            <Link to="/login">
              <Button size="lg" className="">
                Login
              </Button>
            </Link>
          )}
          {location.pathname !== "/signup" && (
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="">
                Signup
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hover:bg-muted px-3 py-2 rounded-md"
                aria-label="Toggle mobile menu"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showLinks && (
                <>
                  <DropdownMenuItem>
                    <a href="#how-it-works" className="w-full block">
                      How It Works
                    </a>{" "}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="#about-us" className="w-full block">
                      About Us
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="#testimonials" className="w-full block">
                      Testimonials
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem>
                {location.pathname !== "/login" && (
                  <Link to="/login" className="w-full block">
                    <Button size="lg" className="w-full">
                      Login
                    </Button>
                  </Link>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {location.pathname !== "/signup" && (
                  <Link to="/signup" className="w-full block">
                    <Button size="lg" variant="secondary" className="w-full">
                      Signup
                    </Button>
                  </Link>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
