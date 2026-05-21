export function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color =
    pct > 85
      ? "bg-[var(--danger)]"
      : pct > 60
        ? "bg-[var(--warning)]"
        : "bg-[var(--accent-raw)]";
  return (
    <div className="min-w-[100px]">
      <div className="flex justify-between text-xs text-[var(--text-2)] mb-1">
        <span>{used}</span>
        <span>{limit} min</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
