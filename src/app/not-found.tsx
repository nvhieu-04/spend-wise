import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-800">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight text-gray-800 sm:text-7xl">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-semibold text-gray-800">
            Page Not Found
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The page you&apos;re looking for doesn&lsquo;t exist or has been moved.
          </p>
        </div>
        <Link 
          href="/"
          className="px-6 py-3 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
}