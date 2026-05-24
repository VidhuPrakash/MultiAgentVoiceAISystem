import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { CalendarCheck, Phone, UserCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STAT_CARDS = [
  {
    key: "totalLeads",
    label: "Total Leads",
    Icon: Users,
    color: "from-violet-500/20 to-violet-600/5",
    accent: "text-violet-400",
    border: "border-violet-500/20",
  },
  {
    key: "leadsWithName",
    label: "Leads With Name",
    Icon: UserCheck,
    color: "from-sky-500/20 to-sky-600/5",
    accent: "text-sky-400",
    border: "border-sky-500/20",
  },
  {
    key: "leadsWithPhone",
    label: "Leads With Phone",
    Icon: Phone,
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    key: "appointments",
    label: "Appointments",
    Icon: CalendarCheck,
    color: "from-amber-500/20 to-amber-600/5",
    accent: "text-amber-400",
    border: "border-amber-500/20",
  },
];

interface StatsResponse {
  totalLeads: number;
  leadsWithName: number;
  leadsWithPhone: number;
  appointments: number;
}

export function StatsSection() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/user/leads/stats");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadStats = () => fetchStats();
    loadStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STAT_CARDS.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-[var(--border-raw)] bg-[var(--surface)] p-4 md:p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24 bg-[var(--surface-2)]" />
            <Skeleton className="h-8 w-16 bg-[var(--surface-2)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {STAT_CARDS.map(({ key, label, Icon, color, accent, border }) => (
        <div
          key={key}
          className={`group relative rounded-xl border ${border} bg-[var(--surface)] p-4 md:p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
          />
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-2)] font-medium tracking-wide uppercase">
                {label}
              </span>
              <div className="p-1.5 rounded-lg bg-[var(--surface-2)]">
                <Icon className={`w-3.5 h-3.5 ${accent}`} />
              </div>
            </div>
            <span
              className={`text-2xl md:text-3xl font-bold ${accent} tabular-nums`}
            >
              {(data?.[key as keyof StatsResponse] ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
