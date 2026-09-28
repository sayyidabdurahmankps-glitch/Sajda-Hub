
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Eye,
  Globe2,
  Layers3,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Bell,
  ExternalLink,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import HeadToHead from "../components/HeadToHead";

/* =========================================================
   WINGS
========================================================= */

const wings = [
  {
    name: "Da'wa",
    arabic: "الدعوة",
    description:
      "Islamic outreach, learning initiatives and meaningful community engagement.",
    icon: Globe2,
    color: "dawa",
    number: "01",
  },
  {
    name: "Adarsham",
    arabic: "ആദർശം",
    description:
      "Character, academic development and value-oriented student activities.",
    icon: ShieldCheck,
    color: "adarsham",
    number: "02",
  },
  {
    name: "Sargam",
    arabic: "സർഗം",
    description:
      "Creative, cultural and literary activities that encourage expression.",
    icon: Sparkles,
    color: "sargam",
    number: "03",
  },
  {
    name: "Publishing",
    arabic: "പ്രസിദ്ധീകരണം",
    description:
      "Editorial, publishing and media initiatives documenting union life.",
    icon: BookOpen,
    color: "publishing",
    number: "04",
  },
] as const;

/* =========================================================
   FEATURES
========================================================= */

const features = [
  {
    icon: Users,
    title: "Yearly Committees",
    text: "Keep every union committee organized by academic year.",
  },
  {
    icon: CalendarDays,
    title: "Program Archive",
    text: "Record programs and activities conducted across every wing.",
  },
  {
    icon: BarChart3,
    title: "Union Metrics",
    text: "Track structured performance metrics for every union.",
  },
  {
    icon: Radio,
    title: "Realtime Updates",
    text: "Leaderboard data updates instantly through Supabase Realtime.",
  },
];

/* =========================================================
   WING CARD
========================================================= */

function WingCard({ wing }: { wing: (typeof wings)[number] }) {
  const Icon = wing.icon;

  const styles = {
    dawa: {
      icon: "bg-wing-dawa-soft text-wing-dawa",
      line: "bg-wing-dawa",
    },
    adarsham: {
      icon: "bg-wing-adarsham-soft text-wing-adarsham",
      line: "bg-wing-adarsham",
    },
    sargam: {
      icon: "bg-wing-sargam-soft text-wing-sargam",
      line: "bg-wing-sargam",
    },
    publishing: {
      icon: "bg-wing-publishing-soft text-wing-publishing",
      line: "bg-wing-publishing",
    },
  }[wing.color];

  return (
    <article className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-line bg-white p-6 shadow-ocean-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ocean-200 hover:shadow-ocean-md">
      <div
        className={`absolute left-0 top-0 h-1 w-0 ${styles.line} transition-all duration-500 ease-out group-hover:w-full`}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.icon} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
        >
          <Icon size={22} strokeWidth={2.5} />
        </div>

        <span className="text-sm font-extrabold tracking-[0.18em] text-ink-500/40 transition-colors group-hover:text-ocean-950">
          {wing.number}
        </span>
      </div>

      <p className="mt-7 text-sm font-bold text-ink-500">{wing.arabic}</p>

      <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-ocean-950">
        {wing.name} Wing
      </h3>

      <p className="mt-3 text-sm font-medium leading-6 text-ink-600">
        {wing.description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs font-extrabold text-ocean-700">
        Explore wing
        <ArrowUpRight
          size={16}
          strokeWidth={2.5}
          className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
        />
      </div>
    </article>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [typedText, setTypedText] = useState("");

  // Announcement State
  const [announcement, setAnnouncement] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Contact Form State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error" | null
  >("idle");

  const fullText =
    "Students Association of Jamia Nooriyya for Devoted Activities.";

  /* =========================================================
     INITIALIZATION
  ========================================================= */

  useEffect(() => {
    setMounted(true);

    /* -------------------------------------------------------
       Loader
    ------------------------------------------------------- */

    const loaderTimer = setTimeout(() => {
      setShowLoader(false);
    }, 2800);

    /* -------------------------------------------------------
       Fetch Top Announcement
    ------------------------------------------------------- */

    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("title, body")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setAnnouncement(data);
      }
    };

    fetchAnnouncement();

    /* -------------------------------------------------------
       Typewriter effect
    ------------------------------------------------------- */

    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 35);

    /* -------------------------------------------------------
       Cleanup
    ------------------------------------------------------- */

    return () => {
      clearInterval(typingInterval);
      clearTimeout(loaderTimer);
    };
  }, []);

  /* =========================================================
     CONTACT FORM
  ========================================================= */

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? ""),
      college: String(formData.get("college") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      status: "unread",
    };

    const { error } = await supabase
      .from("contact_messages")
      .insert(payload);

    if (error) {
      console.error("Message Error:", error);
      setSubmitStatus("error");
    } else {
      setSubmitStatus("success");
      e.currentTarget.reset();

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {/* =====================================================
          MAIN PAGE
      ====================================================== */}

      <main className="min-h-screen overflow-hidden bg-white text-ink-950">
        {/* =====================================================
            LIVE ANNOUNCEMENT BANNER
        ====================================================== */}
        {announcement && showAnnouncement && (
          <div className="relative z-50 border-b border-white/10 bg-ocean-950 px-5 py-3 pr-12 shadow-lg animate-in slide-in-from-top-4 fade-in duration-500 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-sm font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Bell size={14} className="animate-pulse" />
              </span>

              <span className="truncate">
                <span className="mr-2 font-extrabold text-amber-400">
                  {announcement.title}:
                </span>

                <span className="text-white/90">
                  {announcement.body}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAnnouncement(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
              aria-label="Dismiss announcement"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.018]"
              style={{
                backgroundImage:
                  "linear-gradient(#075A8A 1px, transparent 1px), linear-gradient(90deg, #075A8A 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full border border-ocean-800/[0.04]" />

            <div className="absolute left-1/2 top-20 h-[440px] w-[600px] -translate-x-1/2 rounded-full border border-ocean-800/[0.035]" />
          </div>

          <div
            className={`relative mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10 lg:pb-36 ${
              announcement && showAnnouncement
                ? "pt-24 sm:pt-32 lg:pt-36"
                : "pt-32 sm:pt-40 lg:pt-44"
            }`}
          >
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <div
                className={`mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-ocean-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ocean-700 transition-all duration-700 ease-out ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-ocean-500" />
                SAJDA Hub
                <span className="mx-1 text-line-strong">•</span>
                2026 — 2027
              </div>

              <h1
                className={`max-w-4xl text-[3.4rem] font-black leading-[1] tracking-[-0.045em] text-[#0B1726] transition-all delay-150 duration-700 ease-out sm:text-6xl lg:text-[5.5rem] ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
              >
                Where unions{" "}
                <span className="block text-ocean-800">
                  grow together.
                </span>
              </h1>

              <p className="mt-8 min-h-[64px] max-w-2xl text-[16px] font-bold leading-8 text-[#526579] sm:text-xl">
                {typedText}

                <span className="ml-1 inline-block h-[18px] w-[3px] animate-pulse bg-ocean-500" />
              </p>

              <div
                className={`mt-10 flex flex-col justify-center gap-4 transition-all delay-300 duration-700 ease-out sm:flex-row ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <Link
                  href="/leaderboard"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean-950 px-8 py-4 text-[15px] font-extrabold text-white shadow-[0_12px_30px_rgba(3,17,31,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ocean-800 hover:shadow-[0_15px_35px_rgba(3,17,31,0.18)]"
                >
                  Explore Leaderboard
                  <ArrowUpRight
                    size={18}
                    strokeWidth={2.5}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>

                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-line-strong bg-white px-8 py-4 text-[15px] font-extrabold text-ocean-900 transition-all duration-200 hover:border-ocean-300 hover:bg-ocean-50"
                >
                  Search Unions
                  <ChevronRight size={18} strokeWidth={2.5} />
                </Link>
              </div>

              <div
                className={`mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 transition-all delay-500 duration-700 ease-out ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                {[
                  ["Multi-year", "Academic records"],
                  ["04", "Dedicated wings"],
                  ["Live", "Realtime metrics"],
                ].map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-base font-extrabold text-[#0B1726]">
                      {value}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-[#7B8B9B]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK STATS
        ====================================================== */}
        <section className="px-5 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-ocean-md">
            <div className="grid md:grid-cols-3">
              {[
                {
                  icon: Layers3,
                  value: "04",
                  title: "Union Wings",
                  text: "Structured areas of activity",
                },
                {
                  icon: CalendarDays,
                  value: "INFINTE",
                  title: "Academic Years",
                  text: "A reusable yearly architecture",
                },
                {
                  icon: Radio,
                  value: "LIVE",
                  title: "Realtime System",
                  text: "Instant metric synchronization",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`group flex items-center gap-5 border-line p-6 transition-colors hover:bg-ocean-50/50 sm:p-8 ${
                      index !== 2
                        ? "border-b md:border-b-0 md:border-r"
                        : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean-100 text-ocean-800 transition-transform group-hover:scale-110">
                      <Icon size={22} strokeWidth={2.5} />
                    </div>

                    <div>
                      <p className="text-2xl font-black text-ocean-950">
                        {item.value}
                      </p>

                      <p className="text-sm font-extrabold text-ink-900">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[11px] font-medium text-ink-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            WINGS
        ====================================================== */}
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-ocean-600">
                The four wings
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-ocean-950 sm:text-5xl lg:text-6xl">
                One union.{" "}
                <span className="block text-ocean-700">
                  Four dimensions.
                </span>
              </h2>
            </div>

            <p className="max-w-md text-base font-medium leading-7 text-[#526579]">
              Every major area of union activity gets its own identity while
              remaining part of one connected platform.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {wings.map((wing) => (
              <WingCard key={wing.name} wing={wing} />
            ))}
          </div>
        </section>

        {/* =====================================================
            FEATURE SECTION
        ====================================================== */}
        <section className="border-y border-line bg-ocean-50/50">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
            <div className="grid items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-100 text-ocean-800">
                  <Eye size={24} strokeWidth={2.5} />
                </div>

                <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.22em] text-ocean-600">
                  Designed for continuity
                </p>

                <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.03em] text-ocean-950 sm:text-5xl">
                  Your union's story <br />
                  shouldn't reset every year.
                </h2>

                <p className="mt-6 max-w-lg text-base font-medium leading-8 text-[#526579]">
                  SAJDA Hub separates every academic year while keeping the
                  institution's history connected. Committees, programs and
                  metrics remain structured and accessible.
                </p>

                <Link
                  href="/dashboard"
                  className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-ocean-950 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-ocean-800"
                >
                  Explore the platform
                  <ArrowUpRight
                    size={17}
                    strokeWidth={2.5}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group rounded-[1.75rem] border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-ocean-200 hover:shadow-ocean-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocean-50 text-ocean-800 transition-colors group-hover:bg-ocean-100">
                        <Icon size={22} strokeWidth={2.5} />
                      </div>

                      <h3 className="mt-6 text-lg font-extrabold text-ocean-950">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm font-medium leading-6 text-ink-600">
                        {feature.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ====================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-ocean-600">
                Simple by design
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-ocean-950 sm:text-5xl">
                From union activity to insight.
              </h2>
            </div>

            <div className="relative mt-20 grid gap-10 md:grid-cols-4">
              <div className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-ocean-100 md:block" />

              {[
                [
                  "01",
                  "Union",
                  "Establish the yearly union and committee.",
                ],
                [
                  "02",
                  "Programs",
                  "Document activities across the four wings.",
                ],
                [
                  "03",
                  "Metrics",
                  "Maintain structured union performance data.",
                ],
                [
                  "04",
                  "Insight",
                  "See the live Best Union Award leaderboard.",
                ],
              ].map(([number, title, text]) => (
                <div key={number} className="group relative text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ocean-200 bg-white text-base font-black text-ocean-800 shadow-ocean-sm transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-ocean-md">
                    {number}
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold text-ocean-950 transition-colors group-hover:text-ocean-700">
                    {title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-[220px] text-sm font-medium leading-6 text-[#526579]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            HEAD-TO-HEAD COMPARISON
        ====================================================== */}
        <HeadToHead />

        {/* =====================================================
            CONTACT SECTION
        ====================================================== */}
        <section className="relative overflow-hidden bg-white py-24 sm:py-32">
          <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-ocean-100/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-ocean-100/30 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-ocean-600">
                  Get in Touch
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight text-ocean-950 sm:text-5xl">
                  Reach out to the Central Committee.
                </h2>

                <p className="mt-6 text-base font-medium leading-8 text-[#526579]">
                  Have questions regarding union coordination, program
                  updates, academic-year records, or leaderboard
                  synchronization? Reach the SAJDA Central Committee through
                  the official contact channels below.
                </p>

                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {/* CENTRAL OFFICE */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Jamia+Nooriya+Arabic+College%2C+Faizabad%2C+Pattikkad%2C+Perinthalmanna%2C+Malappuram%2C+Kerala+679325"
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-ocean-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-800 transition-transform group-hover:scale-105">
                        <MapPin size={21} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-extrabold text-ocean-950">
                            Central Office
                          </h3>

                          <ExternalLink
                            size={14}
                            className="text-ink-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </div>

                        <p className="mt-1 text-xs font-medium leading-5 text-ink-600">
                          SAJDA Central Committee
                          <br />
                          Jamia Nooriya Arabic College
                          <br />
                          Faizabad, Pattikkad P.O., Perinthalmanna
                          <br />
                          Malappuram, Kerala — 679325
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* CONTACT NUMBERS */}
                  <div className="rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-ocean-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-800">
                        <Phone size={21} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-ocean-950">
                          Contact Numbers
                        </h3>

                        <div className="mt-1 flex flex-col gap-1 text-xs font-bold leading-5 text-ink-600">
                          <a
                            href="tel:+919847070200"
                            className="transition hover:text-ocean-700"
                          >
                            +91 98470 70200
                          </a>

                          <a
                            href="tel:+919747399584"
                            className="transition hover:text-ocean-700"
                          >
                            +91 97473 99584
                          </a>

                          <span className="pt-1 text-ink-500">
                            Landline: 04933 235 917 / 04933 235 620
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL ADDRESSES */}
                  <div className="rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-ocean-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-800">
                        <Mail size={21} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-ocean-950">
                          Email Addresses
                        </h3>

                        <div className="mt-1 flex flex-col gap-1.5 text-xs font-bold leading-5">
                          <a
                            href="mailto:jamianooriya@gmail.com"
                            className="break-all text-ink-600 transition hover:text-ocean-700"
                          >
                            jamianooriya@gmail.com
                          </a>

                          <a
                            href="mailto:jamiajuniorcolleges@gmail.com"
                            className="break-all text-ink-600 transition hover:text-ocean-700"
                          >
                            jamiajuniorcolleges@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SOCIAL CHANNELS */}
                  <div className="rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-ocean-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-800">
                        <Globe2 size={21} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-ocean-950">
                          Official Social Channels
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ocean-50 px-3 py-1.5 text-[11px] font-extrabold text-ocean-800">
                            <FaFacebook size={13} />
                            SAJDA Central Committee
                          </span>

                          <a
                            href="https://instagram.com/sajda_central_committee"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ocean-50 px-3 py-1.5 text-[11px] font-extrabold text-ocean-800 transition hover:border-ocean-200 hover:bg-ocean-100"
                          >
                            <FaInstagram size={13} />
                            @sajda_central_committee
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  CONTACT FORM
              ================================================== */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-ocean-50/50 p-8 sm:p-10">
                <form
                  className="relative z-10 flex flex-col gap-6"
                  onSubmit={handleSendMessage}
                >
                  {/* ERROR MESSAGE */}
                  {submitStatus === "error" && (
                    <div className="mb-2 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-sm font-extrabold text-red-600">
                      <X size={18} />
                      Error sending message. Please try again.
                    </div>
                  )}

                  {/* NAME + COLLEGE */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-name"
                        className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500"
                      >
                        Full Name
                      </label>

                      <input
                        id="contact-name"
                        name="name"
                        required
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-bold text-ocean-950 outline-none transition-colors placeholder:text-ink-300 focus:border-ocean-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-college"
                        className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500"
                      >
                        Union / College
                      </label>

                      <input
                        id="contact-college"
                        name="college"
                        type="text"
                        autoComplete="organization"
                        placeholder="College name"
                        className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-bold text-ocean-950 outline-none transition-colors placeholder:text-ink-300 focus:border-ocean-400"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-email"
                      className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500"
                    >
                      Email Address
                    </label>

                    <input
                      id="contact-email"
                      name="email"
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-bold text-ocean-950 outline-none transition-colors placeholder:text-ink-300 focus:border-ocean-400"
                    />
                  </div>

                  {/* MESSAGE */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-message"
                      className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500"
                    >
                      Message
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="resize-none rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-bold text-ocean-950 outline-none transition-colors placeholder:text-ink-300 focus:border-ocean-400"
                    />
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-950 py-4 text-sm font-extrabold text-white transition-all hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send
                          size={16}
                          strokeWidth={2.5}
                          className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* =====================================================
              SUCCESS POPUP
          ====================================================== */}
          {submitStatus === "success" && (
            <div className="pointer-events-none fixed inset-x-0 top-5 z-[9999] flex justify-center px-4">
              <div className="pointer-events-auto flex w-full max-w-md items-center gap-4 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] animate-in slide-in-from-top-5 fade-in duration-300">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2
                    size={22}
                    strokeWidth={2.5}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-ocean-950">
                    Message sent successfully
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-ink-500">
                    Your message has been delivered to the Central
                    Committee.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitStatus(null)}
                  className="shrink-0 rounded-lg p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-ocean-950"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
