import { AlertCircle, RefreshCw } from "lucide-react";

export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[--danger]/30 bg-[--danger]/8 px-4 py-3">
      <AlertCircle className="h-4 w-4 shrink-0 text-[--danger]" />
      <p className="flex-1 text-xs text-[--text-2]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-medium text-[--accent-raw] hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}
