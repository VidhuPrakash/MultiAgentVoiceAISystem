import { Skeleton } from "@/components/ui/skeleton";

export function MobileCardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-[var(--surface-2)]" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28 bg-[var(--surface-2)]" />
              <Skeleton className="h-3 w-20 bg-[var(--surface-2)]" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full bg-[var(--surface-2)]" />
            <Skeleton className="h-3 w-3/4 bg-[var(--surface-2)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
