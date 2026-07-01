import type { Case } from "./schema";
import type { EntityCategory, Status } from "./constants";
import { ENTITY_CATEGORIES, STATUSES } from "./constants";
import { statusAsOf } from "./filter";

export type GraphNode = {
  id: string;
  kind: "entity" | "case";
  label: string;
  color: string;
  val: number; // relative size for the force graph
  // entity-only
  category?: EntityCategory;
  // case-only
  caseId?: string;
  status?: Status;
  caseType?: string;
  actionType?: string;
};

export type GraphLink = {
  source: string;
  target: string;
  color: string;
  side: "initiating" | "responding";
};

export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const entityNodeId = (name: string) => `entity:${slug(name)}`;
export const caseNodeId = (caseId: string) => `case:${caseId}`;

// Bipartite graph: entity nodes <-> case nodes.
//  - initiating party:  entity --> case   (flow points into the case)
//  - responding party:  case   --> entity (flow points at the target)
// Case node + its links are colored by the case's status AS OF `asOf`.
export function buildGraphData(cases: Case[], asOf: string): GraphData {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  for (const c of cases) {
    const effStatus = statusAsOf(c, asOf);
    const statusColor = STATUSES[effStatus].color;

    const cid = caseNodeId(c.id);
    nodes.set(cid, {
      id: cid,
      kind: "case",
      label: c.title,
      color: statusColor,
      val: 3,
      caseId: c.id,
      status: effStatus,
      caseType: c.caseType,
      actionType: c.actionType,
    });

    for (const p of c.parties) {
      const eid = entityNodeId(p.name);
      if (!nodes.has(eid)) {
        const meta = ENTITY_CATEGORIES[p.category];
        nodes.set(eid, {
          id: eid,
          kind: "entity",
          label: p.name,
          color: meta.color,
          val: meta.size,
          category: p.category,
        });
      }
      if (p.side === "initiating") {
        links.push({ source: eid, target: cid, color: statusColor, side: p.side });
      } else {
        links.push({ source: cid, target: eid, color: statusColor, side: p.side });
      }
    }
  }

  return { nodes: [...nodes.values()], links };
}
