import { CallStatus, STATUS_CONFIG } from "../page";

export function StatusBadge({ status }: { status: CallStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.failed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
