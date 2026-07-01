// Shared metadata for the AI Legal Landscape Tracker.
// Single source of truth used by the graph, filters, timeline, table, and legend.

// The historical window this tracker covers.
export const TRACKER_START_DATE = "2025-01-01";

// ---------------------------------------------------------------------------
// Case types (the primary filter facet). Copyright is the default selection.
// ---------------------------------------------------------------------------
export const CASE_TYPE_KEYS = [
  "copyright_training_data",
  "privacy_data_protection",
  "defamation_misinformation",
  "ai_safety_harms",
  "licensing_contract",
  "antitrust_competition",
  "employment_labor",
  "consumer_protection",
  "regulatory_enforcement",
  "government_investigation",
  "other",
] as const;
export type CaseType = (typeof CASE_TYPE_KEYS)[number];

export const CASE_TYPES: Record<CaseType, { label: string; color: string }> = {
  copyright_training_data: { label: "Copyright / training data", color: "#f59e0b" },
  privacy_data_protection: { label: "Privacy / data protection", color: "#38bdf8" },
  defamation_misinformation: { label: "Defamation / misinformation", color: "#fb7185" },
  ai_safety_harms: { label: "AI safety / harms", color: "#f43f5e" },
  licensing_contract: { label: "Licensing / contract", color: "#2dd4bf" },
  antitrust_competition: { label: "Antitrust / competition", color: "#a78bfa" },
  employment_labor: { label: "Employment / labor", color: "#34d399" },
  consumer_protection: { label: "Consumer protection", color: "#facc15" },
  regulatory_enforcement: { label: "Regulatory enforcement", color: "#fb923c" },
  government_investigation: { label: "Government investigation", color: "#60a5fa" },
  other: { label: "Other", color: "#94a3b8" },
};

export const DEFAULT_CASE_TYPES: CaseType[] = ["copyright_training_data"];

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
export const ACTION_TYPE_KEYS = [
  "lawsuit",
  "regulatory_action",
  "investigation",
  "settlement",
  "licensing_dispute",
  "class_action",
  "appeal",
  "other",
] as const;
export type ActionType = (typeof ACTION_TYPE_KEYS)[number];

export const ACTION_TYPES: Record<ActionType, { label: string }> = {
  lawsuit: { label: "Lawsuit" },
  regulatory_action: { label: "Regulatory action" },
  investigation: { label: "Investigation" },
  settlement: { label: "Settlement" },
  licensing_dispute: { label: "Licensing dispute" },
  class_action: { label: "Class action" },
  appeal: { label: "Appeal" },
  other: { label: "Other" },
};

// ---------------------------------------------------------------------------
// Status / relationship (colors case nodes AND their edges)
// ---------------------------------------------------------------------------
export const STATUS_KEYS = [
  "sued",
  "pending",
  "dismissed",
  "settled",
  "appealed",
  "judgment",
  "licensing_agreement",
  "investigation",
  "enforcement_action",
  "needs_review",
] as const;
export type Status = (typeof STATUS_KEYS)[number];

export const STATUSES: Record<Status, { label: string; color: string }> = {
  sued: { label: "Sued", color: "#f87171" },
  pending: { label: "Pending", color: "#fbbf24" },
  dismissed: { label: "Dismissed", color: "#94a3b8" },
  settled: { label: "Settled", color: "#34d399" },
  appealed: { label: "Appealed", color: "#c084fc" },
  judgment: { label: "Judgment", color: "#60a5fa" },
  licensing_agreement: { label: "Licensing agreement", color: "#2dd4bf" },
  investigation: { label: "Investigation", color: "#fb923c" },
  enforcement_action: { label: "Enforcement action", color: "#fb7185" },
  needs_review: { label: "Needs review", color: "#64748b" },
};

// ---------------------------------------------------------------------------
// Entity categories (node color + size class). AI companies are the large
// central nodes; everything else orbits them.
// ---------------------------------------------------------------------------
export const ENTITY_CATEGORY_KEYS = [
  "ai_company",
  "authors",
  "publishers",
  "media",
  "musicians",
  "visual_artists",
  "developers",
  "governments",
  "regulators",
  "class_action",
  "other",
] as const;
export type EntityCategory = (typeof ENTITY_CATEGORY_KEYS)[number];

export const ENTITY_CATEGORIES: Record<
  EntityCategory,
  { label: string; color: string; size: number }
> = {
  ai_company: { label: "AI companies", color: "#e2e8f0", size: 9 },
  authors: { label: "Authors", color: "#f59e0b", size: 4 },
  publishers: { label: "Publishers", color: "#ec4899", size: 4 },
  media: { label: "Media companies", color: "#3b82f6", size: 4 },
  musicians: { label: "Musicians", color: "#a855f7", size: 4 },
  visual_artists: { label: "Visual artists", color: "#ef4444", size: 4 },
  developers: { label: "Developers", color: "#10b981", size: 4 },
  governments: { label: "Governments", color: "#14b8a6", size: 5 },
  regulators: { label: "Regulators", color: "#eab308", size: 5 },
  class_action: { label: "Class actions", color: "#fb923c", size: 4 },
  other: { label: "Other", color: "#94a3b8", size: 3.5 },
};

// Party roles / sides
export const PARTY_ROLE_KEYS = [
  "plaintiff",
  "complainant",
  "regulator",
  "investigator",
  "defendant",
  "respondent",
  "appellant",
  "other",
] as const;
export type PartyRole = (typeof PARTY_ROLE_KEYS)[number];

export const PARTY_SIDE_KEYS = ["initiating", "responding"] as const;
export type PartySide = (typeof PARTY_SIDE_KEYS)[number];

export const CONFIDENCE_KEYS = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE_KEYS)[number];

export const REVIEW_STATUS_KEYS = ["published", "needs_review"] as const;
export type ReviewStatus = (typeof REVIEW_STATUS_KEYS)[number];
