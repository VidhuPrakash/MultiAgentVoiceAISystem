"use client";

import { useCallback, useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PhoneCall,
  Loader2,
  AlertCircle,
  MessageSquare,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import api from "@/lib/api";

interface CallUser {
  id: string;
  name: string;
  email: string;
}
interface CallAgent {
  id: string;
  name: string;
  type: "receptionist" | "appointment" | "faq";
}
interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface CallDetail {
  id: string;
  user: CallUser;
  agent: CallAgent;
  status: "completed" | "failed" | "in-progress" | "no-answer";
  durationSeconds: number;
  startedAt: string;
  endedAt: string | null;
  transcript: TranscriptMessage[] | null;
  recordingUrl: string | null;
}

export interface CallDetailSheetProps {
  callId: string | null;
  onClose: () => void;
}

function fmtDuration(s: number) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60),
    r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    bg: "bg-[var(--danger)]/10",
    text: "text-[var(--danger)]",
    border: "border-[var(--danger)]/20",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-[var(--info)]/10",
    text: "text-[var(--info)]",
    border: "border-[var(--info)]/20",
  },
  "no-answer": {
    label: "No Answer",
    bg: "bg-[var(--surface-3)]",
    text: "text-[var(--text-2)]",
    border: "border-[var(--border-2)]",
  },
};

function CallStatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG["no-answer"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  );
}

const AGENT_TYPE_CONFIG = {
  receptionist: {
    label: "Receptionist",
    color: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20",
    Icon: PhoneCall,
  },
  appointment: {
    label: "Appointment",
    color:
      "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    Icon: Calendar,
  },
  faq: {
    label: "FAQ",
    color:
      "bg-[var(--accent-dim)] text-[var(--accent-raw)] border-[var(--accent-raw)]/20",
    Icon: MessageSquare,
  },
};

function AgentTypeBadge({ type }: { type: keyof typeof AGENT_TYPE_CONFIG }) {
  const c = AGENT_TYPE_CONFIG[type];
  if (!c) return null;
  const { Icon } = c;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.color}`}
    >
      <Icon size={10} />
      {c.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="ml-1 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
    >
      {copied ? (
        <Check size={12} className="text-emerald-400" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="w-24 shrink-0 text-xs text-[var(--text-2)] pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-sm text-[var(--text)]">{children}</div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function CallDetailSheet({ callId, onClose }: CallDetailSheetProps) {
  const [detail, setDetail] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;
    const controller = new AbortController();
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: { data: { data?: CallDetail } } = await api.get(
          `/admin/calls/${callId}`,
          { signal: controller.signal },
        );
        setDetail(res.data?.data ?? null);
      } catch (err: unknown) {
        const e = err as { name?: string; response?: { data?: { message?: string } } };
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          setError(e?.response?.data?.message ?? "Failed to load call");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    return () => controller.abort();
  }, [callId]);

  return (
    <Sheet
      open={!!callId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="p-0 overflow-y-auto w-full sm:w-[480px] bg-[var(--surface)] border-l border-[var(--border-raw)]"
      >
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 size={22} className="animate-spin text-[var(--text-2)]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[300px] px-6 text-center">
            <AlertCircle size={28} className="text-[var(--danger)]" />
            <p className="text-sm text-[var(--text-2)]">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="border-[var(--border-2)] text-[var(--text-2)]"
              onClick={() => {
                setError(null);
                setLoading(true);
                api
                  .get(`/admin/calls/${callId}`)
                  .then((r: { data: { data?: CallDetail } }) => setDetail(r.data?.data ?? null))
                  .catch((e: { response?: { data?: { message?: string } } }) =>
                    setError(e?.response?.data?.message ?? "Failed to load"),
                  )
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && detail && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border-raw)]">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border-raw)]">
                  <PhoneCall size={16} className="text-[var(--text-2)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-[var(--text)]">
                      Call #{detail.id.slice(0, 8)}
                    </span>
                    <CallStatusBadge status={detail.status} />
                  </div>
                  <p className="text-xs text-[var(--text-2)] mt-0.5">
                    Started {fmtDateTime(detail.startedAt)} ·{" "}
                    {fmtDuration(detail.durationSeconds)}
                  </p>
                </div>
              </div>

              {/* Recording */}
              {detail.recordingUrl ? (
                <audio
                  controls
                  src={detail.recordingUrl}
                  className="w-full mt-3 rounded-md"
                  style={{
                    accentColor: "var(--accent-raw)",
                    colorScheme: "dark",
                  }}
                />
              ) : (
                <p className="mt-3 text-xs text-[var(--text-3)]">
                  No recording available
                </p>
              )}
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="details"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-5 pt-3">
                <TabsList className="bg-[var(--surface-2)] border border-[var(--border-raw)] h-9 p-0.5 gap-0.5 w-full">
                  <TabsTrigger
                    value="details"
                    className="flex-1 text-xs data-[state=active]:bg-[var(--surface-3)] data-[state=active]:text-[var(--text)]"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="transcript"
                    className="flex-1 text-xs data-[state=active]:bg-[var(--surface-3)] data-[state=active]:text-[var(--text)]"
                  >
                    Transcript
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Details Tab */}
              <TabsContent
                value="details"
                className="flex-1 overflow-y-auto px-5 py-4"
              >
                <div className="rounded-lg border border-[var(--border-raw)] bg-[var(--surface-2)] divide-y divide-[var(--border-raw)]">
                  <InfoRow label="Call ID">
                    <span className="font-mono text-xs text-[var(--text-2)] break-all">
                      {detail.id}
                    </span>
                    <CopyButton text={detail.id} />
                  </InfoRow>
                  <InfoRow label="User">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px] bg-[var(--surface-3)] text-[var(--text-2)]">
                          {initials(detail.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-[var(--text)] leading-none">
                          {detail.user.name}
                        </p>
                        <p className="text-xs text-[var(--text-2)] mt-0.5">
                          {detail.user.email}
                        </p>
                      </div>
                    </div>
                  </InfoRow>
                  <InfoRow label="Agent">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-[var(--text)]">
                        {detail.agent.name}
                      </span>
                      <AgentTypeBadge type={detail.agent.type} />
                    </div>
                  </InfoRow>
                  <InfoRow label="Status">
                    <CallStatusBadge status={detail.status} />
                  </InfoRow>
                  <InfoRow label="Duration">
                    <span>{fmtDuration(detail.durationSeconds)}</span>
                  </InfoRow>
                  <InfoRow label="Started">
                    <span>{fmtDateTime(detail.startedAt)}</span>
                  </InfoRow>
                  <InfoRow label="Ended">
                    <span>
                      {detail.endedAt ? fmtDateTime(detail.endedAt) : "—"}
                    </span>
                  </InfoRow>
                </div>
              </TabsContent>

              {/* Transcript Tab */}
              <TabsContent
                value="transcript"
                className="flex-1 overflow-y-auto px-5 py-4"
              >
                {!detail.transcript || detail.transcript.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <MessageSquare size={28} className="text-[var(--text-3)]" />
                    <p className="text-sm text-[var(--text-2)]">
                      No transcript available
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {detail.transcript.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.role === "assistant" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] font-semibold tracking-widest mb-1 text-[var(--text-3)] uppercase">
                          {msg.role === "assistant" ? "AI" : "User"}
                        </span>
                        <div
                          className={`max-w-[85%] px-3 py-2 text-sm text-[var(--text)] leading-relaxed ${
                            msg.role === "user"
                              ? "bg-[var(--surface-3)] rounded-lg rounded-tl-sm"
                              : "bg-[var(--accent-dim)] border border-[var(--accent-raw)]/20 rounded-lg rounded-tr-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.timestamp && (
                          <span className="text-[var(--text-3)] text-xs mt-1">
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
