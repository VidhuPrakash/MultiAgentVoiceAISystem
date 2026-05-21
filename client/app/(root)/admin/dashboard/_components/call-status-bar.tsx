import { CallStatus, COLORS, STATUS_COLORS } from "../page";
import { Sk } from "./skeleton";

export function CallStatusBars({
  data,
  loading,
}: {
  data: CallStatus[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[80, 40, 20, 15].map((w, i) => (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <Sk h="10px" w="60px" />
            <Sk h="6px" w={`${w}%`} />
          </div>
        ))}
      </div>
    );

  const max = Math.max(...data.map((d) => d.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      {data.map((d) => {
        const pct = max > 0 ? Math.round((d.count / max) * 100) : 0;
        const color = STATUS_COLORS[d.status] ?? COLORS.amber;
        return (
          <div
            key={d.status}
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "2px",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-2)",
                    fontFamily: "var(--font-sans)",
                    textTransform: "capitalize",
                  }}
                >
                  {d.status}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                }}
              >
                {d.count.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                height: "5px",
                borderRadius: "3px",
                background: "var(--surface-2)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: "3px",
                  background: color,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
