"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { buildGraph } from "@/lib/graph";
import { PLAINTIFF_TYPES, STATUSES } from "@/lib/constants";
import type { Lawsuit } from "@/lib/schema";

const hiddenHandle = { opacity: 0, width: 1, height: 1 } as const;

function CompanyNode({ data }: NodeProps) {
  const label = (data as { label: string }).label;
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 px-2 text-center text-sm font-semibold text-white shadow-lg">
      <Handle type="target" position={Position.Top} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} style={hiddenHandle} />
      {label}
    </div>
  );
}

function PlaintiffNode({ data }: NodeProps) {
  const d = data as { label: string; color: string; typeLabel: string };
  return (
    <div
      className="flex max-w-[170px] items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm"
      style={{ borderColor: d.color, borderWidth: 2 }}
      title={d.typeLabel}
    >
      <Handle type="target" position={Position.Top} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} style={hiddenHandle} />
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: d.color }}
      />
      <span className="truncate">{d.label}</span>
    </div>
  );
}

const nodeTypes = { company: CompanyNode, plaintiff: PlaintiffNode };

export default function GraphView({ lawsuits }: { lawsuits: Lawsuit[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const g = buildGraph(lawsuits);

    const rfNodes: Node[] = g.nodes.map((n) => {
      if (n.kind === "company") {
        return {
          id: n.id,
          type: "company",
          position: { x: n.x, y: n.y },
          data: { label: n.label },
          draggable: true,
        };
      }
      const meta = n.plaintiffType
        ? PLAINTIFF_TYPES[n.plaintiffType]
        : { color: "#94a3b8", label: "Unknown" };
      return {
        id: n.id,
        type: "plaintiff",
        position: { x: n.x, y: n.y },
        data: { label: n.label, color: meta.color, typeLabel: meta.label },
        draggable: true,
      };
    });

    const rfEdges: Edge[] = g.edges.map((e) => {
      const color = STATUSES[e.status].color;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: STATUSES[e.status].label,
        labelStyle: { fill: color, fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.85 },
        labelBgPadding: [3, 1] as [number, number],
        style: { stroke: color, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color },
        data: { caseId: e.caseId },
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [lawsuits]);

  const onEdgeClick = useCallback<EdgeMouseHandler>((_, edge) => {
    const caseId = (edge.data as { caseId?: string } | undefined)?.caseId;
    setSelectedId(caseId ?? null);
  }, []);

  const selected = useMemo(
    () => lawsuits.find((l) => l.id === selectedId) ?? null,
    [lawsuits, selectedId],
  );

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onEdgeClick={onEdgeClick}
        onPaneClick={() => setSelectedId(null)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={24} />
        <Controls showInteractive={false} />
        <MiniMap
          zoomable
          pannable
          nodeColor={(n) =>
            n.type === "company"
              ? "#1e293b"
              : ((n.data as { color?: string })?.color ?? "#94a3b8")
          }
        />
      </ReactFlow>

      {selected && (
        <div className="absolute right-3 top-3 z-10 w-80 max-w-[calc(100%-1.5rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {selected.name}
            </h3>
            <button
              onClick={() => setSelectedId(null)}
              className="shrink-0 rounded px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <dl className="mt-2 space-y-1 text-xs text-slate-600">
            <div>
              <span className="font-medium text-slate-800">
                {selected.plaintiff}
              </span>{" "}
              vs{" "}
              <span className="font-medium text-slate-800">
                {selected.defendant}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-medium text-white"
                style={{ backgroundColor: STATUSES[selected.status].color }}
              >
                {STATUSES[selected.status].label}
              </span>
              {!selected.verified && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                  needs review
                </span>
              )}
              {selected.category && <span>· {selected.category}</span>}
            </div>
            {selected.filingDate && <div>Filed: {selected.filingDate}</div>}
            {selected.court && <div>Court: {selected.court}</div>}
            {selected.notes && (
              <p className="pt-1 leading-relaxed text-slate-500">
                {selected.notes}
              </p>
            )}
          </dl>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="text-xs font-medium text-slate-700">Sources</p>
            <ul className="mt-1 space-y-1">
              {selected.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800"
                  >
                    {s.label || s.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
