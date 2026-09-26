"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  Trophy, Plus, Loader2, CheckCircle2, ShieldAlert, 
  Pencil, Trash2, Check, Clock, XCircle, Activity, Medal
} from "lucide-react";

export default function AddScorePage() {
  const [unions, setUnions] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  
  // Ledger State
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  // Form State
  const [selectedUnion, setSelectedUnion] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [score, setScore] = useState("");
  const [position, setPosition] = useState(""); // New Position State
  const [resultStatus, setResultStatus] = useState("approved");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit Modal State
  const [editingScore, setEditingScore] = useState<any>(null);
  const [editPoints, setEditPoints] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    fetchFormData();
    fetchScores();
  }, []);

  const fetchFormData = async () => {
    try {
      const { data: unionData } = await supabase
        .from("college_unions")
        .select("id, union_name, colleges(name)")
        .eq("status", "active")
        .order("union_name");

      const { data: programData } = await supabase
        .from("programs")
        .select("id, title, wing_key")
        .eq("status", "active")
        .order("event_date", { ascending: false });

      if (unionData) setUnions(unionData);
      if (programData) setPrograms(programData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingForm(false);
    }
  };

  const fetchScores = async () => {
    setLoadingScores(true);
    try {
      const { data } = await supabase
        .from("program_results")
        .select(`
          id, points, position, status, created_at,
          college_unions ( union_name ),
          programs ( title, wing_key )
        `)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (data) setRecentScores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScores(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const numericScore = parseFloat(score);
      if (numericScore < 0) throw new Error("Score cannot be negative.");

      const { error } = await supabase.from("program_results").insert({
        union_id: selectedUnion,
        program_id: selectedProgram,
        points: numericScore,
        position: position ? parseInt(position) : null,
        status: resultStatus,
      });

      if (error) throw error;

      setSuccessMsg("Points successfully awarded!");
      setScore("");
      setPosition("");
      fetchScores(); // Refresh ledger instantly

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to award points.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Action: Approve
  const handleApprove = async (id: string) => {
    await supabase.from("program_results").update({ status: "approved" }).eq("id", id);
    fetchScores();
  };

  // Quick Action: Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this score record?")) return;
    await supabase.from("program_results").delete().eq("id", id);
    fetchScores();
  };

  // Edit Modal Handling
  const openEdit = (record: any) => {
    setEditingScore(record);
    setEditPoints(record.points.toString());
    setEditPosition(record.position ? record.position.toString() : "");
    setEditStatus(record.status);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      await supabase.from("program_results").update({
        points: parseFloat(editPoints),
        position: editPosition ? parseInt(editPosition) : null,
        status: editStatus,
      }).eq("id", editingScore.id);
      
      setEditingScore(null);
      fetchScores();
    } catch (err) {
      console.error(err);
      alert("Failed to update score.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatWing = (key: string) => {
    const wings: Record<string, string> = { dawa: "Da'wa", adarsham: "Adarsham", sargam: "Sargam", publishing: "Publishing" };
    return wings[key] || "General";
  };

  const getPositionLabel = (pos: number) => {
    if (pos === 1) return "1st Place";
    if (pos === 2) return "2nd Place";
    if (pos === 3) return "3rd Place";
    return `${pos}th Place`;
  };

  return (
    <main className="min-h-screen bg-[#0B1726] text-white p-5 sm:p-10 pb-24">
      
      {/* HEADER */}
      <div className="mb-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-500 mb-4">
          Point Allocation
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Trophy className="text-amber-400" size={28} />
          Award & Manage Points
        </h1>
        <p className="mt-2 text-sm font-medium text-white/50">
          Award points to a union for a specific program. Review, edit, and approve pending allocations below.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ==========================================
            ALLOCATION FORM
        =========================================== */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-md shadow-xl">
          {loadingForm ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 size={32} className="animate-spin text-amber-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {errorMsg && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-400">
                  <ShieldAlert size={18} /> {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-400 animate-in fade-in">
                  <CheckCircle2 size={18} /> {successMsg}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Target Union</label>
                  <select
                    required
                    value={selectedUnion}
                    onChange={(e) => setSelectedUnion(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm font-bold text-white outline-none transition-colors focus:border-amber-500/50"
                  >
                    <option value="" disabled className="bg-[#0B1726] text-white/50">Select a union...</option>
                    {unions.map((u) => <option key={u.id} value={u.id} className="bg-[#0B1726]">{u.union_name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Target Program</label>
                  <select
                    required
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm font-bold text-white outline-none transition-colors focus:border-amber-500/50"
                  >
                    <option value="" disabled className="bg-[#0B1726] text-white/50">Select a program...</option>
                    {programs.map((p) => <option key={p.id} value={p.id} className="bg-[#0B1726]">[{formatWing(p.wing_key)}] {p.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Points Awarded</label>
                  <div className="relative">
                    <Plus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="number" required min="0" step="0.5" placeholder="e.g. 15"
                      value={score} onChange={(e) => setScore(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-lg font-black text-white outline-none focus:border-amber-500/50 placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* NEW POSITION FIELD */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Position <span className="text-white/30 lowercase tracking-normal">(Optional)</span></label>
                  <select
                    value={position} onChange={(e) => setPosition(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-bold text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="" className="bg-[#0B1726]">None / Participation</option>
                    <option value="1" className="bg-[#0B1726]">1st Place</option>
                    <option value="2" className="bg-[#0B1726]">2nd Place</option>
                    <option value="3" className="bg-[#0B1726]">3rd Place</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Verification Status</label>
                  <select
                    required value={resultStatus} onChange={(e) => setResultStatus(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-bold text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="approved" className="bg-[#0B1726]">Approved</option>
                    <option value="pending" className="bg-[#0B1726]">Pending (Audit)</option>
                    <option value="void" className="bg-[#0B1726]">Void</option>
                  </select>
                </div>
              </div>

              <button
                type="submit" disabled={isSubmitting || !selectedUnion || !selectedProgram}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 text-sm font-extrabold text-[#0B1726] transition-all hover:bg-amber-400 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />}
                {isSubmitting ? "Processing..." : "Award Program Points"}
              </button>
            </form>
          )}
        </div>

        {/* ==========================================
            RECENT SCORE LEDGER
        =========================================== */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-amber-500" size={20} />
            <h2 className="text-lg font-black text-white">Score Ledger & Audits</h2>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="pb-3 pl-3">Union & Program</th>
                  <th className="pb-3 text-center">Points</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingScores ? (
                  <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="animate-spin text-amber-500 inline-block" /></td></tr>
                ) : recentScores.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-white/40 font-bold">No recent score allocations.</td></tr>
                ) : (
                  recentScores.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-white/5">
                      <td className="py-3 pl-3">
                        <div className="font-bold text-white">{record.college_unions?.union_name}</div>
                        <div className="text-[11px] font-medium text-white/50 mt-0.5 flex items-center flex-wrap gap-1.5">
                          <span className="uppercase text-amber-500/70 tracking-widest text-[9px]">{formatWing(record.programs?.wing_key)}</span>
                          • {record.programs?.title}
                          {/* POSITION BADGE */}
                          {record.position && (
                            <span className="ml-1 inline-flex items-center gap-1 rounded bg-ocean-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-ocean-300 border border-ocean-500/30">
                              <Medal size={10} /> {getPositionLabel(record.position)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center font-black text-amber-400">+{record.points}</td>
                      <td className="py-3 text-center">
                        {record.status === "approved" && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={10} /> Approved</span>
                        )}
                        {record.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase text-amber-400 border border-amber-500/20 animate-pulse"><Clock size={10} /> Pending</span>
                        )}
                        {record.status === "void" && (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase text-red-400 border border-red-500/20"><XCircle size={10} /> Void</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <div className="flex justify-end gap-2">
                          {record.status === "pending" && (
                            <button onClick={() => handleApprove(record.id)} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white" title="Approve">
                              <Check size={14} strokeWidth={3} />
                            </button>
                          )}
                          <button onClick={() => openEdit(record)} className="rounded-xl border border-white/10 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(record.id)} className="rounded-xl border border-red-500/20 bg-red-500/5 p-2 text-red-400 transition-colors hover:bg-red-500 hover:text-white" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==========================================
          EDIT MODAL
      =========================================== */}
      {editingScore && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={saveEdit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0B1726] p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-1">Edit Allocation</h2>
            <p className="text-xs font-medium text-white/50 mb-6 truncate">{editingScore.college_unions?.union_name} - {editingScore.programs?.title}</p>
            
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Points</label>
                  <input
                    type="number" required min="0" step="0.5"
                    value={editPoints} onChange={(e) => setEditPoints(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 py-3 px-4 text-lg font-black text-white outline-none focus:border-amber-500/50"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Position</label>
                  <select
                    value={editPosition} onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 px-4 text-sm font-bold text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="" className="bg-[#0B1726]">None</option>
                    <option value="1" className="bg-[#0B1726]">1st</option>
                    <option value="2" className="bg-[#0B1726]">2nd</option>
                    <option value="3" className="bg-[#0B1726]">3rd</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-white/50">Status</label>
                <select
                  required value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-3 px-4 text-sm font-bold text-white outline-none focus:border-amber-500/50"
                >
                  <option value="approved" className="bg-[#0B1726]">Approved</option>
                  <option value="pending" className="bg-[#0B1726]">Pending</option>
                  <option value="void" className="bg-[#0B1726]">Void</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-5">
              <button type="button" onClick={() => setEditingScore(null)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white/50 hover:bg-white/10 hover:text-white">
                Cancel
              </button>
              <button type="submit" disabled={isSavingEdit} className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-[#0B1726] hover:bg-amber-400 disabled:opacity-50">
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </main>
  );
}