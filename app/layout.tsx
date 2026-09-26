import type { Metadata } from "next";
import "./globals.css";
// Adjust this import path if your Navbar is in a different folder
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";

const SITE_URL = "https://sajda-union.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SAJDA Union | Students Association of Jamia Nooriyya Arabic Colleges",
    template: "%s | SAJDA Union",
  },
  description:
    "The official digital platform for Jamia Nooriyya Junior College Unions — committees, programs, four union wings and live union metrics.",
  applicationName: "SAJDA Union",
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
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  // Added Google Search Console Verification here!
  verification: {
    google: "x0yVVMqFfsRu0tOzbeBHIhKE8WeOg0FwAy8IEkucFpU",  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 
        Added min-h-screen and flex-col so the footer always 
        pushes cleanly to the bottom of the page.
      */}
      <body className="flex min-h-screen flex-col bg-[#F8FAFC] text-ink-950 antialiased selection:bg-ocean-500/30 selection:text-ocean-900">
        <Navbar />
        
        {/* Main content wrapper */}
        <div className="flex-grow">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}