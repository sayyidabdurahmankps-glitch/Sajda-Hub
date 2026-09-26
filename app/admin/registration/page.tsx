"use client";

import { useEffect, useState } from "react";
import { Save, Settings2, ToggleRight, ToggleLeft } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Button, Input, PageHeader, Panel, Select } from "../components/ui";

interface RegistrationSetting {
  key: string;
  is_open: boolean;
  registration_type: 'open' | 'closed' | 'invite_only' | 'restricted';
  allow_direct_user_creation: boolean;
  require_email_verification: boolean;
  require_college_selection: boolean;
  auto_assign_wing_head: boolean;
  description: string;
}

export default function RegistrationSettingsPage() {
  const [settings, setSettings] = useState<RegistrationSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("registration_settings")
      .select("*")
      .eq("key", "registration_open")
      .single();

    if (!error && data) {
      setSettings(data);
    }
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("registration_settings")
        .update({
          is_open: settings.is_open,
          registration_type: settings.registration_type,
          allow_direct_user_creation: settings.allow_direct_user_creation,
          require_email_verification: settings.require_email_verification,
          require_college_selection: settings.require_college_selection,
          auto_assign_wing_head: settings.auto_assign_wing_head,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "registration_open");

      if (error) throw error;
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error saving settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <div className="text-white/50">Loading...</div>;
  }

  const toggleSetting = (key: keyof RegistrationSetting, value: boolean) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registration"
        title="Registration Settings"
        description="Control how users can join and register on the platform."
        actions={
          <Button onClick={save} disabled={saving}>
            <Save size={15} />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      {message && (
        <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-200">
          {message}
        </div>
      )}

      <Panel className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-black text-white">
                <Settings2 size={18} className="text-amber-300" />
                Registration Status
              </h3>
              <p className="mt-1 text-xs text-white/40">
                Enable or disable new user registrations
              </p>
            </div>
            <button
              onClick={() => toggleSetting('is_open', !settings.is_open)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              {settings.is_open ? (
                <ToggleRight size={32} className="text-green-400" />
              ) : (
                <ToggleLeft size={32} className="text-red-400" />
              )}
            </button>
          </div>
          <div className="text-sm">
            <span className={`font-semibold ${settings.is_open ? 'text-green-400' : 'text-red-400'}`}>
              {settings.is_open ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/10 p-6">
          <h3 className="flex items-center gap-2 font-black text-white mb-4">
            <Settings2 size={18} className="text-amber-300" />
            Registration Type
          </h3>
          <Select
            value={settings.registration_type}
            onChange={(e) =>
              setSettings(prev => prev ? { ...prev, registration_type: e.target.value as any } : null)
            }
          >
            <option value="open">Open (Anyone can register)</option>
            <option value="closed">Closed (No registrations)</option>
            <option value="invite_only">Invite Only (Via invite codes)</option>
            <option value="restricted">Restricted (College selection required)</option>
          </Select>
          <p className="mt-2 text-xs text-white/40">
            Choose how users can access your platform
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white">Direct User Creation</h3>
              <p className="mt-1 text-xs text-white/40">
                Admins can create users without requiring email verification
              </p>
            </div>
            <button
              onClick={() => toggleSetting('allow_direct_user_creation', !settings.allow_direct_user_creation)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              {settings.allow_direct_user_creation ? (
                <ToggleRight size={32} className="text-green-400" />
              ) : (
                <ToggleLeft size={32} className="text-red-400" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white">Require Email Verification</h3>
              <p className="mt-1 text-xs text-white/40">
                New users must verify their email address
              </p>
            </div>
            <button
              onClick={() => toggleSetting('require_email_verification', !settings.require_email_verification)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              {settings.require_email_verification ? (
                <ToggleRight size={32} className="text-green-400" />
              ) : (
                <ToggleLeft size={32} className="text-red-400" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white">Require College Selection</h3>
              <p className="mt-1 text-xs text-white/40">
                Users must select their college during registration
              </p>
            </div>
            <button
              onClick={() => toggleSetting('require_college_selection', !settings.require_college_selection)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              {settings.require_college_selection ? (
                <ToggleRight size={32} className="text-green-400" />
              ) : (
                <ToggleLeft size={32} className="text-red-400" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white">Auto-Assign Wing Head</h3>
              <p className="mt-1 text-xs text-white/40">
                Automatically assign wing head role to certain users
              </p>
            </div>
            <button
              onClick={() => toggleSetting('auto_assign_wing_head', !settings.auto_assign_wing_head)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              {settings.auto_assign_wing_head ? (
                <ToggleRight size={32} className="text-green-400" />
              ) : (
                <ToggleLeft size={32} className="text-red-400" />
              )}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}