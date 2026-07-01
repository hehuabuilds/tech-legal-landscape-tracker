import { lawsuits as rawLawsuits } from "@/data/lawsuits";
import { lawsuitSchema, type Lawsuit } from "./schema";

// Validate the seed at load time. Any row that fails the schema (e.g. missing a
// source URL) is dropped and logged rather than crashing the whole page — so
// the "every displayed case has >= 1 source" guarantee holds no matter what.
export function getLawsuits(): Lawsuit[] {
  const valid: Lawsuit[] = [];
  for (const row of rawLawsuits) {
    const parsed = lawsuitSchema.safeParse(row);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      const id = (row as { id?: string })?.id ?? "<unknown>";
      console.error(
        `[data] Dropping invalid lawsuit "${id}":`,
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      );
    }
  }
  return valid;
}

export type LawsuitStats = {
  total: number;
  verified: number;
  needsReview: number;
  companies: number;
  plaintiffs: number;
};

export function getStats(lawsuits: Lawsuit[]): LawsuitStats {
  return {
    total: lawsuits.length,
    verified: lawsuits.filter((l) => l.verified).length,
    needsReview: lawsuits.filter((l) => !l.verified || l.status === "needs_review")
      .length,
    companies: new Set(lawsuits.map((l) => l.defendant)).size,
    plaintiffs: new Set(lawsuits.map((l) => l.plaintiff)).size,
  };
}
