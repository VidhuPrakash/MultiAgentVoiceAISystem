export function CardSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] p-4 space-y-3 animate-pulse"
          style={{ opacity: 1 - i * 0.2 }}
        >
          <div className="flex justify-between">
            <div className="h-5 w-24 rounded-full bg-[var(--surface-2)]" />
            <div className="h-4 w-16 rounded bg-[var(--surface-2)]" />
          </div>
          <div className="h-4 w-36 rounded bg-[var(--surface-2)]" />
          <div className="h-4 w-28 rounded bg-[var(--surface-2)]" />
        </div>
      ))}
    </>
  );
}
