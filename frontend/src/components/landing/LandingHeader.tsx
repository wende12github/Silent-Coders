import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

export const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className='mx-0 md:px-16 px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-[8px]'>
          <FontAwesomeIcon icon={faClock} className='text-[28px] text-[var(--color-primary)]'/>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">TimeBank</h1>
        </div>
        <div className='hidden md:flex items-center gap-[16px]'>
          <a href='#how-it-works' className="text-gray-700 hover:text-[var(--color-primary)] transition duration-200">How It Works</a>
          <a href='#about-us' className="text-gray-700 hover:text-[var(--color-primary)] transition duration-200">About Us</a>
          <a href='#testimonials' className="text-gray-700 hover:text-[var(--color-primary)] transition duration-200">Testimonials</a>
          <Link to='/login'><Button size='lg' className="">Login</Button></Link>
          <Link to="/signup"><Button size='lg' variant="secondary" className="">Signup</Button></Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='hover:bg-[var(--color-muted)] px-3 py-2 rounded-[var(--radius)]'>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 border-t animate-fade-in" style={{ borderTopColor: 'var(--color-primary)' }}>
          <div className="flex flex-col space-y-1">
            <a href="#how-it-works" className="text-gray-700 hover:text-[var(--color-primary)] transition duration-200 py-2">
              How It Works
            </a>
            <a href="#about-us" className="text-gray-700 hover:text-[var(--color-primary)] transition duration-200 py-2">
              About Us
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-[var(--color-primary)] transition duration-200 py-2">
              Testimonials
            </a>
            <button className="hover:text-timebank-blue transition duration-200 border-1 rounded-[var(--radius)] font-medium text-[var(--color-primary)] px-4 py-2 hover:bg-[var(--color-muted)]">Login</button>
          <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[white] font-medium rounded-[var(--radius)] px-4 py-2">Signup</button>
          </div>
        </div>
      )}
    </div>
  );
}