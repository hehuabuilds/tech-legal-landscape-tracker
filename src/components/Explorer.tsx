"use client";

import { useMemo, useState } from "react";
import Filters from "./Filters";
import TimelineSlider from "./TimelineSlider";
import DetailPanel from "./DetailPanel";
import DataTable from "./DataTable";
import Legend from "./Legend";
import ForceGraphView from "./ForceGraphView";
import {
  applyFilters,
  defaultFilterState,
  type FilterState,
} from "@/lib/filter";
import { buildGraphData } from "@/lib/graph";
import type { Case } from "@/lib/schema";

export default function Explorer({
  cases,
  jurisdictions,
  today,
}: {
  cases: Case[];
  jurisdictions: string[];
  today: string;
}) {
  const [filters, setFilters] = useState<FilterState>(() =>
    defaultFilterState(today),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => applyFilters(cases, filters),
    [cases, filters],
  );
  const graphData = useMemo(
    () => buildGraphData(filtered, filters.asOfDate),
    [filtered, filters.asOfDate],
  );
  const selected = useMemo(
    () => (selectedId ? (cases.find((c) => c.id === selectedId) ?? null) : null),
    [cases, selectedId],
  );

  return (
    <div className="space-y-4">
      <Filters
        filters={filters}
        jurisdictions={jurisdictions}
        resultCount={filtered.length}
        totalCount={cases.length}
        onChange={setFilters}
        onReset={() => {
          setFilters(defaultFilterState(today));
          setSelectedId(null);
        }}
      />

      <Legend />

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <ForceGraphView
            data={graphData}
            selectedNodeId={selectedId}
            onSelectCase={setSelectedId}
          />
        </div>
        {selected && (
          <div className="h-[640px] w-full shrink-0 lg:w-96">
            <DetailPanel
              c={selected}
              asOfDate={filters.asOfDate}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      <TimelineSlider
        asOfDate={filters.asOfDate}
        today={today}
        onChange={(date) => setFilters((f) => ({ ...f, asOfDate: date }))}
      />

      <DataTable
        cases={filtered}
        asOfDate={filters.asOfDate}
        onSelectCase={setSelectedId}
      />
    </div>
  );
}
