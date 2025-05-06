import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from '@fortawesome/free-regular-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'

const features = [
  {
    icon: faSearch,
    title: "Browse Skills",
    description: "Find people offering skills you need."
  },
  {
    icon: faCalendarDays,
    title: "Book Sessions",
    description: "Request sessions and earn credits."
  },
  {
    icon: faClock,
    title: "Track Time",
    description: "Watch your time wallet grow."
  }
];

const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <div className="bg-card dark:bg-card-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-border dark:border-border-dark">
      <div className="h-12 w-12 bg-primary/20 dark:bg-primary-dark/20 rounded-full flex items-center justify-center mb-4 mx-auto">
        <FontAwesomeIcon icon={icon} className="text-primary dark:text-primary-dark opacity-70 text-xl" />
      </div>
      <h3 className="text-foreground dark:text-foreground-dark text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground dark:text-muted-foreground-dark text-center">{description}</p>
    </div>
  );
};

export const HowTo = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-muted dark:from-background-dark dark:to-muted-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground dark:text-foreground-dark text-3xl font-bold mb-4 relative inline-block wiggly-line">How It Works</h2>
          <p className="text-muted-foreground dark:text-muted-foreground-dark max-w-xl mx-auto">
            TimeBank makes skill sharing simple and rewarding through a time-based currency system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
