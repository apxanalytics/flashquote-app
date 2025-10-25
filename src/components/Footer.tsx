import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 py-12 mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-gray-900 font-bold text-xl mb-4">FlashQuote</h3>
            <p className="text-sm text-gray-600 mb-4">
              Made for contractors, by contractors.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard/help" className="hover:text-blue-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard/help/tutorials" className="hover:text-blue-600 transition-colors">
                  Video Tutorials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 FlashQuote. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-600 flex items-center">
                🔒 Secure & Encrypted
              </span>
              <span className="text-xs text-gray-600 flex items-center">
                ✓ SOC 2 Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
