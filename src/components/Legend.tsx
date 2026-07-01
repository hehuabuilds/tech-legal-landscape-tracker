import {
  ENTITY_CATEGORY_KEYS,
  ENTITY_CATEGORIES,
  STATUS_KEYS,
  STATUSES,
} from "@/lib/constants";

export default function Legend() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs sm:flex-row sm:gap-8">
      <div>
        <p className="mb-2 font-semibold text-slate-300">
          Entity type (node color)
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {ENTITY_CATEGORY_KEYS.map((k) => (
            <li key={k} className="flex items-center gap-1.5 text-slate-400">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: ENTITY_CATEGORIES[k].color }}
              />
              {ENTITY_CATEGORIES[k].label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 font-semibold text-slate-300">
          Status (case node &amp; edge color)
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {STATUS_KEYS.map((k) => (
            <li key={k} className="flex items-center gap-1.5 text-slate-400">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: STATUSES[k].color }}
              />
              {STATUSES[k].label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
