"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Search, 
  CalendarDays, 
  MapPin, 
  Globe2, 
  ShieldCheck, 
  Sparkles, 
  BookOpen,
  ArrowRight,
  Filter,
  Image as ImageIcon
} from "lucide-react";

// Define the shape of our fetched data
interface Program {
  id: string;
  title: string;
  wing: string;
  date: string;
  location: string;
  union: string;
  status: "Upcoming" | "Completed";
  description: string;
  poster_url: string | null;
}

const wings = [
  { name: "All", icon: Filter },
  { name: "Da'wa", icon: Globe2 },
  { name: "Adarsham", icon: ShieldCheck },
  { name: "Sargam", icon: Sparkles },
  { name: "Publishing", icon: BookOpen },
];

export default function ProgramsPage() {
  const [mounted, setMounted] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWing, setActiveWing] = useState("All");

  useEffect(() => {
    setMounted(true);
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      // Fetch programs WITHOUT the removed college_unions join
      const { data, error } = await supabase
        .from("programs")
        .select(`
          id,
          title,
          description,
          event_date,
          location,
          wing_key,
          status,
          poster_url
        `)
        .eq("status", "active")
        .order("event_date", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPrograms: Program[] = data.map((p: any) => {
          const isUpcoming = new Date(p.event_date) > new Date();
          
          const wingDisplay = 
            p.wing_key === "dawa" ? "Da'wa" :
            p.wing_key === "adarsham" ? "Adarsham" :
            p.wing_key === "sargam" ? "Sargam" :
            p.wing_key === "publishing" ? "Publishing" : "General";

          return {
            id: p.id,
            title: p.title,
            wing: wingDisplay,
            date: new Date(p.event_date).toLocaleDateString("en-IN", { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            location: p.location || "Campus",
            union: "SAJDA Central", // Hardcoded since we removed the union relation
            status: isUpcoming ? "Upcoming" : "Completed",
            description: p.description || "No description provided.",
            poster_url: p.poster_url || null,
          };
        });
        
        setPrograms(formattedPrograms);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter((program) => {
    // Search by title or location now
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          program.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWing = activeWing === "All" || program.wing === activeWing;
    return matchesSearch && matchesWing;
  });

  // Styles for the badges
  const getWingStyles = (wingName: string) => {
    switch (wingName) {
      case "Da'wa": return { icon: Globe2, color: "text-blue-700", bg: "from-blue-500 to-blue-700" };
      case "Adarsham": return { icon: ShieldCheck, color: "text-indigo-700", bg: "from-indigo-500 to-indigo-700" };
      case "Sargam": return { icon: Sparkles, color: "text-purple-700", bg: "from-purple-500 to-purple-700" };
      case "Publishing": return { icon: BookOpen, color: "text-amber-700", bg: "from-amber-400 to-amber-600" };
      default: return { icon: Globe2, color: "text-slate-700", bg: "from-slate-500 to-slate-700" };
    }
  };

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
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Program Archive
          </div>

          <h1 className="text-4xl font-black tracking-tight text-ocean-950 sm:text-6xl">
            Union Programs
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-ink-600 sm:text-lg">
            Discover the academic, cultural, and outreach initiatives organized by committees across all four wings of the SAJDA Hub.
          </p>
        </div>

        {/* =========================================================
            CONTROLS (SEARCH & FILTERS)
        ========================================================== */}
        <div 
          className={`mx-auto mt-16 max-w-5xl transition-all duration-700 delay-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col gap-5 rounded-[1.5rem] bg-white p-5 shadow-sm border-2 border-line sm:flex-row sm:items-center sm:justify-between">
            
            <div className="relative w-full sm:max-w-xs">
              <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input 
                type="text" 
                placeholder="Search programs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-line bg-[#F8FAFC] py-3 pl-12 pr-4 text-sm font-extrabold text-ocean-950 outline-none transition-colors focus:border-ocean-300 focus:bg-white"
              />
            </div>

            <div className="flex w-full overflow-x-auto pb-2 sm:w-auto sm:pb-0 hide-scrollbar">
              <div className="flex gap-2">
                {wings.map((wing) => {
                  const Icon = wing.icon;
                  const isActive = activeWing === wing.name;
                  return (
                    <button
                      key={wing.name}
                      onClick={() => setActiveWing(wing.name)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 ${
                        isActive 
                          ? "border-ocean-950 bg-ocean-950 text-white shadow-md" 
                          : "border-line bg-white text-ink-500 hover:border-ocean-200 hover:bg-ocean-50 hover:text-ocean-950"
                      }`}
                    >
                      <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                      {wing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================
              PROGRAMS GRID (POSTER FIRST)
          ========================================================== */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {loading ? (
              // Loading Skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[9/16] w-full animate-pulse rounded-[1.75rem] border-2 border-line bg-white shadow-sm" />
              ))
            ) : filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => {
                const { icon: WingIcon, color: wingColor, bg: wingBg } = getWingStyles(program.wing);
                const isUpcoming = program.status === "Upcoming";

                return (
                  <article 
                    key={program.id}
                    className="group flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ocean-200 hover:shadow-ocean-md"
                  >
                    {/* 1. 9:16 POSTER IMAGE HEADER */}
                    <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-100 shrink-0">
                      {program.poster_url ? (
                        <img 
                          src={program.poster_url} 
                          alt={program.title} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        // Fallback Beautiful Gradient if no poster exists
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${wingBg} opacity-90`}>
                          <WingIcon size={64} strokeWidth={1.5} className="text-white/20" />
                        </div>
                      )}

                      {/* Overlay Badges */}
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md">
                        <WingIcon size={14} strokeWidth={2.5} className={wingColor} />
                        <span className={wingColor}>{program.wing}</span>
                      </div>
                      
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md">
                        {isUpcoming ? (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {program.status}
                          </span>
                        ) : (
                          <span className="text-ink-500">{program.status}</span>
                        )}
                      </div>
                    </div>

                    {/* 2. TEXT CONTENT */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        {/* Title Below Poster */}
                        <h3 className="text-xl font-black leading-tight text-ocean-950">
                          {program.title}
                        </h3>
                        
                        {/* Description Below Title */}
                        <p className="mt-3 text-sm font-medium leading-relaxed text-ink-600 line-clamp-3">
                          {program.description}
                        </p>

                        <div className="mt-6 space-y-3 border-t border-line pt-6">
                          <div className="flex items-center gap-3 text-sm font-bold text-ink-600">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-ocean-800">
                              <CalendarDays size={16} strokeWidth={2.5} />
                            </div>
                            {program.date}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm font-bold text-ink-600">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-ocean-800">
                              <MapPin size={16} strokeWidth={2.5} />
                            </div>
                            <span className="truncate">{program.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Organized by Footer */}
                      <div className="mt-8 flex items-center justify-between rounded-xl bg-[#F8FAFC] p-4">
                        <div className="overflow-hidden pr-3">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                            Organized by
                          </p>
                          <p className="mt-1 text-sm font-black text-ocean-950 truncate">
                            {program.union}
                          </p>
                        </div>
                        
                        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ocean-950 shadow-sm border border-line transition-transform group-hover:scale-110">
                          <ArrowRight size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-line bg-white py-24 text-center">
                <Search size={40} className="text-ink-300 mb-4" />
                <h3 className="text-xl font-black text-ocean-950">No programs found</h3>
                <p className="mt-2 text-sm font-bold text-ink-500">
                  We couldn't find any {activeWing !== "All" ? activeWing : ""} events matching "{searchQuery}".
                </p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveWing("All"); }}
                  className="mt-6 rounded-xl bg-ocean-100 px-6 py-3 text-sm font-extrabold text-ocean-900 transition hover:bg-ocean-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  );
}