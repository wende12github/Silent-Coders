import { Hero } from "../components/landing/Hero";
import { SectionSeparator } from "../components/landing/SectionSeparator";
import { HowTo } from "../components/landing/HowTo";
import { AboutUs } from "../components/landing/AboutUs";
import { Testimonials } from "../components/landing/Testimonials";
import { LandingFooter } from "../components/landing/LandingFooter";

const LandingPage: React.FC = () => {
  return (
    <div className="">
      <Hero />
      <SectionSeparator />
      <HowTo />
      <SectionSeparator className="rotate-180" />
      <AboutUs />
      <SectionSeparator />
      <Testimonials />
      <SectionSeparator className="rotate-180" />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
