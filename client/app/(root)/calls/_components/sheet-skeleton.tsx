export function SheetSkeleton() {
  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <div className="h-6 w-32 rounded bg-[var(--surface-2)] animate-pulse" />
        <div className="h-4 w-48 rounded bg-[var(--surface-2)] animate-pulse" />
      </div>
      <div className="h-32 rounded-xl bg-[var(--surface-2)] animate-pulse" />
      <div className="h-48 rounded-xl bg-[var(--surface-2)] animate-pulse" />
    </div>
  );
}
