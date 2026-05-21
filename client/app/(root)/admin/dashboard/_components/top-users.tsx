import { COLORS, TopUser } from "../page";
import { PLAN_META } from "./plan-donate";
import { Sk } from "./skeleton";

const AVATAR_COLORS = [
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E1F5EE", text: "#085041" },
];


export function TopUsers({
  data,
  loading,
  error,
}: {
  data: TopUser[];
  loading: boolean;
  error: boolean;
}) {
  if (error)
    return (
      <p style={{ color: "var(--danger)", fontSize: "12px" }}>Failed to load</p>
    );

  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <Sk h="26px" w="26px" r="50%" />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <Sk h="12px" w="120px" />
              <Sk h="10px" w="80px" />
            </div>
            <Sk h="12px" w="40px" />
          </div>
        ))}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {data.map((u, i) => {
        const pct = Math.min(
          100,
          Math.round((u.minutesUsed / u.minutesLimit) * 100),
        );
        const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const initials = u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const planMeta = PLAN_META[u.plan] ?? PLAN_META.free;
        return (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 0",
              borderBottom:
                i < data.length - 1 ? "1px solid var(--border-raw)" : "none",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                minWidth: "18px",
              }}
            >
              #{i + 1}
            </span>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: av.bg,
                color: av.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text)",
                  fontFamily: "var(--font-sans)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {u.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  color: "var(--text-3)",
                  fontFamily: "var(--font-mono)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {u.email}
              </p>
            </div>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "20px",
                background: planMeta.bg,
                color: planMeta.text,
                fontFamily: "var(--font-sans)",
                textTransform: "capitalize",
                flexShrink: 0,
              }}
            >
              {u.plan}
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "3px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-2)",
                }}
              >
                {pct}%
              </span>
              <div
                style={{
                  width: "48px",
                  height: "4px",
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
                    background:
                      pct > 85
                        ? COLORS.red
                        : pct > 60
                          ? COLORS.amber
                          : COLORS.teal,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
