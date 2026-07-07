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

// ---------------------------------------------------------------------------
// Outcome / ripple effects: sentiment channels + lean.
// Public reaction is tracked per channel so social platforms (Reddit, X,
// Instagram, TikTok) sit alongside traditional press rather than being
// collapsed into a single "press" bucket.
// ---------------------------------------------------------------------------
export const SENTIMENT_CHANNEL_KEYS = [
  "news",
  "reddit",
  "x",
  "instagram",
  "tiktok",
  "other",
] as const;
export type SentimentChannel = (typeof SENTIMENT_CHANNEL_KEYS)[number];

export const SENTIMENT_CHANNELS: Record<
  SentimentChannel,
  { label: string; icon: string; color: string }
> = {
  news: { label: "News", icon: "📰", color: "#64748b" },
  reddit: { label: "Reddit", icon: "👽", color: "#ff4500" },
  x: { label: "X", icon: "𝕏", color: "#0f172a" },
  instagram: { label: "Instagram", icon: "📷", color: "#c13584" },
  tiktok: { label: "TikTok", icon: "🎵", color: "#0f172a" },
  other: { label: "Social", icon: "💬", color: "#94a3b8" },
};

export const SENTIMENT_LEAN_KEYS = ["positive", "mixed", "negative"] as const;
export type SentimentLean = (typeof SENTIMENT_LEAN_KEYS)[number];

export const SENTIMENT_LEANS: Record<
  SentimentLean,
  { label: string; color: string }
> = {
  positive: { label: "Positive", color: "#34d399" },
  mixed: { label: "Mixed", color: "#fbbf24" },
  negative: { label: "Negative", color: "#f87171" },
};

// Human-readable publisher names for source links, keyed by bare hostname
// (leading "www." stripped). Anything not listed falls back to its cleaned
// hostname via sourceName() below.
const SOURCE_NAMES: Record<string, string> = {
  "advertisinglaw.fkks.com": "Frankfurt Kurnit",
  "authorsguild.org": "Authors Guild",
  "authorsalliance.org": "Authors Alliance",
  "blog.ericgoldman.org": "Eric Goldman Blog",
  "deadline.com": "Deadline",
  "dig.watch": "Digital Watch",
  "digiday.com": "Digiday",
  "news.bloomberglaw.com": "Bloomberg Law",
  "techcrunch.com": "TechCrunch",
  "therecord.media": "The Record",
  "ttms.com": "TTMS",
  "404media.co": "404 Media",
  "abajournal.com": "ABA Journal",
  "aljazeera.com": "Al Jazeera",
  "billboard.com": "Billboard",
  "cnbc.com": "CNBC",
  "cnn.com": "CNN",
  "dandodiary.com": "D&O Diary",
  "ftc.gov": "FTC",
  "goodwinlaw.com": "Goodwin",
  "musicbusinessworldwide.com": "Music Business Worldwide",
  "nbcnews.com": "NBC News",
  "npr.org": "NPR",
  "osborneclarke.com": "Osborne Clarke",
  "pymnts.com": "PYMNTS",
  "rappler.com": "Rappler",
  "route-fifty.com": "Route Fifty",
};

// Turn a source URL into a readable publisher name. Uses the curated map above
// when available, otherwise falls back to the bare hostname (e.g. "example.com").
export function sourceName(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return url;
  }
  const bare = host.replace(/^www\./, "");
  return SOURCE_NAMES[host] ?? SOURCE_NAMES[bare] ?? bare;
}

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
