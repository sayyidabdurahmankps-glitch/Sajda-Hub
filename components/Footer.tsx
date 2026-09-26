"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer entirely on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="group flex items-center gap-4">
              
              {/* Added your logo here, keeping the nice hover scale effect! */}
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl shadow-ocean-sm transition-transform group-hover:scale-105">
                <Image
                  src="/icon.svg"
                  alt="SAJDA Hub Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>

              <div>
                <p className="text-lg font-black text-ocean-950 transition-colors group-hover:text-ocean-700">
                  SAJDA Central Committee
                </p>
              </div>
            </Link>

            <div className="mt-7 space-y-3 text-sm font-medium leading-relaxed text-ink-600">
              <p className="font-extrabold text-ocean-800">
                Students Association of Jamia Nooriyya for Devoted Activities
              </p>

              <p>
                Central coordination of Jamia Junior Colleges
                <br />
                Jamia Nooriya Arabic College
                <br />
                Faizabad, Pattikkad P.O., Perinthalmanna
                <br />
                Malappuram District, Kerala — 679325
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:gap-x-20">
            <div>
              <p className="mb-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-400">
                Platform
              </p>

              <div className="flex flex-col gap-4 text-sm font-bold text-ink-600">
                <Link
                  href="/unions"
                  className="transition hover:translate-x-1 hover:text-ocean-700"
                >
                  Unions
                </Link>
                <Link
                  href="/programs"
                  className="transition hover:translate-x-1 hover:text-ocean-700"
                >
                  Programs
                </Link>
                <Link
                  href="/leaderboard"
                  className="transition hover:translate-x-1 hover:text-ocean-700"
                >
                  Leaderboard
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-400">
                Portal
              </p>

              <div className="flex flex-col gap-4 text-sm font-bold text-ink-600">
                <Link
                  href="/register"
                  className="transition hover:translate-x-1 hover:text-ocean-700"
                >
                  Register Union
                </Link>
                <Link
                  href="/login"
                  className="transition hover:translate-x-1 hover:text-ocean-700"
                >
                  Executive Login
                </Link>
              </div>
            </div>

            <div className="col-span-2">
              <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-400">
                Official Channels
              </p>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href="mailto:jamianooriya@gmail.com"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs font-extrabold text-ink-600 transition hover:-translate-y-0.5 hover:border-ocean-200 hover:text-ocean-700"
                >
                  <Mail size={14} />
                  jamianooriya@gmail.com
                </a>
                <a
                  href="https://instagram.com/sajda_central_committee"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs font-extrabold text-ink-600 transition hover:-translate-y-0.5 hover:border-ocean-200 hover:text-ocean-700"
                >
                  <FaInstagram size={14} />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-[12px] font-bold text-ink-400 md:flex-row">
          <p>
            © {new Date().getFullYear()} SAJDA Central Committee. All rights
            reserved.
          </p>

          <p>
            Designed & developed by{" "}
            <span className="font-black text-ocean-700">PIXIDO_DESIGNS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}