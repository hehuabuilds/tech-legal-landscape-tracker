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

  // Position of the fill boundary / chick, corrected for the 28px thumb so it
  // tracks the native thumb's center travel (inset by half the thumb at ends).
  const pct = (value / maxDays) * 100;
  const fillPos = `calc(${pct}% + ${(0.5 - pct / 100) * 28}px)`;

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
    <div className="bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
          >
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <span className="text-xs font-semibold text-zinc-700">
            Landscape as of{" "}
            <span className="font-mono text-[#e76a5e]">{asOfDate}</span>
          </span>
        </div>
        <button
          onClick={() => onChange(today)}
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          Jump to today
        </button>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={maxDays}
          value={value}
          onChange={(e) =>
            onChange(addDays(TRACKER_START_DATE, Number(e.target.value)))
          }
          className="chick-slider block w-full"
          style={{
            background: `linear-gradient(to right, #e76a5e 0, #e76a5e ${fillPos}, #e4e4e7 ${fillPos}, #e4e4e7 100%)`,
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e76a5e] text-[11px] leading-none text-white shadow ring-2 ring-white select-none"
          style={{ left: fillPos }}
        >
          ✶
        </span>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>{TRACKER_START_DATE}</span>
        <span>{today}</span>
      </div>
    </div>
  );
}
