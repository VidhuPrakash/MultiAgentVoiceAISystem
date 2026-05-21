import { AvgDuration, COLORS } from "../page";
import { Sk } from "./skeleton";

export function AvgDurationBars({
  data,
  loading,
}: {
  data: AvgDuration[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[60, 75, 45, 88, 55].map((w, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Sk h="10px" w="28px" />
            <Sk h="5px" w={`${w}%`} />
            <Sk h="10px" w="30px" />
          </div>
        ))}
      </div>
    );

  const max = Math.max(...data.map((d) => d.avgDuration));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((d) => {
        const pct = max > 0 ? Math.round((d.avgDuration / max) * 100) : 0;
        return (
          <div
            key={d.period}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                minWidth: "28px",
              }}
            >
              {d.period}
            </span>
            <div
              style={{
                flex: 1,
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
                  background: COLORS.purple,
                }}
              />
            </div>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-2)",
                minWidth: "32px",
                textAlign: "right",
              }}
            >
              {d.avgDuration}s
            </span>
          </div>
        );
      })}
    </div>
  );
}
