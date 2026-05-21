import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PlanDist } from "../page";

const COLORS = {
  amber: "#EF9F27",
  teal: "#1D9E75",
  blue: "#378ADD",
  purple: "#7F77DD",
  coral: "#D85A30",
  gray: "#888780",
  red: "#E24B4A",
};

export const PLAN_META: Record<
  string,
  { bg: string; text: string; color: string }
> = {
  free: { bg: "rgba(136,135,128,0.12)", text: "#5F5E5A", color: COLORS.gray },
  starter: { bg: "rgba(55,138,221,0.12)", text: "#185FA5", color: COLORS.blue },
  pro: { bg: "rgba(29,158,117,0.12)", text: "#0F6E56", color: COLORS.teal },
};

function Sk({
  h = "14px",
  w = "100%",
  r = "6px",
}: {
  h?: string;
  w?: string;
  r?: string;
}) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        background: "var(--surface-2)",
        animation: "pulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

export function PlanDonut({
  data,
  loading,
}: {
  data: PlanDist[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sk h="100px" w="100px" r="50%" />
      </div>
    );

  const total = data.reduce((s, d) => s + d.count, 0);
  const planColors = data.map((d) => PLAN_META[d.plan]?.color ?? COLORS.gray);

  return (
    <div className="an-fade justify-between flex flex-col gap-10">
      <div style={{ position: "relative", height: "150px", flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              innerRadius="52%"
              outerRadius="85%"
              strokeWidth={0}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={planColors[i]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-raw)",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <b style={{ textTransform: "capitalize" }}>
                      {payload[0].name}
                    </b>
                    : {Number(payload[0].value).toLocaleString()}
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        {/* center label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {total.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: "9px",
              color: "var(--text-3)",
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            total
          </span>
        </div>
      </div>

      {/* Legend bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {data.map((d) => {
          const meta = PLAN_META[d.plan] ?? PLAN_META.free;
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div
              key={d.plan}
              style={{ display: "flex", flexDirection: "column", gap: "3px" }}
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
                      borderRadius: "50%",
                      background: meta.color,
                      display: "inline-block",
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
                    {d.plan}
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {d.count.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "20px",
                      background: meta.bg,
                      color: meta.text,
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: "3px",
                  borderRadius: "2px",
                  background: "var(--surface-2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: "2px",
                    background: meta.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
