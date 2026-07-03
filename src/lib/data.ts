import { cases as rawCases } from "@/data/cases";
import { caseSchema, type Case } from "./schema";
import { deriveIssues } from "./issues";

// Validate the seed at load time. Any record that fails the schema (e.g. a
// missing source URL) is dropped and logged, never rendered. Issue clusters
// are derived here if not already present on the record.
export function getCases(): Case[] {
  const valid: Case[] = [];
  for (const row of rawCases) {
    const parsed = caseSchema.safeParse(row);
    if (parsed.success) {
      const c = parsed.data;
      if (!c.issues || c.issues.length === 0) c.issues = deriveIssues(c);
      valid.push(c);
    } else {
      const id = (row as { id?: string })?.id ?? "<unknown>";
      console.error(
        `[data] Dropping invalid case "${id}":`,
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      );
    }
  }
  return valid;
}

export function getJurisdictions(cases: Case[]): string[] {
  return [...new Set(cases.map((c) => c.jurisdiction))].sort();
}

export type Stats = {
  total: number;
  companies: number;
  entities: number;
  verified: number;
  needsReview: number;
};

export function getStats(cases: Case[]): Stats {
  const entityNames = new Set<string>();
  const companies = new Set<string>();
  for (const c of cases) {
    for (const p of c.parties) {
      entityNames.add(p.name);
      if (p.category === "ai_company") companies.add(p.name);
    }
  }
  return {
    total: cases.length,
    companies: companies.size,
    entities: entityNames.size,
    verified: cases.filter((c) => c.reviewStatus === "published").length,
    needsReview: cases.filter((c) => c.reviewStatus === "needs_review").length,
  };
}

// Today, computed on the server at request time (ISO date only).
export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}
