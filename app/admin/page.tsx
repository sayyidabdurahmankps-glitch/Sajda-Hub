"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Building2, CheckCircle2, MessageSquare, Network, Plus, Trophy, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button, Empty, PageHeader, Panel, formatDate } from "./components/ui";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: m }, { data: inbox }, { data: news }, { data: logs }] = await Promise.all([
        supabase.from("union_metrics").select("*").order("total_score", { ascending: false }).limit(50),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("announcements").select("id,title,status,published_at,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("audit_logs").select("id,action,table_name,created_at,actor_email,metadata").order("created_at", { ascending: false }).limit(8),
      ]);
      setMetrics(m ?? []); setMessages(inbox ?? []); setAnnouncements(news ?? []); setActivity(logs ?? []); setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => ({
    unions: metrics.length,
    colleges: new Set(metrics.map((x) => x.college_id)).size,
    points: metrics.reduce((a, x) => a + Number(x.total_score || 0), 0),
    unread: messages.filter((x) => x.status === "unread").length,
  }), [metrics, messages]);

  if (loading) return <div className="grid min-h-[70vh] place-items-center"><Activity className="animate-spin text-amber-300"/></div>;

  return <div>
    <PageHeader eyebrow="Command overview" title="Central dashboard" description="One operational view for institutions, unions, scores, communications, reports and administrative activity."
      actions={<><Link href="/admin/colleges"><Button><Plus size={15}/> Add college</Button></Link><Link href="/admin/unions"><Button variant="ghost"><Network size={15}/> Manage unions</Button></Link></>} />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Colleges", stats.colleges, Building2],
        ["Active unions", stats.unions, Network],
        ["Aggregate points", stats.points, Trophy],
        ["Unread messages", stats.unread, MessageSquare],
      ].map(([label, value, Icon]: any) => <Panel key={label} className="relative overflow-hidden"><Icon className="absolute right-5 top-5 text-white/10" size={52}/><div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</div><div className="mt-3 text-3xl font-black">{value}</div><div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-300"><CheckCircle2 size={13}/> Synced</div></Panel>)}
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
      <Panel>
        <div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-black">Current leaderboard</h3><p className="text-xs text-white/35">Live from union_metrics.</p></div><Link className="text-xs font-black text-amber-300" href="/admin/leaderboard">Open full board <ArrowUpRight className="inline" size={14}/></Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/30"><tr><th className="px-3 py-3">#</th><th>Union</th><th>College</th><th>Academic year</th><th className="text-right">Score</th></tr></thead><tbody className="divide-y divide-white/5">{metrics.slice(0,8).map((x, i) => <tr key={x.union_id} className="hover:bg-white/[0.025]"><td className="px-3 py-4 font-black text-white/35">{i + 1}</td><td className="font-bold">{x.union_name}</td><td className="text-white/50">{x.college_name}</td><td className="text-white/40">{x.academic_year}</td><td className="text-right font-black text-amber-300">{x.total_score}</td></tr>)}</tbody></table></div>
      </Panel>

      <div className="grid gap-6">
        <Panel><div className="mb-4 flex items-center justify-between"><div><h3 className="font-black">Inbox</h3><p className="text-xs text-white/35">Latest communications</p></div><Link href="/admin/messages" className="text-xs font-black text-amber-300">View all</Link></div>{messages.length ? <div className="space-y-3">{messages.slice(0,4).map((m) => <div key={m.id} className="rounded-2xl border border-white/5 bg-black/15 p-3"><div className="flex justify-between gap-3"><span className="text-sm font-black">{m.name}</span><span className="text-[10px] text-white/30">{formatDate(m.created_at)}</span></div><div className="mt-1 text-[10px] font-black uppercase tracking-wider text-amber-300/70">{m.status}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45">{m.message}</p></div>)}</div> : <Empty/>}</Panel>
        <Panel><div className="mb-4 flex items-center gap-2"><Activity size={17} className="text-cyan-300"/><h3 className="font-black">Recent admin activity</h3></div>{activity.length ? <div className="space-y-3">{activity.slice(0,5).map((a) => <div key={a.id} className="flex gap-3"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-300"/><div><div className="text-xs font-bold">{a.action} <span className="text-white/35">on {a.table_name}</span></div><div className="mt-1 text-[10px] text-white/30">{a.actor_email || "System"} · {formatDate(a.created_at)}</div></div></div>)}</div> : <Empty/>}</Panel>
      </div>
    </div>
  </div>;
}
