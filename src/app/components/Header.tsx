'use client'
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Header () {
  const { data: session } = useSession();
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">Spend Wise</div>
      <nav>
      </nav>
      <div>
        {
          session ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{session.user?.name}</span>
              <Link href="/api/auth/signout" className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Sign Out</Link>
            </div>
          ) : (
            <Link href="/api/auth/signin" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Sign In</Link>
          )
        }
      </div>
    </header>
  );
}