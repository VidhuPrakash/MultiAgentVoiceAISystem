import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle size={20} className="text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text)]">
          Failed to load calls
        </p>
        <p className="text-xs text-[var(--text-2)] mt-1">
          Something went wrong. Please try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-[var(--border-raw)] text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--accent-raw)] transition-all duration-200"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </div>
  );
}
