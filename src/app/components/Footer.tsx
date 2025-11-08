import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className='sm:flex sm:flex-col sm:items-center sm:justify-center sm:space-x-3'>
          <h3 className="text-blue-600 text-lg font-semibold mb-3 sm:mb-4">SpendWise</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage your bank cards, track spending, and maximize rewards in one place.
          </p>
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