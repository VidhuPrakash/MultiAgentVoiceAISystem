export function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-raw)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        fontFamily: "var(--font-mono)",
        color: "var(--text)",
      }}
    >
      <p
        style={{ margin: "0 0 3px", color: "var(--text-2)", fontSize: "10px" }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontWeight: 700 }}>
        {Number(payload[0].value).toLocaleString()} {unit ?? ""}
      </p>
    </div>
  );
}
