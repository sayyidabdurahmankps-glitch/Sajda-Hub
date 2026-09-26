"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  History, 
  Target, 
  Globe2, 
  ShieldCheck, 
  Sparkles, 
  BookOpen,
  ArrowUpRight
} from "lucide-react";

const wingsDetailed = [
  {
    name: "Da'wa Wing",
    arabic: "الدعوة",
    icon: Globe2,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    description: "Dedicated to Islamic outreach and community engagement. The Da'wa wing organizes campaigns, study circles, and public awareness programs that bridge the gap between the campus and the wider society, spreading the true essence of Islamic teachings.",
  },
  {
    name: "Adarsham Wing",
    arabic: "ആദർശം",
    icon: ShieldCheck,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    description: "The intellectual backbone of the union. Adarsham focuses on ideological clarity, character building, and academic excellence. It equips students to understand and defend traditional Islamic scholarship through debates, seminars, and intensive study camps.",
  },
  {
    name: "Sargam Wing",
    arabic: "സർഗം",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50 border-purple-100",
    description: "The creative and cultural hub. Sargam nurtures the artistic, literary, and expressive talents of the students. From public speaking and poetry to traditional Malabar arts and calligraphy, this wing ensures holistic cultural development.",
  },
  {
    name: "Publishing Wing",
    arabic: "പ്രസിദ്ധീകരണം",
    icon: BookOpen,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    description: "The voice of the student body. This wing handles all editorial and media initiatives, including the publication of annual magazines, campus journals, and digital content, ensuring that the legacy of the union is documented for future generations.",
  },
];

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-32 sm:pt-40 text-ink-950">
      
      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div 
          className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Central Committee
          </div>

          <h1 className="text-4xl font-black tracking-tight text-ocean-950 sm:text-6xl max-w-4xl">
            The apex body of student unions.
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-ink-600 sm:text-lg">
            Students Association of Jamia Nooriyya for Devoted Activities (SAJDA) is the central coordinating platform connecting junior colleges across the state.
          </p>
        </div>

        {/* =========================================================
            CORE PILLARS (MISSION & HERITAGE)
        ========================================================== */}
        <div 
          className={`mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 transition-all duration-700 delay-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Mission Card */}
          <div className="flex flex-col justify-between rounded-[2rem] border-2 border-line bg-white p-8 shadow-sm transition-all hover:border-ocean-200 hover:shadow-ocean-md sm:p-10">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-100 text-ocean-800">
                <Target size={26} strokeWidth={2.5} />
              </div>
              <h2 className="mt-8 text-2xl font-black text-ocean-950">Our Mission</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-ink-600">
                To create a unified digital and organizational framework that empowers student unions. SAJDA ensures that every committee, across every junior college, has the tools, guidance, and structure needed to conduct impactful academic and cultural programs.
              </p>
            </div>
          </div>

          {/* Heritage Card */}
          <div className="flex flex-col justify-between rounded-[2rem] border-2 border-line bg-white p-8 shadow-sm transition-all hover:border-ocean-200 hover:shadow-ocean-md sm:p-10">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Building2 size={26} strokeWidth={2.5} />
              </div>
              <h2 className="mt-8 text-2xl font-black text-ocean-950">Our Heritage</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-ink-600">
                Rooted in the prestigious legacy of Jamia Nooriyya Arabiyya, Faizabad-Pattikkad. We carry forward decades of traditional Islamic scholarship, blending classical learning with modern organizational efficiency to shape the leaders of tomorrow.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================
            THE FOUR WINGS DEEP DIVE
        ========================================================== */}
        <div className="mx-auto mt-32 max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight text-ocean-950 sm:text-5xl">
              The Four Dimensions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-ink-600">
              Every local union operates through four structured wings, ensuring comprehensive development of the student body.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {wingsDetailed.map((wing, index) => {
              const Icon = wing.icon;
              return (
                <div 
                  key={wing.name}
                  className="group relative flex flex-col rounded-[1.75rem] border-2 border-line bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-ocean-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${wing.color}`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-4xl font-black text-ink-500/10 transition-colors duration-300 group-hover:text-ocean-950/5">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-8 text-2xl font-black text-ocean-950 flex items-center gap-3">
                    {wing.name}
                    <span className="text-sm font-bold text-ink-400 mt-1">{wing.arabic}</span>
                  </h3>
                  
                  <p className="mt-4 text-sm font-medium leading-relaxed text-ink-600">
                    {wing.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            BOTTOM CTA
        ========================================================== */}
        <div className="mx-auto mt-32 max-w-5xl overflow-hidden rounded-[2.5rem] bg-[radial-gradient(ellipse_at_bottom,var(--color-ocean-800),var(--color-ocean-950)_70%)] px-6 py-20 text-center text-white sm:px-12 sm:py-24 shadow-2xl shadow-ocean-950/20">
          <div className="mx-auto max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-400">
              Join the Network
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Explore union activities.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-7 text-white/70">
              See how the four wings come to life across junior colleges in the current academic year.
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href="/programs"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-[15px] font-extrabold tracking-wide text-ocean-950 transition hover:bg-ocean-100 hover:scale-105"
              >
                View Programs
                <ArrowUpRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}