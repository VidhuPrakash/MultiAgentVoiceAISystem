export function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-raw)] bg-[var(--surface-2)]/50">
        <Icon className="w-3.5 h-3.5 text-[var(--accent-raw)]" />
        <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
