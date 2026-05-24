export function PurposeBadge({ purpose }: { purpose?: string }) {
  if (!purpose) return <span className="text-[var(--text-2)] text-xs">—</span>;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-raw)]/10 text-[var(--accent-raw)] border border-[var(--accent-raw)]/20 capitalize">
      {purpose}
    </span>
  );
}
