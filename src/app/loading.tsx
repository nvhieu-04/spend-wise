import React from 'react';

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-800">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">
          Loading
          <span className="inline-block animate-bounce text-blue-500">.</span>
          <span className="inline-block animate-bounce delay-100 text-blue-500">.</span>
          <span className="inline-block animate-bounce delay-200 text-blue-500">.</span>
        </h1>
        <p className="text-lg text-gray-600">Please wait while we prepare your experience</p>
      </div>
    </main>
  );
}