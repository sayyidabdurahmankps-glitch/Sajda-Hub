"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Search,
  Lock,
} from "lucide-react";

// Define the shape of our data
interface LeaderboardRow {
  union_id: string;
  global_rank: number;
  total_score: number;
  dawa_score: number;
  adarsham_score: number;
  sargam_score: number;
  publishing_score: number;
  trend: string;
  union_name: string;
  college_name: string;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // System Settings State
  const [isPublic, setIsPublic] = useState(true);
  const [academicYear, setAcademicYear] = useState("2026-27");

  useEffect(() => {
    setMounted(true);
    
    // Initial Load (Settings + Leaderboard)
    loadData();

    // Subscribe to real-time changes on the new program_results ledger
    const channel = supabase
      .channel("public:program_results")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "program_results" },
        () => {
          fetchLeaderboard(academicYear); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [academicYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch System Settings First
      const { data: settingsData } = await supabase.from("system_settings").select("*");
      
      let currentYear = "2026-27";
      let isLeaderboardPublic = true;

      if (settingsData) {
        const yearSetting = settingsData.find((s) => s.key === "current_academic_year");
        const publicSetting = settingsData.find((s) => s.key === "leaderboard_public");

        if (yearSetting?.value) {
          currentYear = String(yearSetting.value).replace(/['"]/g, ""); // Strip quotes if JSON string
        }
        if (publicSetting?.value !== undefined) {
          isLeaderboardPublic = 
            publicSetting.value === "false" || publicSetting.value === false ? false : true;
        }
      }

      setAcademicYear(currentYear);
      setIsPublic(isLeaderboardPublic);

      // 2. Fetch Leaderboard only if public
      if (isLeaderboardPublic) {
        await fetchLeaderboard(currentYear);
      }
    } catch (error) {
      console.error("Error loading system data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (year: string) => {
    try {
      // 1. Fetch Unions and Colleges
      const { data: unionData, error: unionError } = await supabase
        .from('college_unions')
        .select(`
          id,
          union_name,
          colleges ( name )
        `)
        .eq('academic_year', year)
        .eq('status', 'active');

      if (unionError) throw unionError;
      
      // 2. Fetch Metrics View
      const { data: metricsData, error: metricsError } = await supabase
        .from('union_metrics')
        .select('*')
        .eq('academic_year', year);

      if (metricsError) throw metricsError;

      // 3. Merge data locally
      if (unionData && metricsData) {
        const mergedData = unionData.map((u: any) => {
          const metric = metricsData.find(m => m.union_id === u.id) || {
            total_score: 0, dawa_score: 0, adarsham_score: 0, sargam_score: 0, publishing_score: 0, trend: 'FLAT'
          };
          
          return {
            union_id: u.id,
            union_name: u.union_name || "Unknown Union",
            college_name: u.colleges?.name || "Unknown College",
            total_score: metric.total_score || 0,
            dawa_score: metric.dawa_score || 0,
            adarsham_score: metric.adarsham_score || 0,
            sargam_score: metric.sargam_score || 0,
            publishing_score: metric.publishing_score || 0,
            trend: metric.trend || "FLAT"
          };
        });

        // 4. Sort and assign Global Rank
        mergedData.sort((a, b) => b.total_score - a.total_score);
        
        const formattedData = mergedData.map((item, index) => ({
          ...item,
          global_rank: index + 1
        }));

        setLeaders(formattedData);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  // Helper to render the correct trend icon
  const renderTrend = (trend: string) => {
    if (trend === "UP") return <TrendingUp size={16} className="text-emerald-500" />;
    if (trend === "DOWN") return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-ink-400" />;
  };

  // Logic: If searching, show all matches. If not searching, show only TOP 10.
  const displayLeaders = searchQuery
    ? leaders.filter((l) => 
        l.union_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.college_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leaders.slice(0, 10);

  // If the admin turned off the leaderboard, show this screen instead
  if (!loading && !isPublic) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-ink-950 px-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ocean-100 text-ocean-800 shadow-sm">
          <Lock size={32} strokeWidth={2.5} />
        </div>
        <h1 className="mt-8 text-3xl font-black text-ocean-950 sm:text-4xl text-center">
          Leaderboard Hidden
        </h1>
        <p className="mt-4 max-w-md text-center text-sm font-medium leading-relaxed text-ink-600">
          The public standing for the {academicYear} academic year is currently hidden by the central committee. Please check back later.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-ink-950 pb-24">
      
      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-24 sm:pt-32">
        <div 
          className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Live Standings · {academicYear}
          </div>

          <h1 className="text-4xl font-black tracking-tight text-ocean-950 sm:text-6xl">
            Best Union Award
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-ink-600 sm:text-lg">
            Real-time performance tracking across all four dimensions of union activity. 
          </p>
        </div>

        {/* =========================================================
            LEADERBOARD TABLE / LIST
        ========================================================== */}
        <div 
          className={`mx-auto mt-16 max-w-5xl transition-all duration-700 delay-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Controls Bar */}
          <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-line sm:flex-row sm:px-6">
            <div className="flex items-center gap-2 text-sm font-extrabold text-ocean-950">
              <Trophy size={18} className="text-amber-500" />
              <span>
                {searchQuery ? `${displayLeaders.length} Matches Found` : `Top 10 Unions (Out of ${leaders.length})`}
              </span>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by union or college..." 
                className="w-full rounded-xl border border-line bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm font-bold text-ocean-950 outline-none transition-colors focus:border-ocean-300 focus:bg-white sm:w-72"
              />
            </div>
          </div>

          {/* List Container */}
          <div className="flex flex-col gap-4">
            {loading ? (
              // Loading Skeletons
              [...Array(10)].map((_, i) => (
                <div key={i} className="h-28 w-full animate-pulse rounded-[1.5rem] bg-white border border-line shadow-sm" />
              ))
            ) : displayLeaders.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-line rounded-[1.5rem]">
                <p className="text-sm font-bold text-ink-400">No unions found matching your search.</p>
              </div>
            ) : (
              displayLeaders.map((union) => {
                const rank = union.global_rank;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                return (
                  <div 
                    key={union.union_id}
                    className={`group relative flex flex-col justify-between gap-6 rounded-[1.5rem] border-2 p-5 sm:p-7 sm:flex-row sm:items-center transition-all duration-300 hover:shadow-ocean-md hover:-translate-y-1 ${
                      isFirst 
                        ? "border-amber-200 bg-[#FFFBEB] shadow-sm z-10" 
                        : "border-line bg-white shadow-sm hover:border-ocean-200"
                    }`}
                  >
                    {/* Rank & Union Info */}
                    <div className="flex items-center gap-5 sm:gap-7">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isFirst ? "text-amber-600" : "text-ink-400"}`}>
                          Rank
                        </span>
                        <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black ${
                          isFirst ? "bg-amber-100 text-amber-600" : 
                          isSecond ? "bg-slate-100 text-slate-600" :
                          isThird ? "bg-orange-50 text-orange-600" :
                          "bg-[#F8FAFC] text-ink-500"
                        }`}>
                          {isFirst ? <Crown size={24} strokeWidth={2.5} /> : rank}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-ocean-950">
                          {union.union_name}
                        </h2>
                        <p className="mt-1 text-sm font-bold text-ink-500">
                          {union.college_name}
                        </p>
                      </div>
                    </div>

                    {/* Scores & Trend */}
                    <div className="flex flex-wrap items-center gap-6 border-t border-line pt-5 sm:border-0 sm:pt-0 sm:flex-nowrap">
                      
                      {/* Detailed Wings */}
                      <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold uppercase text-ink-400">Da'wa</span>
                          <span className="text-sm font-black text-ocean-950">{union.dawa_score}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold uppercase text-ink-400">Adarsham</span>
                          <span className="text-sm font-black text-ocean-950">{union.adarsham_score}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold uppercase text-ink-400">Sargam</span>
                          <span className="text-sm font-black text-ocean-950">{union.sargam_score}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold uppercase text-ink-400">Publish</span>
                          <span className="text-sm font-black text-ocean-950">{union.publishing_score}</span>
                        </div>
                      </div>

                      <div className="hidden h-12 w-px bg-line sm:block" />

                      {/* Total Score & Trend */}
                      <div className="flex items-center gap-5 w-full justify-between sm:w-auto">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-extrabold uppercase text-ocean-600">Total Score</span>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-ocean-950">{union.total_score}</span>
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC] border border-line">
                          {renderTrend(union.trend)}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
          
        </div>
      </div>
    </main>
  );
}