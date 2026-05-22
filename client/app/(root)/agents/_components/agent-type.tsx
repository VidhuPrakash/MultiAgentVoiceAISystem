import { CalendarDays, HelpCircle, Phone } from "lucide-react";
import { AgentType } from "../page";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  AgentType,
  { label: string; Icon: React.ElementType; color: string }
> = {
  receptionist: {
    label: "Receptionist",
    Icon: Phone,
    color: "text-[--accent-raw]",
  },
  appointment: {
    label: "Appointment",
    Icon: CalendarDays,
    color: "text-[--info]",
  },
  faq: { label: "FAQ", Icon: HelpCircle, color: "text-[--warning]" },
};

export function AgentTypeBadge({ type }: { type: AgentType }) {
  const { label, Icon, color } = TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        color,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
