// Shared metadata for plaintiff types and lawsuit statuses.
// Single source of truth used by the graph, the data table, and the legend.

export const PLAINTIFF_TYPE_KEYS = [
  "authors",
  "media",
  "musicians",
  "platform",
  "publisher",
  "visual_artists",
] as const;

export type PlaintiffType = (typeof PLAINTIFF_TYPE_KEYS)[number];

export const PLAINTIFF_TYPES: Record<
  PlaintiffType,
  { label: string; color: string }
> = {
  authors: { label: "Authors / Writers", color: "#f59e0b" }, // amber
  media: { label: "Media", color: "#3b82f6" }, // blue
  musicians: { label: "Musicians", color: "#a855f7" }, // purple
  platform: { label: "Platform / Developers", color: "#10b981" }, // emerald
  publisher: { label: "Publisher", color: "#ec4899" }, // pink
  visual_artists: { label: "Visual Artists", color: "#ef4444" }, // red
};

export const STATUS_KEYS = [
  "sued",
  "settled",
  "won",
  "lost",
  "pending",
  "needs_review",
] as const;

export type LawsuitStatus = (typeof STATUS_KEYS)[number];

export const STATUSES: Record<
  LawsuitStatus,
  { label: string; color: string }
> = {
  sued: { label: "Sued", color: "#64748b" }, // slate
  settled: { label: "Settled", color: "#3b82f6" }, // blue
  won: { label: "Won", color: "#22c55e" }, // green
  lost: { label: "Lost", color: "#ef4444" }, // red
  pending: { label: "Pending", color: "#f59e0b" }, // amber
  needs_review: { label: "Needs review", color: "#94a3b8" }, // gray
};

export const CONFIDENCE_KEYS = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE_KEYS)[number];
