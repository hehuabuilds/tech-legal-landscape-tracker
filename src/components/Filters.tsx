"use client";

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
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search parties, jurisdiction, summary, sources…"
          className="min-w-[240px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
        />
        <span className="text-xs text-slate-400">
          {resultCount} / {totalCount} shown
        </span>
        <button
          onClick={onReset}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
        >
          Reset filters
        </button>
      </div>

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
      />

      <ChipGroup
        label="Jurisdiction"
        options={jurisdictions.map((j) => ({ key: j, label: j }))}
        selected={filters.jurisdictions}
        onToggle={(k) =>
          onChange({ ...filters, jurisdictions: toggle(filters.jurisdictions, k) })
        }
      />
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { key: string; label: string; color?: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o.key);
          return (
            <button
              key={o.key}
              onClick={() => onToggle(o.key)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                on
                  ? "border-transparent bg-slate-100 font-medium text-slate-900"
                  : "border-slate-700 text-slate-300 hover:border-slate-500"
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
