export function TH({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold text-[var(--text-2)] uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}
