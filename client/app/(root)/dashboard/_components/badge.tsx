export function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize"
      style={{
        background: "var(--surface-2)",
        color: color ?? "var(--text-2)",
      }}
    >
      {children}
    </span>
  );
}
