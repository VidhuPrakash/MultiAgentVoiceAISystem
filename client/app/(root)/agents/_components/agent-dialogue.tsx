import { useState } from "react";
import { Agent, AgentType, VOICE_LABELS, VoiceType } from "../page";
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
  CalendarDays,
  HelpCircle,
  Loader2,
  Mic,
  Phone,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export interface AgentFormState {
  name: string;
  type: AgentType;
  businessName: string;
  systemPrompt: string;
  voice: VoiceType;
  firstMessage: string;
  isActive: boolean;
}

const DEFAULT_FORM: AgentFormState = {
  name: "",
  type: "receptionist",
  businessName: "",
  systemPrompt: "",
  voice: "shimmer",
  firstMessage: "",
  isActive: true,
};

const getFormState = (data?: Agent | null): AgentFormState => {
  if (!data) return DEFAULT_FORM;

  return {
    name: data.name,
    type: data.type,
    businessName: "",
    systemPrompt: data.systemPrompt ?? "",
    voice: data.voice,
    firstMessage: data.firstMessage,
    isActive: data.isActive,
  };
};

export function AgentFormDialog({
  open,
  onClose,
  initialData,
  onSave,
  saving,
  saveError,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: Agent | null;
  onSave: (form: AgentFormState) => Promise<void>;
  saving: boolean;
  saveError: string | null;
}) {
  const [form, setForm] = useState<AgentFormState>(() =>
    getFormState(initialData),
  );

  function patch(k: keyof AgentFormState, v: string | boolean) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const isEdit = !!initialData;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg border-[--border-2] text-[--text] sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? "Edit Agent" : "Create New Agent"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[--text-2]">
            {isEdit
              ? "Update your agent's configuration and voice settings."
              : "Configure a new AI voice agent for your business."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-4">
          {/* Inline save error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-md border border-[--danger]/30 bg-[--danger]/8 px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[--danger]" />
              <p className="text-xs text-[--danger]">{saveError}</p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[--text-2]">Agent Name</Label>
            <Input
              placeholder="e.g. Clinic Receptionist"
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
              className="border-[--border-2] bg-[--surface-2] text-sm text-[--text] placeholder:text-[--text-3] focus-visible:ring-[--accent-raw]/40"
            />
          </div>

          {/* Type + Voice */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[--text-2]">Agent Type</Label>
              <Select value={form.type} onValueChange={(v) => patch("type", v)}>
                <SelectTrigger className="border-[--border-2] bg-[--surface-2] text-sm text-[--text] focus:ring-[--accent-raw]/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[--border-2] bg-[--surface-2] text-[--text]">
                  <SelectItem
                    value="receptionist"
                    className="text-sm focus:bg-[--surface-3]"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[--accent-raw]" />{" "}
                      Receptionist
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="appointment"
                    className="text-sm focus:bg-[--surface-3]"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-[--info]" />{" "}
                      Appointment
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="faq"
                    className="text-sm focus:bg-[--surface-3]"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-3.5 w-3.5 text-[--warning]" />{" "}
                      FAQ
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[--text-2]">Voice</Label>
              <Select
                value={form.voice}
                onValueChange={(v) => patch("voice", v)}
              >
                <SelectTrigger className="border-[--border-2] bg-[--surface-2] text-sm text-[--text] focus:ring-[--accent-raw]/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[--border-2] bg-[--surface-2] text-[--text]">
                  {(Object.keys(VOICE_LABELS) as VoiceType[]).map((v) => (
                    <SelectItem
                      key={v}
                      value={v}
                      className="text-sm focus:bg-[--surface-3]"
                    >
                      <span className="flex items-center gap-2">
                        <Mic className="h-3.5 w-3.5 text-[--text-2]" />
                        {VOICE_LABELS[v]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Business name (create only) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs text-[--text-2]">
                Business Name{" "}
                <span className="text-[--text-3]">
                  (used in default prompt)
                </span>
              </Label>
              <Input
                placeholder="e.g. City Clinic"
                value={form.businessName}
                onChange={(e) => patch("businessName", e.target.value)}
                className="border-[--border-2] bg-[--surface-2] text-sm text-[--text] placeholder:text-[--text-3] focus-visible:ring-[--accent-raw]/40"
              />
            </div>
          )}

          {/* First message */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[--text-2]">
              First Message{" "}
              <span className="text-[--text-3]">(optional — uses default)</span>
            </Label>
            <Textarea
              placeholder="Hello! Thank you for calling..."
              rows={2}
              value={form.firstMessage}
              onChange={(e) => patch("firstMessage", e.target.value)}
              className="resize-none border-[--border-2] bg-[--surface-2] text-sm text-[--text] placeholder:text-[--text-3] focus-visible:ring-[--accent-raw]/40"
            />
          </div>

          {/* System prompt */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[--text-2]">
              System Prompt{" "}
              <span className="text-[--text-3]">
                (optional — uses default template)
              </span>
            </Label>
            <Textarea
              placeholder="You are a professional assistant..."
              rows={4}
              value={form.systemPrompt}
              onChange={(e) => patch("systemPrompt", e.target.value)}
              className="resize-none border-[--border-2] bg-[--surface-2] font-mono text-xs text-[--text] placeholder:text-[--text-3] focus-visible:ring-[--accent-raw]/40"
            />
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-[--border-raw] bg-[--surface-2] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[--text]">
                  Agent Active
                </p>
                <p className="text-xs text-[--text-2]">
                  Inactive agents won&#39;t accept calls
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => patch("isActive", v)}
                className="data-[state=checked]:bg-[--accent-raw]"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-[--border-2] bg-transparent text-sm text-[--text-2] hover:bg-[--surface-2] hover:text-[--text]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={saving || !form.name?.trim()}
          >
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save changes" : "Create agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
