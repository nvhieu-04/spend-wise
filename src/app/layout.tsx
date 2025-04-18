import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import AuthProvider from "~/components/SessionProvider";

export const metadata: Metadata = {
  title: "Spend Wise",
  description: "A simple expense tracker",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
     <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
