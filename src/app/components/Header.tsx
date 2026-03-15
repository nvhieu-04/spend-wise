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

function isActivePath(pathname: string, href: string): boolean {
  const path = pathname.replace(/^\/(en|vn)\/?/, "") || "";
  const target = href.replace(/^\/(en|vn)\/?/, "") || "";
  if (!target) return path === "" || path === "en" || path === "vn";
  return path === target || path.startsWith(target + "/");
}

const navLink =
  "rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer";
const navLinkActive = "text-[#3A8DFF] bg-blue-50 hover:bg-blue-100";
const navLinkInactive = "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

const Header = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const locale = getLocaleFromPath(pathname);
  const dict = dictionaries[locale];
  const otherLocale: Locale = locale === "en" ? "vn" : "en";
  const switchHref = buildPathWithLocale(pathname, otherLocale);

  const homeHref = buildPathWithLocale("/", locale);
  const dashboardHref = buildPathWithLocale("/dashboard", locale);
  const qrHref = buildPathWithLocale("/qr", locale);
  const importHref = buildPathWithLocale("/import", locale);

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link
            href={homeHref}
            className="flex shrink-0 items-center gap-2 sm:gap-3"
          >
            <Image
              src="/logo.png"
              alt="SpendWise Logo"
              width={40}
              height={40}
              className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
            />
            <span className="text-base font-bold text-[#3A8DFF] transition-colors hover:text-[#1D6FEA] sm:text-xl">
              {dict.header.appName}
            </span>
          </Link>

          <nav
            className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end sm:gap-1 lg:gap-2"
            aria-label="Main navigation"
          >
            {session && (
              <div className="mr-2 flex items-center gap-1 border-r border-gray-200 pr-3 lg:pr-4">
                <Link
                  href={homeHref}
                  className={`${navLink} ${isActivePath(pathname, homeHref) ? navLinkActive : navLinkInactive}`}
                >
                  {dict.header.myCards}
                </Link>
                <Link
                  href={dashboardHref}
                  className={`${navLink} ${isActivePath(pathname, dashboardHref) ? navLinkActive : navLinkInactive}`}
                >
                  {dict.header.dashboard}
                </Link>
                <Link
                  href={qrHref}
                  className={`${navLink} ${isActivePath(pathname, qrHref) ? navLinkActive : navLinkInactive}`}
                >
                  {dict.header.qr}
                </Link>
                <Link
                  href={importHref}
                  className={`${navLink} ${isActivePath(pathname, importHref) ? navLinkActive : navLinkInactive}`}
                >
                  {dict.header.import}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-1">
              {session && <NotificationIcon />}
              <Link
                href={switchHref}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:px-3"
              >
                {otherLocale.toUpperCase()}
              </Link>
              {session ? (
                <Link
                  href="api/auth/signout"
                  className={`${navLink} ${navLinkInactive}`}
                >
                  {dict.common.signOut}
                </Link>
              ) : (
                <Link
                  href="api/auth/signin"
                  className={`${navLink} ${navLinkInactive}`}
                >
                  {dict.common.signIn}
                </Link>
              )}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:hidden">
            <Link
              href={switchHref}
              className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {otherLocale.toUpperCase()}
            </Link>
            {session && <NotificationIcon />}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
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
          <div
            className="border-t border-gray-100 py-3 sm:hidden"
            role="dialog"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-0.5">
              {session && (
                <>
                  <Link
                    href={homeHref}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActivePath(pathname, homeHref) ? "bg-blue-50 text-[#3A8DFF]" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
                    onClick={closeMobile}
                  >
                    {dict.header.myCards}
                  </Link>
                  <Link
                    href={dashboardHref}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActivePath(pathname, dashboardHref) ? "bg-blue-50 text-[#3A8DFF]" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
                    onClick={closeMobile}
                  >
                    {dict.header.dashboard}
                  </Link>
                  <Link
                    href={qrHref}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActivePath(pathname, qrHref) ? "bg-blue-50 text-[#3A8DFF]" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
                    onClick={closeMobile}
                  >
                    {dict.header.qr}
                  </Link>
                  <Link
                    href={importHref}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActivePath(pathname, importHref) ? "bg-blue-50 text-[#3A8DFF]" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
                    onClick={closeMobile}
                  >
                    {dict.header.import}
                  </Link>
                  <div className="my-2 border-t border-gray-100" />
                  <Link
                    href="api/auth/signout"
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    onClick={closeMobile}
                  >
                    {dict.common.signOut}
                  </Link>
                </>
              )}
              {!session && (
                <Link
                  href="api/auth/signin"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  onClick={closeMobile}
                >
                  {dict.common.signIn}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
