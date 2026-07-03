import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Display face for the page title — Orange Avenue (demo) from 1001fonts.
const orangeAvenue = localFont({
  variable: "--font-display",
  src: "./fonts/OrangeAvenueDEMO-Regular.woff2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Copyright Lawsuit Map",
  description:
    "An interactive, source-backed network map of copyright lawsuits against AI companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${geistMono.variable} ${orangeAvenue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
