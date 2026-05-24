import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[var(--border-raw)] bg-[var(--surface)]"
        >
          <Skeleton className="w-8 h-8 rounded-full bg-[var(--surface-2)]" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32 bg-[var(--surface-2)]" />
            <Skeleton className="h-2.5 w-20 bg-[var(--surface-2)]" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full bg-[var(--surface-2)]" />
          <Skeleton className="h-3 w-24 bg-[var(--surface-2)] hidden md:block" />
          <Skeleton className="h-3 w-16 bg-[var(--surface-2)] hidden lg:block" />
        </div>
      ))}
    </div>
  );
}
