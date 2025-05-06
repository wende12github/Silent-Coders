import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { faMessage } from "@fortawesome/free-regular-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";

export const AboutUs = () => {
  return (
    <section
      id="about-us"
      className="py-20 bg-background dark:bg-background-dark"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 relative inline-block wiggly-line text-foreground dark:text-foreground-dark">
            About TimeBank
          </h2>
          <p className="text-muted-foreground dark:text-muted-foreground-dark max-w-2xl mx-auto">
            We're on a mission to create a community where skills are valued
            equally and time becomes the universal currency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-primary/5 dark:bg-primary-dark/5 rounded-lg hover:shadow-md transition-all">
            <div className="h-14 w-14 bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-xl text-primary-foreground dark:text-primary-foreground-dark"
              />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground dark:text-foreground-dark">
              Our Community
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              Join thousands of people sharing skills, building connections, and
              supporting each other without spending money.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-primary/5 dark:bg-primary-dark/5 rounded-lg hover:shadow-md transition-all">
            <div className="h-14 w-14 bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faMessage}
                className="text-xl text-primary-foreground dark:text-primary-foreground-dark"
              />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground dark:text-foreground-dark">
              Our Values
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              We believe everyone has something valuable to teach and something
              valuable to learn. Time is our most equal asset.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-primary/5 dark:bg-primary-dark/5 rounded-lg hover:shadow-md transition-all">
            <div className="h-14 w-14 bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faClock}
                className="text-xl text-primary-foreground dark:text-primary-foreground-dark"
              />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground dark:text-foreground-dark">
              Our Promise
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              Easy and fair exchanges, transparent policies, and a platform that
              helps you build skills while building community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
