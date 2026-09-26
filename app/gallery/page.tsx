"use client";

import { useEffect, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
}

export default function GalleryPage() {
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setImages(data ?? []);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 pt-32 sm:pt-40 text-ink-950">
      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div
          className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Visual Archive
          </div>

          <h1 className="text-4xl font-black tracking-tight text-ocean-950 sm:text-6xl">
            SAJDA Gallery
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-ink-600 sm:text-lg">
            A visual journey through the events, programs, and meaningful
            moments created by our unions across the state.
          </p>
        </div>

        {/* =========================================================
            MASONRY IMAGE GRID
        ========================================================== */}
        <div
          className={`mx-auto mt-16 max-w-6xl transition-all duration-700 delay-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {loading ? (
            <div className="columns-1 gap-6 sm:columns-2 md:columns-3 space-y-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-full animate-pulse rounded-[1.5rem] bg-white border-2 border-line shadow-sm ${i % 2 === 0 ? "h-64" : "h-96"}`}
                />
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="columns-1 gap-6 sm:columns-2 md:columns-3 space-y-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative break-inside-avoid overflow-hidden rounded-[1.5rem] border-2 border-line bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-ocean-md hover:border-ocean-200"
                >
                  <img
                    src={img.image_url}
                    alt={img.title || "Gallery Image"}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ocean-950/90 via-ocean-950/40 to-transparent p-6 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-sm font-black text-white drop-shadow-md">
                        {img.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-line bg-white py-32 text-center shadow-sm">
              <Camera
                size={48}
                className="text-ink-300 mb-5"
                strokeWidth={1.5}
              />
              <h3 className="text-2xl font-black text-ocean-950">
                No photos yet
              </h3>
              <p className="mt-2 text-base font-medium text-ink-500 max-w-sm">
                The visual archive is currently empty. Check back soon for
                updates from our recent programs.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
