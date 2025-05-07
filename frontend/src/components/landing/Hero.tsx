import { Link } from "react-router-dom";

import placeholder from "/landing-img.png";
import Button from "../ui/Button";

export const Hero = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-background dark:bg-background-dark">
      <div className="absolute top-20 right-10 w-20 h-20 bg-accent dark:bg-accent-dark rounded-full"></div>

      <div className="absolute bottom-10 left-10 w-12 h-12 bg-accent dark:bg-accent-dark rounded-full animate-float"></div>

      <div className="mx-auto px-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 relative inline-block wiggly-line text-foreground dark:text-foreground-dark">
              Exchange Skills, Earn Time Credits.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground dark:text-muted-foreground-dark mb-8 max-w-lg">
              Teach what you know, learn what you need &mdash; no money
              required.
            </p>

            <div className="flex justify-center md:justify-start gap-4">
              <Link to="/signup">
                <Button size="lg" className="lg:text-lg">
                  Get Started
                </Button>
              </Link>

              <a href="#about-us">
                <Button
                  size="lg"
                  variant="outline"
                  className="lg:text-lg text-primary dark:text-primary-dark border-primary dark:border-primary-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="bg-card dark:bg-card-dark shadow-lg dark:shadow-lg-dark rounded-2xl p-6 relative z-10">
              <div className="aspect-video bg-muted dark:bg-muted-dark rounded-lg flex items-center justify-center">
                <img
                  src={placeholder}
                  alt="TimeBank Hero Image"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary dark:bg-primary-dark opacity-20 rounded-full"></div>

            <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary dark:bg-primary-dark opacity-10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
