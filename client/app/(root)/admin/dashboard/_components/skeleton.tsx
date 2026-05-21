export function Sk({
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
