"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/lib/graph";
import {
  EDGE_TYPES,
  CHARGE_BY_TYPE,
  LOD,
  NODE_TYPES,
  type NodeType,
} from "@/lib/graphConfig";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// Distance (camera->center) at/under which each layer-3 type becomes visible.
const TYPE_REVEAL: Partial<Record<NodeType, number>> = {};
for (const tier of LOD.reveal) for (const t of tier.types) {
  TYPE_REVEAL[t] = Math.max(TYPE_REVEAL[t] ?? 0, tier.within);
}

const BG = "#0a1024"; // deep navy galaxy background
const DIM = "#d4d4d8"; // faded (non-highlighted) node color

type Props = {
  data: GraphData;
  selectedCaseId: string | null;
  showDetails: boolean;
  onSelectCase: (caseId: string | null) => void;
};

export default function ForceGraphView({
  data,
  selectedCaseId,
  showDetails,
  onSelectCase,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 640 });
  const [camDist, setCamDist] = useState(900);
  const [highlight, setHighlight] = useState<Set<string> | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  // id -> node and adjacency, rebuilt when the (filtered) graph changes.
  const { byId, adj } = useMemo(() => {
    const byId = new Map<string, GraphNode>();
    for (const n of data.nodes) byId.set(n.id, n);
    const adj = new Map<string, Set<string>>();
    const link = (a: string, b: string) => {
      (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
    };
    for (const l of data.links) {
      const s = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
      link(s, t);
      link(t, s);
    }
    return { byId, adj };
  }, [data]);

  // Preserve node positions across rebuilds. When the graph is recomputed
  // (e.g. scrubbing the timeline), reuse the previous node object for each id so
  // react-force-graph keeps its simulation x/y/z/velocity and the layout stays
  // put instead of re-annealing from scratch. Only genuinely new nodes start
  // unpositioned and ease in; data fields (val/color/glow/label) are refreshed.
  const posRef = useRef<Map<string, GraphNode>>(new Map());
  const stableData = useMemo(() => {
    const prev = posRef.current;
    const next = new Map<string, GraphNode>();
    const nodes = data.nodes.map((n) => {
      const old = prev.get(n.id);
      const node = old ? Object.assign(old, n) : n;
      next.set(n.id, node);
      return node;
    });
    posRef.current = next;
    return { nodes, links: data.links };
  }, [data]);

  // Reset interaction state whenever the underlying graph changes.
  useEffect(() => {
    setHighlight(null);
    setRevealed(new Set());
  }, [data]);

  // Measure container.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Configure forces from config (galaxy clustering). The force accessors are
  // (cheaply) re-applied whenever the data changes, but we only *reheat* the
  // simulation when the graph topology actually changes — adding/removing nodes
  // or links. Scrubbing the timeline mostly just refreshes node status/size, so
  // this keeps the layout from churning on every slider tick.
  const topoRef = useRef("");
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    try {
      fg.d3Force("link")
        ?.strength((l: { edgeType?: keyof typeof EDGE_TYPES }) =>
          l.edgeType ? EDGE_TYPES[l.edgeType].strength : 0.2,
        )
        .distance((l: { edgeType?: keyof typeof EDGE_TYPES }) =>
          l.edgeType ? EDGE_TYPES[l.edgeType].distance : 40,
        );
      fg.d3Force("charge")?.strength((n: GraphNode) => CHARGE_BY_TYPE[n.nodeType] ?? -30);
      const topo = `${data.nodes.length}:${data.links.length}`;
      if (topo !== topoRef.current) {
        fg.d3ReheatSimulation?.();
        topoRef.current = topo;
      }
    } catch {
      /* force API not ready — defaults are fine */
    }
  }, [data]);

  // Track camera distance for level-of-detail. Polled on a timer so we never
  // touch the controls/camera before react-force-graph has initialised them.
  useEffect(() => {
    const id = setInterval(() => {
      const fg = fgRef.current;
      const cam = fg?.camera?.();
      const p = cam?.position;
      if (p && typeof p.x === "number") setCamDist(Math.hypot(p.x, p.y, p.z));
    }, 350);
    return () => clearInterval(id);
  }, []);

  // Glowing starfield in the 3D scene, behind the graph. Two spherical shells
  // (dim/far + bright/near) of additive round sprites give soft glow with real
  // depth, so nodes occlude the stars behind them. Added once the THREE scene
  // is ready; a slow drift + gentle twinkle keeps it alive. The camera far
  // plane is pushed out so the outer shell isn't clipped.
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let group: import("three").Group | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nearMat: any = null;

    const build = async () => {
      const fg = fgRef.current;
      const scene = fg?.scene?.();
      const cam = fg?.camera?.();
      if (!scene || !cam) return false;

      const THREE = await import("three");
      if (cancelled) return true;

      // Soft round glow sprite so points read as stars, not squares.
      const cvs = document.createElement("canvas");
      cvs.width = cvs.height = 64;
      const ctx = cvs.getContext("2d")!;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(255,255,255,0.85)");
      g.addColorStop(0.5, "rgba(255,255,255,0.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      const sprite = new THREE.CanvasTexture(cvs);

      const shell = (
        count: number,
        rMin: number,
        rMax: number,
        size: number,
        opacity: number,
        color: number,
      ) => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const r = rMin + (rMax - rMin) * Math.random();
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i * 3 + 2] = r * Math.cos(phi);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
          color,
          size,
          map: sprite,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });
        return new THREE.Points(geo, mat);
      };

      group = new THREE.Group();
      group.name = "starfield";
      group.add(shell(1300, 2600, 4200, 34, 0.34, 0xaec2ff)); // far, dim, cool
      const near = shell(320, 1500, 2400, 46, 0.58, 0xffffff); // near, bright
      nearMat = near.material;
      group.add(near);
      // Extra ambient light so the graph nodes read much brighter/more vivid
      // against the deep-navy backdrop (adds flat illumination to every node).
      group.add(new THREE.AmbientLight(0xffffff, 2.6));
      scene.add(group);

      // Make sure the outer shell is within the view frustum.
      if (cam.far < 9000) {
        cam.far = 9000;
        cam.updateProjectionMatrix();
      }

      let t = 0;
      const animate = () => {
        t += 1;
        if (group) group.rotation.y += 0.00012;
        if (nearMat) nearMat.opacity = 0.5 + 0.1 * Math.sin(t * 0.018);
        raf = requestAnimationFrame(animate);
      };
      animate();
      return true;
    };

    const id = setInterval(async () => {
      if (await build()) clearInterval(id);
    }, 300);

    return () => {
      cancelled = true;
      clearInterval(id);
      if (raf) cancelAnimationFrame(raf);
      const scene = fgRef.current?.scene?.();
      if (group && scene) scene.remove(group);
    };
  }, []);

  const nodeVisible = useCallback(
    (n: GraphNode) => {
      if (n.layer <= 2) return true; // issues + cases always visible
      if (showDetails || revealed.has(n.id)) return true;
      const thr = TYPE_REVEAL[n.nodeType] ?? LOD.hideL3Beyond;
      return camDist <= thr;
    },
    [showDetails, revealed, camDist],
  );

  const nodeColor = useCallback(
    (n: GraphNode) => (highlight && !highlight.has(n.id) ? DIM : n.color),
    [highlight],
  );

  const nodeVal = useCallback((n: GraphNode) => n.val, []);

  const nodeLabel = useCallback((n: GraphNode) => {
    return `<div style="font-family:var(--font-sans);font-size:12px;color:#18181b;background:#ffffffee;border:1px solid rgba(0,0,0,0.35);border-radius:8px;padding:4px 8px;max-width:280px;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
      <div style="font-weight:600">${esc(n.label)}</div>
      <div style="color:#71717a;font-size:11px">${NODE_TYPES[n.nodeType].label}</div>
    </div>`;
  }, []);

  const flyTo = useCallback((n: GraphNode & { x?: number; y?: number; z?: number }) => {
    if (!fgRef.current || typeof n.x !== "number") return;
    const dist = 90 + (n.val ?? 4) * 6;
    const hyp = Math.hypot(n.x, n.y!, n.z!) || 1;
    const r = 1 + dist / hyp;
    fgRef.current.cameraPosition(
      { x: n.x * r, y: n.y! * r, z: n.z! * r },
      { x: n.x, y: n.y, z: n.z },
      1200,
    );
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onNodeClick = useCallback(
    (node: any) => {
      const n = node as GraphNode;
      const neighbors = adj.get(n.id) ?? new Set<string>();

      if (n.nodeType === "case") {
        // Reveal this case's supporting entities + highlight its neighborhood.
        const hs = new Set<string>([n.id, ...neighbors]);
        const rev = new Set<string>();
        for (const nb of neighbors) if ((byId.get(nb)?.layer ?? 2) === 3) rev.add(nb);
        setHighlight(hs);
        setRevealed(rev);
        onSelectCase(n.caseId ?? null);
      } else if (n.nodeType === "issue_cluster") {
        // Highlight connected cases, fade the rest.
        setHighlight(new Set<string>([n.id, ...neighbors]));
        setRevealed(new Set());
        onSelectCase(null);
      } else {
        // Entity (company/individual/court/law/regulator): highlight every
        // connected case across the whole graph.
        setHighlight(new Set<string>([n.id, ...neighbors]));
        setRevealed(new Set());
        onSelectCase(null);
      }
      flyTo(n);
    },
    [adj, byId, onSelectCase, flyTo],
  );

  const linkColor = useCallback(
    (l: { source?: GraphNode | string; target?: GraphNode | string; color?: string }) => {
      if (!highlight) return l.color ?? "#d4d4d899";
      const s = typeof l.source === "string" ? l.source : (l.source as GraphNode)?.id;
      const t = typeof l.target === "string" ? l.target : (l.target as GraphNode)?.id;
      return highlight.has(s!) && highlight.has(t!) ? (l.color ?? "#a1a1aa") : "#ededed";
    },
    [highlight],
  );

  return (
    <div
      ref={wrapRef}
      className="relative h-[640px] w-full overflow-hidden bg-[#0a1024]"
    >
      <ForceGraph3D
        ref={fgRef}
        width={size.w}
        height={size.h}
        graphData={stableData}
        backgroundColor={BG}
        showNavInfo={false}
        controlType="orbit"
        nodeLabel={nodeLabel}
        nodeVal={nodeVal}
        nodeColor={nodeColor}
        nodeVisibility={nodeVisible}
        nodeOpacity={1}
        nodeResolution={12}
        linkColor={linkColor}
        linkWidth={(l: { width?: number }) => l.width ?? 0.4}
        linkOpacity={0.5}
        enableNodeDrag={true}
        onNodeClick={onNodeClick}
        onBackgroundClick={() => {
          setHighlight(null);
          setRevealed(new Set());
          onSelectCase(null);
        }}
        cooldownTicks={140}
        warmupTicks={30}
      />
      {/* Depth overlay: a gentle sky gradient, a soft central light bloom and a
          feathered edge vignette so the backdrop reads as lit, deep space.
          Kept subtle/natural and non-interactive so it never blocks the graph. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            // faint cool light blooming from upper-centre
            "radial-gradient(75% 60% at 50% 32%, rgba(120,150,255,0.10), transparent 62%)",
            // top-to-bottom atmosphere: a touch lighter up high, deeper below
            "linear-gradient(to bottom, rgba(30,44,86,0.22), transparent 26%, transparent 68%, rgba(4,8,20,0.45))",
            // soft feathered vignette
            "radial-gradient(135% 110% at 50% 42%, transparent 58%, rgba(3,7,18,0.6) 100%)",
          ].join(","),
        }}
      />
      {/* selection hint */}
      {selectedCaseId && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-zinc-200 bg-white/90 px-2 py-1 text-[11px] text-zinc-600 shadow-sm backdrop-blur">
          Case selected · click empty space to reset
        </div>
      )}
    </div>
  );
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
