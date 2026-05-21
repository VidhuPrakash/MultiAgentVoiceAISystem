export function StatCard({
  icon: Icon,
  label,
  value,
  color,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  iconColor?: string;
}) {
  return (
    <div className="rounded-lg overflow-auto border border-[var(--border-raw)] bg-[var(--surface)] p-4 flex items-center gap-3 min-w-0">
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${color}`}
      >
        <Icon size={16} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-[var(--text-2)] text-xs truncate">{label}</p>
        <p className="text-[var(--text)] text-xl font-semibold leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
