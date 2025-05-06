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
    <div
      className="shadow-sm sticky top-0 z-50
                   bg-background text-foreground border-b border-border
                   dark:bg-background-dark dark:text-foreground-dark dark:border-border-dark"
    >
      <div className="mx-0 md:px-16 px-4 py-4 flex justify-between items-center">
        <Link to={"/"}>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClock}
              className="text-[28px] text-primary dark:text-primary-dark"
            />
            <h1 className="text-2xl font-bold text-primary dark:text-primary-dark">
              TimeBank
            </h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {showLinks && (
            <>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-primary transition duration-200 dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                How It Works
              </a>
              <a
                href="#about-us"
                className="text-muted-foreground hover:text-primary transition duration-200 dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                About Us
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-primary transition duration-200 dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                Testimonials
              </a>
            </>
          )}
          {location.pathname !== "/login" && (
            <Link to="/login">
              <Button size="lg">Login</Button>
            </Link>
          )}
          {location.pathname !== "/signup" && (
            <Link to="/signup">
              <Button size="lg" variant="secondary">
                Signup
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="px-3 py-2 rounded-md
                           hover:bg-muted text-foreground
                           dark:hover:bg-muted-dark dark:text-foreground-dark"
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

              {location.pathname !== "/login" && (
                <DropdownMenuItem>
                  <Link to="/login" className="w-full block">
                    <Button size="lg" className="w-full">
                      Login
                    </Button>
                  </Link>
                </DropdownMenuItem>
              )}
              {location.pathname !== "/signup" && (
                <DropdownMenuItem>
                  <Link to="/signup" className="w-full block">
                    <Button size="lg" variant="secondary" className="w-full">
                      Signup
                    </Button>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
