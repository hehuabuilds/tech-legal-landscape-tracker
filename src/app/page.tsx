import GraphView from "@/components/GraphView";
import DataTable from "@/components/DataTable";
import Legend from "@/components/Legend";
import { getLawsuits, getStats } from "@/lib/data";

export default function Home() {
  const lawsuits = getLawsuits();
  const stats = getStats(lawsuits);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Copyright Lawsuit Map
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            An interactive map of copyright lawsuits against AI companies.
            Central nodes are AI companies (defendants); surrounding nodes are
            plaintiffs, colored by type. Each edge is a lawsuit labeled with its
            status. Every case links to at least one source — this is an
            informational tracker, not legal advice.
          </p>
        </header>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Cases", value: stats.total },
            { label: "AI companies", value: stats.companies },
            { label: "Plaintiffs", value: stats.plaintiffs },
            { label: "Verified", value: stats.verified },
            { label: "Needs review", value: stats.needsReview },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </section>

        <div className="mb-4">
          <Legend />
        </div>

        {/* Graph */}
        <section className="mb-8">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Network map</h2>
            <p className="text-xs text-slate-500">
              Drag nodes to rearrange · click an edge for case details &amp;
              sources
            </p>
          </div>
          <GraphView lawsuits={lawsuits} />
        </section>

        {/* Table */}
        <section className="mb-10">
          <h2 className="mb-2 text-lg font-semibold">All cases</h2>
          <DataTable lawsuits={lawsuits} />
        </section>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          Data compiled from public court dockets (CourtListener) and news
          reporting. Statuses reflect the last recorded update and may lag
          ongoing litigation. Contributions and corrections should be
          source-backed.
        </footer>
      </div>
    </main>
  );
}
