export function SkeletonLine({ w, h = "h-4" }: { w: string; h?: string }) {
  return (
    <div
      className={`${h} ${w} rounded-md animate-pulse`}
      style={{ background: "var(--surface-2)" }}
    />
  );
}
