"use client";

import type { Case } from "@/lib/schema";
import {
  STATUSES,
  CASE_TYPES,
  ACTION_TYPES,
  ENTITY_CATEGORIES,
} from "@/lib/constants";
import { statusAsOf } from "@/lib/filter";

export default function DetailPanel({
  c,
  asOfDate,
  onClose,
}: {
  c: Case;
  asOfDate: string;
  onClose: () => void;
}) {
  const eff = statusAsOf(c, asOfDate);
  const initiating = c.parties.filter((p) => p.side === "initiating");
  const responding = c.parties.filter((p) => p.side === "responding");

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-slate-200 backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{c.title}</h3>
        <button
          onClick={onClose}
          className="shrink-0 rounded px-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span
          className="rounded-full px-2 py-0.5 font-medium text-white"
          style={{ backgroundColor: STATUSES[eff].color }}
        >
          {STATUSES[eff].label}
        </span>
        <span
          className="rounded-full px-2 py-0.5 font-medium"
          style={{
            backgroundColor: `${CASE_TYPES[c.caseType].color}22`,
            color: CASE_TYPES[c.caseType].color,
          }}
        >
          {CASE_TYPES[c.caseType].label}
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">
          {ACTION_TYPES[c.actionType].label}
        </span>
        {c.reviewStatus === "needs_review" && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-medium text-amber-300">
            needs review
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1 text-xs text-slate-400">
        <div>Jurisdiction: {c.jurisdiction}</div>
        {c.filingDate && <div>Filed / announced: {c.filingDate}</div>}
        <div>Last verified: {c.lastVerified}</div>
      </dl>

      <PartyGroup title="Initiating" parties={initiating} />
      <PartyGroup title="Responding" parties={responding} />

      {c.summary && (
        <p className="mt-3 text-xs leading-relaxed text-slate-300">{c.summary}</p>
      )}

      {c.timeline.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-200">Timeline</p>
          <ol className="mt-1 space-y-1.5 border-l border-slate-700 pl-3">
            {[...c.timeline]
              .sort((a, b) => (a.date < b.date ? -1 : 1))
              .map((e, i) => (
                <li key={i} className="text-xs text-slate-400">
                  <span className="font-mono text-slate-500">{e.date}</span>{" "}
                  {e.event}
                  {e.status && (
                    <span
                      className="ml-1 rounded px-1 text-[10px]"
                      style={{
                        color: STATUSES[e.status].color,
                        backgroundColor: `${STATUSES[e.status].color}1a`,
                      }}
                    >
                      {STATUSES[e.status].label}
                    </span>
                  )}
                </li>
              ))}
          </ol>
        </div>
      )}

      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-200">Sources</p>
        <ul className="mt-1 space-y-1">
          {c.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 underline underline-offset-2 hover:text-sky-300"
              >
                {s.label || s.url}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PartyGroup({
  title,
  parties,
}: {
  title: string;
  parties: Case["parties"];
}) {
  if (parties.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-slate-200">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {parties.map((p, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: ENTITY_CATEGORIES[p.category].color }}
            />
            {p.name}
            <span className="text-slate-500">· {p.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
