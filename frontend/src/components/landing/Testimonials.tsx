import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import placeholder from "/landing-img.png";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    quote: "Earned 10 credits teaching yoga and used them for Spanish lessons!",
    avatar: placeholder,
    role: "Yoga Instructor",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    quote:
      "I traded my web design skills for home repair help. TimeBank is genius!",
    avatar: placeholder,
    role: "Web Designer",
  },
  {
    id: 3,
    name: "Aisha Johnson",
    quote:
      "Teaching guitar lessons on TimeBank has connected me with amazing people.",
    avatar: placeholder,
    role: "Musician",
  },
  {
    id: 4,
    name: "Jason Kim",
    quote:
      "Used my cooking skills to earn credits for math tutoring for my son.",
    avatar: placeholder,
    role: "Chef",
  },
  {
    id: 5,
    name: "Elena Patel",
    quote:
      "TimeBank helped me learn photography while teaching others about gardening.",
    avatar: placeholder,
    role: "Gardener",
  },
  {
    id: 6,
    name: "Marcus Wilson",
    quote:
      "Found an amazing language exchange partner through TimeBank. Now we're friends!",
    avatar: placeholder,
    role: "Language Enthusiast",
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToTestimonial = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    let interval: number | undefined;

    if (autoplay) {
      interval = window.setInterval(() => {
        nextTestimonial();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, activeIndex]);

  return (
    <section id="testimonials" className="py-20 bg-muted dark:bg-muted-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 relative inline-block wiggly-line text-foreground dark:text-foreground-dark">
            What Our Users Say
          </h2>

          <p className="text-muted-foreground dark:text-muted-foreground-dark max-w-xl mx-auto">
            Join thousands of people exchanging skills and building community.
          </p>
        </div>

        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div className="mb-12">
            <div className="bg-card dark:bg-card-dark rounded-xl shadow-md border border-border dark:border-border-dark overflow-hidden transition-all duration-300">
              <div className="md:flex">
                <div className="md:w-1/3 bg-muted dark:bg-muted-dark p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full overflow-hidden bg-primary dark:bg-primary-dark mb-4">
                      <div className="h-20 w-20 relative">
                        <img
                          src={testimonials[activeIndex].avatar}
                          alt={testimonials[activeIndex].name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.onerror = null;
                            img.src = "";
                            img.alt = "Avatar placeholder";

                            const parent = img.parentElement;
                            if (parent) {
                              parent.classList.add(
                                "bg-primary",
                                "dark:bg-primary-dark",
                                "flex",
                                "items-center",
                                "justify-center"
                              );
                              parent.innerHTML = `
                                <span class="text-primary-foreground dark:text-primary-foreground-dark text-xl">
                                  ${testimonials[activeIndex].name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              `;
                            }
                          }}
                        />
                      </div>
                    </div>

                    <h4 className="font-semibold text-lg text-foreground dark:text-foreground-dark">
                      {testimonials[activeIndex].name}
                    </h4>

                    <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm">
                      {testimonials[activeIndex].role}
                    </p>
                  </div>
                </div>

                <div className="md:w-2/3 p-8 flex items-center">
                  <p className="italic text-foreground dark:text-foreground-dark text-lg">
                    &ldquo;{testimonials[activeIndex].quote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`cursor-pointer ${
                  index === activeIndex ? "opacity-50" : "opacity-100"
                }`}
                onClick={() => goToTestimonial(index)}
              >
                <div
                  className={`h-full p-6 flex flex-col transition-all duration-300 hover:shadow-md rounded-lg border
                    ${
                      index === activeIndex
                        ? "bg-muted dark:bg-muted-dark border-primary/30 dark:border-primary-dark/30"
                        : "bg-card dark:bg-card-dark border-border dark:border-border-dark"
                    }`}
                >
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 mr-3 rounded-full overflow-hidden bg-primary dark:bg-primary-dark">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.src = "";
                          img.alt = "Avatar placeholder";

                          const parent = img.parentElement;
                          if (parent) {
                            parent.classList.add(
                              "flex",
                              "items-center",
                              "justify-center",
                              "bg-primary",
                              "dark:bg-primary-dark"
                            );
                            parent.innerHTML = `
                              <span class="text-primary-foreground dark:text-primary-foreground-dark text-xs">
                                ${testimonial.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            `;
                          }
                        }}
                      />
                    </div>

                    <div>
                      <p className="font-medium text-sm text-foreground dark:text-foreground-dark">
                        {testimonial.name}
                      </p>

                      <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm flex-grow line-clamp-3">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 gap-3">
            <button
              className="rounded-full bg-card dark:bg-card-dark h-8 w-8 flex items-center justify-center border border-border dark:border-border-dark text-primary dark:text-primary-dark"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
            </button>

            <div className="flex space-x-2 items-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === i
                      ? "w-6 bg-primary dark:bg-primary-dark"
                      : "w-2 bg-muted-foreground/50 dark:bg-muted-foreground-dark/50"
                  }`}
                  onClick={() => goToTestimonial(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                ></button>
              ))}
            </div>

            <button
              className="rounded-full bg-card dark:bg-card-dark h-8 w-8 flex items-center justify-center border border-border dark:border-border-dark text-primary dark:text-primary-dark"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
