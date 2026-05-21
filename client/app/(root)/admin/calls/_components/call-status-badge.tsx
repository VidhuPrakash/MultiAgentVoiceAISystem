const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    bg: "bg-[var(--danger)]/10",
    text: "text-[var(--danger)]",
    border: "border-[var(--danger)]/20",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-[var(--info)]/10",
    text: "text-[var(--info)]",
    border: "border-[var(--info)]/20",
  },
  "no-answer": {
    label: "No Answer",
    bg: "bg-[var(--surface-3)]",
    text: "text-[var(--text-2)]",
    border: "border-[var(--border-2)]",
  },
};

export function CallStatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG["no-answer"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  );
}
