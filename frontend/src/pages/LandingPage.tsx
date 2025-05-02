import React, {useState, useEffect} from 'react';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Hero } from '../components/landing/Hero';
import { SectionSeparator } from '../components/landing/SectionSeparator';
import { HowTo } from '../components/landing/HowTo';
import { AboutUs } from '../components/landing/AboutUs';
import { Testimonials } from '../components/landing/Testimonials';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LoadingOverlay } from '../components/landing/LoadingOverlay';

const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => setIsLoading(false);

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      
      const timeoutId = setTimeout(() => {
        handleLoad();
      }, 5000);

      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="">
      <LandingHeader />
      <Hero />
      <SectionSeparator/>
      <HowTo />
      <SectionSeparator className='rotate-180' />
      <AboutUs />
      <SectionSeparator />
      <Testimonials />
      <SectionSeparator className='rotate-180'/>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;