"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Activity,
  Swords,
  ChevronDown,
  Lock,
  Search,
  Trophy,
  ShieldCheck,
  Loader2,
  BarChart3,
  Radar,
} from "lucide-react";

interface UnionData {
  union_id: string;
  name: string;
  dawa: number;
  adarsham: number;
  sargam: number;
  publishing: number;
  total: number;
}

type StatKey = "dawa" | "adarsham" | "sargam" | "publishing";

const stats: { label: string; key: StatKey }[] = [
  { label: "Da'wa", key: "dawa" },
  { label: "Adarsham", key: "adarsham" },
  { label: "Sargam", key: "sargam" },
  { label: "Publishing", key: "publishing" },
];

export default function HeadToHead() {
  const [unionsList, setUnionsList] = useState<UnionData[]>([]);
  const [unionA, setUnionA] = useState<UnionData | null>(null);
  const [unionB, setUnionB] = useState<UnionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [isDropdownA, setIsDropdownA] = useState(false);
  const [isDropdownB, setIsDropdownB] = useState(false);

  useEffect(() => {
    const fetchUnions = async () => {
      try {
        const { data, error } = await supabase
          .from("union_metrics")
          .select(
            "union_id, union_name, dawa_score, adarsham_score, sargam_score, publishing_score, total_score"
          );

        if (error) {
          console.error("Supabase Error:", error);
          return;
        }

        if (data) {
          const formattedData: UnionData[] = data.map((item: any) => ({
            union_id: item.union_id,
            name: item.union_name || "Unknown Union",
            dawa: Number(item.dawa_score) || 0,
            adarsham: Number(item.adarsham_score) || 0,
            sargam: Number(item.sargam_score) || 0,
            publishing: Number(item.publishing_score) || 0,
            total: Number(item.total_score) || 0,
          }));

          setUnionsList(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch unions:", error);
      } finally {
        setIsLoading(false);
      }
   };

    fetchUnions();
  }, []);

  const filteredA = useMemo(() => {
    return unionsList.filter((u) =>
      u.name.toLowerCase().includes(searchA.toLowerCase())
    );
  }, [unionsList, searchA]);

  const filteredB = useMemo(() => {
    return unionsList.filter(
      (u) =>
        u.union_id !== unionA?.union_id &&
        u.name.toLowerCase().includes(searchB.toLowerCase())
    );
  }, [unionsList, searchB, unionA]);

  /*
   * Radar chart calculations
   */
  const radarData = useMemo(() => {
    if (!unionA || !unionB) return null;

    const centerX = 200;
    const centerY = 200;
    const radius = 135;

    const getPoint = (index: number, value: number) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 4;
      const normalized = Math.min(Math.max(value, 0), 100) / 100;

      return {
        x: centerX + Math.cos(angle) * radius * normalized,
        y: centerY + Math.sin(angle) * radius * normalized,
      };
    };

    const getFullPoint = (index: number) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 4;

      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    };

    const valuesA = stats.map((stat) => unionA[stat.key]);
    const valuesB = stats.map((stat) => unionB[stat.key]);

    const pointsA = valuesA.map((value, index) =>
      getPoint(index, value)
    );

    const pointsB = valuesB.map((value, index) =>
      getPoint(index, value)
    );

    return {
      pointsA,
      pointsB,
      fullPoints: [0, 1, 2, 3].map(getFullPoint),
      axisLabels: stats.map((stat, index) => {
        const point = getFullPoint(index);

        return {
          label: stat.label,
          x: point.x,
          y: point.y,
        };
      }),
    };
  }, [unionA, unionB]);

  const getPolygonPoints = (
    points: { x: number; y: number }[]
  ) => {
    return points.map((point) => `${point.x},${point.y}`).join(" ");
  };

  return (
    <section className="relative overflow-hidden border-y border-line bg-white py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#052659 1px, transparent 1px), linear-gradient(90deg, #052659 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
       {/* Section Header */}
        <div className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ocean-700 shadow-sm">
            <Activity size={14} className="text-emerald-500" />
            Data Intelligence
          </div>

          <h2 className="text-4xl font-black uppercase leading-none tracking-tight text-ocean-950 md:text-[3.5rem]">
            HEAD-TO-HEAD{" "}
            <span className="text-ink-400">STATS</span>
          </h2>
        </div>

        {/* Main Card */}
        <div className="rounded-[2.5rem] border border-line bg-white p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] sm:p-10">
          {isLoading ? (
            <div className="flex h-32 w-full items-center justify-center gap-3 text-ink-400">
              <Loader2 className="h-6 w-6 animate-spin text-ocean-500" />
              <span className="text-sm font-bold uppercase tracking-widest">
                Syncing Database...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* TEAM ALPHA */}
              <div className="relative w-full flex-1">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-ink-500">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Team Alpha
                </div>

                <div
                  className={`relative flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-6 py-5 transition-colors ${
                    isDropdownA
                      ? "border-ocean-300 bg-ocean-50"
                      : "border-line bg-[#F8FAFC] hover:border-ocean-200"
                  }`}
                  onClick={() => {
                    setIsDropdownA((prev) => !prev);
                    setIsDropdownB(false);
                  }}
                >
                  <span
                    className={`text-sm font-black uppercase tracking-widest ${
                      unionA ? "text-ocean-950" : "text-ink-400"
                    }`}
                  >
                    {unionA ? unionA.name : "SELECT CHALLENGER..."}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`text-ink-400 transition-transform ${
                      isDropdownA ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown A */}
                {isDropdownA && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-line bg-white p-2 shadow-xl">
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-[#F8FAFC] px-4 py-3">
                      <Search size={16} className="text-ink-400" />

                      <input
                        type="text"
                        placeholder="Search unions..."
                        autoFocus
                        className="w-full bg-transparent text-sm font-bold text-ocean-950 outline-none placeholder:text-ink-400"
                        value={searchA}
                        onChange={(e) => setSearchA(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="custom-scrollbar flex max-h-48 flex-col gap-1 overflow-y-auto">
                      {filteredA.length > 0 ? (
                        filteredA.map((u) => (
                          <button
                            key={u.union_id}
                            type="button"
                            className="cursor-pointer rounded-xl px-4 py-3 text-left text-xs font-extrabold text-ink-600 transition-colors hover:bg-ocean-50 hover:text-ocean-950"
                            onClick={() => {
                              setUnionA(u);
                              setUnionB(null);
                              setSearchA("");
                              setSearchB("");
                              setIsDropdownA(false);
                            }}
                          >
                            {u.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-5 text-center text-xs font-bold text-ink-400">
                          No unions found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* VS */}
              <div className="mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-[#F8FAFC] text-ink-400 shadow-sm md:mt-0">
                <Swords size={20} strokeWidth={2.5} />
              </div>

              {/* TEAM BRAVO */}
              <div className="relative w-full flex-1">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-ink-500">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Team Bravo
                </div>

                {!unionA ? (
                  <div className="relative flex w-full items-center justify-between rounded-2xl border-2 border-line/50 bg-[#F8FAFC]/50 px-6 py-5 opacity-60">
                    <span className="text-sm font-black uppercase tracking-widest text-ink-300">
                      LOCKED
                    </span>

                    <Lock size={18} className="text-ink-300" />
                  </div>
                ) : (
                  <div
                    className={`relative flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-6 py-5 transition-colors ${
                      isDropdownB
                        ? "border-ocean-300 bg-ocean-50"
                        : "border-line bg-[#F8FAFC] hover:border-ocean-200"
                    }`}
                    onClick={() => {
                      setIsDropdownB((prev) => !prev);
                      setIsDropdownA(false);
                    }}
                  >
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${
                        unionB ? "text-ocean-950" : "text-ink-400"
                      }`}
                    >
                      {unionB ? unionB.name : "SELECT CHALLENGER..."}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`text-ink-400 transition-transform ${
                        isDropdownB ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}

                {/* Dropdown B */}
                {isDropdownB && unionA && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-line bg-white p-2 shadow-xl">
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-[#F8FAFC] px-4 py-3">
                      <Search size={16} className="text-ink-400" />

                      <input
                        type="text"
                        placeholder="Search unions..."
                        autoFocus
                        className="w-full bg-transparent text-sm font-bold text-ocean-950 outline-none placeholder:text-ink-400"
                        value={searchB}
                        onChange={(e) => setSearchB(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="custom-scrollbar flex max-h-48 flex-col gap-1 overflow-y-auto">
                      {filteredB.length > 0 ? (
                        filteredB.map((u) => (
                          <button
                            key={u.union_id}
                            type="button"
                            className="cursor-pointer rounded-xl px-4 py-3 text-left text-xs font-extrabold text-ink-600 transition-colors hover:bg-ocean-50 hover:text-ocean-950"
                            onClick={() => {
                              setUnionB(u);
                              setSearchB("");
                              setIsDropdownB(false);
                            }}
                          >
                            {u.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-5 text-center text-xs font-bold text-ink-400">
                          No unions found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {unionA && unionB && (
            <div className="mt-12 border-t border-line pt-12">
              {/* Selected Teams */}
              <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-ocean-100 bg-ocean-50 px-5 py-4">
                  <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ocean-600">
                    Team Alpha
                  </div>

                  <div className="text-xl font-black uppercase text-ocean-950">
                    {unionA.name}
                  </div>
                </div>

                <div className="rounded-2xl border border-ocean-100 bg-ocean-50 px-5 py-4">
                  <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ocean-600">
                    Team Bravo
                  </div>

                  <div className="text-xl font-black uppercase text-ocean-950">
                    {unionB.name}
                  </div>
                </div>
              </div>

              {/* SCORE BARS */}
              <div className="flex flex-col gap-8">
                {stats.map((stat) => {
                  const scoreA = unionA[stat.key];
                  const scoreB = unionB[stat.key];
                  const maxScore = Math.max(100, scoreA, scoreB);

                  const winA = scoreA > scoreB;
                  const winB = scoreB > scoreA;
                  const draw = scoreA === scoreB;

                  return (
                    <div
                      key={stat.key}
                      className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8"
                    >
                      {/* A */}
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xl font-black ${
                            winA
                              ? "text-ocean-950"
                              : draw
                              ? "text-ink-600"
                              : "text-ink-400"
                          }`}
                        >
                          {scoreA}
                        </span>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8EEF2]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              winA
                                ? "bg-emerald-500"
                                : draw
                                ? "bg-ocean-400"
                                : "bg-ink-300"
                            }`}
                            style={{
                              width: `${
                                maxScore === 0
                                  ? 0
                                  : (scoreA / maxScore) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Label */}
                      <span className="w-24 text-center text-[10px] font-extrabold uppercase tracking-widest text-ink-500 sm:w-32">
                        {stat.label}
                      </span>

                      {/* B */}
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`text-xl font-black ${
                            winB
                              ? "text-ocean-950"
                              : draw
                              ? "text-ink-600"
                              : "text-ink-400"
                          }`}
                        >
                          {scoreB}
                        </span>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8EEF2]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              winB
                                ? "bg-emerald-500"
                                : draw
                                ? "bg-ocean-400"
                                : "bg-ink-300"
                            }`}
                            style={{
                              width: `${
                                maxScore === 0
                                  ? 0
                                  : (scoreB / maxScore) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ========================================================= */}
              {/* GRAPH 1 - BAR GRAPH */}
              {/* ========================================================= */}
              <div className="mt-16 rounded-[2rem] border border-line bg-[#F8FAFC] p-6 sm:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                    <BarChart3
                      size={21}
                      className="text-ocean-600"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-ocean-950">
                      Category Comparison
                    </h3>

                    <p className="text-xs font-semibold text-ink-400">
                      Side-by-side performance by category
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-7">
                  {stats.map((stat) => {
                    const scoreA = unionA[stat.key];
                    const scoreB = unionB[stat.key];

                    return (
                      <div key={stat.key}>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink-500">
                            {stat.label}
                          </span>

                          <div className="flex items-center gap-3 text-xs font-black">
                            <span className="text-ocean-950">
                              {scoreA}
                            </span>

                            <span className="text-ink-300">VS</span>

                            <span className="text-ocean-950">
                              {scoreB}
                            </span>
                          </div>
                        </div>

                        {/* A */}
                        <div className="mb-2 flex items-center gap-3">
                          <div className="w-8 shrink-0 text-[10px] font-black uppercase text-ink-400">
                            A
                          </div>

                          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#E4EAF0]">
                            <div
                              className="absolute left-0 top-0 h-full rounded-full bg-ocean-700 transition-all duration-1000"
                              style={{
                                width: `${Math.min(scoreA, 100)}%`,
                              }}
                            />
                          </div>

                          <span className="w-10 text-right text-xs font-black text-ocean-950">
                            {scoreA}
                          </span>
                        </div>

                        {/* B */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 shrink-0 text-[10px] font-black uppercase text-ink-400">
                            B
                          </div>

                          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#E4EAF0]">
                            <div
                              className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-all duration-1000"
                              style={{
                                width: `${Math.min(scoreB, 100)}%`,
                              }}
                            />
                          </div>

                          <span className="w-10 text-right text-xs font-black text-ocean-950">
                            {scoreB}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Graph Legend */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-line pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-ocean-700" />
                    {unionA.name}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    {unionB.name}
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* GRAPH 2 - RADAR CHART */}
              {/* ========================================================= */}
              {radarData && (
                <div className="mt-8 rounded-[2rem] border border-line bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50">
                      <Radar
                        size={21}
                        className="text-ocean-600"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-ocean-950">
                        Performance Radar
                      </h3>

                      <p className="text-xs font-semibold text-ink-400">
                        Overall category balance
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center lg:flex-row">
                    {/* Radar */}
                    <div className="w-full max-w-[500px]">
                      <svg
                        viewBox="0 0 400 400"
                        className="h-auto w-full"
                      >
                        {/* Outer polygon */}
                        <polygon
                          points={getPolygonPoints(
                            radarData.fullPoints
                          )}
                          fill="none"
                          stroke="#D9E1E8"
                          strokeWidth="1.5"
                        />

                        {/* Middle levels */}
                        {[25, 50, 75].map((level) => {
                          const levelPoints = [0, 1, 2, 3].map(
                            (index) => {
                              const angle =
                                -Math.PI / 2 +
                                (index * Math.PI * 2) / 4;

                              const r =
                                135 * (level / 100);

                              return {
                                x: 200 + Math.cos(angle) * r,
                                y: 200 + Math.sin(angle) * r,
                              };
                            }
                          );

                          return (
                            <polygon
                              key={level}
                              points={getPolygonPoints(levelPoints)}
                              fill="none"
                              stroke="#E7EDF2"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Axis lines */}
                        {radarData.fullPoints.map(
                          (point, index) => (
                            <line
                              key={index}
                              x1="200"
                              y1="200"
                              x2={point.x}
                              y2={point.y}
                              stroke="#E7EDF2"
                              strokeWidth="1"
                            />
                          )
                        )}

                        {/* Team A */}
                        <polygon
                          points={getPolygonPoints(
                            radarData.pointsA
                          )}
                          fill="rgba(5, 38, 89, 0.10)"
                          stroke="#052659"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />

                        {/* Team B */}
                        <polygon
                          points={getPolygonPoints(
                            radarData.pointsB
                          )}
                          fill="rgba(16, 185, 129, 0.10)"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />

                        {/* Team A dots */}
                        {radarData.pointsA.map(
                          (point, index) => (
                            <circle
                              key={`a-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r="5"
                              fill="#052659"
                            />
                          )
                        )}

                        {/* Team B dots */}
                        {radarData.pointsB.map(
                          (point, index) => (
                            <circle
                              key={`b-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r="5"
                              fill="#10B981"
                            />
                          )
                        )}

                        {/* Labels */}
                        {radarData.axisLabels.map(
                          (item, index) => {
                            const labelOffset = 25;

                            let x = item.x;
                            let y = item.y;

                            if (index === 0) {
                              y -= labelOffset;
                            }

                            if (index === 1) {
                              x += labelOffset;
                            }

                            if (index === 2) {
                              y += labelOffset;
                            }

                            if (index === 3) {
                              x -= labelOffset;
                            }

                            return (
                              <text
                                key={item.label}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="11"
                                fontWeight="800"
                                fill="#64748B"
                              >
                                {item.label.toUpperCase()}
                              </text>
                            );
                          }
                        )}
                      </svg>
                    </div>

                    {/* Radar Side Information */}
                    <div className="w-full max-w-sm lg:ml-8">
                      <div className="rounded-2xl border border-line bg-[#F8FAFC] p-6">
                        <div className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink-400">
                          Comparison Overview
                        </div>

                        <div className="mb-6 flex items-center gap-4">
                          <div className="h-3 w-3 rounded-full bg-ocean-700" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black uppercase text-ocean-950">
                              {unionA.name}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                              Team Alpha
                            </div>
                          </div>
                        </div>

                        <div className="mb-6 flex items-center gap-4">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black uppercase text-ocean-950">
                              {unionB.name}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                              Team Bravo
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-line pt-5">
                          {stats.map((stat) => {
                            const scoreA = unionA[stat.key];
                            const scoreB = unionB[stat.key];
                            const difference = Math.abs(
                              scoreA - scoreB
                            );

                            return (
                              <div
                                key={stat.key}
                                className="mb-4 last:mb-0"
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-500">
                                    {stat.label}
                                  </span>

                                  <span className="text-[10px] font-black text-ocean-950">
                                    Δ {difference}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-xs font-black">
                                  <span className="text-ocean-700">
                                    {scoreA}
                                  </span>

                                  <span className="text-ink-300">
                                    /
                                  </span>

                                  <span className="text-emerald-600">
                                    {scoreB}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TOTAL POINTS */}
              <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-ocean-100 bg-ocean-50 px-6 py-8 shadow-sm sm:gap-8 sm:px-10">
                <div className="text-right">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-ocean-600">
                    Total Points
                  </div>

                  <div className="mt-1 text-4xl font-black text-ocean-950">
                    {unionA.total}
                  </div>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-amber-500 shadow-sm">
                  <Trophy size={22} strokeWidth={2.5} />
                </div>

                <div className="text-left">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-ocean-600">
                    Total Points
                  </div>

                  <div className="mt-1 text-4xl font-black text-ocean-950">
                    {unionB.total}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
