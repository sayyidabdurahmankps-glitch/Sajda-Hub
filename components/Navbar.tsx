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

      if (authError) throw authError;

      if (data.session) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020b07] px-5 py-12 sm:px-8">
      
      {/* Ambient Background Glows */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean-600/10 blur-[100px]" />
      <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        
        {/* Glassmorphic Container */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          
          {/* Header */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-inner">
              {/* Note: Ensure /icon.png exists in your public folder to fix the broken image */}
              <Image 
                src="sajda-logo.png" 
                alt="SAJDA Logo" 
                width={48} 
                height={48} 
                className="object-contain opacity-90 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-white">
              Executive Portal
            </h1>
            <p className="text-xs font-medium leading-relaxed text-white/50">
              Secure access for SAJDA Central Committee and Union Administrators.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 animate-in slide-in-from-top-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-[11px] font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Email Address
              </label>
              <div className="relative flex items-center group">
                <Mail className="absolute left-4 h-5 w-5 text-white/30 transition-colors group-focus-within:text-ocean-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sajda.in"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all focus:border-ocean-500/50 focus:bg-white/5 focus:ring-4 focus:ring-ocean-500/10 placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Password
              </label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-4 h-5 w-5 text-white/30 transition-colors group-focus-within:text-ocean-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all focus:border-ocean-500/50 focus:bg-white/5 focus:ring-4 focus:ring-ocean-500/10 placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-ocean-600 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-ocean-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-ocean-200" />
                  Secure Login
                  <ArrowRight className="absolute right-6 h-4 w-4 opacity-0 transition-all group-hover:right-5 group-hover:opacity-100" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 border-t border-white/5 pt-8 text-center">
            <Link 
              href="/"
              className="text-[11px] font-bold tracking-wider text-white/30 transition-colors hover:text-white"
            >
              &larr; RETURN TO PUBLIC SITE
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}