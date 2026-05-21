import { Badge } from "@/components/ui/badge";
import { Role } from "../page";

export function RoleBadge({ role }: { role: Role }) {
  return role === "admin" ? (
    <Badge className="bg-[var(--accent-dim)] text-[var(--accent-raw)] border border-[var(--accent-raw)]/30 text-xs font-medium">
      Admin
    </Badge>
  ) : (
    <Badge className="bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border-2)] text-xs font-medium">
      User
    </Badge>
  );
}
