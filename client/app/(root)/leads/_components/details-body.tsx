import { Bot, FileText, Hash, Mic, PhoneCall } from "lucide-react";
import { Lead } from "../page";
import { Avatar } from "./avatar";
import { SectionCard } from "./details-card";
import { InfoRow } from "./details-info-row";
import { PurposeBadge } from "./purpose-badge";
import { CallBadge } from "./call-badge";

export function SheetBody({ lead }: { lead: Lead }) {
  function formatDuration(secs?: number): string {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

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
    <>
      {/* Identity */}
      <div className="flex items-center gap-4">
        <Avatar name={lead.name} phone={lead.phone} size="lg" />
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text)] text-base truncate">
            {lead.name ?? "Unknown"}
          </p>
          <p className="text-sm text-[var(--text-2)]">{lead.phone ?? "—"}</p>
          <div className="mt-1">
            <PurposeBadge purpose={lead.purpose} />
          </div>
        </div>
      </div>

      {/* Lead info */}
      <SectionCard title="Lead Information" icon={FileText}>
        <div className="divide-y divide-[var(--border-raw)]">
          <InfoRow label="Service" value={lead.service} />
          <InfoRow label="Appointment" value={lead.appointmentDate} />
          <div className="border-t border-[var(--border-raw)] pt-4">
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-2)] uppercase tracking-wider font-medium">
                Service Details
              </p>

              <div
                className="
            rounded-xl
            border border-[var(--border-raw)]
            bg-[var(--surface-2)]
            p-3
            min-h-[100px]
            max-h-[180px]
            overflow-y-auto
          "
              >
                <p
                  className="
              text-sm
              text-[var(--text)]
              whitespace-pre-wrap
              break-words
              leading-6
            "
                >
                  {lead.service || "No details available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Agent */}
      {lead.agent && (
        <SectionCard title="Agent" icon={Bot}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--accent-raw)]/15 border border-[var(--accent-raw)]/25 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[var(--accent-raw)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                {lead.agent.name}
              </p>
              <p className="text-xs text-[var(--text-2)] capitalize">
                {lead.agent.type}
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Call info */}
      <SectionCard title="Call Information" icon={PhoneCall}>
        <div className="divide-y divide-[var(--border-raw)]">
          <InfoRow label="Caller" value={lead.callerId} />
          <InfoRow label="Duration" value={formatDuration(lead.callDuration)} />
          <InfoRow label="Started" value={fmtDate(lead.callStartedAt)} />
          <InfoRow
            label="Status"
            value={<CallBadge status={lead.callStatus} />}
          />
        </div>
      </SectionCard>

      {/* Recording */}
      {lead.recordingUrl && (
        <SectionCard title="Recording" icon={Mic}>
          <div className="rounded-lg bg-[var(--surface-2)] p-3 border border-[var(--border-raw)]">
            <audio
              controls
              src={lead.recordingUrl}
              className="w-full h-9"
              style={{ accentColor: "var(--accent-raw)" }}
            />
          </div>
        </SectionCard>
      )}

      {/* Transcript */}
      {lead.transcript && lead.transcript.length > 0 && (
        <SectionCard title="Transcript" icon={FileText}>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {lead.transcript.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "caller" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "agent"
                      ? "bg-[var(--accent-raw)]/15 text-[var(--text)] rounded-tl-sm border border-[var(--accent-raw)]/20"
                      : "bg-[var(--surface-2)] text-[var(--text)] rounded-tr-sm border border-[var(--border-raw)]"
                  }`}
                >
                  <p
                    className={`text-[10px] font-semibold mb-0.5 ${
                      msg.role === "agent"
                        ? "text-[var(--accent-raw)]"
                        : "text-[var(--text-2)]"
                    }`}
                  >
                    {msg.role === "agent" ? "Agent" : "Caller"}
                  </p>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Metadata */}
      <SectionCard title="Metadata" icon={Hash}>
        <div className="divide-y divide-[var(--border-raw)]">
          <InfoRow
            label="Lead ID"
            value={
              <code className="text-[10px] font-mono text-[var(--text-2)]">
                {lead.id}
              </code>
            }
          />
          {lead.callId && (
            <InfoRow
              label="Call ID"
              value={
                <code className="text-[10px] font-mono text-[var(--text-2)]">
                  {lead.callId}
                </code>
              }
            />
          )}
          {lead.agent?.id && (
            <InfoRow
              label="Agent ID"
              value={
                <code className="text-[10px] font-mono text-[var(--text-2)]">
                  {lead.agent.id}
                </code>
              }
            />
          )}
        </div>
      </SectionCard>
    </>
  );
}
