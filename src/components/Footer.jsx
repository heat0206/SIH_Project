import { Link } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { GraduationCap } from 'lucide-react'; // Added this import as it's used in the new footer content

const Footer = () => {
  const isOnline = useOnlineStatus();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-none">SIH 2024</h3>
                <p className="text-xs text-blue-400 font-medium">Ministry of Education</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Digitizing attendance and mid-day meal monitoring to ensure transparency and efficiency in rural education.
            </p>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 bg-gray-800 rounded-full border border-gray-700 flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-300">
                  System {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          {/* Placeholder for other columns if they were intended */}
          {/* For example:
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
          */}
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SIH 2024. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
