"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  PhoneOff,
  PhoneMissed,
  PhoneCall,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Bot,
  User,
  Calendar,
  Hash,
  Mic,
  FileText,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "../admin/users/_components/stat-card";
import { StatusBadge } from "./_components/status-badge";
import { TableSkeleton } from "./_components/skeleton";
import { ErrorState } from "./_components/error-state";
import { EmptyState } from "./_components/empty-state";
import { CardSkeleton } from "./_components/card-skeleton";
import { PagBtn } from "./_components/page-button";
import { SheetSkeleton } from "./_components/sheet-skeleton";

export type CallStatus = "completed" | "missed" | "failed" | "in-progress";

interface Agent {
  id: string;
  name: string;
  type: string;
}

interface Call {
  id: string;
  status: CallStatus;
  callerNumber: string;
  duration: number;
  recordingUrl?: string;
  startedAt: string;
  endedAt?: string;
  agent: Agent;
}

interface CallDetail extends Call {
  transcript?: string;
  vapiCallId?: string;
}

interface CallsResponse {
  rows: Call[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface StatsData {
  total: number;
  completed: number;
  missed: number;
  failed: number;
  totalMinutes: number;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatRelative(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function parseTranscript(transcript: string) {
  return transcript
    .split("\n")
    .filter(Boolean)
    .map((line, i) => {
      const isAgent = line.startsWith("Agent:");
      const isCaller = line.startsWith("Caller:");
      const text = line.replace(/^(Agent:|Caller:)\s*/, "");
      return { id: i, isAgent, isCaller, text, raw: line };
    });
}

export const STATUS_CONFIG: Record<
  CallStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ElementType;
    dot: string;
  }
> = {
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: Phone,
    dot: "bg-emerald-400",
  },
  missed: {
    label: "Missed",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: PhoneMissed,
    dot: "bg-amber-400",
  },
  failed: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    icon: PhoneOff,
    dot: "bg-red-400",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: PhoneCall,
    dot: "bg-blue-400 animate-pulse",
  },
};

export default function CallHistoryPage() {
  const [status, setStatus] = useState<string>("all");
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState<number>(1);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [calls, setCalls] = useState<CallsResponse | null>(null);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsError, setCallsError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CallDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const { data } = await api.get("/user/calls/stats");

      setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      await fetchStats();
    };

    loadStats();
  }, [fetchStats]);

  const fetchCalls = useCallback(() => {
    setCallsLoading(true);
    setCallsError(false);
    const params: Record<string, unknown> = { page, limit };
    if (status !== "all") params.status = status;
    params.sort = sort === "newest" ? "desc" : "asc";

    api
      .get("/user/calls", { params })
      .then((r) => setCalls(r.data.data))
      .catch(() => setCallsError(true))
      .finally(() => setCallsLoading(false));
  }, [page, limit, status, sort]);

  useEffect(() => {
    const loadCalls = async () => {
      await fetchCalls();
    };

    loadCalls();
  }, [fetchCalls]);

  function handleStatus(v: string) {
    setStatus(v);
    setPage(1);
  }
  function handleLimit(v: string) {
    setLimit(Number(v));
    setPage(1);
  }
  function handleSort(v: string) {
    setSort(v);
    setPage(1);
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    setSheetOpen(true);
    api
      .get(`/user/calls/${id}`)
      .then((r) => setDetail(r.data.data))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }

  const totalPages = calls?.pages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  const statCards = [
    {
      label: "Total Calls",
      value: stats?.total ?? 0,
      icon: Phone,
      color: "bg-violet-500 text-violet-400",
    },
    {
      label: "Completed",
      value: stats?.completed ?? 0,
      icon: Phone,
      color: "bg-emerald-500 text-emerald-400",
    },
    {
      label: "Missed",
      value: stats?.missed ?? 0,
      icon: PhoneMissed,
      color: "bg-amber-500 text-amber-400",
    },
    {
      label: "Failed",
      value: stats?.failed ?? 0,
      icon: PhoneOff,
      color: "bg-red-500 text-red-400",
    },
    {
      label: "Total Minutes",
      value: stats ? `${stats.totalMinutes}m` : "—",
      icon: Clock,
      color: "bg-sky-500 text-sky-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Call History
          </h1>
          <p className="mt-1 text-sm text-[--text-2]">
            Track conversations, recordings and performance insights
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((c) => (
            <StatCard
              key={c.label}
              label={c.label}
              value={c.value}
              icon={c.icon}
              color={c.color}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Status */}
          <Select value={status} onValueChange={handleStatus}>
            <SelectTrigger className="w-36 shrink-0 bg-[var(--surface)] border-[var(--border-raw)] text-[var(--text)] text-sm h-9 focus:ring-[var(--accent-raw)]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--surface)] border-[var(--border-raw)] text-[var(--text)]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-32 shrink-0 bg-[var(--surface)] border-[var(--border-raw)] text-[var(--text)] text-sm h-9 focus:ring-[var(--accent-raw)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--surface)] border-[var(--border-raw)] text-[var(--text)]">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] overflow-hidden">
          {/* ─ Desktop table ─ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-raw)] bg-[var(--surface-2)]">
                  {[
                    "Status",
                    "Caller",
                    "Agent",
                    "Duration",
                    "Started",
                    "Ended",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-2)] tracking-wider uppercase whitespace-nowrap sticky top-0 bg-[var(--surface-2)] z-10"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {callsLoading ? (
                  <TableSkeleton />
                ) : callsError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <ErrorState onRetry={fetchCalls} />
                    </td>
                  </tr>
                ) : !calls?.rows?.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  calls.rows.map((call) => (
                    <tr
                      key={call.id}
                      onClick={() => openDetail(call.id)}
                      className="border-b border-[var(--border-raw)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-4 py-3.5">
                        <StatusBadge status={call.status} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[var(--text)] whitespace-nowrap">
                        {call.callerNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--accent-raw)]/10 border border-[var(--accent-raw)]/20 flex items-center justify-center">
                            <Bot
                              size={12}
                              className="text-[var(--accent-raw)]"
                            />
                          </div>
                          <span className="text-xs text-[var(--text)] truncate max-w-[120px]">
                            {call.agent?.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text)] font-mono whitespace-nowrap">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-2)] whitespace-nowrap">
                        {formatRelative(call.startedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-2)] whitespace-nowrap">
                        {call.endedAt ? formatRelative(call.endedAt) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(call.id);
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-raw)]
                            text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--accent-raw)]
                            hover:bg-[var(--accent-raw)]/5 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ─ Mobile cards ─ */}
          <div className="md:hidden divide-y divide-[var(--border-raw)]">
            {callsLoading ? (
              <div className="p-4 space-y-3">
                <CardSkeleton />
              </div>
            ) : callsError ? (
              <div className="p-8">
                <ErrorState onRetry={fetchCalls} />
              </div>
            ) : !calls?.rows?.length ? (
              <div className="p-8">
                <EmptyState />
              </div>
            ) : (
              calls.rows.map((call) => (
                <div
                  key={call.id}
                  onClick={() => openDetail(call.id)}
                  className="p-4 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={call.status} />
                    <span className="text-xs text-[var(--text-2)]">
                      {formatDuration(call.duration)}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-[var(--text)] mb-1">
                    {call.callerNumber}
                  </p>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Bot size={11} className="text-[var(--text-2)]" />
                    <span className="text-xs text-[var(--text-2)]">
                      {call.agent?.name ?? "Unknown agent"}
                    </span>
                    <span className="text-[var(--text-2)] opacity-40 mx-1">
                      ·
                    </span>
                    <span className="text-xs text-[var(--text-2)]">
                      {formatRelative(call.startedAt)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(call.id);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-raw)]
                      text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--accent-raw)]
                      transition-all duration-200"
                  >
                    View details →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {calls && calls.pages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-2)]">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, calls.total)} of {calls.total}
            </p>

            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-1">
              <PagBtn onClick={() => setPage(page - 1)} disabled={!canPrev}>
                <ChevronLeft size={14} />
                Prev
              </PagBtn>
              {pageNumbers().map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-[var(--text-2)] text-sm"
                  >
                    …
                  </span>
                ) : (
                  <PagBtn
                    key={p}
                    onClick={() => setPage(Number(p))}
                    active={p === page}
                  >
                    {p}
                  </PagBtn>
                ),
              )}
              <PagBtn onClick={() => setPage(page + 1)} disabled={!canNext}>
                Next
                <ChevronRight size={14} />
              </PagBtn>
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden items-center gap-2">
              <PagBtn onClick={() => setPage(page - 1)} disabled={!canPrev}>
                <ChevronLeft size={14} />
              </PagBtn>
              <span className="text-xs text-[var(--text)] px-2">
                {page} / {totalPages}
              </span>
              <PagBtn onClick={() => setPage(page + 1)} disabled={!canNext}>
                <ChevronRight size={14} />
              </PagBtn>
            </div>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="
            w-screen sm:w-[92vw] md:w-[760px] lg:w-[860px]
            max-w-none sm:max-w-[760px] lg:max-w-[860px]
            h-dvh p-0 overflow-hidden
            bg-[var(--surface)]
            border-l border-[var(--border-raw)]
            flex flex-col
          "
        >
          {detailLoading ? (
            <div className="p-4 sm:p-6">
              <SheetSkeleton />
            </div>
          ) : !detail ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center gap-4 text-[var(--text-2)]">
              <AlertCircle size={32} className="opacity-40" />
              <p className="text-sm">Failed to load call details</p>
              <button
                onClick={() => selectedId && openDetail(selectedId)}
                className="px-4 py-2 text-xs rounded-lg border border-[var(--border-raw)] hover:border-[var(--accent-raw)] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 sm:p-6 space-y-5">
                {/* ── Sheet Header ─────────────────────────────────────── */}
                <SheetHeader className="pb-5 border-b border-[var(--border-raw)] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <SheetTitle className="text-lg sm:text-xl font-semibold text-[var(--text)]">
                      Call Details
                    </SheetTitle>
                    <StatusBadge status={detail.status} />
                  </div>

                  {/* 3-col info cards: stack on mobile, row on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                    {/* Caller */}
                    <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface-2)] p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--surface-3)] flex items-center justify-center shrink-0">
                          <User size={15} className="text-[var(--text-2)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-[var(--text-2)]">
                            Caller
                          </p>
                          <p className="text-sm font-mono text-[var(--text)] truncate">
                            {detail.callerNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Agent */}
                    <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface-2)] p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--accent-raw)]/10 border border-[var(--accent-raw)]/20 flex items-center justify-center shrink-0">
                          <Bot size={15} className="text-[var(--accent-raw)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-[var(--text-2)]">
                            Agent
                          </p>
                          <p className="text-sm text-[var(--text)] truncate">
                            {detail.agent?.name ?? "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface-2)] p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--surface-3)] flex items-center justify-center shrink-0">
                          <Clock size={15} className="text-[var(--text-2)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-[var(--text-2)]">
                            Duration
                          </p>
                          <p className="font-mono text-sm text-[var(--text)]">
                            {formatDuration(detail.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                {detail.recordingUrl && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Mic size={14} className="text-[var(--accent-raw)]" />
                      <h3 className="text-sm font-semibold text-[var(--text)]">
                        Recording
                      </h3>
                    </div>
                    <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface-2)] p-3 sm:p-4">
                      <audio
                        controls
                        src={detail.recordingUrl}
                        className="w-full"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={14} className="text-[var(--accent-raw)]" />
                    <h3 className="text-sm font-semibold text-[var(--text)]">
                      Metadata
                    </h3>
                  </div>
                  <div className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface-2)] divide-y divide-[var(--border-raw)] overflow-hidden">
                    {[
                      {
                        icon: Hash,
                        label: "Vapi Call ID",
                        value: detail.vapiCallId ?? "—",
                        mono: true,
                      },
                      {
                        icon: Calendar,
                        label: "Started",
                        value: detail.startedAt
                          ? formatDateTime(detail.startedAt)
                          : "—",
                        mono: false,
                      },
                      {
                        icon: Calendar,
                        label: "Ended",
                        value: detail.endedAt
                          ? formatDateTime(detail.endedAt)
                          : "—",
                        mono: false,
                      },
                      {
                        icon: Clock,
                        label: "Duration",
                        value: formatDuration(detail.duration),
                        mono: true,
                      },
                    ].map(({ icon: Icon, label, value, mono }) => (
                      <div
                        key={label}
                        className="flex items-start sm:flex-col md:flex-row sm:items-center gap-3 px-4 py-3"
                      >
                        <Icon
                          size={13}
                          className="text-[var(--text-2)] shrink-0 mt-0.5 sm:mt-0"
                        />
                        <span className="text-xs text-[var(--text-2)] w-24 shrink-0">
                          {label}
                        </span>
                        <span
                          className={`text-xs text-[var(--text)] break-all ${mono ? "font-mono" : ""}`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
