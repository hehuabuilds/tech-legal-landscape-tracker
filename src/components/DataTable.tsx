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
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
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
                className="cursor-pointer border-b border-zinc-100 align-top text-zinc-600 hover:bg-zinc-50"
              >
                <td className="px-4 py-2.5">
                  <span className="font-medium text-zinc-900">{c.title}</span>
                  {c.reviewStatus === "needs_review" && (
                    <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      review
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex flex-col items-start gap-1">
                    <span
                      className="w-fit rounded-sm px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${CASE_TYPES[c.caseType].color}22`,
                        color: CASE_TYPES[c.caseType].color,
                      }}
                    >
                      {CASE_TYPES[c.caseType].label}
                    </span>
                    <span className="pl-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {ACTION_TYPES[c.actionType].label}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs">
                  <span className="text-zinc-700">{initiating}</span>
                  <span className="text-zinc-400"> → </span>
                  <span className="text-zinc-500">{responding}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">
                  {c.jurisdiction}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex w-fit items-center rounded-sm px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: STATUSES[eff].color }}
                  >
                    {STATUSES[eff].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">
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
                        className="text-xs text-[#e76a5e] underline underline-offset-2 hover:text-[#c8564b]"
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
              <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                No cases match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
