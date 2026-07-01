"use client";

import { useEffect, useState } from "react";
import { TRACKER_START_DATE } from "@/lib/constants";

const MS_PER_DAY = 86_400_000;

function toUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / MS_PER_DAY);
}
function addDays(iso: string, n: number): string {
  return new Date(toUTC(iso) + n * MS_PER_DAY).toISOString().slice(0, 10);
}

export default function TimelineSlider({
  asOfDate,
  today,
  onChange,
}: {
  asOfDate: string;
  today: string;
  onChange: (date: string) => void;
}) {
  const maxDays = Math.max(1, daysBetween(TRACKER_START_DATE, today));
  const value = Math.min(maxDays, Math.max(0, daysBetween(TRACKER_START_DATE, asOfDate)));
  const [playing, setPlaying] = useState(false);

  // Advance the cursor by a week on a timer while playing; stops at today.
  useEffect(() => {
    if (!playing) return;
    if (value >= maxDays) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => {
      onChange(addDays(TRACKER_START_DATE, Math.min(maxDays, value + 7)));
    }, 220);
    return () => clearTimeout(id);
  }, [playing, value, maxDays, onChange]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <span className="text-xs font-semibold text-slate-200">
            Landscape as of{" "}
            <span className="font-mono text-sky-400">{asOfDate}</span>
          </span>
        </div>
        <button
          onClick={() => onChange(today)}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Jump to today
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={maxDays}
        value={value}
        onChange={(e) =>
          onChange(addDays(TRACKER_START_DATE, Number(e.target.value)))
        }
        className="w-full accent-sky-500"
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>{TRACKER_START_DATE}</span>
        <span>{today}</span>
      </div>
    </div>
  );
}
