"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LaunchPage() {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!isLaunching) {
          setIsLaunching(true);
          // A slightly longer, cinematic 1.2s delay for the fade-out
          setTimeout(() => router.push("/leaderboard"), 1200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLaunching, router]);

  return (
    <div 
      onClick={() => {
        if (!isLaunching) {
          setIsLaunching(true);
          setTimeout(() => router.push("/leaderboard"), 1200);
        }
      }}
      className={`relative flex min-h-screen w-full cursor-pointer flex-col items-center justify-between overflow-hidden bg-[#020b07] selection:bg-ocean-500/30 transition-all duration-[1200ms] ease-in-out ${
        isLaunching ? "scale-[1.02] opacity-0 blur-sm" : "scale-100 opacity-100 blur-0"
      }`}
    >
      {/* 
        ========================================
        SUBTLE, PROFESSIONAL AMBIENCE
        ========================================
      */}
      {/* Deep, sophisticated radial glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean-600/10 blur-[120px] transition-opacity duration-1000" />
      
      {/* High-end grain texture for depth */}
      <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />

      {/* 
        ========================================
        TOP: BRANDING
        ========================================
      */}
      <div className="mt-16 flex animate-in fade-in slide-in-from-top-8 duration-1000 flex-col items-center gap-6">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          <Image 
            src="/icon.png" 
            alt="SAJDA Logo" 
            fill
            className="object-contain p-3 opacity-90" 
          />
        </div>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* 
        ========================================
        CENTER: PREMIUM TYPOGRAPHY
        ========================================
      */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="animate-in fade-in slide-in-from-bottom-4 duration-1000 mb-6 text-[11px] font-medium uppercase tracking-[0.4em] text-white/40">
          Central Committee · 2026—2027
        </p>
        
        <h1 className="animate-in fade-in zoom-in-95 duration-1000 delay-150 flex flex-col items-center text-[12vw] font-black leading-[0.8] tracking-tighter text-white md:text-[9vw]">
          SAJDA
          <span className="mt-2 bg-gradient-to-b from-ocean-200 to-ocean-500 bg-clip-text text-transparent drop-shadow-2xl">
            HUB
          </span>
        </h1>

        <p className="animate-in fade-in duration-1000 delay-500 mt-10 max-w-md text-sm font-medium leading-relaxed tracking-wide text-white/50">
          The official digital ecosystem for Jamia Nooriyya Junior Colleges.
        </p>
      </div>

      {/* 
        ========================================
        BOTTOM: SLEEK ACTION PROMPT
        ========================================
      */}
      <div className="mb-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
        <div className="group relative flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-md transition-all hover:bg-white/10">
          <div className={`absolute inset-0 rounded-full bg-ocean-500/20 blur-md transition-opacity duration-500 ${isLaunching ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
          
          <span className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Press
          </span>
          <div className="relative flex h-8 items-center justify-center rounded bg-white px-4 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <span className="text-xs font-black uppercase tracking-widest text-[#020b07]">Space</span>
          </div>
          <span className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            To Initialize
          </span>
        </div>
      </div>

    </div>
  );
}