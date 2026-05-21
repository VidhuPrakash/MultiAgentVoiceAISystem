import { startTransition, useEffect, useState } from "react";
import { Agent, AgentType, UpdateAgentPayload } from "../page";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Loader2,
  MessageSquare,
  PhoneCall,
  XCircle,
} from "lucide-react";
import { CopyChip } from "./copy-chip";

interface EditDialogProps {
  agent: Agent | null;
  onClose: () => void;
  onSaved: (updated: Agent) => void;
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

const VOICE_OPTIONS = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export function EditAgentDialog({ agent, onClose, onSaved }: EditDialogProps) {
  const [name, setName] = useState(agent?.name ?? "");
  const [voice, setVoice] = useState(agent?.voice ?? "alloy");
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? "");
  const [isActive, setIsActive] = useState(agent?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const agentId = agent?.id;

  useEffect(() => {
    if (agent) {
      startTransition(() => {
        setName(agent.name);
        setVoice(agent.voice);
        setSystemPrompt(agent.systemPrompt ?? "");
        setIsActive(agent.isActive);
        setErrors({});
        setGlobalError(null);
      });
    }
  }, [agentId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (systemPrompt.length > 4000)
      e.systemPrompt = "System prompt must be 4000 characters or fewer";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!agent || !validate()) return;
    setIsSaving(true);
    setGlobalError(null);
    const payload: UpdateAgentPayload = { name, voice, systemPrompt, isActive };
    try {
      const res = await api.patch<{ data: Agent; success: boolean }>(
        `/admin/agents/${agent.id}`,
        payload,
      );
      onSaved(res.data.data);
      toast.success("Agent updated", {
        style: {
          background: "var(--surface)",
          border: "1px solid var(--accent-raw)",
          color: "var(--accent-raw)",
        },
      });
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          status?: number;
          data?: { errors?: { field: string; message: string }[] };
        };
      };
      if (axiosErr.response?.status === 400 && axiosErr.response.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const fe of axiosErr.response.data.errors) {
          fieldErrors[fe.field] = fe.message;
        }
        setErrors(fieldErrors);
      } else {
        setGlobalError("Failed to save — please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = agent
    ? new Date(agent.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Dialog open={!!agent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg w-full rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] p-0 overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[var(--border-raw)]">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold text-[var(--text)]">
              Edit Agent
            </DialogTitle>
            {agent && <AgentTypeBadge type={agent.type} />}
          </div>
          <DialogDescription className="text-[var(--text-2)] text-sm mt-1">
            Changes sync to VAPI on save.
          </DialogDescription>
          {agent?.vapiAssistantId && (
            <div className="mt-2">
              <CopyChip text={agent.vapiAssistantId} />
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {globalError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              {globalError}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="edit-agent-name"
              className="block text-xs font-medium text-[var(--text-2)] mb-1.5"
            >
              Agent Name
            </label>
            <input
              id="edit-agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[var(--surface-3)] border border-[var(--border-raw)] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-raw)] transition-colors"
              placeholder="e.g. Sales Receptionist"
            />
            {errors.name && (
              <p className="text-[var(--danger)] text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Voice */}
          <div>
            <label
              htmlFor="edit-agent-voice"
              className="block text-xs font-medium text-[var(--text-2)] mb-1.5"
            >
              Voice
            </label>
            <select
              id="edit-agent-voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[var(--surface-3)] border border-[var(--border-raw)] text-[var(--text)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-raw)] transition-colors appearance-none"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div>
            <label
              htmlFor="edit-agent-prompt"
              className="block text-xs font-medium text-[var(--text-2)] mb-1.5"
            >
              System Prompt
            </label>
            <div className="relative">
              <textarea
                id="edit-agent-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
                maxLength={4000}
                className="w-full px-3 py-2 rounded-md bg-[var(--surface-3)] border border-[var(--border-raw)] text-[var(--text)] text-sm placeholder:text-[var(--text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-raw)] transition-colors resize-y font-mono"
                style={{ fontFamily: "var(--font-mono)", minHeight: "160px" }}
                placeholder="Describe what this agent should do, its personality, and knowledge…"
              />
              <span className="absolute bottom-2 right-2 text-[var(--text-3)] text-xs pointer-events-none">
                {systemPrompt.length} / 4000
              </span>
            </div>
            {errors.systemPrompt && (
              <p className="text-[var(--danger)] text-xs mt-1">
                {errors.systemPrompt}
              </p>
            )}
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-md bg-[var(--surface-2)] border border-[var(--border-raw)]">
            <span className="text-xs font-medium text-[var(--text-2)]">
              Agent Status
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent-raw)] ${
                  isActive ? "bg-[var(--accent-raw)]" : "bg-[var(--surface-3)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  isActive ? "text-[var(--accent-raw)]" : "text-[var(--danger)]"
                }`}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 size={12} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Disabled
                  </>
                )}
              </span>
            </div>
          </div>
          {!isActive && (
            <p className="flex items-center gap-1.5 text-[var(--warning)] text-xs -mt-3">
              <AlertTriangle size={11} className="flex-shrink-0" />
              Disabling this agent will prevent it from taking calls.
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[var(--border-raw)] flex items-center justify-between">
          <span className="text-[var(--text-3)] text-xs">
            Last updated: {formattedDate}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-md text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-[var(--accent-raw)] text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
