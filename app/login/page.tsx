"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, Lock, ShieldCheck, Loader2, ArrowRight, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        // Redirect to the admin dashboard/studio upon successful login
        router.push("/admin");
        router.refresh(); // Force a refresh to update server components with the new session
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center px-5 py-12 sm:px-8">
      
      {/* 
        ========================================
        LOGIN CARD
        ========================================
      */}
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Decorative background glow */}
        <div className="absolute -inset-1 -z-10 rounded-[2.5rem] bg-gradient-to-b from-ocean-500/20 to-transparent blur-xl" />

        <div className="overflow-hidden rounded-[2rem] border border-line bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] sm:p-10">
          
          {/* Header */}
          <div className="mb-10 flex flex-col items-center text-center">
            
            <h1 className="mb-2 text-2xl font-black tracking-tight text-ink-950">
              Executive Portal
            </h1>
            <p className="text-sm font-medium text-ink-500">
              Secure access for SAJDA Central Committee and Union Administrators.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-50 p-4 text-red-600 animate-in slide-in-from-top-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-5 w-5 text-ink-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jamianooriya.in"
                  className="w-full rounded-xl border border-line bg-[#F8FAFC] py-3.5 pl-12 pr-4 text-sm font-bold text-ink-900 outline-none transition-all focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-500/10 placeholder:text-ink-300 placeholder:font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-ink-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-line bg-[#F8FAFC] py-3.5 pl-12 pr-4 text-sm font-bold text-ink-900 outline-none transition-all focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-500/10 placeholder:text-ink-300 placeholder:font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-ocean-600 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-ocean-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-ocean-200" />
                  Secure Login
                  <ArrowRight className="absolute right-6 h-4 w-4 opacity-0 transition-all group-hover:right-4 group-hover:opacity-100" />
                </>
              )}
            </button>

          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-line pt-6">
            <Link 
              href="/"
              className="text-xs font-bold text-ink-400 transition-colors hover:text-ocean-600"
            >
              &larr; Return to Public Site
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}