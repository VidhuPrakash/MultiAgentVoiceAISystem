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

const COLORS = {
  amber: "#EF9F27",
  teal: "#1D9E75",
  blue: "#378ADD",
  purple: "#7F77DD",
  coral: "#D85A30",
  gray: "#888780",
  red: "#E24B4A",
};

export const STAT_ACCENTS = [
  COLORS.teal,
  COLORS.amber,
  COLORS.purple,
  COLORS.coral,
  COLORS.blue,
];
export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  idx,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading: boolean;
  idx: number;
}) {
  const accent = STAT_ACCENTS[idx % STAT_ACCENTS.length];
  return (
    <div
      className="an-fade"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-raw)",
        borderRadius: "16px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${idx * 55}ms`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "3px",
          height: "100%",
          background: accent,
          borderRadius: "0",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "var(--text-2)",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={13} color={accent} />
        </div>
      </div>
      {loading ? (
        <Sk h="26px" w="55%" />
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      )}
    </div>
  );
}
