"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import {
  Search as SearchIcon,
  Loader2,
  Trophy,
  ShieldCheck,
  ArrowLeft,
  Activity,
  Library,
  MapPin,
  Globe2,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  XCircle
} from "lucide-react";

// --- TYPES ---
type UnionRecord = {
  id: string;
  union_name: string;
  academic_year: string;
  college_name: string;
  city: string;
  program_results: {
    id: string;
    points: number;
    status: string;
    programs: { title: string; wing_key: string; status: string } | null;
  }[];
};

export default function UnionSearchPage() {
  const [query, setQuery] = useState("");
  const [unions, setUnions] = useState<UnionRecord[]>([]);
  const [filteredResults, setFilteredResults] = useState<UnionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Fetch ALL data on mount for instantaneous client-side searching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch unions WITH their nested program results & program details
        const { data: unionsData, error } = await supabase
          .from("college_unions")
          .select(`
            id, union_name, academic_year,
            colleges ( name, city ),
            program_results (
              id, points, status,
              programs ( title, wing_key, status )
            )
          `)
          .eq("status", "active");

        if (error) throw error;

        if (unionsData) {
          const merged: UnionRecord[] = unionsData.map((u: any) => ({
            id: u.id,
            union_name: u.union_name,
            academic_year: u.academic_year,
            college_name: u.colleges?.name || "Unknown College",
            city: u.colleges?.city || "",
            program_results: (u.program_results || []).sort((a: any, b: any) => {
              if (a.status === "approved" && b.status !== "approved") return -1;
              if (a.status !== "approved" && b.status === "approved") return 1;
              return 0;
            }),
          }));
          setUnions(merged);
        }
      } catch (error) {
        console.error("Error loading search engine data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 2. REAL-TIME SEARCH ENGINE (Debounced for smooth UI)
  useEffect(() => {
    if (query.trim().length < 2) {
      setFilteredResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const debounce = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results = unions.filter(
        (u) => 
          u.union_name.toLowerCase().includes(lowerQuery) || 
          u.college_name.toLowerCase().includes(lowerQuery)
      );
      
      // Sort results by total approved points descending
      results.sort((a, b) => {
        const scoreA = a.program_results.filter(r => r.status === "approved" && r.programs?.status === "active").reduce((s, r) => s + r.points, 0);
        const scoreB = b.program_results.filter(r => r.status === "approved" && r.programs?.status === "active").reduce((s, r) => s + r.points, 0);
        return scoreB - scoreA;
      });
      
      setFilteredResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, unions]);

  // Wing Helper
  const getWingStyles = (wingName: string) => {
    switch (wingName) {
      case "dawa": return { icon: Globe2, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", name: "Da'wa" };
      case "adarsham": return { icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100", name: "Adarsham" };
      case "sargam": return { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50 border-purple-100", name: "Sargam" };
      case "publishing": return { icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50 border-amber-100", name: "Publishing" };
      default: return { icon: Globe2, color: "text-slate-600", bg: "bg-slate-50 border-slate-100", name: "General" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-ink-950 selection:bg-ocean-500/30 selection:text-ocean-900 font-sans relative overflow-hidden flex flex-col">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-ocean-400/5 blur-[150px] rounded-full pointer-events-none" />

      <header className="relative z-10 px-6 py-6 md:px-12 max-w-6xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-500 hover:text-ocean-700 transition-colors text-xs font-black uppercase tracking-widest bg-white hover:bg-ocean-50 px-4 py-2.5 rounded-xl border border-line shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 pb-24 relative z-10 flex flex-col">
        
        <div className="text-center mb-12 animate-in slide-in-from-top-10 duration-700">
          <div className="inline-flex items-center justify-center p-4 bg-ocean-50 border border-ocean-100 rounded-full mb-6 shadow-sm">
            <SearchIcon className="w-8 h-8 text-ocean-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-ocean-950 tracking-tighter uppercase mb-4">
            Union <span className="text-ocean-600 italic">Lookup</span>
          </h1>
          <p className="text-ink-500 font-bold max-w-xl mx-auto">
            Access live point ledgers. Search by specific college name or union name.
          </p>
        </div>

        {/* THE SEARCH BAR */}
        <div className="relative max-w-3xl mx-auto w-full mb-16 group">
          <div className="absolute inset-0 bg-ocean-500/10 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white border-2 border-line focus-within:border-ocean-400 focus-within:ring-4 focus-within:ring-ocean-400/10 rounded-full p-2 transition-all shadow-md">
            <SearchIcon className="w-6 h-6 text-ink-400 ml-4 shrink-0 group-focus-within:text-ocean-500 transition-colors" />
            <input
              type="text"
              placeholder="Enter College or Union Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 w-full bg-transparent border-none outline-none text-ocean-950 font-black text-xl py-4 pl-4 pr-12 placeholder-ink-300 tracking-wide"
              autoFocus
              disabled={loading}
            />
            {(isSearching || loading) && (
              <Loader2 className="absolute right-6 w-6 h-6 animate-spin text-ocean-500" />
            )}
          </div>
        </div>

        {/* SEARCH RESULTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hasSearched && !isSearching && filteredResults.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-line shadow-sm">
              <ShieldCheck className="w-16 h-16 text-ink-300 mb-5" strokeWidth={1.5} />
              <h3 className="text-2xl font-black text-ocean-950">No Unions Found</h3>
              <p className="mt-2 text-sm font-bold text-ink-500">We couldn't find any registered unions matching "{query}".</p>
            </div>
          )}

          {filteredResults.map((union) => {
            // Dynamic Scoring calculation based exclusively on active programs
            const totalApprovedPoints = union.program_results
              .filter((r) => r.status === "approved" && r.programs?.status === "active")
              .reduce((sum, r) => sum + (r.points || 0), 0);

            return (
              <div key={union.id} className="bg-white border-2 border-line rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group hover:border-ocean-200 transition-all shadow-sm hover:shadow-ocean-md flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-2 opacity-80 bg-amber-400 transition-all" />

                <div className="flex justify-between items-start mb-8 relative z-10 pt-2">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-ocean-50 border border-ocean-100 rounded-2xl flex items-center justify-center shadow-inner shrink-0 text-ocean-600">
                      <Award className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-ocean-950 tracking-tight uppercase leading-none">
                        {union.union_name}
                      </h2>
                      <p className="text-[10px] font-black text-ink-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5">
                        <MapPin size={12} /> {union.city || "Campus"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-4xl font-black tabular-nums tracking-tighter leading-none text-ocean-950">
                      {totalApprovedPoints}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mt-1.5 flex items-center justify-end gap-1">
                      <Trophy size={10} /> Verified Pts
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-8 relative z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-[#F8FAFC] border-line text-ocean-800 flex items-center gap-1.5">
                    <Library size={12} /> {union.college_name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-500 bg-white px-3 py-1.5 rounded-lg border border-line">
                    {union.academic_year}
                  </span>
                </div>

                {/* PROGRAM RESULTS LEDGER */}
                <div className="flex-1 flex flex-col relative z-10 bg-[#F8FAFC] rounded-[1.5rem] border border-line p-2">
                  <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                    <Activity className="w-4 h-4 text-ocean-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-800">
                      Event History Ledger
                    </span>
                  </div>

                  <div className="p-2 space-y-2">
                    {union.program_results.length === 0 ? (
                      <div className="py-8 text-center text-[11px] font-bold uppercase text-ink-400 tracking-widest">
                        No program points recorded yet.
                      </div>
                    ) : (
                      union.program_results.map((res) => {
                        const wingData = getWingStyles(res.programs?.wing_key || "");
                        const isProgramActive = res.programs?.status === "active";

                        return (
                          <div key={res.id} className="bg-white border border-line rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-ocean-200 transition-colors shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 border rounded-lg shrink-0 ${wingData.bg}`}>
                                <wingData.icon className={`w-4 h-4 ${wingData.color}`} strokeWidth={2.5} />
                              </div>
                              <div>
                                <p className={`text-xs font-black uppercase tracking-wide leading-tight ${isProgramActive ? "text-ocean-950" : "text-ink-400 line-through"}`}>
                                  {res.programs?.title || "Unknown Program"}
                                </p>
                                <p className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mt-1">
                                  {wingData.name} Wing
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-line sm:border-0 pt-2 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <p className={`text-sm font-black tabular-nums leading-none ${isProgramActive ? "text-ocean-700" : "text-ink-300"}`}>
                                  +{res.points} <span className="text-[8px] uppercase">Pts</span>
                                </p>
                              </div>

                              <div className="w-px h-6 bg-line hidden sm:block" />

                              {/* Status Badges */}
                              {!isProgramActive ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                                  <XCircle className="w-3 h-3" /> Inactive
                                </div>
                              ) : res.status === "approved" ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded text-emerald-600 text-[8px] font-black uppercase tracking-widest">
                                  <ShieldCheck className="w-3 h-3" /> Verified
                                </div>
                              ) : res.status === "pending" ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded text-amber-600 text-[8px] font-black uppercase tracking-widest animate-pulse">
                                  <Clock className="w-3 h-3" /> Audit
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded text-red-600 text-[8px] font-black uppercase tracking-widest">
                                  <XCircle className="w-3 h-3" /> Void
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}