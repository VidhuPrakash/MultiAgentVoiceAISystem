export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-4"
      style={{ color: "var(--text-2)" }}
    >
      {children}
    </p>
  );
}
