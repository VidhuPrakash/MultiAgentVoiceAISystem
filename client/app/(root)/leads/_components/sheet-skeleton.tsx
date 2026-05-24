import { Skeleton } from "@/components/ui/skeleton";

export function SheetSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full bg-[var(--surface-2)]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-[var(--surface-2)]" />
          <Skeleton className="h-3 w-24 bg-[var(--surface-2)]" />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] p-4 space-y-3"
        >
          <Skeleton className="h-3 w-24 bg-[var(--surface-2)]" />
          {[1, 2].map((j) => (
            <div key={j} className="flex justify-between">
              <Skeleton className="h-3 w-20 bg-[var(--surface-2)]" />
              <Skeleton className="h-3 w-28 bg-[var(--surface-2)]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
