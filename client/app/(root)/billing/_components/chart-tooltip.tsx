export const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm shadow-xl"
      style={{
        background: "var(--surface-3)",
        borderColor: "var(--border-raw)",
        color: "var(--text)",
      }}
    >
      <p className="font-medium mb-2" style={{ color: "var(--text-2)" }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span style={{ color: "var(--text-2)" }}>{p.name}:</span>
          <span className="font-semibold" style={{ color: "var(--text)" }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};
