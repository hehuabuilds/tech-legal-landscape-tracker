// =============================================================================
// GRAPH THEME + BEHAVIOR CONFIG — single source of truth for the knowledge
// galaxy. Colors, node types, layers, sizing, status glow, force strengths,
// and level-of-detail are all data here, so the builder and renderer stay
// free of hardcoded if/else chains and the graph scales.
// =============================================================================

// ---- Node types (color = TYPE, never status) -------------------------------
export type NodeType =
  | "issue_cluster"
  | "case"
  | "company"
  | "individual"
  | "court"
  | "law"
  | "regulator"
  | "event";

export const NODE_TYPES: Record<
  NodeType,
  {
    label: string;
    color: string;
    layer: 1 | 2 | 3;
    baseSize: number; // minimum node radius
    degreeBoost: number; // extra radius per (normalized degree) — importance
  }
> = {
  issue_cluster: { label: "Issue cluster", color: "#a855f7", layer: 1, baseSize: 13, degreeBoost: 6 },
  case: { label: "Case / action", color: "#3b82f6", layer: 2, baseSize: 3.5, degreeBoost: 7 },
  company: { label: "Company / org", color: "#22c55e", layer: 3, baseSize: 2.5, degreeBoost: 8 },
  individual: { label: "Individual", color: "#2dd4bf", layer: 3, baseSize: 2, degreeBoost: 4 },
  court: { label: "Court", color: "#f97316", layer: 3, baseSize: 2.5, degreeBoost: 6 },
  law: { label: "Law / regulation", color: "#eab308", layer: 3, baseSize: 2.5, degreeBoost: 7 },
  regulator: { label: "Regulator / government", color: "#ef4444", layer: 3, baseSize: 3, degreeBoost: 7 },
  event: { label: "Timeline event", color: "#ffffff", layer: 3, baseSize: 1.5, degreeBoost: 0 },
};

// ---- Status → GLOW (status changes glow, not node color) --------------------
export type GlowKind = "ongoing" | "filed" | "settled" | "won_ai" | "lost_ai" | "appealed" | "none";

export const GLOW_STYLES: Record<GlowKind, { color: string; pulse: boolean }> = {
  ongoing: { color: "#60a5fa", pulse: true }, // soft blue pulse
  filed: { color: "#ffffff", pulse: true }, // white pulse
  settled: { color: "#94a3b8", pulse: false }, // dim grey glow
  won_ai: { color: "#22c55e", pulse: false }, // green glow
  lost_ai: { color: "#ef4444", pulse: false }, // red glow
  appealed: { color: "#f97316", pulse: false }, // orange glow
  none: { color: "#334155", pulse: false },
};

// Map our data statuses onto a glow kind. Direction (won/lost by AI) is only
// asserted where it is unambiguous from the data; otherwise stays neutral.
export const STATUS_GLOW: Record<string, GlowKind> = {
  sued: "filed",
  pending: "ongoing",
  investigation: "ongoing",
  enforcement_action: "ongoing",
  dismissed: "won_ai", // case dismissed → AI defendant prevailed
  settled: "settled",
  licensing_agreement: "settled",
  appealed: "appealed",
  judgment: "lost_ai", // a merits judgment in this dataset generally ran against the AI co.
  needs_review: "none",
};

// ---- Edge types + force strengths -------------------------------------------
export type EdgeType = "issue_case" | "case_entity" | "case_court" | "case_law" | "related";

export const EDGE_TYPES: Record<
  EdgeType,
  { color: string; strength: number; distance: number; baseWidth: number }
> = {
  issue_case: { color: "#7c3aed", strength: 0.9, distance: 34, baseWidth: 0.7 }, // STRONG
  case_entity: { color: "#334155", strength: 0.35, distance: 26, baseWidth: 0.4 }, // MEDIUM
  case_court: { color: "#b45309", strength: 0.3, distance: 26, baseWidth: 0.4 },
  case_law: { color: "#a16207", strength: 0.3, distance: 28, baseWidth: 0.4 },
  related: { color: "#475569", strength: 0.05, distance: 90, baseWidth: 0.3 }, // WEAK
};

// Charge (repulsion) per node type — issue clusters push hard apart so each
// becomes its own local galaxy instead of one blob.
export const CHARGE_BY_TYPE: Record<NodeType, number> = {
  issue_cluster: -520,
  case: -55,
  company: -28,
  individual: -16,
  court: -22,
  law: -22,
  regulator: -30,
  event: -10,
};

// ---- Level of detail: which layers are visible by camera distance -----------
// Every node stays visible at any zoom level; the thresholds are effectively
// unbounded so layer-3 entities (companies, people, courts, laws, regulators)
// never disappear when the camera is far away. (Kept as data so the progressive
// reveal machinery still works if we ever want to re-enable distance culling.)
const ALWAYS = Number.POSITIVE_INFINITY;
export const LOD = {
  hideL3Beyond: ALWAYS,
  reveal: [
    { within: ALWAYS, types: ["regulator", "company"] as NodeType[] },
    { within: ALWAYS, types: ["court", "law"] as NodeType[] },
    { within: ALWAYS, types: ["individual", "event"] as NodeType[] },
  ],
} as const;

// ---- Related-case similarity weights ---------------------------------------
export const SIMILARITY = {
  weights: { issue: 1.0, company: 1.4, plaintiff: 1.2, court: 0.8, statute: 1.0 },
  minScore: 1.6, // only render meaningful relationships
  maxPerCase: 3, // cap edges per case for scale
};

export const HIGHLIGHT = {
  dimOpacity: 0.08,
  fadeOpacity: 0.14,
};
