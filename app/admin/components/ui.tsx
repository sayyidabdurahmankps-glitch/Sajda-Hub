"use client";

import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
    <div>
      {eyebrow && <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300/70">{eyebrow}</div>}
      <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,.12)] ${className}`}>{children}</section>;
}

export function Button({ children, onClick, variant = "primary", type = "button", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; type?: "button" | "submit"; disabled?: boolean }) {
  const styles = variant === "primary" ? "bg-amber-400 text-[#07111d] hover:bg-amber-300" : variant === "danger" ? "border border-red-400/10 bg-red-400/10 text-red-300 hover:bg-red-400/15" : "border border-white/10 bg-white/5 text-white hover:bg-white/10";
  return <button type={type} disabled={disabled} onClick={onClick} className={`rounded-xl px-4 py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}>{children}</button>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-white/10 bg-[#07111d]/80 px-3.5 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-amber-300/40 ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-xl border border-white/10 bg-[#07111d]/90 px-3.5 py-3 text-sm font-semibold text-white outline-none focus:border-amber-300/40 ${props.className ?? ""}`} />;
}

export function Empty({ children = "No data found." }: { children?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm font-semibold text-white/35">{children}</div>;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
