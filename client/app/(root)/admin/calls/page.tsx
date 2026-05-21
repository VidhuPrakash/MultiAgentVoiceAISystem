"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SkeletonRow } from "./_components/skeleton";
import { CallDetailSheet } from "./_components/call-details-sheet";
import { CopyIdButton } from "./_components/copy-id-button";
import { AgentTypeBadge } from "./_components/agent-type-badge";
import { CallStatusBadge } from "./_components/call-status-badge";
import { StatCard } from "../users/_components/stat-card";

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

interface CallRecord {
  id: string;
  user: CallUser;
  agent: CallAgent;
  status: "completed" | "failed" | "in-progress" | "no-answer";
  durationSeconds: number;
  startedAt: string;
  endedAt: string | null;
}

interface PaginatedCalls {
  rows: CallRecord[];
  total: number;
  page: number;
  limit: number;
}

function fmtDuration(s: number) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60),
    r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
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


const LIMIT = 10;

export default function CallsPage() {
  const [data, setData] = useState<PaginatedCalls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = () => {
      setLoading(true);
      setError(null);
      api
        .get("/admin/calls", { params: { page, limit: LIMIT } })
        .then((res: { data: { data?: PaginatedCalls } }) =>
          setData(res.data?.data ?? null),
        )
        .catch((err: { response?: { data?: { message?: string } } }) => {
          const msg = err?.response?.data?.message ?? "Failed to load calls";
          setError(msg);
          toast.error(msg, {
            style: {
              background: "var(--surface)",
              border: "1px solid var(--border-raw)",
              color: "var(--text)",
            },
          });
        })
        .finally(() => setLoading(false));
    };
    fetchCalls();
  }, []);

  // Stats
  const rows = data?.rows ?? [];
  const completed = rows.filter((r) => r.status === "completed");
  const failed = rows.filter((r) => r.status === "failed");
  const avgDur = completed.length
    ? fmtDuration(
        Math.round(
          completed.reduce((a, r) => a + r.durationSeconds, 0) /
            completed.length,
        ),
      )
    : "—";

  // Pagination
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const start = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  const pageNums: number[] = [];
  const s = Math.max(1, Math.min(page - 2, totalPages - 4));
  const e = Math.min(totalPages, s + 4);
  for (let i = s; i <= e; i++) pageNums.push(i);

  return (
    <div className="flex flex-col gap-6  min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
            Call Monitoring
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">
            Monitor and review all AI calls
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border-raw)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--border-raw)]">
                {[
                  "Call ID",
                  "User",
                  "Agent",
                  "Status",
                  "Duration",
                  "Started",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="text-[var(--text-2)] text-xs font-medium uppercase tracking-wider px-4 py-3 text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

              {/* Empty */}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <PhoneOff size={28} className="text-[var(--text-3)]" />
                      <p className="text-sm font-medium text-[var(--text-2)]">
                        No calls found
                      </p>
                      <p className="text-xs text-[var(--text-3)]">
                        Calls will appear here once they are made
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading &&
                !error &&
                rows.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedId(call.id)}
                    className="border-b border-[var(--border-raw)] hover:bg-[var(--surface-3)] cursor-pointer transition-colors group"
                  >
                    {/* Call ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-[var(--text-2)]">
                          {call.id.slice(0, 8)}
                        </span>
                        <CopyIdButton id={call.id} />
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px] bg-[var(--surface-3)] text-[var(--text-2)]">
                            {initials(call.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-[var(--text)] leading-none whitespace-nowrap">
                            {call.user.name}
                          </p>
                          <p className="text-xs text-[var(--text-2)] mt-0.5 whitespace-nowrap">
                            {call.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Agent */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-[var(--text)] whitespace-nowrap">
                          {call.agent.name}
                        </span>
                        <AgentTypeBadge type={call.agent.type} />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <CallStatusBadge status={call.status} />
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-sm text-[var(--text-2)] whitespace-nowrap">
                      {fmtDuration(call.durationSeconds)}
                    </td>

                    {/* Started */}
                    <td className="px-4 py-3 text-sm text-[var(--text-2)] whitespace-nowrap">
                      {fmtDate(call.startedAt)}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--surface-3)] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal size={15} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[var(--surface-2)] border-[var(--border-raw)] text-[var(--text)]"
                        >
                          <DropdownMenuItem
                            className="text-sm text-[var(--text-2)] hover:text-[var(--text)] focus:bg-[var(--surface-3)] cursor-pointer"
                            onClick={() => setSelectedId(call.id)}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border-raw)] bg-[var(--surface-2)] flex-wrap">
            <p className="text-xs text-[var(--text-2)] whitespace-nowrap">
              Showing {start}–{end} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 text-[var(--text-2)] hover:bg-[var(--surface-3)] disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </Button>

              {pageNums.map((n) => (
                <Button
                  key={n}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(n)}
                  className={`h-7 w-7 p-0 text-xs border transition-colors ${
                    n === page
                      ? "bg-[var(--accent-dim)] text-[var(--accent-raw)] border-[var(--accent-raw)]/40"
                      : "text-[var(--text-2)] border-transparent hover:bg-[var(--surface-3)]"
                  }`}
                >
                  {n}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 p-0 text-[var(--text-2)] hover:bg-[var(--surface-3)] disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <CallDetailSheet
        callId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
