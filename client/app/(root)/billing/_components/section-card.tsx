export function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-raw)",
      }}
    >
      {children}
    </div>
  );
}
