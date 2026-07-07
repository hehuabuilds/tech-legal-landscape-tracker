"use client";

import type { Case } from "@/lib/schema";
import {
  STATUSES,
  CASE_TYPES,
  ACTION_TYPES,
  ENTITY_CATEGORIES,
  sourceName,
} from "@/lib/constants";
import { statusAsOf } from "@/lib/filter";
import { ISSUE_CLUSTERS, type IssueKey } from "@/lib/issues";
import { NODE_TYPES } from "@/lib/graphConfig";

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
    <div className="flex h-full w-full flex-col overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 text-zinc-700 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-900">{c.title}</h3>
        <button
          onClick={onClose}
          className="shrink-0 rounded px-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
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
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
          {ACTION_TYPES[c.actionType].label}
        </span>
        {c.reviewStatus === "needs_review" && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
            needs review
          </span>
        )}
      </div>

      {c.issues && c.issues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(c.issues as IssueKey[]).map((k) => (
            <span
              key={k}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${NODE_TYPES.issue_cluster.color}22`,
                color: NODE_TYPES.issue_cluster.color,
              }}
            >
              {ISSUE_CLUSTERS[k]?.label ?? k}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-3 space-y-1 text-xs text-zinc-500">
        <div>Jurisdiction: {c.jurisdiction}</div>
        {c.court && <div>Court / forum: {c.court}</div>}
        {c.filingDate && <div>Filed / announced: {c.filingDate}</div>}
        <div>Last verified: {c.lastVerified}</div>
      </dl>

      {c.summary && (
        <p className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
          {c.summary}
        </p>
      )}

      {c.statutes && c.statutes.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-zinc-900">Statutes</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {c.statutes.map((s) => (
              <span
                key={s}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${NODE_TYPES.law.color}22`,
                  color: NODE_TYPES.law.color,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {c.legalTheories && c.legalTheories.length > 0 && (
        <div className="mt-2 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-900">Legal theories: </span>
          {c.legalTheories.join(", ")}
        </div>
      )}

      <PartyGroup title="Initiating" parties={initiating} />
      <PartyGroup title="Responding" parties={responding} />

      {c.timeline.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-zinc-900">Timeline</p>
          {/* Left rail: a continuous vertical line on the left, with dot
              markers sitting on it. Badges and event text are left-aligned
              to the right of the rail. */}
          <ol className="relative mt-2 space-y-3 border-l border-zinc-200 pl-4">
            {[...c.timeline]
              .sort((a, b) => (a.date < b.date ? -1 : 1))
              .map((e, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[calc(1rem+1px)] top-1 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-zinc-300 ring-2 ring-white"
                    style={
                      e.status
                        ? { backgroundColor: STATUSES[e.status].color }
                        : undefined
                    }
                  />
                  {e.status && (
                    <span
                      className="inline-block whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        color: STATUSES[e.status].color,
                        boxShadow: `0 0 0 1px ${STATUSES[e.status].color}66`,
                      }}
                    >
                      {STATUSES[e.status].label}
                    </span>
                  )}
                  <div className="mt-1 text-xs text-zinc-600">
                    <span className="font-mono text-zinc-400">{e.date}</span>{" "}
                    {e.event}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}

      {(() => {
        const o = c.outcome;
        if (!o) return null;
        const hasLegislative = !!o.legislative && o.legislative.length > 0;
        const hasMarket = !!o.market && o.market.length > 0;
        const hasSentiment = !!o.sentiment && o.sentiment.length > 0;
        if (!hasLegislative && !hasMarket && !hasSentiment) return null;
        return (
          <section className="mt-4 rounded-lg border border-[#e76a5e]/25 bg-[#e76a5e]/[0.04] p-3.5">
            <h4 className="text-xs font-semibold text-zinc-900">
              Outcome &amp; ripple effects
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
              How the ruling rippled outward — into law, markets and public
              opinion.
            </p>

            {hasLegislative && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  ✶ Legislative &amp; legal ripple
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-zinc-600 marker:text-[#e76a5e]/50">
                  {o.legislative!.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasMarket && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  ✶ Market dynamics
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-zinc-600 marker:text-[#e76a5e]/50">
                  {o.market!.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasSentiment && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  ✶ Public &amp; social sentiment
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {o.sentiment!.map((s, i) => {
                    return (
                      <li
                        key={i}
                        className="rounded-md border border-zinc-200 bg-white p-2"
                      >
                        <p className="text-xs leading-relaxed text-zinc-600">
                          {s.summary}
                          {s.sourceUrl && (
                            <>
                              {" "}
                              <a
                                href={s.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#e76a5e] underline underline-offset-2 hover:text-[#c8564b]"
                              >
                                {sourceName(s.sourceUrl)}
                              </a>
                            </>
                          )}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        );
      })()}

      <div className="mt-3">
        <p className="text-xs font-semibold text-zinc-900">Sources</p>
        <ul className="mt-1 space-y-1">
          {c.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#e76a5e] underline underline-offset-2 hover:text-[#c8564b]"
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
      <p className="text-xs font-semibold text-zinc-900">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {parties.map((p, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-700">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: ENTITY_CATEGORIES[p.category].color }}
            />
            {p.name}
            <span className="text-zinc-400">· {p.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
