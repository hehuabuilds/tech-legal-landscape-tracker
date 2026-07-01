import Explorer from "@/components/Explorer";
import { getCases, getJurisdictions, getStats, getToday } from "@/lib/data";

// Live tracker: render at request time so "today" and the as-of window are current.
export const dynamic = "force-dynamic";

export default function Home() {
  const cases = getCases();
  const jurisdictions = getJurisdictions(cases);
  const stats = getStats(cases);
  const today = getToday();

  return (
    <main className="min-h-screen bg-[#05060d] text-slate-200">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <header className="mb-6">
          <h1 className="bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            AI Legal Landscape Tracker
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            A living, source-backed map of AI-related legal cases and actions
            from Jan 1 2025 onward — lawsuits, regulatory actions, investigations
            and settlements. AI companies are central nodes; plaintiffs,
            regulators and other parties orbit them; edges are cases colored by
            status. Informational only — not legal advice.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Cases / actions", value: stats.total },
            { label: "AI companies", value: stats.companies },
            { label: "Entities", value: stats.entities },
            { label: "Verified", value: stats.verified },
            { label: "Needs review", value: stats.needsReview },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </section>

        <Explorer cases={cases} jurisdictions={jurisdictions} today={today} />

        <footer className="mt-10 border-t border-slate-800 pt-4 text-xs text-slate-500">
          Data compiled from public court dockets, regulator publications and
          news reporting. Every record links to at least one source. Historical
          records are preserved; statuses evolve along the timeline. Corrections
          should be source-backed.
        </footer>
      </div>
    </main>
  );
}
