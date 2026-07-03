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
  const [showDetails, setShowDetails] = useState(false);

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

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4">
              <Legend />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="accent-[#e76a5e]"
                />
                Show details (reveal companies, people, courts, laws)
              </label>
            </div>
            <ForceGraphView
              data={graphData}
              selectedCaseId={selectedId}
              showDetails={showDetails}
              onSelectCase={setSelectedId}
            />
            <div className="border-t border-zinc-200">
              <TimelineSlider
                asOfDate={filters.asOfDate}
                today={today}
                onChange={(date) => setFilters((f) => ({ ...f, asOfDate: date }))}
              />
            </div>
          </div>
        </div>
        {selected && (
          <div className="w-full shrink-0 lg:relative lg:w-96">
            {/* On desktop the panel is absolutely positioned so its (possibly
                tall) content doesn't stretch the row — the row height is driven
                by the left column, and the panel fills it and scrolls inside.
                On mobile it just flows at its natural height. */}
            <div className="lg:absolute lg:inset-0">
              <DetailPanel
                c={selected}
                asOfDate={filters.asOfDate}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </div>
        )}
      </div>

      <DataTable
        cases={filtered}
        asOfDate={filters.asOfDate}
        onSelectCase={setSelectedId}
      />
    </div>
  );
}
