import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <h3 className="text-blue-600 text-lg font-semibold mb-3 sm:mb-4">SpendWise</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Manage your bank cards, track spending, and maximize rewards in one place.
            </p>
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-gray-900 text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-blue-600 text-sm transition-colors inline-block py-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/cards"
                  className="text-gray-600 hover:text-blue-600 text-sm transition-colors inline-block py-1"
                >
                  My Cards
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-blue-600 text-sm transition-colors inline-block py-1"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
            <h3 className="text-gray-900 text-lg font-semibold mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@spendwise.com"
                  className="text-gray-600 hover:text-blue-600 text-sm transition-colors inline-block py-1 break-all"
                >
                  support@spendwise.com
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/spendwise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 text-sm transition-colors inline-block py-1"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm text-center">
            © {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;