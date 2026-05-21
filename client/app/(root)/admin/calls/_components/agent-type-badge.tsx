import { Calendar, MessageSquare, PhoneCall } from "lucide-react";

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

export function AgentTypeBadge({
  type,
}: {
  type: keyof typeof AGENT_TYPE_CONFIG;
}) {
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
