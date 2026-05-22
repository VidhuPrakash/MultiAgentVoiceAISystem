export function AgentCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[--border-raw] bg-[--surface] p-4 space-y-3 animate-pulse">
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-sm bg-[--border-2]" />
      <div className="flex items-start gap-3 pl-1">
        <div className="h-9 w-9 rounded-lg bg-[--surface-3]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-[--surface-3]" />
          <div className="h-2.5 w-20 rounded bg-[--surface-3]" />
        </div>
      </div>
      <div className="h-2.5 w-full rounded bg-[--surface-3]" />
      <div className="h-2.5 w-3/4 rounded bg-[--surface-3]" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-[--surface-3]" />
        <div className="h-5 w-20 rounded-full bg-[--surface-3]" />
      </div>
    </div>
  );
}
