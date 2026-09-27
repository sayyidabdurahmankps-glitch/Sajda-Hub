"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { PageHeader } from "../components/ui";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  FileImage,
  Grip,
  Hash,
  ImagePlus,
  Layers3,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type UploadStatus = "queued" | "compressing" | "uploading" | "success" | "error";

type WatermarkSettings = {
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

type UploadQueueItem = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
  caption: string;
  category: string;
  eventId: string;
  watermark: WatermarkSettings;
};

type EventData = { id: string; name: string; event_code: string };

// ⚡ GLOBALLY SYNCED FESTIVAL CATEGORIES
const CATEGORY_OPTIONS = [
  { value: "Hifz", label: "Hifz" },
  { value: "Sub-Junior", label: "Sub-Junior" },
  { value: "Junior", label: "Junior" },
  { value: "Senior", label: "Senior" },
  { value: "General", label: "General" },
];

const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: true,
  x: 0.86,
  y: 0.86,
  width: 0.25,
  height: 0.25,
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusMeta(status: UploadStatus) {
  switch (status) {
    case "compressing":
      return { label: "Preparing", icon: Loader2, className: "text-amber-300 bg-amber-400/10 border-amber-400/15" };
    case "uploading":
      return { label: "Uploading", icon: Loader2, className: "text-sky-300 bg-sky-400/10 border-sky-400/15" };
    case "success":
      return { label: "Uploaded", icon: CheckCircle2, className: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15" };
    case "error":
      return { label: "Failed", icon: AlertTriangle, className: "text-red-300 bg-red-400/10 border-red-400/15" };
    default:
      return { label: "Ready", icon: FileImage, className: "text-zinc-400 bg-white/[0.035] border-white/10" };
  }
}

export default function GalleryStudioPage() {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [stageOverlayUrl, setStageOverlayUrl] = useState<string | null>(null);
  const [nonStageOverlayUrl, setNonStageOverlayUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState<"all" | "ready" | "failed" | "done">("all");
  const [mobilePanel, setMobilePanel] = useState<"queue" | "editor">("queue");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoadingData(true);
      setDataError(null);

      const [eventResult, settingsResult] = await Promise.all([
        supabase.from("events").select("id, name, event_code").order("name"),
        supabase
          .from("settings")
          .select("key, value")
          .in("key", ["stage_overlay_url", "non_stage_overlay_url"]),
      ]);

      if (cancelled) return;

      if (eventResult.error || settingsResult.error) {
        setDataError(eventResult.error?.message || settingsResult.error?.message || "Could not load studio settings.");
      }

      if (eventResult.data) setEvents(eventResult.data);

      if (settingsResult.data) {
        const stageUrl = settingsResult.data.find((item) => item.key === "stage_overlay_url")?.value;
        const nonStageUrl = settingsResult.data.find((item) => item.key === "non_stage_overlay_url")?.value;
        setStageOverlayUrl(stageUrl || null);
        setNonStageOverlayUrl(nonStageUrl || null);
      }

      setIsLoadingData(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeItem = useMemo(
    () => uploadQueue.find((item) => item.id === activeItemId) || null,
    [uploadQueue, activeItemId]
  );

  const filteredQueue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return uploadQueue.filter((item) => {
      const matchesSearch =
        !q ||
        item.file.name.toLowerCase().includes(q) ||
        item.caption.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesFilter =
        queueFilter === "all" ||
        (queueFilter === "ready" && (item.status === "queued" || item.status === "compressing" || item.status === "uploading")) ||
        (queueFilter === "failed" && item.status === "error") ||
        (queueFilter === "done" && item.status === "success");

      return matchesSearch && matchesFilter;
    });
  }, [uploadQueue, searchQuery, queueFilter]);

  const counts = useMemo(() => {
    const ready = uploadQueue.filter((item) => item.status === "queued").length;
    const failed = uploadQueue.filter((item) => item.status === "error").length;
    const done = uploadQueue.filter((item) => item.status === "success").length;
    const active = uploadQueue.filter((item) => item.status === "compressing" || item.status === "uploading").length;
    return { total: uploadQueue.length, ready, failed, done, active };
  }, [uploadQueue]);

  const updateItem = (id: string, updates: Partial<UploadQueueItem>) => {
    setUploadQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const updateActiveItem = (updates: Partial<UploadQueueItem>) => {
    if (!activeItemId) return;
    updateItem(activeItemId, updates);
  };

  const updateItemStatus = (id: string, status: UploadStatus, progress: number, errorMessage?: string) => {
    updateItem(id, { status, progress, errorMessage });
  };

  const addFilesToQueue = (files: FileList | File[] | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const invalidCount = Array.from(files).length - validFiles.length;

    const newItems = validFiles.map<UploadQueueItem>((file) => ({
      id: createId(),
      file,
      preview: URL.createObjectURL(file),
      status: "queued",
      progress: 0,
      caption: "",
      category: "Hifz", // ⚡ Default to first category in your hierarchy
      eventId: "",
      watermark: { ...DEFAULT_WATERMARK },
    }));

    if (!newItems.length) {
      window.alert("Please choose image files only.");
      return;
    }

    setUploadQueue((prev) => [...prev, ...newItems]);
    setActiveItemId((current) => current || newItems[0].id);
    setMobilePanel("editor");

    if (invalidCount > 0) {
      window.setTimeout(() => window.alert(`${invalidCount} non-image file${invalidCount === 1 ? " was" : "s were"} skipped.`), 0);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setUploadQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      const filtered = prev.filter((item) => item.id !== id);

      if (activeItemId === id) {
        const currentIndex = prev.findIndex((item) => item.id === id);
        const fallback = filtered[Math.min(Math.max(currentIndex, 0), filtered.length - 1)] || null;
        setActiveItemId(fallback?.id || null);
      }

      return filtered;
    });
  };

  const clearCompleted = () => {
    setUploadQueue((prev) => {
      prev.filter((item) => item.status === "success").forEach((item) => URL.revokeObjectURL(item.preview));
      const next = prev.filter((item) => item.status !== "success");
      if (activeItem && activeItem.status === "success") setActiveItemId(next[0]?.id || null);
      return next;
    });
  };

  const clearAll = () => {
    if (!uploadQueue.length) return;
    const confirmed = window.confirm("Clear the entire local upload queue? Uploaded files remain in Supabase.");
    if (!confirmed) return;
    uploadQueue.forEach((item) => URL.revokeObjectURL(item.preview));
    setUploadQueue([]);
    setActiveItemId(null);
  };

  const retryFailed = () => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.status === "error" ? { ...item, status: "queued", progress: 0, errorMessage: undefined } : item
      )
    );
  };

  const selectItem = (id: string) => {
    setActiveItemId(id);
    setMobilePanel("editor");
  };

  const applyCurrentSettingsToPending = () => {
    if (!activeItem) return;

    setUploadQueue((prev) =>
      prev.map((item) => {
        if (item.id === activeItem.id || item.status === "success") return item;
        return {
          ...item,
          category: activeItem.category,
          eventId: activeItem.eventId,
          watermark: { ...activeItem.watermark },
        };
      })
    );
  };

  const resetWatermark = () => {
    updateActiveItem({ watermark: { ...DEFAULT_WATERMARK } });
  };

  const moveActive = (direction: -1 | 1) => {
    if (!activeItem) return;
    const index = uploadQueue.findIndex((item) => item.id === activeItem.id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= uploadQueue.length) return;
    setActiveItemId(uploadQueue[nextIndex].id);
  };

  const processAndUpload = async () => {
    const pendingItems = uploadQueue.filter((item) => item.status === "queued" || item.status === "error");
    if (!pendingItems.length) return;

    setIsProcessing(true);

    for (const item of pendingItems) {
      updateItemStatus(item.id, "compressing", 15);

      try {
        // ⚡ Updated Overlay Logic: "General" gets the non-stage overlay, everything else gets stage overlay
        const isMainStage = ["Hifz", "Sub-Junior", "Junior", "Senior"].includes(item.category);
        const overlayUrl = isMainStage ? stageOverlayUrl : nonStageOverlayUrl;
        
        const compressedBlob = await bakeImageWithWatermark(item, overlayUrl);
        updateItemStatus(item.id, "uploading", 55);

        const safeName = item.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}_${createId().slice(0, 8)}_${safeName}`;
        const filePath = `${item.category}/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from("media-gallery")
          .upload(filePath, compressedBlob, { contentType: "image/jpeg", upsert: false });

        if (storageError) throw storageError;

        const { data: publicData } = supabase.storage.from("media-gallery").getPublicUrl(filePath);
        const publicUrl = publicData.publicUrl;
        const finalCaption = item.caption.trim() || `[${item.category}] Event Media`;

        const { error: dbError } = await supabase.from("gallery").insert([
          {
            image_url: publicUrl,
            caption: finalCaption,
            title: finalCaption,
            category: item.category,
            event_id: item.eventId || null,
            is_featured: false,
          } as any,
        ]);

        if (dbError) {
          await supabase.storage.from("media-gallery").remove([filePath]);
          throw dbError;
        }

        updateItemStatus(item.id, "success", 100);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error || "Upload failed.");
        console.error("Upload failed for:", item.file.name, error);
        updateItemStatus(item.id, "error", 0, message);
      }
    }

    setIsProcessing(false);
  };

  // ⚡ Updated active overlay detector
  const isMainStagePreview = ["Hifz", "Sub-Junior", "Junior", "Senior"].includes(activeItem?.category || "Hifz");
  const activeOverlayUrl = isMainStagePreview ? stageOverlayUrl : nonStageOverlayUrl;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Media"
        title="Gallery Studio"
        description="High-volume asset ingestion, watermarking, event linking, and media publishing."
      />

      <div className="min-h-[780px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] text-white shadow-2xl shadow-black/20 selection:bg-violet-500/30 selection:text-white">
      <div className="flex min-h-[100dvh] flex-col md:flex-row">
        {/* QUEUE */}
        <aside
          className={`w-full shrink-0 border-b border-white/10 bg-[#0a0a0a] md:h-[100dvh] md:w-[390px] md:border-b-0 md:border-r md:sticky md:top-0 ${
            mobilePanel === "queue" ? "flex" : "hidden md:flex"
          } flex-col`}
        >
          <div className="flex items-start justify-between border-b border-white/10 px-4 py-4 md:px-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500 text-black">
                  <Layers3 className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight">MEDIA STUDIO</h1>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">Asset Control Center</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobilePanel("editor")}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 md:hidden"
            >
              Editor <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="border-b border-white/10 p-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => addFilesToQueue(e.target.files)}
              accept="image/*"
              className="hidden"
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFilesToQueue(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-violet-500/[0.07] to-transparent p-5 transition hover:border-violet-400/40 hover:bg-violet-500/[0.09]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-200">Import photos</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Drop files here or browse your device. Multiple images supported.</p>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-black shadow-lg transition group-hover:scale-105">
                  <UploadCloud className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                ["All", counts.total, "all"],
                ["Ready", counts.ready, "ready"],
                ["Failed", counts.failed, "failed"],
                ["Done", counts.done, "done"],
              ].map(([label, count, filter]) => (
                <button
                  key={String(filter)}
                  type="button"
                  onClick={() => setQueueFilter(filter as typeof queueFilter)}
                  className={`rounded-xl border px-2 py-2 text-center transition ${
                    queueFilter === filter ? "border-violet-500/40 bg-violet-500/10" : "border-white/7 bg-white/[0.025] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="text-sm font-black text-white">{count}</div>
                  <div className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                </button>
              ))}
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filename, caption, category…"
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              <span>{filteredQueue.length} shown</span>
              {counts.active > 0 && <span className="text-violet-400">• {counts.active} active</span>}
            </div>
            <div className="flex items-center gap-1">
              {counts.failed > 0 && (
                <button
                  type="button"
                  onClick={retryFailed}
                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                  title="Retry failed"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              {counts.done > 0 && (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                  title="Clear completed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              {counts.total > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                  title="Clear queue"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
            {filteredQueue.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.025]">
                  <ImagePlus className="h-6 w-6 text-zinc-700" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No media here</p>
                <p className="mt-2 max-w-[230px] text-[11px] leading-relaxed text-zinc-600">
                  Add images to start editing captions, events, and watermark placement.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredQueue.map((item) => (
                  <QueueItem
                    key={item.id}
                    item={item}
                    selected={item.id === activeItemId}
                    onSelect={() => selectItem(item.id)}
                    onRemove={() => removeFile(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#0a0a0a] p-3 md:p-4">
            <button
              type="button"
              onClick={processAndUpload}
              disabled={isProcessing || counts.ready + counts.failed === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isProcessing ? `Uploading • ${counts.active + counts.done}/${counts.total}` : counts.failed > 0 ? `Retry & Upload ${counts.ready + counts.failed}` : `Upload ${counts.ready}`}
            </button>
          </div>
        </aside>

        {/* EDITOR */}
        <main className={`min-w-0 flex-1 ${mobilePanel === "editor" ? "flex" : "hidden md:flex"} flex-col bg-[#050505]`}>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#080808] px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobilePanel("queue")}
                className="rounded-lg border border-white/10 bg-white/[0.025] p-2 text-zinc-400 hover:text-white md:hidden"
                title="Back to queue"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Inspector</span>
                  {activeItem && <span className="text-[9px] text-zinc-700">/</span>}
                  {activeItem && <span className="max-w-[180px] truncate text-[10px] font-bold text-zinc-500">{activeItem.file.name}</span>}
                </div>
                <p className="mt-0.5 text-sm font-black text-white">Edit & publish media</p>
              </div>
            </div>

            {activeItem && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveActive(-1)}
                  className="rounded-lg border border-white/10 bg-white/[0.025] p-2 text-zinc-400 hover:text-white"
                  title="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveActive(1)}
                  className="rounded-lg border border-white/10 bg-white/[0.025] p-2 text-zinc-400 hover:text-white"
                  title="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {dataError && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-200 md:mx-6">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Studio data could not fully load.</p>
                <p className="mt-1 text-red-200/60">{dataError}</p>
              </div>
            </div>
          )}

          {!activeItem ? (
            <EmptyEditor onImport={() => fileInputRef.current?.click()} />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <section className="relative min-h-[320px] flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.08),_transparent_42%)] p-3 md:p-6">
                <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]" />

                <div className="relative flex h-full items-center justify-center">
                  <InteractivePreview
                    item={activeItem}
                    activeOverlayUrl={activeOverlayUrl}
                    onUpdateWatermark={(watermark) => updateActiveItem({ watermark })}
                  />

                  <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-2 md:left-0 md:top-0">
                    <span className="rounded-lg border border-white/10 bg-black/45 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 backdrop-blur">
                      {activeItem.category}
                    </span>
                    {activeItem.status === "success" && (
                      <span className="flex items-center gap-1 rounded-lg border border-emerald-400/15 bg-emerald-500/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 backdrop-blur">
                        <CheckCircle2 className="h-3 w-3" /> Uploaded
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 md:bottom-0 md:left-0 md:right-0">
                    <div className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[10px] font-bold text-zinc-500 backdrop-blur">
                      Drag watermark to position • pinch / handle to resize
                    </div>
                    <button
                      type="button"
                      onClick={resetWatermark}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 backdrop-blur hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </button>
                  </div>
                </div>
              </section>

              <section className="border-t border-white/10 bg-[#090909] p-4 md:p-6">
                <div className="mx-auto max-w-[1400px]">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-400">Metadata</p>
                      <h2 className="mt-1 text-sm font-black text-white">Prepare this photo for the gallery</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={applyCurrentSettingsToPending}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        title="Copies category, event and watermark settings to all non-completed items"
                      >
                        <Copy className="h-3.5 w-3.5" /> Apply to pending
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced((value) => !value)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                          showAdvanced ? "border-violet-500/30 bg-violet-500/10 text-violet-200" : "border-white/10 bg-white/[0.035] text-zinc-400 hover:text-white"
                        }`}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" /> More options
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1.45fr_0.8fr_0.95fr]">
                    <Field label="Caption" icon={<MessageSquare className="h-3.5 w-3.5" />}>
                      <input
                        value={activeItem.caption}
                        onChange={(e) => updateActiveItem({ caption: e.target.value })}
                        placeholder="Write a useful gallery caption…"
                        className={`w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-700 focus:border-violet-500/50`}
                      />
                    </Field>

                    <Field label="Category" icon={<Tag className="h-3.5 w-3.5" />}>
                      <select
                        value={activeItem.category}
                        onChange={(e) => updateActiveItem({ category: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-black/35 px-3.5 py-3 text-xs font-black uppercase tracking-wider text-zinc-300 outline-none focus:border-violet-500/50"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-zinc-950">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Linked event" icon={<Hash className="h-3.5 w-3.5" />}>
                      <select
                        value={activeItem.eventId}
                        onChange={(e) => updateActiveItem({ eventId: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-black/35 px-3.5 py-3 text-xs font-black uppercase tracking-wider text-zinc-300 outline-none focus:border-violet-500/50"
                      >
                        <option value="" className="bg-zinc-950">Unlinked</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id} className="bg-zinc-950">
                            {event.event_code}: {event.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {showAdvanced && (
                    <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Watermark</p>
                            <p className="mt-1 text-xs font-bold text-zinc-200">
                              {activeItem.watermark.enabled ? "Enabled" : "Disabled"}
                              {activeOverlayUrl ? " • Overlay ready" : " • Overlay unavailable"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateActiveItem({ watermark: { ...activeItem.watermark, enabled: !activeItem.watermark.enabled } })}
                            className={`relative h-7 w-12 rounded-full border p-1 transition ${
                              activeItem.watermark.enabled ? "border-violet-400 bg-violet-500" : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            <span
                              className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                                activeItem.watermark.enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          <span>Watermark size</span>
                          <span className="text-zinc-300">{Math.round(activeItem.watermark.width * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1.5"
                          step="0.01"
                          value={activeItem.watermark.width}
                          onChange={(e) =>
                            updateActiveItem({
                              watermark: { ...activeItem.watermark, width: Number(e.target.value) },
                            })
                          }
                          disabled={!activeItem.watermark.enabled}
                          className="w-full accent-violet-500 disabled:opacity-30"
                        />
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                          <CircleHelp className="h-4 w-4 text-violet-400" />
                          <span>Saved at upload</span>
                        </div>
                        <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-zinc-600">The watermark is baked into the JPEG before it reaches storage.</p>
                      </div>
                    </div>
                  )}

                  {activeItem.status === "error" && activeItem.errorMessage && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-300">Upload error</p>
                        <p className="mt-1 break-words text-[11px] text-red-200/60">{activeItem.errorMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {isLoadingData && (
            <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 shadow-2xl backdrop-blur">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading studio data
            </div>
          )}
        </main>
      </div>

      </div>

      <style jsx global>{`
        * { scrollbar-color: #27272a transparent; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}

function QueueItem({
  item,
  selected,
  onSelect,
  onRemove,
}: {
  item: UploadQueueItem;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const meta = statusMeta(item.status);
  const StatusIcon = meta.icon;

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-2xl border p-2 transition ${
        selected
          ? "border-violet-500/35 bg-violet-500/[0.075]"
          : "border-transparent bg-transparent hover:border-white/7 hover:bg-white/[0.035]"
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
          <img src={item.preview} alt="" className="h-full w-full object-cover" draggable={false} />
          {item.status !== "queued" && (
            <div className="absolute inset-x-0 bottom-0 bg-black/65 px-1.5 py-1 backdrop-blur">
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className={`truncate text-[11px] font-black ${selected ? "text-violet-100" : "text-zinc-200"}`}>
              {item.caption.trim() || item.file.name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="rounded-lg p-1 text-zinc-700 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100 focus:opacity-100"
              title="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[9px] font-bold uppercase tracking-wider text-zinc-600">{item.category}</span>
            {item.eventId && <span className="truncate text-[9px] font-bold text-zinc-700">• event linked</span>}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate text-[9px] text-zinc-700">{formatBytes(item.file.size)}</span>
            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-1 text-[8px] font-black uppercase tracking-wider ${meta.className}`}>
              <StatusIcon className={`h-3 w-3 ${item.status === "compressing" || item.status === "uploading" ? "animate-spin" : ""}`} />
              {meta.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <label className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
        <span className="text-violet-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function EmptyEditor({ onImport }: { onImport: () => void }) {
  return (
    <div className="flex min-h-[70dvh] flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black">
          <ImagePlus className="h-8 w-8 text-zinc-700" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">Media workspace</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Nothing selected yet</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-600">
          Import a batch of photos, then edit each image with event linking, captions, watermark placement, and one-click publishing.
        </p>
        <button
          type="button"
          onClick={onImport}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black hover:bg-zinc-200"
        >
          <UploadCloud className="h-4 w-4" /> Import media
        </button>
      </div>
    </div>
  );
}

function InteractivePreview({
  item,
  activeOverlayUrl,
  onUpdateWatermark,
}: {
  item: UploadQueueItem;
  activeOverlayUrl: string | null;
  onUpdateWatermark: (watermark: WatermarkSettings) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(item.watermark);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<ResizeHandle | null>(null);
  const [pinching, setPinching] = useState(false);
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [pinchStartBox, setPinchStartBox] = useState({ width: item.watermark.width, height: item.watermark.height });

  const resizeSessionRef = useRef<{
    handle: ResizeHandle;
    pointerX: number;
    pointerY: number;
    box: WatermarkSettings;
    ratio: number;
  } | null>(null);

  useEffect(() => {
    setLocal(item.watermark);
  }, [item.id, item.watermark.enabled, item.watermark.x, item.watermark.y, item.watermark.width, item.watermark.height]);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const commit = (next: WatermarkSettings) => {
    setLocal(next);
    onUpdateWatermark(next);
  };

  const getBounds = () => canvasRef.current?.getBoundingClientRect() || null;

  const updatePosition = (clientX: number, clientY: number) => {
    const rect = getBounds();
    if (!rect) return;

    const x = clamp((clientX - rect.left) / rect.width, 0.01, 0.99);
    const y = clamp((clientY - rect.top) / rect.height, 0.01, 0.99);
    setLocal((prev) => ({ ...prev, x, y }));
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const startPinch = (e: React.TouchEvent) => {
    if (!local.enabled || e.touches.length !== 2) return;

    setPinching(true);
    setDragging(false);
    setResizing(null);
    setPinchStartDistance(getTouchDistance(e.touches));
    setPinchStartBox({ width: local.width, height: local.height });
  };

  const movePinch = (e: React.TouchEvent) => {
    if (!pinching || e.touches.length !== 2 || !pinchStartDistance) return;
    e.preventDefault();

    const distance = getTouchDistance(e.touches);
    const scale = distance / pinchStartDistance;

    setLocal((prev) => ({
      ...prev,
      width: clamp(pinchStartBox.width * scale, 0.04, 1.5),
      height: clamp(pinchStartBox.height * scale, 0.04, 1.5),
    }));
  };

  const endPinch = (e: React.TouchEvent) => {
    if (!pinching || e.touches.length >= 2) return;
    setPinching(false);
    setPinchStartDistance(null);
    setLocal((prev) => {
      onUpdateWatermark(prev);
      return prev;
    });
  };

  const handleDragStart = (e: React.PointerEvent) => {
    if (!local.enabled || resizing || e.pointerType === "touch") return;
    e.stopPropagation();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();
    e.stopPropagation();
    updatePosition(e.clientX, e.clientY);
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!dragging) return;
    e.stopPropagation();
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setLocal((prev) => {
      onUpdateWatermark(prev);
      return prev;
    });
  };

  const beginResize = (handle: ResizeHandle, e: React.PointerEvent) => {
    if (!local.enabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    setResizing(handle);
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = getBounds();
    const boxWidthPx = Math.max(1, local.width * (rect?.width || 1));
    const boxHeightPx = Math.max(1, local.height * (rect?.height || 1));

    resizeSessionRef.current = {
      handle,
      pointerX: e.clientX,
      pointerY: e.clientY,
      box: { ...local },
      ratio: boxWidthPx / boxHeightPx,
    };
  };

  const resizeLinked = (clientX: number, clientY: number) => {
    const rect = getBounds();
    const session = resizeSessionRef.current;
    if (!rect || !session) return;

    const { handle, pointerX, pointerY, box, ratio } = session;
    const baseWidthPx = box.width * rect.width;
    const baseHeightPx = box.height * rect.height;

    const dx = clientX - pointerX;
    const dy = clientY - pointerY;

    const horizontal = handle.includes("e") || handle.includes("w");
    const vertical = handle.includes("n") || handle.includes("s");
    const corner = horizontal && vertical;

    let scale = 1;

    if (corner) {
      const sx = baseWidthPx > 0 ? (baseWidthPx + (handle.includes("e") ? dx : -dx)) / baseWidthPx : 1;
      const sy = baseHeightPx > 0 ? (baseHeightPx + (handle.includes("s") ? dy : -dy)) / baseHeightPx : 1;
      scale = Math.abs(sx - 1) >= Math.abs(sy - 1) ? sx : sy;
    } else if (horizontal) {
      const signedWidth = baseWidthPx + (handle.includes("e") ? dx : -dx);
      scale = signedWidth / Math.max(baseWidthPx, 1);
    } else if (vertical) {
      const signedHeight = baseHeightPx + (handle.includes("s") ? dy : -dy);
      scale = signedHeight / Math.max(baseHeightPx, 1);
    }

    const minWidthPx = Math.max(24, rect.width * 0.04);
    const maxWidthPx = rect.width * 1.5;
    const minScale = minWidthPx / Math.max(baseWidthPx, 1);
    const maxScale = maxWidthPx / Math.max(baseWidthPx, 1);
    scale = clamp(scale, minScale, maxScale);

    const nextWidthPx = baseWidthPx * scale;
    const nextHeightPx = nextWidthPx / Math.max(ratio, 0.0001);

    const startCenterX = rect.left + rect.width * box.x;
    const startCenterY = rect.top + rect.height * box.y;

    const startLeft = startCenterX - baseWidthPx / 2;
    const startRight = startCenterX + baseWidthPx / 2;
    const startTop = startCenterY - baseHeightPx / 2;
    const startBottom = startCenterY + baseHeightPx / 2;

    let nextLeft = startLeft;
    let nextRight = startRight;
    let nextTop = startTop;
    let nextBottom = startBottom;

    if (handle.includes("w")) nextLeft = startRight - nextWidthPx;
    else if (handle.includes("e")) nextRight = startLeft + nextWidthPx;
    else {
      nextLeft = startCenterX - nextWidthPx / 2;
      nextRight = startCenterX + nextWidthPx / 2;
    }

    if (handle.includes("n")) nextTop = startBottom - nextHeightPx;
    else if (handle.includes("s")) nextBottom = startTop + nextHeightPx;
    else {
      nextTop = startCenterY - nextHeightPx / 2;
      nextBottom = startCenterY + nextHeightPx / 2;
    }

    const nextCenterX = (nextLeft + nextRight) / 2;
    const nextCenterY = (nextTop + nextBottom) / 2;

    const nextX = clamp((nextCenterX - rect.left) / rect.width, -0.25, 1.25);
    const nextY = clamp((nextCenterY - rect.top) / rect.height, -0.25, 1.25);

    setLocal((prev) => ({
      ...prev,
      x: nextX,
      y: nextY,
      width: clamp(nextWidthPx / rect.width, 0.04, 1.5),
      height: clamp(nextHeightPx / rect.height, 0.04, 1.5),
    }));
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizing) return;
    e.preventDefault();
    e.stopPropagation();
    resizeLinked(e.clientX, e.clientY);
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (!resizing) return;
    e.stopPropagation();
    setResizing(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    resizeSessionRef.current = null;
    setLocal((prev) => {
      onUpdateWatermark(prev);
      return prev;
    });
  };

  const nudge = (dx: number, dy: number) => {
    if (!local.enabled) return;
    commit({
      ...local,
      x: clamp(local.x + dx, 0.01, 0.99),
      y: clamp(local.y + dy, 0.01, 0.99),
    });
  };

  const adjustSize = (scaleDelta: number) => {
    if (!local.enabled) return;
    const scale = 1 + scaleDelta;
    const nextWidth = clamp(local.width * scale, 0.04, 1.5);
    const ratio = local.width > 0 && local.height > 0 ? local.width / local.height : 1;
    const nextHeight = clamp(nextWidth / Math.max(ratio, 0.0001), 0.04, 1.5);

    commit({
      ...local,
      width: nextWidth,
      height: nextHeight,
    });
  };

  const handleStyle = (handle: ResizeHandle) => {
    const common =
      "absolute z-30 grid h-3.5 w-3.5 rounded-full border-2 border-violet-500 bg-white shadow-lg transition hover:scale-125 active:scale-95 md:h-4 md:w-4";
    const positions: Record<ResizeHandle, string> = {
      nw: "-left-2 -top-2 cursor-nwse-resize",
      n: "left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize",
      ne: "-right-2 -top-2 cursor-nesw-resize",
      e: "-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize",
      se: "-bottom-2 -right-2 cursor-nwse-resize",
      s: "-bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize",
      sw: "-bottom-2 -left-2 cursor-nesw-resize",
      w: "-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize",
    };
    return `${common} ${positions[handle]}`;
  };

  return (
    <div className="relative flex max-h-full max-w-full items-center justify-center select-none">
      <div
        ref={canvasRef}
        className="relative max-h-[58dvh] max-w-[calc(100vw-24px)] overflow-visible rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60 md:max-h-[64dvh] md:max-w-[calc(100vw-470px)]"
        onTouchStart={startPinch}
        onTouchMove={movePinch}
        onTouchEnd={endPinch}
        onTouchCancel={endPinch}
        style={{ touchAction: "none" }}
      >
        <img
          src={item.preview}
          alt="Media preview"
          className="block max-h-[58dvh] max-w-full rounded-2xl object-contain md:max-h-[64dvh]"
          draggable={false}
        />

        {item.watermark.enabled && activeOverlayUrl && (
          <div
            tabIndex={0}
            role="application"
            aria-label="Watermark transform box"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.01 : 0.005;
              const sizeStep = e.shiftKey ? 0.08 : 0.03;
              if (e.key === "ArrowLeft") nudge(-step, 0);
              if (e.key === "ArrowRight") nudge(step, 0);
              if (e.key === "ArrowUp") nudge(0, -step);
              if (e.key === "ArrowDown") nudge(0, step);
              if (e.key === "+" || e.key === "=") adjustSize(sizeStep);
              if (e.key === "-") adjustSize(-sizeStep);
            }}
            className={`group absolute z-20 outline-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              left: `${local.x * 100}%`,
              top: `${local.y * 100}%`,
              width: `${local.width * 100}%`,
              height: `${local.height * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`pointer-events-none absolute inset-0 rounded-md border-2 border-violet-400/90 bg-violet-500/[0.06] ${
                dragging || resizing || pinching ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />

            <img
              src={activeOverlayUrl}
              alt="Watermark overlay"
              className="pointer-events-none block h-full w-full select-none object-fill drop-shadow-2xl"
              draggable={false}
            />

            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 p-1.5 text-white backdrop-blur transition ${
                dragging || resizing || pinching ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <Grip className="h-4 w-4" />
            </div>

            {(Object.keys(HANDLE_LABELS) as ResizeHandle[]).map((handle) => (
              <button
                key={handle}
                type="button"
                aria-label={`Resize ${HANDLE_LABELS[handle]} (linked ratio)`}
                onPointerDown={(e) => beginResize(handle, e)}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                onPointerCancel={handleResizeEnd}
                className={handleStyle(handle)}
                style={{ touchAction: "none" }}
              >
                <span className="sr-only">{HANDLE_LABELS[handle]}</span>
              </button>
            ))}

            <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-zinc-300 opacity-0 backdrop-blur transition group-hover:opacity-100">
              Ratio locked
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLE_LABELS: Record<ResizeHandle, string> = {
  nw: "top left",
  n: "top",
  ne: "top right",
  e: "right",
  se: "bottom right",
  s: "bottom",
  sw: "bottom left",
  w: "left",
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not decode image."));
  });
  return img;
}

async function loadOverlayImage(url: string): Promise<HTMLImageElement> {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Watermark download failed (${response.status}).`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function bakeImageWithWatermark(item: UploadQueueItem, overlayUrl: string | null): Promise<Blob> {
  const [mainImage, overlayImage] = await Promise.all([
    loadImage(item.preview),
    item.watermark.enabled && overlayUrl ? loadOverlayImage(overlayUrl) : Promise.resolve(null),
  ]);

  const canvas = document.createElement("canvas");
  let width = mainImage.naturalWidth || mainImage.width;
  let height = mainImage.naturalHeight || mainImage.height;

  const MAX = 2400;
  if (Math.max(width, height) > MAX) {
    const ratio = MAX / Math.max(width, height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  ctx.drawImage(mainImage, 0, 0, width, height);

  if (overlayImage && item.watermark.enabled) {
    const wmWidth = width * item.watermark.width;
    const wmHeight = height * item.watermark.height;
    const x = width * item.watermark.x - wmWidth / 2;
    const y = height * item.watermark.y - wmHeight / 2;
    ctx.drawImage(overlayImage, x, y, wmWidth, wmHeight);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((output) => {
      if (output) resolve(output);
      else reject(new Error("Could not encode the processed image."));
    }, "image/jpeg", 0.88);
  });

  return blob;
}
