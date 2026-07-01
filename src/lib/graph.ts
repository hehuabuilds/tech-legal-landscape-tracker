import type { Lawsuit } from "./schema";
import type { PlaintiffType, LawsuitStatus } from "./constants";

export type GraphNode = {
  id: string;
  kind: "company" | "plaintiff";
  label: string;
  x: number;
  y: number;
  plaintiffType?: PlaintiffType;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  status: LawsuitStatus;
  caseId: string;
  caseName: string;
};

const companyNodeId = (name: string) => `company:${name}`;
const plaintiffNodeId = (name: string) => `plaintiff:${name}`;

// Deterministic radial layout:
//  - AI companies (defendants) sit on an inner ring.
//  - The full circle is divided into one angular sector per company, sized by
//    how many distinct plaintiffs primarily target that company.
//  - Each company's plaintiffs fan out on an outer ring within that sector.
// A plaintiff that sues multiple companies is placed once (near its first
// defendant); its extra lawsuits simply become edges that cross sectors.
export function buildGraph(lawsuits: Lawsuit[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const companies = [...new Set(lawsuits.map((l) => l.defendant))];

  const plaintiffPrimaryCompany = new Map<string, string>();
  const plaintiffTypeByName = new Map<string, PlaintiffType>();
  for (const l of lawsuits) {
    if (!plaintiffPrimaryCompany.has(l.plaintiff)) {
      plaintiffPrimaryCompany.set(l.plaintiff, l.defendant);
    }
    plaintiffTypeByName.set(l.plaintiff, l.plaintiffType);
  }

  const plaintiffsByCompany = new Map<string, string[]>();
  companies.forEach((c) => plaintiffsByCompany.set(c, []));
  for (const [plaintiff, company] of plaintiffPrimaryCompany) {
    plaintiffsByCompany.get(company)!.push(plaintiff);
  }

  const weights = companies.map((c) =>
    Math.max(1, plaintiffsByCompany.get(c)!.length),
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const INNER_RADIUS = 340;
  const OUTER_RADIUS = 720;
  const nodes: GraphNode[] = [];

  let angle = -Math.PI / 2; // start at the top
  companies.forEach((company, i) => {
    const sector = (2 * Math.PI * weights[i]) / totalWeight;
    const mid = angle + sector / 2;

    nodes.push({
      id: companyNodeId(company),
      kind: "company",
      label: company,
      x: INNER_RADIUS * Math.cos(mid),
      y: INNER_RADIUS * Math.sin(mid),
    });

    const plaintiffs = plaintiffsByCompany.get(company)!;
    const k = plaintiffs.length;
    const pad = sector * 0.12;
    const start = angle + pad;
    const end = angle + sector - pad;

    plaintiffs.forEach((plaintiff, j) => {
      const t = k === 1 ? 0.5 : j / (k - 1);
      const pa = start + (end - start) * t;
      const r = OUTER_RADIUS + (j % 2) * 100; // stagger to reduce label overlap
      nodes.push({
        id: plaintiffNodeId(plaintiff),
        kind: "plaintiff",
        label: plaintiff,
        plaintiffType: plaintiffTypeByName.get(plaintiff),
        x: r * Math.cos(pa),
        y: r * Math.sin(pa),
      });
    });

    angle += sector;
  });

  const edges: GraphEdge[] = lawsuits.map((l) => ({
    id: `edge:${l.id}`,
    source: plaintiffNodeId(l.plaintiff),
    target: companyNodeId(l.defendant),
    status: l.status,
    caseId: l.id,
    caseName: l.name,
  }));

  return { nodes, edges };
}
