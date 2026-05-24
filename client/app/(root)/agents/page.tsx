"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Bot,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Copy,
  Phone,
  CalendarDays,
  HelpCircle,
  Mic,
  ChevronRight,
  Loader2,
  Zap,
  Shield,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api"; // ← your axios instance
import { AxiosError } from "axios";
import { StatCard } from "../admin/users/_components/stat-card";
import { ApiError } from "@/types/auth";
import { AgentFormDialog, AgentFormState } from "./_components/agent-dialogue";
import { InlineError } from "./_components/inline-error";
import { AgentCardSkeleton } from "./_components/agent-card-skeleton";
import { EmptyState } from "./_components/empty-state";
import { AgentCard } from "./_components/agent-card";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentType = "receptionist" | "appointment" | "faq";
export type VoiceType =
  | "shimmer"
  | "alloy"
  | "echo"
  | "nova"
  | "onyx"
  | "fable";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  voice: VoiceType;
  isActive: boolean;
  firstMessage: string;
  systemPrompt?: string;
  vapiAssistantId: string;
  createdAt: string;
}

export const VOICE_LABELS: Record<VoiceType, string> = {
  shimmer: "Shimmer",
  alloy: "Alloy",
  echo: "Echo",
  nova: "Nova",
  onyx: "Onyx",
  fable: "Fable",
};

const PLAN_LIMIT = 1;

function extractApiMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as ApiError)?.message ?? fallback;
  }
  return fallback;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Agent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [agentLimit, setAgentLimit] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [editingLoading, setEditingLoading] = useState(false);

  const reFetchAgents = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get<{ success: boolean; data: Agent[] }>(
        "/user/agents",
      );
      setAgents(data.data);
    } catch (err) {
      setFetchError(
        extractApiMessage(err, "Failed to load agents. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const [agentsRes, billingRes] = await Promise.all([
          api.get<{ success: boolean; data: Agent[] }>("/user/agents"),

          api.get<{
            success: boolean;
            data: {
              limits: {
                agentLimit: number;
              };
            };
          }>("/user/billing"),
        ]);

        setAgents(agentsRes.data.data);

        setAgentLimit(billingRes.data.data.limits.agentLimit);
      } catch (err) {
        setFetchError(
          extractApiMessage(err, "Failed to load agents. Please try again."),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const activeCount = agents.filter((a) => a.isActive).length;
  const atLimit = agents.length >= agentLimit;

  function openCreate() {
    setEditTarget(null);
    setSaveError(null);
    setDialogOpen(true);
  }

  async function openEdit(agent: Agent) {
    try {
      setEditingLoading(true);
      setSaveError(null);

      const { data } = await api.get<{
        success: boolean;
        data: Agent;
      }>(`/user/agents/${agent.id}`);

      setEditTarget(data.data);
      setDialogOpen(true);
    } catch (err) {
      setSaveError(extractApiMessage(err, "Failed to load agent details."));
    } finally {
      setEditingLoading(false);
    }
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditTarget(null);
    setSaveError(null);
  }

  async function handleSave(form: AgentFormState) {
    setSaving(true);
    setSaveError(null);

    try {
      if (editTarget) {
        const { data } = await api.patch<{ success: boolean; data: Agent }>(
          `/user/agents/${editTarget.id}`,
          {
            name: form.name,
            systemPrompt: form.systemPrompt || undefined,
            voice: form.voice,
            firstMessage: form.firstMessage || undefined,
            isActive: form.isActive,
          },
        );
        setAgents((prev) =>
          prev.map((ag) => (ag.id === editTarget.id ? data.data : ag)),
        );
      } else {
        const { data } = await api.post<{ success: boolean; data: Agent }>(
          "/user/agents",
          {
            name: form.name,
            type: form.type,
            businessName: form.businessName || undefined,
            systemPrompt: form.systemPrompt || undefined,
            voice: form.voice,
            firstMessage: form.firstMessage || undefined,
          },
        );
        setAgents((prev) => [...prev, data.data]);
      }
      closeDialog();
    } catch (err) {
      setSaveError(
        extractApiMessage(
          err,
          editTarget ? "Failed to update agent." : "Failed to create agent.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(agent: Agent) {
    setTogglingIds((s) => new Set(s).add(agent.id));

    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === agent.id ? { ...ag, isActive: !ag.isActive } : ag,
      ),
    );
    try {
      const { data } = await api.patch<{ success: boolean; data: Agent }>(
        `/user/agents/${agent.id}`,
        { isActive: !agent.isActive },
      );

      setAgents((prev) =>
        prev.map((ag) => (ag.id === agent.id ? data.data : ag)),
      );
    } catch (err) {
      setAgents((prev) =>
        prev.map((ag) =>
          ag.id === agent.id ? { ...ag, isActive: agent.isActive } : ag,
        ),
      );
      console.error("Toggle failed:", extractApiMessage(err, "Unknown error"));
    } finally {
      setTogglingIds((s) => {
        const next = new Set(s);
        next.delete(agent.id);
        return next;
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/user/agents/${deleteTarget.id}`);
      setAgents((prev) => prev.filter((ag) => ag.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", extractApiMessage(err, "Unknown error"));
      // Keep dialog open — user can retry
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[--bg]">
      <div className=" max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[--text]">
              Agent Management
            </h1>
            <p className="mt-1 text-sm text-[--text-2]">
              Configure AI voice agents that handle calls, bookings &amp; FAQs.
            </p>
          </div>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button onClick={openCreate} disabled={atLimit || loading}>
                    <Plus className="h-4 w-4" />
                    New Agent
                  </Button>
                </span>
              </TooltipTrigger>
              {atLimit && (
                <TooltipContent side="bottom" className="text-xs">
                  Upgrade your plan to create more agents
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            color="bg-[var(--surface-3)] text-[var(--text-2)]"
            icon={Bot}
            label="Total Agents"
            value={agents.length}
          />
          <StatCard
            color="bg-[var(--accent-dim)] text-[var(--accent-raw)]"
            icon={Zap}
            label="Active"
            value={activeCount}
          />
          <StatCard
            color="bg-[var(--danger)]/10 text-[var(--danger)]"
            icon={Shield}
            label="Plan Limit"
            value={`${agents.length}/${agentLimit}`}
          />
          <StatCard
            color="bg-[var(--accent-glow)] text-[var(--accent-raw)]"
            icon={Mic}
            label="Voices Used"
            value={new Set(agents.map((a) => a.voice)).size}
          />
        </div>

        {fetchError && (
          <div className="mb-6">
            <InlineError message={fetchError} onRetry={reFetchAgents} />
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        ) : agents.length === 0 && !fetchError ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                toggling={togglingIds.has(agent.id)}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
              />
            ))}

            {/* Ghost "add" card */}
            {!atLimit && (
              <button
                onClick={openCreate}
                className={cn(
                  "group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl",
                  "border border-dashed border-[--border-2] bg-transparent",
                  "text-[--text-3] transition-all duration-200",
                  "hover:border-[--accent-raw]/50 hover:bg-[--surface] hover:text-[--accent-raw]",
                  "hover:shadow-[0_0_20px_rgba(7,108,90,0.07)]",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[--border-2] transition-colors group-hover:border-[--accent-raw]/50">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Add agent</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AgentFormDialog
        key={editTarget?.id ?? "create"}
        open={dialogOpen}
        onClose={closeDialog}
        initialData={editTarget}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-[--border-2] bg-[--surface] text-[--text]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Delete &quot;{deleteTarget?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[--text-2]">
              This will permanently remove the agent and disconnect it from
              Vapi. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="border-[--border-2] bg-transparent text-sm text-[--text-2] hover:bg-[--surface-2] hover:text-[--text]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-[--danger] text-sm font-medium text-white hover:bg-[--danger]/85"
            >
              {deleting && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Delete agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
