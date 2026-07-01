"use client";

import { useMemo, useState } from "react";
import type { Case } from "@/lib/schema";
import { STATUSES, CASE_TYPES, ACTION_TYPES } from "@/lib/constants";
import { statusAsOf } from "@/lib/filter";

type SortKey = "title" | "filingDate" | "jurisdiction" | "status";

export default function DataTable({
  cases,
  asOfDate,
  onSelectCase,
}: {
  cases: Case[];
  asOfDate: string;
  onSelectCase: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("filingDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...cases].sort((a, b) => {
      const av =
        sortKey === "status" ? statusAsOf(a, asOfDate) : (a[sortKey] ?? "");
      const bv =
        sortKey === "status" ? statusAsOf(b, asOfDate) : (b[sortKey] ?? "");
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }, [cases, sortKey, sortDir, asOfDate]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };
  const arrow = (k: SortKey) =>
    k === sortKey ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
            <th
              className="cursor-pointer px-4 py-2.5 font-medium"
              onClick={() => toggleSort("title")}
            >
              Case / action{arrow("title")}
            </th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Parties</th>
            <th
              className="cursor-pointer px-4 py-2.5 font-medium"
              onClick={() => toggleSort("jurisdiction")}
            >
              Jurisdiction{arrow("jurisdiction")}
            </th>
            <th
              className="cursor-pointer px-4 py-2.5 font-medium"
              onClick={() => toggleSort("status")}
            >
              Status{arrow("status")}
            </th>
            <th
              className="cursor-pointer px-4 py-2.5 font-medium"
              onClick={() => toggleSort("filingDate")}
            >
              Filed{arrow("filingDate")}
            </th>
            <th className="px-4 py-2.5 font-medium">Sources</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const eff = statusAsOf(c, asOfDate);
            const initiating = c.parties
              .filter((p) => p.side === "initiating")
              .map((p) => p.name)
              .join(", ");
            const responding = c.parties
              .filter((p) => p.side === "responding")
              .map((p) => p.name)
              .join(", ");
            return (
              <tr
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="cursor-pointer border-b border-slate-800/70 align-top text-slate-300 hover:bg-slate-800/50"
              >
                <td className="px-4 py-2.5">
                  <span className="font-medium text-slate-100">{c.title}</span>
                  {c.reviewStatus === "needs_review" && (
                    <span className="ml-2 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                      review
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex flex-col gap-1">
                    <span
                      className="w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${CASE_TYPES[c.caseType].color}22`,
                        color: CASE_TYPES[c.caseType].color,
                      }}
                    >
                      {CASE_TYPES[c.caseType].label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {ACTION_TYPES[c.actionType].label}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs">
                  <span className="text-slate-200">{initiating}</span>
                  <span className="text-slate-500"> → </span>
                  <span className="text-slate-400">{responding}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                  {c.jurisdiction}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: STATUSES[eff].color }}
                  >
                    {STATUSES[eff].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                  {c.filingDate ?? "—"}
                </td>
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <span className="flex flex-col gap-0.5">
                    {c.sources.map((s, i) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-400 underline underline-offset-2 hover:text-sky-300"
                      >
                        {s.label || `Source ${i + 1}`}
                      </a>
                    ))}
                  </span>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                No cases match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
