import placeholder from "../../assets/placeholder.png";
import Button from "../ui/Button";

export const Hero = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-20 h-20 bg-[var(--color-accent)] rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-12 h-12 bg-[var(--color-accent)] rounded-full animate-float"></div>

      <div className="mx-16 px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 relative inline-block wiggly-line">
              Exchange Skills, Earn Time Credits.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
              Teach what you know, learn what you need &mdash; no money
              required.
            </p>
            <div className="flex justify-center md:justify-start gap-8">
              <Button size="lg" className="lg:text-lg!">
                Get Started
              </Button>
              <a href="#about-us">
                <Button
                  size="lg"
                  variant="secondary"
                  className="lg:text-lg! rounded-sm text-primary border-pr"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="bg-white shadow-lg rounded-2xl p-6 relative z-10">
              <div className="aspect-video bg-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                <img src={placeholder} width={300} />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[var(--color-primary)] opacity-20 rounded-full"></div>
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-[var(--color-primary)] opacity-10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
