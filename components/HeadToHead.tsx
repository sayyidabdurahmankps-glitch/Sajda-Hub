"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Ensure this path points to your supabase client
import {
  Activity,
  Swords,
  ChevronDown,
  Lock,
  Search,
  Trophy,
  ShieldCheck
} from "lucide-react";

// The shape of our Supabase data
interface UnionData {
  union_id: string;
  name: string;
  dawa: number;
  adarsham: number;
  sargam: number;
  publishing: number;
  total: number;
}

export default function HeadToHead() {
  const [unionsList, setUnionsList] = useState<UnionData[]>([]);
  const [unionA, setUnionA] = useState<UnionData | null>(null);
  const [unionB, setUnionB] = useState<UnionData | null>(null);
  
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [isDropdownA, setIsDropdownA] = useState(false);
  const [isDropdownB, setIsDropdownB] = useState(false);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchUnions = async () => {
      const { data, error } = await supabase
        .from('union_metrics')
        .select(`
          union_id, dawa_score, adarsham_score, sargam_score, publishing_score, total_score,
          college_unions ( union_name )
        `);

      if (!error && data) {
        const formattedData = data.map((item: any) => ({
          union_id: item.union_id,
          name: item.college_unions?.union_name || "Unknown Union",
          dawa: item.dawa_score,
          adarsham: item.adarsham_score,
          sargam: item.sargam_score,
          publishing: item.publishing_score,
          total: item.total_score,
        }));
        setUnionsList(formattedData);
      }
    };

    fetchUnions();
  }, []);

  return (
    <section className="relative border-y border-line bg-white py-24 sm:py-32 overflow-hidden">
      {/* Light Grid Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#052659 1px, transparent 1px), linear-gradient(90deg, #052659 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ocean-700 shadow-sm">
            <Activity size={14} className="text-emerald-500" />
            Data Intelligence
          </div>
          <h2 className="text-4xl md:text-[3.5rem] leading-none font-black uppercase tracking-tight text-ocean-950">
            HEAD-TO-HEAD <span className="text-ink-400">STATS</span>
          </h2>
        </div>

        {/* Interactive Search UI (Light Theme) */}
        <div className="rounded-[2.5rem] border border-line bg-white p-6 sm:p-10 shadow-ocean-md">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* TEAM ALPHA */}
            <div className="relative w-full flex-1">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-ink-500">
                <ShieldCheck size={16} className="text-emerald-500" />
                Team Alpha
              </div>
              
              <div 
                className={`relative flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-6 py-5 transition-colors ${
                  isDropdownA ? 'border-ocean-300 bg-ocean-50' : 'border-line bg-[#F8FAFC] hover:border-ocean-200'
                }`}
                onClick={() => setIsDropdownA(!isDropdownA)}
              >
                <span className={`text-sm font-black uppercase tracking-widest ${unionA ? 'text-ocean-950' : 'text-ink-400'}`}>
                  {unionA ? unionA.name : "SELECT CHALLENGER..."}
                </span>
                <ChevronDown size={18} className="text-ink-400" />
              </div>
              
              {/* Search Dropdown Alpha */}
              {isDropdownA && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-line bg-white p-2 shadow-xl" onMouseLeave={() => setIsDropdownA(false)}>
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3 border border-line">
                    <Search size={16} className="text-ink-400" />
                    <input 
                      type="text" 
                      placeholder="Search unions..." 
                      className="w-full bg-transparent text-sm font-bold text-ocean-950 outline-none placeholder:text-ink-400"
                      value={searchA}
                      onChange={(e) => setSearchA(e.target.value)}
                    />
                  </div>
                  <div className="flex max-h-48 flex-col gap-1 overflow-y-auto custom-scrollbar">
                    {unionsList.filter(u => u.name.toLowerCase().includes(searchA.toLowerCase())).map(u => (
                      <div 
                        key={u.union_id} 
                        className="cursor-pointer rounded-xl px-4 py-3 text-xs font-extrabold text-ink-600 hover:bg-ocean-50 hover:text-ocean-950"
                        onClick={() => { setUnionA(u); setIsDropdownA(false); }}
                      >
                        {u.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VS BADGE */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-[#F8FAFC] text-ink-400 mt-6 md:mt-0 shadow-sm">
              <Swords size={20} strokeWidth={2.5} />
            </div>

            {/* TEAM BRAVO */}
            <div className="relative w-full flex-1">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-ink-500">
                <ShieldCheck size={16} className="text-emerald-500" />
                Team Bravo
              </div>
              
              {!unionA ? (
                <div className="relative flex w-full items-center justify-between rounded-2xl border-2 border-line/50 bg-[#F8FAFC]/50 px-6 py-5 opacity-60">
                  <span className="text-sm font-black uppercase tracking-widest text-ink-300">
                    LOCKED
                  </span>
                  <Lock size={18} className="text-ink-300" />
                </div>
              ) : (
                <div 
                  className={`relative flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-6 py-5 transition-colors ${
                    isDropdownB ? 'border-ocean-300 bg-ocean-50' : 'border-line bg-[#F8FAFC] hover:border-ocean-200'
                  }`}
                  onClick={() => setIsDropdownB(!isDropdownB)}
                >
                  <span className={`text-sm font-black uppercase tracking-widest ${unionB ? 'text-ocean-950' : 'text-ink-400'}`}>
                    {unionB ? unionB.name : "SELECT CHALLENGER..."}
                  </span>
                  <ChevronDown size={18} className="text-ink-400" />
                </div>
              )}

              {/* Search Dropdown Bravo */}
              {isDropdownB && unionA && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-line bg-white p-2 shadow-xl" onMouseLeave={() => setIsDropdownB(false)}>
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3 border border-line">
                    <Search size={16} className="text-ink-400" />
                    <input 
                      type="text" 
                      placeholder="Search unions..." 
                      className="w-full bg-transparent text-sm font-bold text-ocean-950 outline-none placeholder:text-ink-400"
                      value={searchB}
                      onChange={(e) => setSearchB(e.target.value)}
                    />
                  </div>
                  <div className="flex max-h-48 flex-col gap-1 overflow-y-auto custom-scrollbar">
                    {unionsList.filter(u => u.name.toLowerCase().includes(searchB.toLowerCase()) && u.union_id !== unionA.union_id).map(u => (
                      <div 
                        key={u.union_id} 
                        className="cursor-pointer rounded-xl px-4 py-3 text-xs font-extrabold text-ink-600 hover:bg-ocean-50 hover:text-ocean-950"
                        onClick={() => { setUnionB(u); setIsDropdownB(false); }}
                      >
                        {u.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RESULTS CHART (Reveals when both unions are selected) */}
          {unionA && unionB && (
            <div className="mt-12 border-t border-line pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-8">
                {[
                  { label: "Da'wa", key: "dawa" },
                  { label: "Adarsham", key: "adarsham" },
                  { label: "Sargam", key: "sargam" },
                  { label: "Publishing", key: "publishing" },
                ].map((stat) => {
                  const scoreA = unionA[stat.key as keyof typeof unionA] as number;
                  const scoreB = unionB[stat.key as keyof typeof unionB] as number;
                  const maxScore = 100;
                  const winA = scoreA >= scoreB;
                  const winB = scoreB >= scoreA;

                  return (
                    <div key={stat.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xl font-black ${winA ? 'text-ocean-950' : 'text-ink-400'}`}>{scoreA}</span>
                        <div className="h-2 w-full rounded-full bg-[#E8EEF2] flex justify-end overflow-hidden">
                          <div className={`h-full rounded-full ${winA ? 'bg-emerald-500' : 'bg-ink-300'}`} style={{ width: `${(scoreA / maxScore) * 100}%` }} />
                        </div>
                      </div>
                      
                      <span className="w-24 text-center text-[10px] font-extrabold uppercase tracking-widest text-ink-500 sm:w-32">
                        {stat.label}
                      </span>

                      <div className="flex flex-col items-start gap-2">
                        <span className={`text-xl font-black ${winB ? 'text-ocean-950' : 'text-ink-400'}`}>{scoreB}</span>
                        <div className="h-2 w-full rounded-full bg-[#E8EEF2] overflow-hidden">
                          <div className={`h-full rounded-full ${winB ? 'bg-emerald-500' : 'bg-ink-300'}`} style={{ width: `${(scoreB / maxScore) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Total Points Footer */}
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl bg-ocean-50 py-8 px-6 sm:gap-8 sm:px-10 border border-ocean-100 shadow-sm">
                   <div className="text-right">
                     <div className="text-[10px] font-extrabold uppercase tracking-widest text-ocean-600">Total Points</div>
                     <div className="text-4xl font-black text-ocean-950 mt-1">{unionA.total}</div>
                   </div>
                   <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-line text-amber-500 shadow-sm">
                     <Trophy size={22} strokeWidth={2.5} />
                   </div>
                   <div className="text-left">
                     <div className="text-[10px] font-extrabold uppercase tracking-widest text-ocean-600">Total Points</div>
                     <div className="text-4xl font-black text-ocean-950 mt-1">{unionB.total}</div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}