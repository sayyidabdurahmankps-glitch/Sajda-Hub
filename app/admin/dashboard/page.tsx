"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  MessageSquare, 
  LogOut,
  MoreVertical,
  Search,
  Loader2
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [unions, setUnions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Aggregated Stats
  const [stats, setStats] = useState({
    totalUnions: 0,
    totalPoints: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Unions and Colleges
      const { data: unionData, error: unionError } = await supabase
        .from('college_unions')
        .select(`
          id,
          union_name,
          academic_year,
          colleges ( name )
        `)
        .eq('status', 'active');

      if (unionError) throw unionError;
      
      // 2. Fetch Metrics View
      const { data: metricsData, error: metricsError } = await supabase
        .from('union_metrics')
        .select('*');

      if (metricsError) throw metricsError;

      // 3. Fetch Recent Contact Messages (Fails gracefully if table doesn't exist)
      const { data: msgData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // 4. Merge Unions with their Metrics
      const mergedUnions = (unionData || []).map((u: any) => {
        // Find matching metric, default to 0s if none found
        const metric = metricsData?.find(m => m.union_id === u.id) || {
          total_score: 0, dawa_score: 0, adarsham_score: 0, sargam_score: 0, publishing_score: 0
        };
        return { ...u, ...metric };
      });

      // Sort by total score descending
      mergedUnions.sort((a, b) => b.total_score - a.total_score);
      
      // Calculate Stats
      const totalPoints = mergedUnions.reduce((sum, u) => sum + (u.total_score || 0), 0);
      
      setUnions(mergedUnions);
      setMessages(msgData || []);
      setStats({
        totalUnions: mergedUnions.length,
        totalPoints,
        totalMessages: msgData?.length || 0,
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Adjusted search filter to match the newly flattened structure
  const filteredUnions = unions.filter(u => 
    u.union_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.colleges?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0B1726] text-white">
      
      {/* Background Subtle Grid */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-500/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        
        {/* =========================================================
            HEADER NAV
        ========================================================== */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <ShieldAlert size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">System Admin</h1>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/50 mt-1">SAJDA Central Command</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Terminate Session
          </button>
        </header>

        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 size={32} className="animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* =========================================================
                LEFT COLUMN: OVERVIEW STATS & INBOX
            ========================================================== */}
            <div className="flex flex-col gap-8 lg:col-span-1">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <Users size={20} className="text-blue-400 mb-4" />
                  <p className="text-3xl font-black">{stats.totalUnions}</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mt-1">Active Unions</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <Activity size={20} className="text-amber-400 mb-4" />
                  <p className="text-3xl font-black">{stats.totalPoints}</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mt-1">Total Points</p>
                </div>
              </div>

              {/* Inbox Widget */}
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm font-extrabold">
                    <MessageSquare size={18} className="text-emerald-400" />
                    Incoming Transmissions
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-400">
                    {stats.totalMessages}
                  </span>
                </div>
                
                <div className="flex flex-col gap-4">
                  {messages.length > 0 ? messages.map((msg) => (
                    <div key={msg.id} className="rounded-xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-white/20 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white">{msg.name}</span>
                        <span className="text-[10px] font-bold text-white/40">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-500/70 mb-2">
                        {msg.college}
                      </span>
                      <p className="text-xs font-medium leading-relaxed text-white/60 line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-sm font-bold text-white/40 border-2 border-dashed border-white/10 rounded-xl">
                      No recent messages.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* =========================================================
                RIGHT COLUMN: UNION MASTER DIRECTORY
            ========================================================== */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 lg:col-span-2 backdrop-blur-md flex flex-col h-[800px]">
              
              {/* Directory Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-black">Union Master Directory</h2>
                  <p className="text-xs font-bold text-white/40 mt-1">Manage all registered colleges and metrics.</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="text" 
                    placeholder="Search directory..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm font-bold text-white outline-none transition-colors focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                      <th className="pb-4 pl-4">Institution & Union</th>
                      <th className="pb-4 text-center">4-Wing Split</th>
                      <th className="pb-4 text-center">Total Score</th>
                      <th className="pb-4 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUnions.length > 0 ? filteredUnions.map((union, idx) => (
                      <tr key={union.id} className="transition-colors hover:bg-white/5">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-black text-white/50 border border-white/10">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-black text-white">{union.union_name}</p>
                              <p className="text-xs font-medium text-white/50 mt-0.5">{union.colleges?.name}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-3 text-xs font-black text-white/80">
                            <span className="flex flex-col items-center gap-1"><span className="text-[9px] text-white/30 uppercase">Da</span>{union.dawa_score}</span>
                            <span className="flex flex-col items-center gap-1"><span className="text-[9px] text-white/30 uppercase">Ad</span>{union.adarsham_score}</span>
                            <span className="flex flex-col items-center gap-1"><span className="text-[9px] text-white/30 uppercase">Sa</span>{union.sargam_score}</span>
                            <span className="flex flex-col items-center gap-1"><span className="text-[9px] text-white/30 uppercase">Pu</span>{union.publishing_score}</span>
                          </div>
                        </td>

                        <td className="py-4 text-center">
                          <div className="inline-flex items-center justify-center rounded-lg bg-amber-500/10 px-3 py-1.5 border border-amber-500/20">
                            <span className="text-sm font-black text-amber-500">{union.total_score}</span>
                          </div>
                        </td>

                        <td className="py-4 pr-4 text-right">
                          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-transparent text-white/50 transition-colors hover:bg-white/10 hover:text-white">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-sm font-bold text-white/40">
                          No union data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </main>
  );
}