import { PhoneOff } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] border border-[var(--border-raw)] flex items-center justify-center">
        <PhoneOff size={20} className="text-[var(--text-2)] opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text)]">No calls found</p>
        <p className="text-xs text-[var(--text-2)] mt-1">
          Try adjusting your filters or check back later
        </p>
      </div>
    </div>
  );
}
