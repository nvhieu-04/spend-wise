import React from 'react';

export default function Footer() {
  return (
    <footer className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="text-sm">
            &copy; {new Date().getFullYear()} Spend Wise. All rights reserved.
      </div>
      <div className="text-sm">
        <a href="/privacy" className="hover:text-gray-400">Privacy Policy</a>
        <span className="mx-2">|</span>
        <a href="/terms" className="hover:text-gray-400">Terms of Service</a>
      </div>
    </footer>
  );
}