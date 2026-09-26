"use client";

import { useEffect, useState } from "react";
import { Save, Settings2, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Button, Input, PageHeader, Panel } from "../components/ui";

export default function SettingsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");
      setRows(data ?? []);
    };
    loadSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      // Loop through and upsert each setting
      for (const r of rows) {
        // We attempt to parse the value so booleans and arrays are saved properly in the JSONB column.
        // If it fails (e.g., it's just a plain string), we save it as a standard string.
        let parsedValue = r.value;
        if (typeof r.value === "string") {
          try {
            parsedValue = JSON.parse(r.value);
          } catch (e) {
            parsedValue = r.value;
          }
        }

        const { error } = await supabase.from("system_settings").upsert({
          key: r.key,
          value: parsedValue,
          label: r.label,
          description: r.description,
        });

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error: any) {
      console.error(error);
      alert(`Error saving settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (index: number, newValue: string) => {
    setRows((currentRows) =>
      currentRows.map((row, j) =>
        j === index ? { ...row, value: newValue } : row
      )
    );
  };

  // Helper to format initial JSON values to strings for the input field
  const getDisplayValue = (val: any) => {
    if (typeof val === "string") return val;
    return JSON.stringify(val);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="System Settings"
        description="Edit runtime configuration stored in Supabase instead of hard-coding operational values."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={15} className="mr-1.5 inline-block animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={15} className="mr-1.5 inline-block" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save size={15} className="mr-1.5 inline-block" />
                Save Changes
              </>
            )}
          </Button>
        }
      />

      <Panel>
        <div className="space-y-4">
          {rows.map((r, i) => (
            <div
              key={r.key}
              className="grid gap-3 rounded-2xl border border-white/5 bg-black/10 p-5 md:grid-cols-[260px_1fr] items-center transition-colors hover:bg-white/[0.02]"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <Settings2 size={16} className="text-amber-300 shrink-0" />
                  {r.label || r.key}
                </div>
                <div className="mt-1.5 text-[11px] font-medium leading-relaxed text-white/40">
                  {r.description || r.key}
                </div>
              </div>
              
              <Input
                value={getDisplayValue(r.value)}
                onChange={(e) => handleValueChange(i, e.target.value)}
                placeholder="Enter value..."
              />
            </div>
          ))}

          {rows.length === 0 && (
            <div className="py-12 text-center text-sm font-bold text-white/30 animate-pulse">
              Loading settings...
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}