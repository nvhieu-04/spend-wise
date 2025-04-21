'use client'
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-blue-600 text-xl font-bold hover:text-blue-700 transition-colors">
              SpendWise
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/cards"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Cards
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
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
        </div>
      </div>
    </header>
  );
};

export default Header;