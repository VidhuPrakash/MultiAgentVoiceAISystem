"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import api from "@/lib/api";
import { useIsAdmin } from "@/store/auth-store";
import {
  Bot,
  CheckCircle2,
  PowerOff,
  PhoneCall,
  RefreshCw,
  Search,
  MoreHorizontal,
  Pencil,
  AlertCircle,
  Calendar,
  MessageSquare,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { StatCard } from "../users/_components/stat-card";
import { PlanBadge } from "../users/_components/plan-badgue";
import { EditAgentDialog } from "./_components/edit-agents";

export type AgentType = "receptionist" | "appointment" | "faq";

export interface AgentOwner {
  id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro";
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  systemPrompt: string | null;
  voice: string;
  isActive: boolean;
  vapiAssistantId: string | null;
  createdAt: string;
  owner: AgentOwner;
}

export interface UpdateAgentPayload {
  name?: string;
  systemPrompt?: string;
  voice?: string;
  isActive?: boolean;
}

const TYPE_CONFIG: Record<
  AgentType,
  {
    label: string;
    color: string;
    Icon: React.ElementType;
  }
> = {
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

function AgentTypeBadge({ type }: { type: AgentType }) {
  const { label, color, Icon } = TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${color}`}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

const SKELETON_WIDTHS = [72, 58, 85, 63, 90, 55, 78, 68];

function SkeletonRow() {
  return (
    <tr className="border-t border-[var(--border-raw)] animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-[var(--surface-3)]"
            style={{ width: `${SKELETON_WIDTHS[i]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function AgentsPage() {
  useIsAdmin();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AgentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [spinning, setSpinning] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        data: { rows: Agent[]; total: number };
        success: boolean;
      }>("/admin/agents");
      setAgents(res.data.data.rows ?? []);
      setTotal(res.data.data.total);
    } catch {
      setError("Failed to load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchAgents();
    };
    void load();
  }, [fetchAgents]);

  const handleRefresh = async () => {
    setSpinning(true);
    await fetchAgents();
    setSpinning(false);
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const res = await api.patch<{ data: Agent; success: boolean }>(
        `/admin/agents/${agent.id}`,
        { isActive: !agent.isActive },
      );
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, ...res.data.data } : a)),
      );
      toast.success(`Agent ${!agent.isActive ? "enabled" : "disabled"}`, {
        style: {
          background: "var(--surface)",
          border: "1px solid var(--accent-raw)",
          color: "var(--accent-raw)",
        },
      });
    } catch {
      toast.error("Failed to update agent status", {
        style: {
          background: "var(--surface)",
          border: "1px solid var(--danger)",
          color: "var(--danger)",
        },
      });
    }
  };

  const handleSaved = (updated: Agent) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
    );
  };

  const activeCount = agents?.filter((a) => a.isActive).length;
  const inactiveCount = agents?.filter((a) => !a.isActive).length;
  const receptionistCount = agents?.filter(
    (a) => a.type === "receptionist",
  ).length;

  const hasFilters = search || typeFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className=" space-y-5 min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Agent Management
          </h1>
          <p className="text-[var(--text-2)] text-sm mt-0.5">
            Manage all agents here
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Bot}
          label="Total Agents"
          value={total}
          color="bg-[var(--surface-3)]"
          iconColor="text-[var(--text-2)]"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active"
          value={activeCount}
          color="bg-[var(--accent-dim)]"
          iconColor="text-[var(--accent-raw)]"
        />
        <StatCard
          icon={PowerOff}
          label="Inactive"
          value={inactiveCount}
          color="bg-[var(--danger)]/10"
          iconColor="text-[var(--danger)]"
        />
        <StatCard
          icon={PhoneCall}
          label="Receptionists"
          value={receptionistCount}
          color="bg-[var(--info)]/10"
          iconColor="text-[var(--info)]"
        />
      </div>

      {/* Table or Empty State */}
      {!loading && !error && agents?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--border-raw)] bg-[var(--surface)]">
          <Bot size={48} className="text-[var(--text-3)]" />
          <p className="text-[var(--text-2)] text-sm font-medium">
            {hasFilters ? "No agents match your filters" : "No agents found"}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[var(--accent-raw)] text-xs hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-raw)] overflow-hidden">
          <table
            role="table"
            className="w-full text-sm"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr className="bg-[var(--surface-2)] text-[var(--text-2)] text-xs uppercase tracking-wider">
                {[
                  "Agent",
                  "Type",
                  "Owner",
                  "Voice",
                  "Vapi ID",
                  "Status",
                  "Created",
                  "",
                ].map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-3 text-left font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={28} className="text-[var(--danger)]" />
                      <p className="text-[var(--text-2)] text-sm">{error}</p>
                      <button
                        type="button"
                        onClick={fetchAgents}
                        className="px-4 py-1.5 rounded-md text-sm font-medium bg-[var(--accent-raw)] text-white hover:brightness-110 transition-all"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                agents?.map((agent) => {
                  const initials = agent.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const ownerInitials = agent.owner.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const formattedDate = new Date(
                    agent.createdAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={agent.id}
                      className="border-t border-[var(--border-raw)] hover:bg-[var(--surface-3)] cursor-pointer transition-colors"
                      onClick={() => setEditingAgent(agent)}
                    >
                      {/* Agent */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[var(--accent-dim)] border border-[var(--accent-raw)]/20 flex items-center justify-center flex-shrink-0 text-[var(--accent-raw)] text-xs font-semibold">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text)]">
                              {agent.name}
                            </p>
                            {agent.systemPrompt && (
                              <p className="text-[var(--text-3)] text-xs max-w-[200px] truncate">
                                {agent.systemPrompt.slice(0, 50)}
                                {agent.systemPrompt.length > 50 ? "…" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <AgentTypeBadge type={agent.type} />
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[var(--surface-3)] border border-[var(--border-2)] flex items-center justify-center flex-shrink-0 text-[var(--text-2)] text-xs font-medium">
                            {ownerInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[var(--text)] text-sm font-medium">
                                {agent.owner.name}
                              </p>
                              <PlanBadge plan={agent.owner.plan} />
                            </div>
                            <p className="text-[var(--text-3)] text-xs">
                              {agent.owner.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Voice */}
                      <td className="px-4 py-3">
                        <span className="bg-[var(--surface-3)] border border-[var(--border-2)] text-[var(--text-2)] text-xs px-2 py-0.5 rounded font-mono">
                          {agent.voice}
                        </span>
                      </td>

                      {/* Vapi ID */}
                      <td className="px-4 py-3">
                        {agent.vapiAssistantId ? (
                          <span className="text-[var(--text-3)] text-xs font-mono">
                            {agent.vapiAssistantId.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="text-[var(--text-3)] text-xs">
                            —
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {agent.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border bg-[var(--accent-dim)] text-[var(--accent-raw)] border-[var(--accent-raw)]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-raw)] inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] inline-block" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3">
                        <span className="text-[var(--text-2)] text-sm">
                          {formattedDate}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu >
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label="Agent actions"
                              className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className=" border bg-black border-[var(--border-raw)] rounded-lg shadow-lg min-w-36 p-1"
                          >
                            <DropdownMenuItem
                              onClick={() => setEditingAgent(agent)}
                              className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--surface-3)] rounded cursor-pointer"
                            >
                              <Pencil size={12} /> Edit Agent
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-[var(--border-raw)]" />
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(agent)}
                              className={`flex items-center gap-2 px-2.5 py-1.5 text-sm rounded cursor-pointer ${
                                agent.isActive
                                  ? "text-[var(--danger)] hover:bg-[var(--danger)]/10"
                                  : "text-[var(--accent-raw)] hover:bg-[var(--accent-dim)]"
                              }`}
                            >
                              {agent.isActive ? (
                                <>
                                  <PowerOff size={12} /> Disable Agent
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={12} /> Enable Agent
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <EditAgentDialog
        agent={editingAgent}
        onClose={() => setEditingAgent(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
