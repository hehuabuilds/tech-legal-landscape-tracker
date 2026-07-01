"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/lib/graph";

// react-force-graph-3d touches window/WebGL at import time, so it must be
// client-only. Typed loosely on purpose — its generics fight `dynamic()` and
// we need to pass a ref plus many accessor props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

type Props = {
  data: GraphData;
  selectedNodeId: string | null;
  onSelectCase: (caseId: string | null) => void;
};

export default function ForceGraphView({
  data,
  selectedNodeId,
  onSelectCase,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  // Measure container so the WebGL canvas fills it and stays responsive.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const nodeLabel = useMemo(
    () => (node: GraphNode) => {
      const kind = node.kind === "case" ? "Case / action" : "Entity";
      return `<div style="font:12px sans-serif;color:#e2e8f0;background:#0b1020cc;border:1px solid #334155;border-radius:6px;padding:4px 8px;max-width:260px">
        <div style="font-weight:600">${escapeHtml(node.label)}</div>
        <div style="color:#94a3b8;font-size:11px">${kind}</div>
      </div>`;
    },
    [],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (node: any) => {
    // Focus the camera on the clicked node (double-click also works via orbit).
    if (fgRef.current && typeof node.x === "number") {
      const dist = 140;
      const hyp = Math.hypot(node.x, node.y, node.z) || 1;
      const r = 1 + dist / hyp;
      fgRef.current.cameraPosition(
        { x: node.x * r, y: node.y * r, z: node.z * r },
        node,
        1200,
      );
    }
    onSelectCase(node.kind === "case" ? (node.caseId ?? null) : null);
  };

  return (
    <div
      ref={wrapRef}
      className="h-[640px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#05060d]"
    >
      <ForceGraph3D
        ref={fgRef}
        width={size.w}
        height={size.h}
        graphData={data}
        backgroundColor="#05060d"
        showNavInfo={false}
        controlType="orbit"
        nodeLabel={nodeLabel}
        nodeVal={(n: GraphNode) => n.val}
        nodeColor={(n: GraphNode) =>
          selectedNodeId && n.caseId === selectedNodeId ? "#ffffff" : n.color
        }
        nodeOpacity={0.95}
        nodeResolution={12}
        linkColor={(l: { color?: string }) => l.color ?? "#334155"}
        linkOpacity={0.35}
        linkWidth={0.5}
        linkDirectionalArrowLength={2.5}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={0}
        enableNodeDrag={true}
        onNodeClick={handleNodeClick}
        onBackgroundClick={() => onSelectCase(null)}
        cooldownTicks={120}
        warmupTicks={20}
      />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
