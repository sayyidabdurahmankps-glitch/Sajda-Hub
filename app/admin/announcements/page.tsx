"use client";

import { useEffect, useState } from "react";
import { Megaphone, Pencil, Plus, RefreshCw, Trash2, Clock, Send } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Button, Empty, Input, PageHeader, Panel, Select } from "../components/ui";

export default function AnnouncementsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    
    const f = new FormData(e.currentTarget);
    const status = String(f.get("status"));
    
    // Auto-set published_at timestamp if we are publishing it right now
    const isPublishingNow = status === "published" && editing?.status !== "published";
    
    const payload: any = {
      title: String(f.get("title")),
      body: String(f.get("body")),
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (isPublishingNow) {
      payload.published_at = new Date().toISOString();
    }

    try {
      if (editing?.id) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        // Grab the admin's user ID for the created_by field
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          payload.created_by = userData.user.id;
        }
        
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
      }

      setEditing(null);
      await load();
    } catch (err: any) {
      alert(`Error saving announcement: ${err.message}`);
    }
    
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Permanently delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    await load();
  };

  // Helper for status colors
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "published":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
      case "archived":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
      default: // draft
        return "border-white/10 bg-white/5 text-white/50";
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Communications"
        title="Announcements"
        description="Broadcast important updates to all union members. Published items appear instantly on the live homepage."
        actions={
          <>
            <Button onClick={() => setEditing({ status: "draft" })}>
              <Plus size={15} className="mr-1.5 inline-block" /> New Announcement
            </Button>
            <Button variant="ghost" onClick={load}>
              <RefreshCw size={15} className="mr-1.5 inline-block" /> Refresh
            </Button>
          </>
        }
      />

      <Panel>
        {loading ? (
          <div className="py-12 text-center text-sm font-bold text-white/30 animate-pulse">
            Loading announcements...
          </div>
        ) : rows.length > 0 ? (
          <div className="grid gap-4">
            {rows.map((r) => (
              <div 
                key={r.id} 
                className="group flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-5 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getStatusStyle(r.status)}`}>
                    {r.status === "published" ? <Megaphone size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-black text-white">{r.title}</h3>
                      <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${getStatusStyle(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white/50 line-clamp-2 max-w-3xl leading-relaxed">
                      {r.body}
                    </p>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                      {r.published_at ? `Published: ${new Date(r.published_at).toLocaleString("en-IN")}` : `Created: ${new Date(r.created_at).toLocaleString("en-IN")}`}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(r)}
                    className="rounded-xl border border-white/10 p-2.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-xl border border-red-400/10 p-2.5 text-red-300/70 transition-colors hover:bg-red-400/20 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No announcements found. Create your first broadcast.</Empty>
        )}
      </Panel>

      {/* Add / Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a1725] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Send size={18} />
              </div>
              <h2 className="text-xl font-black text-white">
                {editing.id ? "Edit Announcement" : "New Announcement"}
              </h2>
            </div>
            
            <div className="grid gap-5">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Title / Headline</span>
                <Input 
                  name="title" 
                  required 
                  defaultValue={editing.title || ""} 
                  placeholder="e.g. Server Maintenance, Event Registration Open..." 
                />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Message Body</span>
                <textarea 
                  name="body" 
                  required 
                  rows={4}
                  defaultValue={editing.body || ""} 
                  placeholder="The full announcement text..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#07111d]/80 p-4 text-sm font-medium text-white outline-none focus:border-amber-300/40"
                />
              </label>
              
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Visibility Status</span>
                <Select name="status" defaultValue={editing.status || "draft"}>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Live on Homepage)</option>
                  <option value="archived">Archived (Hidden)</option>
                </Select>
                <p className="mt-2 text-[10px] font-medium text-white/30">
                  Setting this to "Published" will immediately display it to all visitors.
                </p>
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-5">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save Announcement"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}