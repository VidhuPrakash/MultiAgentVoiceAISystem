import { CallBadge } from "./call-badge";
import { PurposeBadge } from "./purpose-badge";
import { Bot, Clock } from "lucide-react";
import { Lead } from "../page";
import { Avatar } from "./avatar";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function MobileLeadCard({
  lead,
  onClick,
}: {
  lead: Lead;
  onClick: () => void;
}) {
  function fmtDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] p-4 space-y-3 cursor-pointer hover:border-[var(--border-2)] hover:bg-[var(--surface-2)] transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <Avatar name={lead.name} phone={lead.phone} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text)] truncate">
            {lead.name ?? "Unknown"}
          </p>
          <p className="text-xs text-[var(--text-2)]">{lead.phone ?? "—"}</p>
        </div>
        <CallBadge status={lead.callStatus} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-[var(--text-2)] uppercase tracking-wide mb-0.5">
            Purpose
          </p>
          <PurposeBadge purpose={lead.purpose} />
        </div>
        <div>
          <p className="text-[10px] text-[var(--text-2)] uppercase tracking-wide mb-0.5">
            Service
          </p>
          <p className="text-xs text-[var(--text)] truncate">
            {lead.service ?? "—"}
          </p>
        </div>
        {lead.appointmentDate && (
          <div className="col-span-2">
            <p className="text-[10px] text-[var(--text-2)] uppercase tracking-wide mb-0.5">
              Appointment
            </p>
            <p className="text-xs text-[var(--text)]">
              {fmtDate(lead.appointmentDate)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-raw)]">
        <div className="flex items-center gap-2">
          {lead.agent && (
            <>
              <Bot className="w-3 h-3 text-[var(--text-2)]" />
              <span className="text-xs text-[var(--text-2)]">
                {lead.agent.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-[var(--text-2)]" />
          <span className="text-xs text-[var(--text-2)]">
            {relativeTime(lead.createdAt)}
          </span>
          <span className="text-xs text-[var(--accent-raw)] font-medium ml-1">
            View
          </span>
        </div>
      </div>
    </div>
  );
}
