import { Badge } from "@/components/ui/badge";
import { Plan } from "../page";

export function PlanBadge({ plan }: { plan: Plan }) {
  const map = {
    free: "bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border-2)]",
    starter:
      "bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/20",
    pro: "bg-[var(--accent-glow)] text-[var(--accent-raw)] border border-[var(--accent-raw)]/30",
  };
  return (
    <Badge className={`text-xs font-medium capitalize ${map[plan]}`}>
      {plan}
    </Badge>
  );
}
