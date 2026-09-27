"use client";

import { useEffect, useState } from "react";
import { Building2, Pencil, Plus, RefreshCw, Search, Trash2, ListPlus, Copy, CheckCircle2, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Button, Empty, Input, PageHeader, Panel, Select } from "../components/ui";

export default function CollegesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<any>(null);
  
  // Bulk Entry State
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [busy, setBusy] = useState(false);
  
  // UI Feedback State
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    const { data } = await supabase.from("colleges").select("*").order("name");
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    const matchesQuery = !q || `${r.name} ${r.union_name} ${r.city} ${r.district}`.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = status === "all" || r.status === status;
    return matchesQuery && matchesStatus;
  });

  // 🚀 Bulletproof Single Save with Duplicate Management
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    
    const payload = {
      name: String(f.get("name")).trim(),
      union_name: String(f.get("union_name")).trim(),
      city: String(f.get("city") || "").trim() || null,
      district: String(f.get("district") || "").trim() || null,
      status: String(f.get("status")),
    };

    // Prevent Duplicates: Check if college name already exists
    const isDuplicate = rows.some(
      (r) => r.name.toLowerCase() === payload.name.toLowerCase() && r.id !== editing?.id
    );

    if (isDuplicate) {
      showToast(`"${payload.name}" has already been added to the registry!`, "error");
      setBusy(false);
      return;
    }

    try {
      if (editing?.id) {
        // 1. Update existing college
        const { error: colErr } = await supabase.from("colleges").update(payload).eq("id", editing.id);
        if (colErr) throw new Error(`College Update Failed: ${colErr.message}`);

        // 2. Safely update union details for current academic year
        const { error: uErr } = await supabase.from("college_unions")
          .update({ union_name: payload.union_name, status: payload.status })
          .eq("college_id", editing.id)
          .eq("academic_year", "2026-27");
          
        if (uErr) throw new Error(`Union Update Failed: ${uErr.message}`);
        
        showToast("College updated successfully!");

      } else {
        // 1. Insert college and FORCE it to return the new ID
        const { data: newCollege, error: colErr } = await supabase
          .from("colleges")
          .insert(payload)
          .select("id")
          .single(); 
          
        if (colErr) throw new Error(`College Insert Failed: ${colErr.message}`);
        if (!newCollege?.id) throw new Error("Database did not return a new College ID.");

        // 2. Insert into college_unions (using exact required fields)
        const { error: unionErr } = await supabase.from("college_unions").insert({
          college_id: newCollege.id,
          union_name: payload.union_name,
          academic_year: "2026-27",
          status: payload.status
        });
        
        if (unionErr) throw new Error(`Union Insert Failed: ${unionErr.message}`);
        
        showToast("College added successfully!");
      }

      setEditing(null);
      await load();
    } catch (err: any) {
      console.error(err);
      showToast(err.message, "error");
    }
    
    setBusy(false);
  };

  // 🚀 Bulletproof Bulk Save
  const handleBulkSave = async () => {
    setBusy(true);
    
    const lines = bulkText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const payload: any[] = [];
    const seenNames = new Set<string>();
    
    for (const line of lines) {
      const separator = line.includes("\t") ? "\t" : ",";
      const parts = line.split(separator).map((p) => p.trim());
      
      const name = parts[0];
      if (!name || seenNames.has(name)) continue; 
      seenNames.add(name);

      const union_name = parts[1] || `${name} Union`;
      const city = parts[2] || null;
      const district = parts[3] || null;

      payload.push({ name, union_name, city, district, status: "active" });
    }

    if (payload.length > 0) {
      try {
        // 1. Upsert colleges and demand the returned rows
        const { data: insertedColleges, error: colError } = await supabase
          .from("colleges")
          .upsert(payload, { onConflict: "name" })
          .select("id, union_name, status");
          
        if (colError) throw new Error(`Bulk College Error: ${colError.message}`);

        // 2. Ensure we have colleges before running the union loop
        if (insertedColleges && insertedColleges.length > 0) {
          const unionsPayload = insertedColleges.map((col) => ({
            college_id: col.id,
            union_name: col.union_name,
            academic_year: "2026-27",
            status: col.status || "active"
          }));

          // 3. Upsert Unions (CRITICAL: No spaces in the onConflict string!)
          const { error: unionError } = await supabase
            .from("college_unions")
            .upsert(unionsPayload, { onConflict: "college_id,academic_year,union_name" });

          if (unionError) throw new Error(`Bulk Union Error: ${unionError.message}`);
        }

        setBulkOpen(false);
        setBulkText("");
        await load();
        showToast(`${payload.length} colleges successfully imported!`);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this college? This will also delete all associated unions, scores, and programs.")) return;
    try {
      await supabase.from("colleges").delete().eq("id", id);
      await load();
      showToast("College successfully deleted.", "success");
    } catch (err: any) {
      showToast("Failed to delete college.", "error");
    }
  };

  const copyTemplate = () => {
    const template = "College Name, Union Name, City, District\nJamia Nooriyya, SAJDA Union, Perinthalmanna, Malappuram\nDarul Huda, DSB Union, Chemmad, Malappuram";
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Institutions"
        title="College Registry"
        description="Maintain the master list of participating colleges and officially register their unions."
        actions={
          <>
            <Button onClick={() => setEditing({ status: "active" })}>
              <Plus size={15} className="mr-1.5 inline-block" /> Add college
            </Button>
            <Button variant="ghost" onClick={() => setBulkOpen(true)}>
              <ListPlus size={15} className="mr-1.5 inline-block" /> Bulk entry
            </Button>
            <Button variant="ghost" onClick={load}>
              <RefreshCw size={15} className="mr-1.5 inline-block" /> Refresh
            </Button>
          </>
        }
      />

      <Panel>
        {/* Filters */}
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={16} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search college, union, city..."
              className="pl-10"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        {/* Data Table */}
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/30">
                <tr>
                  <th className="px-3 py-3">Institution</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/10 text-amber-300 shrink-0">
                          <Building2 size={17} />
                        </div>
                        <div>
                          <div className="font-black leading-tight mb-0.5">{r.name}</div>
                          <div className="text-[10px] font-bold tracking-wide text-white/40">{r.union_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-white/50">
                      {[r.city, r.district].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                          r.status === "active"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-white/40 text-xs">
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(r)}
                          className="rounded-xl border border-white/10 p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="rounded-xl border border-red-400/10 p-2 text-red-300/70 transition-colors hover:bg-red-400/20 hover:text-red-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </Panel>

      {/* ---------------------------------------------------------
          SMART BULK ENTRY MODAL 
      ---------------------------------------------------------- */}
      {bulkOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a1725] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-2 text-xl font-black text-white">Smart Bulk Entry</div>
            <p className="mb-5 text-sm font-medium leading-relaxed text-white/50">
              Paste a list of colleges from Excel or a text file. We will safely insert records and officially register their unions for the current year.
            </p>
            
            {/* Visual Template Reference */}
            <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-4 relative">
              <button 
                onClick={copyTemplate}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Template"}
              </button>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/70 mb-2">Expected Format</div>
              <div className="font-mono text-xs text-white/60 leading-relaxed">
                College Name, Union Name, City, District<br />
                Jamia Nooriyya, SAJDA Union, Perinthalmanna, Malappuram<br />
                Darul Huda, DSB Union, Chemmad, Malappuram
              </div>
            </div>
            
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              placeholder="Paste your data here..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#07111d]/80 p-4 text-sm font-semibold text-white outline-none focus:border-amber-300/40 custom-scrollbar"
            />

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-bold text-white/30">
                {bulkText.split("\n").filter((l) => l.trim()).length} valid rows detected
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => { setBulkOpen(false); setBulkText(""); }}>
                  Cancel
                </Button>
                <Button onClick={handleBulkSave} disabled={busy || !bulkText.trim()}>
                  {busy ? "Processing Database..." : "Import Records"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          ADD / EDIT MODAL 
      ---------------------------------------------------------- */}
      {editing && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={save}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a1725] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="mb-5 text-xl font-black">
              {editing.id ? "Edit college" : "Add college"}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-white/45">Institution Name</span>
                <Input name="name" required defaultValue={editing.name || ""} placeholder="e.g. Jamia Nooriyya" />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold text-white/45">Union Name</span>
                <Input name="union_name" required defaultValue={editing.union_name || ""} placeholder="e.g. SAJDA Union" />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold text-white/45">Status</span>
                <Select name="status" defaultValue={editing.status || "active"}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold text-white/45">City</span>
                <Input name="city" defaultValue={editing.city || ""} placeholder="Optional" />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold text-white/45">District</span>
                <Input name="district" defaultValue={editing.district || ""} placeholder="Optional" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save college"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------------
          TOAST NOTIFICATION 
      ---------------------------------------------------------- */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md ${
            toast.type === "success" 
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <p className="text-sm font-bold tracking-wide">{toast.msg}</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}