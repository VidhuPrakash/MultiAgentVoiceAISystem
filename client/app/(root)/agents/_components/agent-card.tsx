import { useState } from "react";
import { Agent } from "../page";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Bot,
  ChevronRight,
  Clock,
  Copy,
  Loader2,
  MoreVertical,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { AgentTypeBadge } from "./agent-type";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { VoicePill } from "./voice-pill";
import { Badge } from "@/components/ui/badge";

export function AgentCard({
  agent,
  toggling,
  onEdit,
  onDelete,
  onToggle,
}: {
  agent: Agent;
  toggling: boolean;
  onEdit: (a: Agent) => void;
  onDelete: (a: Agent) => void;
  onToggle: (a: Agent) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    navigator.clipboard.writeText(agent.vapiAssistantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const since = new Date(agent.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-200",
        "bg-[--surface] border-[--border-raw]",
        "hover:border-[--border-3] hover:shadow-[0_0_24px_rgba(7,108,90,0.08)]",
        !agent.isActive && "opacity-60 hover:opacity-80",
      )}
    >
      {/* Active indicator strip */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] rounded-l-sm transition-colors",
          agent.isActive ? "bg-[--accent-raw]" : "bg-[--border-2]",
        )}
      />

      <CardHeader className="pl-5 pr-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[--border-2] bg-[--surface-2]">
              <Bot className="h-4 w-4 text-[--accent-raw]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-snug text-[--text]">
                {agent.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <AgentTypeBadge type={agent.type} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {toggling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[--text-2]" />
                    ) : (
                      <Switch
                        checked={agent.isActive}
                        onCheckedChange={() => onToggle(agent)}
                        className="data-[state=checked]:bg-[--accent-raw] scale-90"
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {agent.isActive ? "Deactivate agent" : "Activate agent"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[--text-2] hover:text-[--text] hover:bg-[--surface-3]"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 border-[--border-2] bg-[--surface-2] text-[--text]"
              >
                <DropdownMenuItem
                  onClick={() => onEdit(agent)}
                  className="gap-2 text-xs hover:bg-[--surface-3] focus:bg-[--surface-3]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggle(agent)}
                  disabled={toggling}
                  className="gap-2 text-xs hover:bg-[--surface-3] focus:bg-[--surface-3]"
                >
                  <Power className="h-3.5 w-3.5" />
                  {agent.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[--border-raw]" />
                <DropdownMenuItem
                  onClick={() => onDelete(agent)}
                  className="gap-2 text-xs text-[--danger] hover:bg-[--danger]/10 focus:bg-[--danger]/10 focus:text-[--danger]"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pl-5 pr-4 pb-4 space-y-3">
        <p className="line-clamp-2 text-xs leading-relaxed text-[--text-2]">
          &quot;{agent.firstMessage}&quot;
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <VoicePill voice={agent.voice} />
          <span className="inline-flex items-center gap-1 rounded-full border border-[--border-2] bg-[--surface-2] px-2 py-0.5 font-mono text-[10px] text-[--text-2]">
            <Clock className="h-2.5 w-2.5" />
            {since}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-2 py-0 text-[10px] border",
              agent.isActive
                ? "border-[--accent-raw]/40 bg-[--accent-raw]/10 text-[--accent-raw]"
                : "border-[--border-2] text-[--text-3]",
            )}
          >
            {agent.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-[--border-raw] bg-[--bg] px-2.5 py-1.5">
          <span className="font-mono text-[10px] text-[--text-3] shrink-0">
            ID
          </span>
          <span className="flex-1 truncate font-mono text-[10px] text-[--text-2]">
            {agent.vapiAssistantId}
          </span>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={copyId}
                  className="shrink-0 text-[--text-3] transition-colors hover:text-[--accent-raw]"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {copied ? "Copied!" : "Copy ID"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(agent)}
          className="w-full h-7 justify-between rounded-md border border-[--border-raw] bg-transparent px-3 text-xs text-[--text-2] hover:border-[--border-3] hover:bg-[--surface-2] hover:text-[--text]"
        >
          Configure agent
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
