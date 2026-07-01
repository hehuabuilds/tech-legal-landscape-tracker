"use client";

import { useMemo, useState } from "react";
import {
  PLAINTIFF_TYPES,
  STATUSES,
  PLAINTIFF_TYPE_KEYS,
  STATUS_KEYS,
  type PlaintiffType,
  type LawsuitStatus,
} from "@/lib/constants";
import type { Lawsuit } from "@/lib/schema";

type SortKey = "filingDate" | "plaintiff" | "defendant" | "status";

export default function DataTable({ lawsuits }: { lawsuits: Lawsuit[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PlaintiffType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LawsuitStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("filingDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = lawsuits.filter((l) => {
      if (typeFilter !== "all" && l.plaintiffType !== typeFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.plaintiff.toLowerCase().includes(q) ||
        l.defendant.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        (l.category?.toLowerCase().includes(q) ?? false)
      );
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }, [lawsuits, query, typeFilter, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortArrow = (key: SortKey) =>
    key === sortKey ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plaintiff, defendant, case…"
          className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as PlaintiffType | "all")
          }
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="all">All plaintiff types</option>
          {PLAINTIFF_TYPE_KEYS.map((k) => (
            <option key={k} value={k}>
              {PLAINTIFF_TYPES[k].label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as LawsuitStatus | "all")
          }
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {STATUSES[k].label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-500">
          {rows.length} of {lawsuits.length} cases
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th
                className="cursor-pointer px-4 py-2.5 font-medium"
                onClick={() => toggleSort("plaintiff")}
              >
                Plaintiff{sortArrow("plaintiff")}
              </th>
              <th
                className="cursor-pointer px-4 py-2.5 font-medium"
                onClick={() => toggleSort("defendant")}
              >
                Defendant{sortArrow("defendant")}
              </th>
              <th className="px-4 py-2.5 font-medium">Lawsuit</th>
              <th
                className="cursor-pointer px-4 py-2.5 font-medium"
                onClick={() => toggleSort("filingDate")}
              >
                Filed{sortArrow("filingDate")}
              </th>
              <th
                className="cursor-pointer px-4 py-2.5 font-medium"
                onClick={() => toggleSort("status")}
              >
                Status{sortArrow("status")}
              </th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Sources</th>
              <th className="px-4 py-2.5 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr
                key={l.id}
                className="border-b border-slate-100 align-top hover:bg-slate-50"
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: PLAINTIFF_TYPES[l.plaintiffType].color,
                      }}
                      title={PLAINTIFF_TYPES[l.plaintiffType].label}
                    />
                    <span className="font-medium text-slate-800">
                      {l.plaintiff}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-700">{l.defendant}</td>
                <td className="px-4 py-2.5 text-slate-600">{l.name}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                  {l.filingDate ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex flex-col gap-1">
                    <span
                      className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: STATUSES[l.status].color }}
                    >
                      {STATUSES[l.status].label}
                    </span>
                    {!l.verified && (
                      <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        needs review
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {l.category ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex flex-col gap-0.5">
                    {l.sources.map((s, i) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800"
                      >
                        {s.label || `Source ${i + 1}`}
                      </a>
                    ))}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                  {l.lastUpdated}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No cases match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
