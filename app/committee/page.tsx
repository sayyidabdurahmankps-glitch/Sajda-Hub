"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ShieldCheck, User, Crown, Award } from "lucide-react";

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  tier: number;
  academic_year: string;
  photo_url: string | null;
  sort_order: number;
}

export default function CommitteePage() {
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchCommittee();
  }, []);

  const fetchCommittee = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("committee_members")
        .select("*")
        .eq("status", "active")
        .order("tier", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setMembers(data ?? []);
    } catch (error) {
      console.error("Error fetching committee:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group members by their hierarchy tier
  const topExecutives = members.filter((m) => m.tier === 1);
  const vicePresidents = members.filter((m) => m.tier === 2);
  const jointSecretaries = members.filter((m) => m.tier === 3);

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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-800 shadow-sm">
            <Crown size={14} className="text-amber-600" />
            Central Committee · 2026 — 2027
          </div>

          <h1 className="text-4xl font-black tracking-tight text-ocean-950 sm:text-6xl">
            Our Leadership
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-ink-600 sm:text-lg">
            The dedicated team steering the Students Association of Jamia Nooriyya for Devoted Activities (SAJDA) towards organizational and academic excellence.
          </p>
        </div>

        {/* =========================================================
            LOADING STATE
        ========================================================== */}
        {loading ? (
          <div className="mx-auto mt-20 max-w-5xl grid gap-8 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 w-full animate-pulse rounded-[2rem] border-2 border-line bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-20 max-w-6xl space-y-20">
            
            {/* =========================================================
                TIER 1: TOP EXECUTIVES (President, G. Secretary, Treasurer)
            ========================================================== */}
            {topExecutives.length > 0 && (
              <section>
                <div className="text-center mb-10">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-ocean-600">Executive Committee</p>
                  <h2 className="mt-2 text-2xl font-black text-ocean-950 sm:text-3xl">Core Office Bearers</h2>
                </div>

                <div className="grid gap-8 sm:grid-cols-3">
                  {topExecutives.map((member) => (
                    <div 
                      key={member.id}
                      className="group relative flex flex-col items-center rounded-[2rem] border-2 border-line bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-ocean-300 hover:shadow-ocean-md"
                    >
                      {/* Photo Frame */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-ocean-50 border border-line shadow-inner">
                        {member.photo_url ? (
                          <img 
                            src={member.photo_url} 
                            alt={member.name} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ocean-300">
                            <User size={64} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <h3 className="mt-6 text-2xl font-black text-ocean-950 tracking-tight">
                        {member.name}
                      </h3>
                      
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-800 shadow-sm">
                        {member.role}
                      </div>

                      <p className="mt-2 text-[11px] font-bold text-ink-400 tracking-wider">
                        2026 — 2027
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =========================================================
                TIER 2: VICE PRESIDENTS
            ========================================================== */}
            {vicePresidents.length > 0 && (
              <section>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-black text-ocean-950 sm:text-3xl">Vice Presidents</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {vicePresidents.map((member) => (
                    <div 
                      key={member.id}
                      className="group flex flex-col items-center rounded-[1.75rem] border-2 border-line bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ocean-300 hover:shadow-ocean-sm"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] bg-ocean-50 border border-line">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ocean-300"><User size={48} /></div>
                        )}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-ocean-950">{member.name}</h3>
                      <p className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-ocean-700">{member.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* =========================================================
                TIER 3: JOINT SECRETARIES
            ========================================================== */}
            {jointSecretaries.length > 0 && (
              <section>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-black text-ocean-950 sm:text-3xl">Joint Secretaries</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {jointSecretaries.map((member) => (
                    <div 
                      key={member.id}
                      className="group flex flex-col items-center rounded-[1.75rem] border-2 border-line bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ocean-300 hover:shadow-ocean-sm"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] bg-ocean-50 border border-line">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ocean-300"><User size={48} /></div>
                        )}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-ocean-950">{member.name}</h3>
                      <p className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-ocean-700">{member.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {members.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-line bg-white py-24 text-center">
                <ShieldCheck size={48} className="text-ink-300 mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-black text-ocean-950">No Committee Members Found</h3>
                <p className="mt-2 text-sm font-bold text-ink-500">
                  Leadership records for the 2026-27 academic year are currently being updated.
                </p>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}