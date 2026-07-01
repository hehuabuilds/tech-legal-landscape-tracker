import { PLAINTIFF_TYPES, STATUSES, PLAINTIFF_TYPE_KEYS, STATUS_KEYS } from "@/lib/constants";

export default function Legend() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs sm:flex-row sm:gap-8">
      <div>
        <p className="mb-2 font-semibold text-slate-700">
          Plaintiff type (node color)
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {PLAINTIFF_TYPE_KEYS.map((k) => (
            <li key={k} className="flex items-center gap-1.5 text-slate-600">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: PLAINTIFF_TYPES[k].color }}
              />
              {PLAINTIFF_TYPES[k].label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 font-semibold text-slate-700">
          Case status (edge label)
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {STATUS_KEYS.map((k) => (
            <li key={k} className="flex items-center gap-1.5 text-slate-600">
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
