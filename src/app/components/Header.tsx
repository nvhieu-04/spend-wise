"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationIcon from "./NotificationIcon";
import { dictionaries, type Locale } from "~/i18n";

function getLocaleFromPath(pathname: string): Locale {
  const [, maybeLocale] = pathname.split("/");
  if (maybeLocale === "en" || maybeLocale === "vn") return maybeLocale;
  return "en";
}

function buildPathWithLocale(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "en" || segments[0] === "vn") {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return `/${segments.join("/")}`;
}

const Header = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const locale = getLocaleFromPath(pathname);
  const dict = dictionaries[locale];
  const otherLocale: Locale = locale === "en" ? "vn" : "en";
  const switchHref = buildPathWithLocale(pathname, otherLocale);

  const dashboardHref = buildPathWithLocale("/dashboard", locale);
  const qrHref = buildPathWithLocale("/qr", locale);
  const homeHref = buildPathWithLocale("/", locale);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Image
              src="/logo.png"
              alt="SpendWise Logo"
              width={40}
              height={40}
              className="h-6 w-6 rounded-full sm:h-8 sm:w-8"
            />
            <Link
              href={homeHref}
              className="text-lg font-bold text-[#3A8DFF] transition-colors hover:text-[#1D6FEA] sm:text-xl"
            >
              {dict.header.appName}
            </Link>
          </div>

          <nav className="hidden items-center space-x-4 sm:flex">
            {session && (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
                >
                  {dict.header.dashboard}
                </Link>
                <Link
                  href={qrHref}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
                >
                  {dict.header.qr}
                </Link>
              </>
            )}
            {session ? (
              <>
                <NotificationIcon />
                <Link
                  href="api/auth/signout"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
                >
                  {dict.common.signOut}
                </Link>
              </>
            ) : (
              <Link
                href="api/auth/signin"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                {dict.common.signIn}
              </Link>
            )}
            <Link
              href={switchHref}
              className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:hidden">
            {session && <NotificationIcon />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
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

        {isMobileMenuOpen && (
          <div className="border-t border-gray-100 py-3 sm:hidden">
            <div className="flex flex-col space-y-2">
              {session ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.header.dashboard}
                  </Link>
                  <Link
                    href={qrHref}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.header.qr}
                  </Link>
                  <Link
                    href="api/auth/signout"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dict.common.signOut}
                  </Link>
                </>
              ) : (
                <Link
                  href="api/auth/signin"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {dict.common.signIn}
                </Link>
              )}
              <Link
                href={switchHref}
                className="mt-1 inline-flex w-fit items-center rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {otherLocale.toUpperCase()}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
