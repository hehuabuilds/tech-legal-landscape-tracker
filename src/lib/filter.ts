import type { Case } from "./schema";
import type { CaseType, ActionType, Status } from "./constants";
import { DEFAULT_CASE_TYPES } from "./constants";

export type FilterState = {
  caseTypes: CaseType[]; // empty = all
  actionTypes: ActionType[]; // empty = all
  statuses: Status[]; // empty = all (matched against as-of status)
  jurisdictions: string[]; // empty = all
  query: string; // free-text search
  asOfDate: string; // timeline cutoff (ISO date)
};

export function defaultFilterState(today: string): FilterState {
  return {
    caseTypes: [...DEFAULT_CASE_TYPES],
    actionTypes: [],
    statuses: [],
    jurisdictions: [],
    query: "",
    asOfDate: today,
  };
}

// A case is present on the graph once its filing/announcement date has passed.
export function caseVisibleAsOf(c: Case, asOf: string): boolean {
  if (!c.filingDate) return true;
  return c.filingDate <= asOf;
}

// Reconstruct the case's status as of a given date from its append-only
// timeline: the latest timeline event carrying a status with date <= asOf.
// Falls back to the record's current status when no dated status exists yet.
export function statusAsOf(c: Case, asOf: string): Status {
  let best: { date: string; status: Status } | null = null;
  for (const e of c.timeline) {
    if (e.status && e.date <= asOf) {
      if (!best || e.date >= best.date) best = { date: e.date, status: e.status };
    }
  }
  return best?.status ?? c.status;
}

function matchesQuery(c: Case, q: string): boolean {
  if (!q) return true;
  const haystack = [
    c.title,
    c.summary,
    c.jurisdiction,
    ...c.parties.map((p) => p.name),
    ...c.sources.map((s) => `${s.label ?? ""} ${s.url}`),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function applyFilters(cases: Case[], f: FilterState): Case[] {
  const q = f.query.trim().toLowerCase();
  return cases.filter((c) => {
    if (c.removed) return false;
    if (!caseVisibleAsOf(c, f.asOfDate)) return false;
    if (f.caseTypes.length && !f.caseTypes.includes(c.caseType)) return false;
    if (f.actionTypes.length && !f.actionTypes.includes(c.actionType)) return false;
    if (f.statuses.length) {
      const eff = statusAsOf(c, f.asOfDate);
      if (!f.statuses.includes(eff)) return false;
    }
    if (f.jurisdictions.length && !f.jurisdictions.includes(c.jurisdiction))
      return false;
    if (!matchesQuery(c, q)) return false;
    return true;
  });
}
