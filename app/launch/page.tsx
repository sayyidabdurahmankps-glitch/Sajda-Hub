"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BOOT_SEQUENCE = [
  "Awaiting initialization command",
  "Authenticating secure environment...",
  "Syncing relational database...",
  "Establishing live metric streams...",
  "System ready. Welcome to SAJDA Hub."
];

export default function LaunchPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.key === " ") && step === 0) {
        e.preventDefault();
        startLaunchSequence();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  const startLaunchSequence = () => {
    if (step > 0) return;
    
    // Step 1: Secure Connection
    setStep(1);
    
    // Step 2: Database Sync
    setTimeout(() => setStep(2), 1000);
    
    // Step 3: Live Metrics
    setTimeout(() => setStep(3), 2000);
    
    // Step 4: Completion text
    setTimeout(() => setStep(4), 3000);
    
    // Final Step: Fade out the entire screen and route
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => router.push("/"), 800);
    }, 3800);
  };

  return (
    <div 
      onClick={startLaunchSequence}
      className={`relative flex min-h-screen w-full cursor-pointer flex-col items-center justify-between overflow-hidden bg-[#020b07] selection:bg-ocean-500/30 transition-all duration-[800ms] ease-in-out ${
        isExiting ? "scale-[1.02] opacity-0 blur-md" : "scale-100 opacity-100 blur-0"
      }`}
    >
      {/* 
        ========================================
        AMBIENT BACKGROUND & TEXTURE
        ========================================
      */}
      <div className={`absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean-600/10 blur-[120px] transition-all duration-[3000ms] ${step > 0 ? "scale-125 opacity-100 bg-ocean-500/20" : "scale-100 opacity-50"}`} />
      <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />

      {/* 
        ========================================
        TOP: BRANDING
        ========================================
      */}
      <div className={`mt-16 flex animate-in fade-in slide-in-from-top-8 duration-1000 flex-col items-center gap-6 transition-all duration-1000 ${step > 0 ? "opacity-30 blur-[2px]" : "opacity-100"}`}>
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          <Image 
            src="/sajda-logo.png" 
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
      <div className={`flex flex-col items-center justify-center text-center transition-all duration-1000 ${step > 0 ? "scale-95 opacity-30 blur-[2px]" : "scale-100 opacity-100"}`}>
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
        BOTTOM: SEQUENCED INITIALIZATION UI
        ========================================
      */}
      <div className="mb-20 flex h-24 flex-col items-center justify-end animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
        
        {/* Initial Prompt (Fades out when space is pressed) */}
        <div className={`group absolute transition-all duration-700 ${step > 0 ? "translate-y-4 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
          <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-md hover:bg-white/10 transition-colors">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Press</span>
            <div className="flex h-8 items-center justify-center rounded bg-white px-4 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="text-xs font-black uppercase tracking-widest text-[#020b07]">Space</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">To Initialize</span>
          </div>
        </div>

        {/* Syncing Progress UI (Fades in when space is pressed) */}
        <div className={`flex w-64 flex-col items-center gap-5 transition-all duration-700 ${step > 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
          
          {/* Progress Bar Line */}
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full bg-ocean-400 transition-all ease-linear"
              style={{
                width: step === 0 ? "0%" : step === 1 ? "25%" : step === 2 ? "65%" : step === 3 ? "90%" : "100%",
                transitionDuration: step === 4 ? "400ms" : "1000ms"
              }}
            />
          </div>
          
          {/* Dynamic Console Text */}
          <div className="flex items-center gap-3">
            {step > 0 && step < 4 && (
              <div className="h-1.5 w-1.5 animate-ping rounded-full bg-ocean-400" />
            )}
            {step === 4 && (
              <div className="h-1.5 w-1.5 rounded-full bg-ocean-400 shadow-[0_0_10px_rgba(74,222,128,1)]" />
            )}
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
              {BOOT_SEQUENCE[step]}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}