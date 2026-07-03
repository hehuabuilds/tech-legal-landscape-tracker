import type { Case } from "./schema";
import { statusAsOf } from "./filter";
import { deriveIssues, ISSUE_CLUSTERS, type IssueKey } from "./issues";
import {
  NODE_TYPES,
  EDGE_TYPES,
  STATUS_GLOW,
  GLOW_STYLES,
  SIMILARITY,
  type NodeType,
  type EdgeType,
  type GlowKind,
} from "./graphConfig";

export type GraphNode = {
  id: string;
  nodeType: NodeType;
  layer: 1 | 2 | 3;
  label: string;
  color: string;
  val: number;
  degree: number;
  firstAppear: string | null; // earliest connected filing date (timeline fade)
  // case-only
  caseId?: string;
  glowKind?: GlowKind;
  glowColor?: string;
  glowPulse?: boolean;
  // issue-only
  issueKey?: IssueKey;
};

export type GraphLink = {
  source: string;
  target: string;
  edgeType: EdgeType;
  color: string;
  width: number;
  weight: number;
};

export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const issueNodeId = (k: string) => `issue:${k}`;
export const caseNodeId = (id: string) => `case:${id}`;
export const entityNodeId = (name: string) => `entity:${slug(name)}`;
export const courtNodeId = (name: string) => `court:${slug(name)}`;
export const lawNodeId = (name: string) => `law:${slug(name)}`;

const ORG_RE =
  /\b(inc|llc|ltd|l\.?p|corp|co|group|guild|records|music|entertainment|society|gmbh|plc|labs|technologies|studios|holdings|company|union|sag-aftra|noyb|aclu|coalition|commission|department|office|attorneys? general|naag|riaa)\b/i;

// Map an entity party to a graph node type (color = type).
export function partyNodeType(category: string, name: string): NodeType {
  if (category === "governments" || category === "regulators") return "regulator";
  if (category === "ai_company" || category === "publishers" || category === "media")
    return "company";
  if (category === "class_action") return "individual";
  return ORG_RE.test(name) ? "company" : "individual";
}

function minDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}

export function buildGraphData(cases: Case[], asOf: string): GraphData {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const degree = new Map<string, number>();
  const bump = (id: string) => degree.set(id, (degree.get(id) ?? 0) + 1);

  const ensure = (
    id: string,
    nodeType: NodeType,
    label: string,
    firstAppear: string | null,
    extra: Partial<GraphNode> = {},
  ) => {
    const existing = nodes.get(id);
    if (existing) {
      existing.firstAppear = minDate(existing.firstAppear, firstAppear);
      return existing;
    }
    const meta = NODE_TYPES[nodeType];
    const n: GraphNode = {
      id,
      nodeType,
      layer: meta.layer,
      label,
      color: meta.color,
      val: meta.baseSize,
      degree: 0,
      firstAppear,
      ...extra,
    };
    nodes.set(id, n);
    return n;
  };

  const addLink = (source: string, target: string, edgeType: EdgeType, weight = 1) => {
    const e = EDGE_TYPES[edgeType];
    links.push({ source, target, edgeType, color: e.color, width: e.baseWidth, weight });
    bump(source);
    bump(target);
  };

  // ---- Build nodes + structural links ----
  for (const c of cases) {
    const issues = (c.issues as IssueKey[] | undefined) ?? deriveIssues(c);
    const eff = statusAsOf(c, asOf);
    const glowKind = STATUS_GLOW[eff] ?? "none";
    const glow = GLOW_STYLES[glowKind];

    const cid = caseNodeId(c.id);
    ensure(cid, "case", c.title, c.filingDate, {
      caseId: c.id,
      glowKind,
      glowColor: glow.color,
      glowPulse: glow.pulse,
    });

    // Issue clusters (layer 1)
    for (const k of issues) {
      const iid = issueNodeId(k);
      ensure(iid, "issue_cluster", ISSUE_CLUSTERS[k]?.label ?? k, c.filingDate, {
        issueKey: k,
      });
      addLink(iid, cid, "issue_case");
    }

    // Parties → company / individual / regulator (layer 3)
    for (const p of c.parties) {
      const t = partyNodeType(p.category, p.name);
      const eid = entityNodeId(p.name);
      ensure(eid, t, p.name, c.filingDate);
      addLink(cid, eid, "case_entity");
    }

    // Court (layer 3)
    if (c.court) {
      const courtId = courtNodeId(c.court);
      ensure(courtId, "court", c.court, c.filingDate);
      addLink(cid, courtId, "case_court");
    }

    // Laws / statutes (layer 3)
    for (const s of c.statutes ?? []) {
      const lid = lawNodeId(s);
      ensure(lid, "law", s, c.filingDate);
      addLink(cid, lid, "case_law");
    }
  }

  // ---- Related-case edges (weighted similarity, thresholded, capped) ----
  const feats = cases.map((c) => ({
    id: c.id,
    issues: new Set((c.issues as string[] | undefined) ?? deriveIssues(c)),
    init: new Set(c.parties.filter((p) => p.side === "initiating").map((p) => p.name)),
    resp: new Set(c.parties.filter((p) => p.side === "responding").map((p) => p.name)),
    court: c.court ?? null,
    statutes: new Set(c.statutes ?? []),
  }));
  const overlap = (a: Set<string>, b: Set<string>) => {
    let n = 0;
    for (const x of a) if (b.has(x)) n++;
    return n;
  };
  const w = SIMILARITY.weights;
  const candidates: Array<{ a: number; b: number; score: number }> = [];
  for (let i = 0; i < feats.length; i++) {
    for (let j = i + 1; j < feats.length; j++) {
      const A = feats[i];
      const B = feats[j];
      const score =
        overlap(A.issues, B.issues) * w.issue +
        overlap(A.resp, B.resp) * w.company +
        overlap(A.init, B.init) * w.plaintiff +
        (A.court && A.court === B.court ? w.court : 0) +
        overlap(A.statutes, B.statutes) * w.statute;
      if (score >= SIMILARITY.minScore) candidates.push({ a: i, b: j, score });
    }
  }
  // Cap edges per case to keep it readable/scalable.
  candidates.sort((x, y) => y.score - x.score);
  const perCase = new Map<number, number>();
  const used = new Set<string>();
  for (const cand of candidates) {
    if ((perCase.get(cand.a) ?? 0) >= SIMILARITY.maxPerCase) continue;
    if ((perCase.get(cand.b) ?? 0) >= SIMILARITY.maxPerCase) continue;
    const key = `${cand.a}-${cand.b}`;
    if (used.has(key)) continue;
    used.add(key);
    perCase.set(cand.a, (perCase.get(cand.a) ?? 0) + 1);
    perCase.set(cand.b, (perCase.get(cand.b) ?? 0) + 1);
    addLink(caseNodeId(feats[cand.a].id), caseNodeId(feats[cand.b].id), "related", cand.score);
  }

  // ---- Size by degree (importance) ----
  let maxDeg = 1;
  for (const d of degree.values()) if (d > maxDeg) maxDeg = d;
  for (const n of nodes.values()) {
    const deg = degree.get(n.id) ?? 0;
    n.degree = deg;
    const meta = NODE_TYPES[n.nodeType];
    n.val = meta.baseSize + meta.degreeBoost * Math.sqrt(deg / maxDeg);
  }

  return { nodes: [...nodes.values()], links };
}
