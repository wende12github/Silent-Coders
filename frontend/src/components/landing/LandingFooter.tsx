import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faTwitter,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

export const LandingFooter = () => {
  return (
    <footer
      className="pt-20 pb-8
                       bg-background text-foreground border-t border-border
                       dark:bg-background-dark dark:text-foreground-dark dark:border-border-dark"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary dark:text-primary-dark">
              TimeBank
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mb-4">
              Exchange skills, earn time credits, build community.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                <FontAwesomeIcon icon={faTwitter} className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
              >
                <FontAwesomeIcon icon={faGithub} className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Learn More Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-foreground-dark">
              Learn More
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Success Stories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-foreground-dark">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-foreground-dark">
              Contact
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Feedback
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors dark:text-muted-foreground-dark dark:hover:text-primary-dark"
                >
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="border-t border-border dark:border-border-dark pt-8 text-center text-muted-foreground dark:text-muted-foreground-dark text-sm">
          <p>
            &copy; {new Date().getFullYear()} TimeBank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
