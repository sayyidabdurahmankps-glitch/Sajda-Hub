import type { Metadata } from "next";
import "./globals.css";
// Adjust this import path if your Navbar is in a different folder
import Navbar from "@/components/Navbar"; 

const SITE_URL = "https://sajda-union.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SAJDA Union | Students Association of Jamia Nooriyya Arabic Colleges",
    template: "%s | SAJDA Union",
  },
  description:
    "The official digital platform for Jamia Nooriyya Junior College Unions — committees, programs, four union wings and live union metrics.",
  applicationName: "SAJDA Hub",
  keywords: [
    "SAJDA Union",
    "Jamia Nooriyya",
    "Jamia Nooriya Junior Colleges",
    "SAJDA Central Committee",
    "student union",
    "union ",
  ],
  authors: [{ name: "SAJDA Central Committee" }],
  creator: "PIXIDO_DESIGNS",
  publisher: "SAJDA Central Committee",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  // Added Google Search Console Verification here!
  verification: {
    google: "googlecb028fd6bef509ce",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-ink-950 antialiased selection:bg-ocean-500/30 selection:text-ocean-900">
        {/* The Navbar now renders globally across the entire app */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}