import { Bot, Clock } from "lucide-react";
import { Lead } from "../page";
import { Avatar } from "./avatar";
import { CallBadge } from "./call-badge";
import { PurposeBadge } from "./purpose-badge";
import { TH } from "./table-head";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function DesktopTable({
  leads,
  onRowClick,
}: {
  leads: Lead[];
  onRowClick: (id: string) => void;
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
    <div className="overflow-x-auto rounded-xl border border-[var(--border-raw)]">
      <table className="w-full min-w-[900px] border-collapse">
        <thead className="bg-[var(--surface-2)] sticky top-0 z-10">
          <tr>
            <TH>Lead</TH>
            <TH>Purpose</TH>
            <TH>Service</TH>
            <TH>Appointment</TH>
            <TH>Agent</TH>
            <TH>Call Status</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-raw)]">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onRowClick(lead.id)}
              className="group bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors duration-150 cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={lead.name} phone={lead.phone} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate max-w-[140px]">
                      {lead.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-[var(--text-2)]">
                      {lead.phone ?? "—"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <PurposeBadge purpose={lead.purpose} />
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-[var(--text-2)] truncate max-w-[120px] block">
                  {lead.service ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-[var(--text-2)]">
                  {lead.appointmentDate ? fmtDate(lead.appointmentDate) : "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                {lead.agent ? (
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[var(--text-2)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--text)] truncate max-w-[100px]">
                        {lead.agent.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-2)] capitalize">
                        {lead.agent.type}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--text-2)]">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <CallBadge status={lead.callStatus} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[var(--text-2)] shrink-0" />
                  <span className="text-xs text-[var(--text-2)]">
                    {relativeTime(lead.createdAt)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(lead.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-[var(--accent-raw)] font-medium hover:underline transition-opacity duration-150"
                >
                  View →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
