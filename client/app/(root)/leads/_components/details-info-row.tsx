export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-[var(--text-2)] shrink-0">{label}</span>
      <span className="text-xs text-[var(--text)] font-medium text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}
