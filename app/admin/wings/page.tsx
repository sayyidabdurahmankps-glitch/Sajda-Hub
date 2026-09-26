"use client";

import { useEffect, useState } from "react";
import { Layers3, Plus, RefreshCw, Save } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Button, Input, PageHeader, Panel } from "../components/ui";

export default function WingsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>({
    key: "",
    name: "",
    sort_order: 5,
    active: true,
  });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("wing_definitions")
      .select("*")
      .order("sort_order");
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    setBusy(true);
    await supabase.from("wing_definitions").insert({
      key: draft.key.trim().toLowerCase().replace(/\s+/g, "-"),
      name: draft.name,
      sort_order: Number(draft.sort_order),
      active: draft.active,
      // Defaulting to a massive number behind the scenes so it never blocks scoring
      max_score: 999999, 
    });
    setDraft({ key: "", name: "", sort_order: 5, active: true });
    await load();
    setBusy(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Scoring model"
        title="Wings & Score Rules"
        description="Manage the operational scoring dimensions for your unions."
        actions={
          <Button variant="ghost" onClick={load}>
            <RefreshCw size={15} className="mr-1.5 inline-block" /> Refresh
          </Button>
        }
      />
      
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Existing Wings */}
        <Panel>
          <div className="mb-5 flex items-center gap-2">
            <Layers3 size={18} className="text-amber-300" />
            <h3 className="font-black">Configured wings</h3>
          </div>
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="grid gap-3 rounded-2xl border border-white/5 bg-black/10 p-4 sm:grid-cols-[1fr_90px_80px_auto] items-center"
              >
                <div>
                  <div className="font-black">{r.name}</div>
                  <div className="mt-1 text-[10px] font-mono text-white/30">
                    {r.key}
                  </div>
                </div>
                
                <div title="Sort Order">
                  <Input
                    type="number"
                    value={r.sort_order}
                    onChange={(e) =>
                      setRows((x) =>
                        x.map((y) =>
                          y.id === r.id ? { ...y, sort_order: e.target.value } : y
                        )
                      )
                    }
                  />
                </div>
                
                <button
                  onClick={async () => {
                    await supabase
                      .from("wing_definitions")
                      .update({ active: !r.active })
                      .eq("id", r.id);
                    await load();
                  }}
                  className={`rounded-xl border py-2 px-3 text-xs font-black transition-colors ${
                    r.active
                      ? "border-emerald-400/10 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                      : "border-white/10 bg-white/5 text-white/35 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {r.active ? "Active" : "Off"}
                </button>
                
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await supabase
                      .from("wing_definitions")
                      .update({ sort_order: Number(r.sort_order) })
                      .eq("id", r.id);
                    await load();
                  }}
                >
                  <Save size={15} />
                </Button>
              </div>
            ))}
          </div>
        </Panel>

        {/* Right Side: Add Wing Form */}
        <Panel>
          <div className="mb-5 flex items-center gap-2">
            <Plus size={18} className="text-cyan-300" />
            <h3 className="font-black">Add a wing</h3>
          </div>
          <div className="space-y-4">
            <label>
              <span className="mb-2 block text-xs font-bold text-white/45">Key</span>
              <Input
                value={draft.key}
                onChange={(e) => setDraft({ ...draft, key: e.target.value })}
                placeholder="e.g. media"
              />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold text-white/45">
                Display name
              </span>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Media Wing"
              />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold text-white/45">
                Sort order
              </span>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft({ ...draft, sort_order: e.target.value })
                }
              />
            </label>
            <Button onClick={add} disabled={busy || !draft.key || !draft.name}>
              {busy ? "Adding..." : <><Plus size={15} className="mr-1.5 inline-block"/> Add wing</>}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}