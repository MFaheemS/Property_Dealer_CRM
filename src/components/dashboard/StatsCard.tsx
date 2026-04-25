interface StatsCardProps {
  label:    string;
  value:    number | string;
  icon:     React.ReactNode;
  sub?:     string;
  accent?:  "gold" | "emerald" | "red" | "blue" | "purple";
}

const ACCENTS = {
  gold:    "border-yellow-400/20 from-yellow-400/5",
  emerald: "border-emerald-400/20 from-emerald-400/5",
  red:     "border-red-400/20 from-red-400/5",
  blue:    "border-blue-400/20 from-blue-400/5",
  purple:  "border-purple-400/20 from-purple-400/5",
};

export default function StatsCard({ label, value, icon, sub, accent = "gold" }: StatsCardProps) {
  return (
    <div className={`glass rounded-2xl p-5 border bg-gradient-to-br to-transparent ${ACCENTS[accent]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-slate-800/60">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-100 tabular-nums">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}
