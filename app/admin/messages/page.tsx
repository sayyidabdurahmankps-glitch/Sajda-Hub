"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import {
  Button,
  Empty,
  Input,
  PageHeader,
  Panel,
  Select,
  formatDate,
} from "../components/ui";

export default function MessagesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      total: rows.length,
      unread: rows.filter((r) => r.status === "unread").length,
      read: rows.filter((r) => r.status === "read").length,
      archived: rows.filter((r) => r.status === "archived").length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchesStatus =
        status === "all" || r.status === status;

      const matchesSearch =
        !search ||
        `${r.name ?? ""} ${r.email ?? ""} ${r.college ?? ""} ${
          r.subject ?? ""
        } ${r.message ?? ""}`
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [rows, q, status]);

  const update = async (id: string, next: string) => {
    await supabase
      .from("contact_messages")
      .update({ status: next })
      .eq("id", id);

    await load();

    if (selected?.id === id) {
      setSelected((current: any) => ({
        ...current,
        status: next,
      }));
    }
  };

  const openMessage = async (message: any) => {
    setSelected(message);

    if (message.status === "unread") {
      await update(message.id, "read");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <PageHeader
        eyebrow="Communications"
        title="Message inbox"
        description="Read, triage and archive inbound contact messages."
        actions={
          <Button
            variant="ghost"
            onClick={load}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        }
      />

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Inbox size={17} />}
          label="All messages"
          value={stats.total}
          active={status === "all"}
          onClick={() => setStatus("all")}
        />

        <StatCard
          icon={<Mail size={17} />}
          label="Unread"
          value={stats.unread}
          active={status === "unread"}
          highlight={stats.unread > 0}
          onClick={() => setStatus("unread")}
        />

        <StatCard
          icon={<MailOpen size={17} />}
          label="Read"
          value={stats.read}
          active={status === "read"}
          onClick={() => setStatus("read")}
        />

        <StatCard
          icon={<Archive size={17} />}
          label="Archived"
          value={stats.archived}
          active={status === "archived"}
          onClick={() => setStatus("archived")}
        />
      </div>

      {/* INBOX */}
      <Panel className="overflow-hidden p-0">
        {/* SEARCH / FILTER */}
        <div className="border-b border-white/[0.06] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />

              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-11 pl-10"
                placeholder="Search by name, email, college or message..."
              />

              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/30 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 lg:w-[190px]"
            >
              <option value="all">All statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/30">
              {filtered.length}{" "}
              {filtered.length === 1 ? "message" : "messages"}
            </div>

            {(q || status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                }}
                className="text-[11px] font-bold text-white/40 transition hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* MESSAGE LIST */}
        {filtered.length ? (
          <div className="divide-y divide-white/[0.05]">
            {filtered.map((m) => {
              const unread = m.status === "unread";

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => openMessage(m)}
                  className={[
                    "group relative block w-full px-4 py-4 text-left transition sm:px-5",
                    unread
                      ? "bg-white/[0.025] hover:bg-white/[0.055]"
                      : "hover:bg-white/[0.025]",
                  ].join(" ")}
                >
                  {unread && (
                    <span className="absolute left-0 top-0 h-full w-[3px] bg-emerald-500" />
                  )}

                  <div className="flex gap-3 sm:gap-4">
                    {/* AVATAR */}
                    <div
                      className={[
                        "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-xs font-black",
                        unread
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/[0.07] bg-white/[0.035] text-white/45",
                      ].join(" ")}
                    >
                      {getInitials(m.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={[
                              "truncate text-sm",
                              unread
                                ? "font-black text-white"
                                : "font-bold text-white/75",
                            ].join(" ")}
                          >
                            {m.name || "Unknown sender"}
                          </span>

                          {unread && (
                            <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                              New
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 text-[10px] font-medium text-white/25">
                          {formatDate(m.created_at)}
                        </span>
                      </div>

                      <div className="mt-1 truncate text-[11px] text-white/30">
                        {m.email || "No email"}
                        {m.college && ` · ${m.college}`}
                      </div>

                      <div className="mt-3">
                        <span
                          className={[
                            "truncate text-xs",
                            unread
                              ? "font-extrabold text-white/85"
                              : "font-bold text-white/55",
                          ].join(" ")}
                        >
                          {m.subject || "No subject"}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs leading-5 text-white/35">
                        {m.message}
                      </p>
                    </div>

                    <div className="hidden items-center sm:flex">
                      <span className="grid h-8 w-8 place-items-center rounded-lg text-white/20 transition group-hover:bg-white/5 group-hover:text-white/60">
                        <Mail size={15} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <Empty />
          </div>
        )}
      </Panel>

      {/* MESSAGE READER */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#081421] shadow-2xl shadow-black/50">
            {/* MODAL HEADER */}
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-5">
                <div className="flex min-w-0 gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10 text-sm font-black text-emerald-300">
                    {getInitials(selected.name)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-white sm:text-xl">
                      {selected.subject || "Message"}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/35">
                      <span>{selected.name}</span>
                      <span className="text-white/15">•</span>
                      <span>
                        {selected.email || "No email"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/35 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.status} />

                {selected.college && (
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-white/35">
                    {selected.college}
                  </span>
                )}

                <span className="ml-auto flex items-center gap-1.5 text-[10px] text-white/25">
                  <Clock3 size={12} />
                  {formatDate(selected.created_at)}
                </span>
              </div>
            </div>

            {/* MESSAGE */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
              <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-5 sm:p-6">
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/20">
                  Message
                </div>

                <div className="whitespace-pre-wrap text-sm leading-7 text-white/65">
                  {selected.message}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="border-t border-white/[0.07] bg-black/10 px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setSelected(null)}
                  className="gap-2"
                >
                  <X size={15} />
                  Close
                </Button>

                <div className="flex flex-wrap justify-end gap-2">
                  {selected.status !== "read" && (
                    <Button
                      variant="ghost"
                      onClick={() => update(selected.id, "read")}
                      className="gap-2"
                    >
                      <Check size={15} />
                      Mark read
                    </Button>
                  )}

                  {selected.status !== "archived" && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        update(selected.id, "archived")
                      }
                      className="gap-2"
                    >
                      <Archive size={15} />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  active,
  highlight,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  active?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group rounded-2xl border p-4 text-left transition",
        active
          ? "border-emerald-400/20 bg-emerald-400/[0.07]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.035]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={[
            "grid h-9 w-9 place-items-center rounded-xl border",
            active
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-white/[0.06] bg-white/[0.03] text-white/35",
          ].join(" ")}
        >
          {icon}
        </div>

        {highlight && value > 0 && (
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.65)]" />
        )}
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">
          {label}
        </div>

        <div className="mt-1 text-2xl font-black tracking-tight text-white">
          {value}
        </div>
      </div>
    </button>
  );
}

/* -------------------------------------------------------
   STATUS BADGE
------------------------------------------------------- */

function StatusBadge({ status }: { status?: string }) {
  if (status === "unread") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">
        <Mail size={11} />
        Unread
      </span>
    );
  }

  if (status === "archived") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[10px] font-black text-white/35">
        <Archive size={11} />
        Archived
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/15 bg-blue-400/10 px-2.5 py-1 text-[10px] font-black text-blue-300">
      <CheckCircle2 size={11} />
      Read
    </span>
  );
}

/* -------------------------------------------------------
   INITIALS
------------------------------------------------------- */

function getInitials(name?: string) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}