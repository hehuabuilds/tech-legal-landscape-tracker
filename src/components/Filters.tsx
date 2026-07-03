"use client";

import { useState } from "react";
import type { FilterState } from "@/lib/filter";
import {
  CASE_TYPE_KEYS,
  CASE_TYPES,
  ACTION_TYPE_KEYS,
  ACTION_TYPES,
  STATUS_KEYS,
  STATUSES,
  type CaseType,
  type ActionType,
  type Status,
} from "@/lib/constants";

type Props = {
  filters: FilterState;
  jurisdictions: string[];
  resultCount: number;
  totalCount: number;
  onChange: (next: FilterState) => void;
  onReset: () => void;
};

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

export default function Filters({
  filters,
  jurisdictions,
  resultCount,
  totalCount,
  onChange,
  onReset,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search parties, jurisdiction, summary, sources…"
          className="min-w-[240px] flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#e76a5e] focus:bg-white focus:ring-2 focus:ring-[#e76a5e]/20"
        />
        <span className="text-xs text-zinc-500">
          {resultCount} / {totalCount} shown
        </span>
        <button
          onClick={onReset}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-[#e76a5e] hover:bg-[#e76a5e]/10 hover:text-[#e76a5e]"
        >
          Reset filters
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-lg border border-[#e76a5e] bg-[#e76a5e]/10 px-3 py-1.5 text-xs font-medium text-[#e76a5e] transition-colors hover:bg-[#e76a5e]/20"
        >
          {open ? "Hide filters" : "Show filters"}
          <span
            className={`inline-block transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>
      </div>

      {open && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-zinc-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <ChipGroup
              label="Case type"
              options={CASE_TYPE_KEYS.map((k) => ({
                key: k,
                label: CASE_TYPES[k].label,
                color: CASE_TYPES[k].color,
              }))}
              selected={filters.caseTypes}
              onToggle={(k) =>
                onChange({ ...filters, caseTypes: toggle(filters.caseTypes, k as CaseType) })
              }
              onReplace={(keys) =>
                onChange({ ...filters, caseTypes: keys as CaseType[] })
              }
            />

            <ChipGroup
              label="Action type"
              options={ACTION_TYPE_KEYS.map((k) => ({
                key: k,
                label: ACTION_TYPES[k].label,
              }))}
              selected={filters.actionTypes}
              onToggle={(k) =>
                onChange({
                  ...filters,
                  actionTypes: toggle(filters.actionTypes, k as ActionType),
                })
              }
              onReplace={(keys) =>
                onChange({ ...filters, actionTypes: keys as ActionType[] })
              }
            />

            <ChipGroup
              label="Status"
              options={STATUS_KEYS.map((k) => ({
                key: k,
                label: STATUSES[k].label,
                color: STATUSES[k].color,
              }))}
              selected={filters.statuses}
              onToggle={(k) =>
                onChange({ ...filters, statuses: toggle(filters.statuses, k as Status) })
              }
              onReplace={(keys) =>
                onChange({ ...filters, statuses: keys as Status[] })
              }
            />
          </div>

          <div className="mt-5 border-t border-zinc-100 pt-4">
            <ChipGroup
              label="Jurisdiction"
              options={jurisdictions.map((j) => ({ key: j, label: j }))}
              selected={filters.jurisdictions}
              onToggle={(k) =>
                onChange({ ...filters, jurisdictions: toggle(filters.jurisdictions, k) })
              }
              onReplace={(keys) =>
                onChange({ ...filters, jurisdictions: keys })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  onReplace,
}: {
  label: string;
  options: { key: string; label: string; color?: string }[];
  selected: string[];
  onToggle: (key: string) => void;
  onReplace: (keys: string[]) => void;
}) {
  const allKeys = options.map((o) => o.key);
  const allOn = allKeys.length > 0 && allKeys.every((k) => selected.includes(k));
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-700">
          {label}
        </p>
        <button
          onClick={() => onReplace(allOn ? [] : allKeys)}
          className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:border-[#e76a5e] hover:bg-[#e76a5e]/10 hover:text-[#e76a5e]"
        >
          {allOn ? "Clear" : "Select all"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o.key);
          return (
            <button
              key={o.key}
              onClick={() => onToggle(o.key)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                on
                  ? "border-transparent bg-zinc-900 font-medium text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {o.color && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: o.color }}
                />
              )}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
