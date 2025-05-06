'use client'
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import NotificationIcon from "./NotificationIcon";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.png"
              alt="SpendWise Logo"
              width={40}
              height={40}
              className="h-8 w-8 rounded-full" 
            />
            <Link href="/" className="text-[#3A8DFF] text-xl font-bold hover:text-[#1D6FEA] transition-colors">
              SpendWise
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
};

export default Header;