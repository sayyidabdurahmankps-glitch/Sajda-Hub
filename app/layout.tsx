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
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
  
  // This is the direct message to Google's Search Bots
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SAJDA Union",
    "alternateName": "SAJDA Central Committee",
    "url": "https://sajda-union.vercel.app",
  };

  return (
    <html lang="en">
      <head>
        {/* Inject the Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#F8FAFC] text-ink-950 antialiased selection:bg-ocean-500/30 selection:text-ocean-900">
        <Navbar />
        
       <div className="flex-grow">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}