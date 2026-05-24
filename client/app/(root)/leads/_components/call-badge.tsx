export function CallBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: {
      label: "Completed",
      cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    missed: {
      label: "Missed",
      cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    failed: {
      label: "Failed",
      cls: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    in_progress: {
      label: "In Progress",
      cls: "bg-blue-500/15 text-blue-400 border-blue-500/30 animate-pulse",
    },
  };
  const s = status ? map[status] : null;
  if (!s) return <span className="text-[var(--text-2)] text-xs">—</span>;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
