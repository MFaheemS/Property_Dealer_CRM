import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropVault CRM — Premium Real Estate CRM",
  description:
    "PropVault is a premium CRM system for property dealers in Pakistan. Manage leads, agents, and analytics in one place.",
  keywords: ["CRM", "real estate", "Pakistan", "property", "DHA", "Bahria Town"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-ambient antialiased">{children}</body>
    </html>
  );
}
