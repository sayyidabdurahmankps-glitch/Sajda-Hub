"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { ShieldAlert, Lock, Mail, ArrowRight, Loader2, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Note: In a production app, you would verify if this user actually has admin privileges
      // here (e.g., checking a 'user_roles' table) before pushing them to the dashboard.
      
      // Redirect to the secure admin dashboard
      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1726] flex items-center justify-center px-5 py-24 sm:px-8 text-ink-950">
      
      {/* Dark mode background subtle grid pattern for Admin area */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div 
        className={`relative w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Card Container */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white p-8 shadow-2xl shadow-black/50 sm:p-10 relative overflow-hidden">
          
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-red-500" />

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border-2 border-amber-100 shadow-sm">
              <ShieldAlert size={26} strokeWidth={2.5} />
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Restricted Area
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-ocean-950">
              System Admin
            </h1>
            <p className="mt-2 text-sm font-medium text-ink-600">
              Central Committee elevated access portal.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="mt-8 flex flex-col gap-5" onSubmit={handleAdminLogin}>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input 
                  type="email" 
                  required
                  placeholder="admin@jamianooriyya.in" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-line bg-[#F8FAFC] py-3.5 pl-12 pr-4 text-sm font-bold text-ocean-950 outline-none transition-colors focus:border-amber-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
                Master Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-line bg-[#F8FAFC] py-3.5 pl-12 pr-4 text-sm font-bold text-ocean-950 outline-none transition-colors focus:border-amber-400 focus:bg-white"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1726] py-4 text-sm font-extrabold text-white shadow-md transition-all hover:bg-black disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Authorize Access
                  <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 border-t border-line pt-6 text-center">
            <p className="text-xs font-bold text-ink-500">
              Not an administrator?{" "}
              <Link href="/login" className="text-ocean-700 hover:underline">
                Return to Union Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}