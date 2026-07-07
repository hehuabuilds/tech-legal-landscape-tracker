import Explorer from "@/components/Explorer";
import { getCases, getJurisdictions, getStats, getToday } from "@/lib/data";

// Render on every request so "today" and live statistics stay up to date.
export const dynamic = "force-dynamic";

export default function Home() {
  const cases = getCases();
  const jurisdictions = getJurisdictions(cases);
  const stats = getStats(cases);
  const today = getToday();

  return (
    <main className="min-h-screen bg-[#f1f1f2] text-zinc-800">
      <div className="relative mx-auto max-w-[1400px] px-6 py-8 sm:px-10 lg:px-14">
        <header className="mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-[#e76a5e] sm:text-4xl">
              Legal Landscape Tracker (AI &amp; Tech)
            </h1>

            <div className="mt-2 max-w-4xl text-sm leading-relaxed text-zinc-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-zinc-700">
                  {stats.total} cases · {stats.entities} entities ·{" "}
                  {stats.companies} companies
                </span>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#1ac299]/30 bg-[#1ac299]/10 px-2 py-0.5 text-[11px] font-medium text-[#0f9b7a]">
                  <span className="animate-pulse text-[10px] leading-none text-[#1ac299]">
                    ✶
                  </span>
                  Live
                </span>
              </div>

              <p className="mt-1">
                A living, source-backed map of AI and technology legal disputes,
                regulatory actions, investigations, and settlements from January
                1, 2025 onwards.
              </p>
            </div>
          </div>
        </header>

        <Explorer
          cases={cases}
          jurisdictions={jurisdictions}
          today={today}
        />

        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
          Data compiled from public court dockets, regulatory publications, and
          reputable news reporting. Every record is cross-verified where
          possible. Historical records are preserved while case statuses evolve
          over time. Corrections should be supported by primary sources.
        </footer>
      </div>
    </main>
  );
}

