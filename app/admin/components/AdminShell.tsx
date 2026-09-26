"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  Database,
  FileBarChart2,
  Gauge,
  LogOut,
  Menu,
  MessageSquare,
  Network,
  Search,
  Settings2,
  ShieldCheck,
  Trophy,
  UserCog,
  Users,
  X,
  Zap,
  Layers3,
  Album,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

// UPDATED: Removed 'unions', added 'scores', tweaked labels for clarity
const NAV = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/audit", label: "Programs", icon: ClipboardList },
  { href: "/admin/colleges", label: "Institutions", icon: Building2 },
  { href: "/admin/wings", label: "Wing Config", icon: Layers3 },
  { href: "/admin/scores", label: "Award Scores", icon: Trophy },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/gallery", label: "Gallery", icon: Album },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/admin/settings", label: "System Settings", icon: Settings2 },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setAdminEmail(data.user.email ?? "Admin");
      setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  const pageTitle = useMemo(() => {
    const hit = NAV.find((item) => isActive(pathname, item.href));
    return hit?.label ?? "Admin Console";
  }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;
  
  if (checking) {
    return (
      <div className="min-h-screen bg-[#07111d] text-white grid place-items-center">
        <Activity className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111d] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[32rem] w-[32rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[290px] border-r border-white/10 bg-[#091522]/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <Link
              href="/admin"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="text-sm font-black tracking-tight">
                  SAJDA COMMAND
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Central Administration
                </div>
              </div>
            </Link>
            <button
              className="rounded-xl p-2 text-white/50 hover:bg-white/5 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
              Workspace
            </div>
            <nav className="space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${active ? "bg-amber-400 text-[#07111d] shadow-[0_12px_32px_rgba(245,158,11,.17)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={16} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="truncate text-xs font-black">{adminEmail}</div>
              <div className="mt-1 text-[10px] text-white/35">
                Administrator session
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/10 bg-red-400/5 px-4 py-3 text-xs font-black text-red-300 hover:bg-red-400/10"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="relative min-h-screen lg:pl-[290px]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111d]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 lg:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/75">
                  SAJDA / ADMIN
                </div>
                <h1 className="mt-0.5 text-lg font-black tracking-tight sm:text-xl">
                  {pageTitle}
                </h1>
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/55">
                <Search size={15} /> Command console
              </div>
              <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Live
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}