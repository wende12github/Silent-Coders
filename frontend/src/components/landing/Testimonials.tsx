import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import placeholder from '../../assets/placeholder.jpg';

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    quote: "Earned 10 credits teaching yoga and used them for Spanish lessons!",
    avatar: placeholder,
    role: "Yoga Instructor"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    quote: "I traded my web design skills for home repair help. TimeBank is genius!",
    avatar: placeholder,
    role: "Web Designer"
  },
  {
    id: 3,
    name: "Aisha Johnson",
    quote: "Teaching guitar lessons on TimeBank has connected me with amazing people.",
    avatar: placeholder,
    role: "Musician"
  },
  {
    id: 4,
    name: "Jason Kim",
    quote: "Used my cooking skills to earn credits for math tutoring for my son.",
    avatar: placeholder,
    role: "Chef"
  },
  {
    id: 5, 
    name: "Elena Patel",
    quote: "TimeBank helped me learn photography while teaching others about gardening.",
    avatar: placeholder,
    role: "Gardener"
  },
  {
    id: 6,
    name: "Marcus Wilson",
    quote: "Found an amazing language exchange partner through TimeBank. Now we're friends!",
    avatar: placeholder,
    role: "Language Enthusiast"
  }
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
    <section id="testimonials" className="py-20 bg-[var(--color-primary)]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 relative inline-block wiggly-line">What Our Users Say</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Join thousands of people exchanging skills and building community.
          </p>
        </div>
        
        <div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {/* Highlighted Testimonial */}
          <div className="mb-12">
          <div className="bg-white rounded-xl shadow-md border border-[var(--color-primary)]/20 overflow-hidden transition-all duration-300">
  <div className="md:flex">
    {/* Left side - Avatar & Info */}
    <div className="md:w-1/3 bg-[var(--color-secondary)]/30 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-20 w-20 rounded-full overflow-hidden bg-[var(--color-primary)] mb-4">
          <div className="h-20 w-20 relative">
            <img
              src={testimonials[activeIndex].avatar}
              alt={testimonials[activeIndex].name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = '';
                img.alt = 'Avatar placeholder';
                
                const parent = img.parentElement;
                if (parent) {
                  parent.classList.add('bg-[var(--color-primary)]', 'flex', 'items-center', 'justify-center');
                  parent.innerHTML = `
                    <span class="text-white text-xl">
                      ${testimonials[activeIndex].name.split(' ').map(n => n[0]).join('')}
                    </span>
                  `;
                }
              }}
            />
          </div>
        </div>
        <h4 className="font-semibold text-lg">{testimonials[activeIndex].name}</h4>
        <p className="text-[var(--color-primary)]/80 text-sm">{testimonials[activeIndex].role}</p>
      </div>
    </div>

    {/* Right side - Testimonial Quote */}
    <div className="md:w-2/3 p-8 flex items-center">
      <p className="italic text-gray-700 text-lg">
        &ldquo;{testimonials[activeIndex].quote}&rdquo;
      </p>
    </div>
  </div>
</div>
          </div>
          
          {/* Grid of Smaller Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`cursor-pointer ${index === activeIndex ? 'opacity-50' : 'opacity-100'}`}
                onClick={() => goToTestimonial(index)}
              >
                <div 
  className={`h-full p-6 flex flex-col transition-all duration-300 hover:shadow-md rounded-lg border
    ${index === activeIndex 
      ? 'bg-[var(--color-secondary)] border-[var(--color-primary)]/30' 
      : 'bg-white border-gray-200'}`}
>
  <div className="flex items-center mb-4">
    <div className="h-10 w-10 mr-3 rounded-full overflow-hidden bg-[var(--color-primary)]">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="h-full w-full object-cover"
        onError={(e) => {
          const img = e.currentTarget;
          img.onerror = null;
          img.src = '';
          img.alt = 'Avatar placeholder';
          
          const parent = img.parentElement;
          if (parent) {
            parent.classList.add('flex', 'items-center', 'justify-center');
            parent.innerHTML = `
              <span class="text-white text-xs">
                ${testimonial.name.split(' ').map(n => n[0]).join('')}
              </span>
            `;
          }
        }}
      />
    </div>
    <div>
      <p className="font-medium text-sm">{testimonial.name}</p>
      <p className="text-xs text-gray-500">{testimonial.role}</p>
    </div>
  </div>
  <p className="text-gray-600 text-sm flex-grow line-clamp-3">
    &ldquo;{testimonial.quote}&rdquo;
  </p>
</div>
              </div>
            ))}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-center mt-8 gap-3">
            <button
              className="rounded-full bg-[white] h-8 w-8 flex items-center justify-center border-[var(--color-primary)] text-[var(--color-primary)]"
              onClick={prevTestimonial}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
            </button>
            <div className="flex space-x-2 items-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === i ? "w-6 bg-[var(--color-primary)]" : "w-2 bg-[var(--color-primary)]/30"
                  }`}
                  onClick={() => goToTestimonial(i)}
                ></button>
              ))}
            </div>
            <button 
              className="rounded-full bg-[white] h-8 w-8 flex items-center justify-center border-[var(--color-primary)] text-[var(--color-primary)]"
              onClick={nextTestimonial}
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};