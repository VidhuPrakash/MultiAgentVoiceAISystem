export function ChartSkeleton() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        gap: "5px",
        padding: "0 4px",
      }}
    >
      {[40, 65, 50, 80, 55, 90, 45, 75, 60, 85, 35, 70].map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: "3px 3px 0 0",
            background: "var(--surface-2)",
            animation: "pulse 1.6s ease-in-out infinite",
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}
