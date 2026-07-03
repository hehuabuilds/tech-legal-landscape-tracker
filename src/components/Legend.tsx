import { NODE_TYPES, type NodeType } from "@/lib/graphConfig";

const ORDER: NodeType[] = [
  "issue_cluster",
  "case",
  "company",
  "individual",
  "regulator",
  "court",
  "law",
];

export default function Legend() {
  return (
    <div className="text-xs">
      <p className="mb-2 font-semibold text-zinc-700">
        Node type <span className="font-normal text-zinc-400">(color = type; status shown by glow)</span>
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {ORDER.map((k) => (
          <li key={k} className="flex items-center gap-1.5 text-zinc-600">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: NODE_TYPES[k].color }}
            />
            {NODE_TYPES[k].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
