import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons'

export const LandingFooter = () => {
  return (
    <footer className="bg-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">TimeBank</h3>
            <p className="text-gray-600 mb-4">Exchange skills, earn time credits, build community.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <FontAwesomeIcon icon={faTwitter} className='text-2xl' />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <FontAwesomeIcon icon={faFacebook} className='text-2xl' />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <FontAwesomeIcon icon={faInstagram} className='text-2xl' />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <FontAwesomeIcon icon={faGithub} className='text-2xl' />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Learn More</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Feedback</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Report an Issue</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TimeBank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};