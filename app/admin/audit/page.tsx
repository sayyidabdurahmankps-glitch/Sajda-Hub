"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, RefreshCw, Search, Trash2, MapPin, Image as ImageIcon, UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Button, Empty, Input, PageHeader, Panel, Select } from "../components/ui";

export default function ProgramsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [wings, setWings] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<any>(null);
  
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    setLoading(true);
    
    // Fetch Programs (No longer joining union data)
    const { data: programsData } = await supabase
      .from("programs")
      .select("*")
      .order("event_date", { ascending: false });

    // Fetch Active Wings for the dropdown
    const { data: wingsData } = await supabase
      .from("wing_definitions")
      .select("key, name")
      .eq("active", true)
      .order("sort_order");

    setRows(programsData ?? []);
    setWings(wingsData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = rows.filter((r) => {
    const searchString = `${r.title} ${r.location}`.toLowerCase();
    const matchesQuery = !q || searchString.includes(q.toLowerCase());
    const matchesStatus = status === "all" || r.status === status;
    return matchesQuery && matchesStatus;
  });

  // Cloudinary Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        setEditing({ ...editing, poster_url: data.secure_url });
      } else {
        throw new Error(data.error?.message || "Failed to upload image.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Image upload failed: ${err.message}. Check your Cloudinary ENV variables.`);
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    
    const payload = {
      title: String(f.get("title")),
      description: String(f.get("description") || ""),
      event_date: String(f.get("event_date")),
      location: String(f.get("location") || "") || null,
      poster_url: editing?.poster_url || null,
      wing_key: String(f.get("wing_key")),
      status: String(f.get("status")),
    };

    try {
      const result = editing?.id
        ? await supabase.from("programs").update(payload).eq("id", editing.id)
        : await supabase.from("programs").insert(payload);

      if (result.error) throw result.error;

      setEditing(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Error saving program: ${err.message}`);
    }
    
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this program? This action cannot be undone.")) return;
    await supabase.from("programs").delete().eq("id", id);
    await loadData();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Activities"
        title="Program Registry"
        description="Manage central events, workshops, and initiatives."
        actions={
          <>
            <Button onClick={() => setEditing({ status: "active", poster_url: "" })}>
              <Plus size={15} className="mr-1.5 inline-block" /> Add program
            </Button>
            <Button variant="ghost" onClick={loadData}>
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
              placeholder="Search programs or locations..."
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
        {loading ? (
          <div className="py-12 text-center text-sm font-bold text-white/30 animate-pulse">
            Loading programs...
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/30">
                <tr>
                  <th className="px-3 py-3">Program Details</th>
                  <th>Category</th>
                  <th>Date & Location</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-4">
                        {/* 9:16 Aspect Ratio Thumbnail */}
                        <div className="flex w-10 aspect-[9/16] shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/20 overflow-hidden border border-white/10">
                          {r.poster_url ? (
                            <img src={r.poster_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={16} />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-white">{r.title}</div>
                          <div className="mt-1 line-clamp-2 max-w-[250px] text-xs font-medium text-white/40">
                            {r.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                        {r.wing_key}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-white/80">
                        <CalendarDays size={14} className="text-white/30" />
                        {new Date(r.event_date).toLocaleDateString("en-IN")}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                        <MapPin size={12} className="text-white/30" />
                        {r.location || "TBA"}
                      </div>
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

      {/* Add / Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm custom-scrollbar">
          <form
            onSubmit={save}
            className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a1725] p-6 shadow-2xl"
          >
            <div className="mb-6 text-xl font-black text-white">
              {editing.id ? "Edit Program" : "Add Program"}
            </div>
            
            <div className="grid gap-5 sm:grid-cols-2">
              
              {/* Cloudinary Image Upload Section */}
              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-white/45">Program Poster</span>
                
                <div className="flex items-center gap-6">
                  {/* 9:16 Aspect Ratio Preview */}
                  <div className="flex w-24 aspect-[9/16] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/50 overflow-hidden">
                    {uploadingImage ? (
                      <Loader2 size={24} className="animate-spin text-amber-400" />
                    ) : editing.poster_url ? (
                      <img src={editing.poster_url} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-white/20" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <label className="group relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-transparent py-4 text-sm font-bold text-white/50 transition-colors hover:border-amber-400/50 hover:text-amber-400 hover:bg-amber-400/5">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <UploadCloud size={18} />
                      {uploadingImage ? "Uploading..." : "Click to upload image"}
                    </label>
                    <p className="mt-2 text-[10px] text-white/30">Vertical 9:16 ratio recommended (e.g., 1080x1920). Auto-uploads to Cloudinary.</p>
                  </div>
                </div>
              </div>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Program Title</span>
                <Input name="title" required defaultValue={editing.title || ""} placeholder="e.g. Annual Debate Championship" />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Description</span>
                <textarea 
                  name="description" 
                  rows={3}
                  defaultValue={editing.description || ""} 
                  placeholder="Provide a brief overview of the event..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#07111d]/80 p-4 text-sm font-semibold text-white outline-none focus:border-amber-300/40 custom-scrollbar"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Category / Wing</span>
                <Select name="wing_key" required defaultValue={editing.wing_key || ""}>
                  <option value="" disabled>Select Wing...</option>
                  {wings.map(w => (
                    <option key={w.key} value={w.key}>{w.name}</option>
                  ))}
                </Select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Event Date</span>
                <Input name="event_date" type="date" required defaultValue={editing.event_date ? editing.event_date.split('T')[0] : ""} />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Location <span className="text-white/20 ml-1">(Optional)</span></span>
                <Input name="location" defaultValue={editing.location || ""} placeholder="e.g. Main Auditorium" />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Status</span>
                <Select name="status" defaultValue={editing.status || "active"}>
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </Select>
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-5">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || uploadingImage}>
                {busy ? "Saving…" : "Save Program"}
              </Button>
            </div>
          </form>
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