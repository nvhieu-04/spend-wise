'use client'
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import NotificationIcon from "./NotificationIcon";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Image
              src="/logo.png"
              alt="SpendWise Logo"
              width={40}
              height={40}
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" 
            />
            <Link href="/" className="text-[#3A8DFF] text-lg sm:text-xl font-bold hover:text-[#1D6FEA] transition-colors">
              SpendWise
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center space-x-4">
            {session ? (
              <>
                <NotificationIcon />
                <Link
                  href="api/auth/signout"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="api/auth/signin"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Navigation - Show notification icon and menu button */}
          <div className="sm:hidden flex items-center space-x-2">
            {session && <NotificationIcon />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3">
            <div className="flex flex-col space-y-2">
              {session ? (
                <>
                  <Link
                    href="api/auth/signout"
                    className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="api/auth/signin"
                    className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;