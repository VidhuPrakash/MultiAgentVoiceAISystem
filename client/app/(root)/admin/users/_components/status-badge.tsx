import { Badge } from "@/components/ui/badge";

export function StatusBadge({ blocked }: { blocked: boolean }) {
  return blocked ? (
    <Badge className="bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 text-xs font-medium">
      Blocked
    </Badge>
  ) : (
    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
      Active
    </Badge>
  );
}
