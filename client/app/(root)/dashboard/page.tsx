"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Clock,
  Users,
  Bot,
  Zap,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import api from "@/lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import { Sk } from "../admin/dashboard/_components/skeleton";
import Card from "../admin/dashboard/_components/card";
import { CardHeader } from "../admin/dashboard/_components/card-header";
import { ChartSkeleton } from "../admin/dashboard/_components/chart-skeleton";
import { Avatar } from "../leads/_components/avatar";
import { Badge } from "./_components/badge";

const COLORS = {
  amber: "#EF9F27",
  teal: "#1D9E75",
  blue: "#378ADD",
  purple: "#7F77DD",
  coral: "#D85A30",
  gray: "#888780",
  red: "#E24B4A",
};

export const STAT_ACCENTS = [
  COLORS.teal,
  COLORS.amber,
  COLORS.purple,
  COLORS.coral,
  COLORS.blue,
];

type Range = "daily" | "monthly" | "yearly";

interface Summary {
  calls: { total: number; answered: number; missed: number };
  minutes: { used: number; limit: number; percent: number };
  leads: { total: number };
  agents: { active: number; total: number };
}
interface CallStatus {
  status: string;
  value: number;
}

interface CallsOverTime {
  period: string;
  completed: number;
  missed: number;
}
interface MinutesOverTime {
  period: string;
  minutes: number;
  callCount: number;
}
interface AgentPerformance {
  agentId: string;
  agentName: string;
  agentType: string;
  total: number;
  completed: number;
  missed: number;
  avgSeconds: number;
  avgMinutes: number;
}
interface RecentLead {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  appointment: string | null;
  createdAt: string;

  agent: {
    name: string;
    type: string;
  };
}
const C = {
  teal: "#076c5a",
  amber: "#EF9F27",
  blue: "#378ADD",
  purple: "#7F77DD",
};
const STATUS_COLOR: Record<string, string> = {
  completed: C.teal,
  missed: "var(--danger)",
  failed: "var(--warning)",
  "in-progress": "var(--info)",
};
const AV = [
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E1F5EE", text: "#085041" },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [range, setRange] = useState<Range>("monthly");
  const [retry, setRetry] = useState(0);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus[]>([]);
  const [callsOT, setCallsOT] = useState<CallsOverTime[]>([]);
  const [minutesOT, setMinutesOT] = useState<MinutesOverTime[]>([]);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [leads, setLeads] = useState<RecentLead[]>([]);

  const [lSum, setLSum] = useState(true);
  const [lStatus, setLStatus] = useState(true);
  const [lCOT, setLCOT] = useState(true);
  const [lMOT, setLMOT] = useState(true);
  const [lAgents, setLAgents] = useState(true);
  const [lLeads, setLLeads] = useState(true);
  const [hasErr, setHasErr] = useState(false);
  const initializedMain = useRef(false);
  const initializedCharts = useRef(false);
  const mountedMain = useRef(false);
  const mountedCharts = useRef(false);

  async function get<T>(path: string): Promise<T> {
    const r = await api.get<{ success: boolean; data: T }>(
      `/user/analytics/${path}`,
    );
    return r.data.data;
  }

  useEffect(() => {
    if (mountedMain.current && retry === 0) {
      return;
    }

    mountedMain.current = true;

    setHasErr(false);

    Promise.all([
      get<Summary>("summary")
        .then(setSummary)
        .finally(() => setLSum(false)),

      get<CallStatus[]>("call-status")
        .then(setCallStatus)
        .finally(() => setLStatus(false)),

      get<AgentPerformance[]>("agent-performance")
        .then(setAgents)
        .finally(() => setLAgents(false)),

      get<RecentLead[]>("recent-leads")
        .then(setLeads)
        .finally(() => setLLeads(false)),
    ]).catch(() => setHasErr(true));
  }, [retry]);

  useEffect(() => {
    if (mountedCharts.current && retry === 0) {
      return;
    }

    mountedCharts.current = true;

    setLCOT(true);
    setLMOT(true);

    Promise.all([
      get<CallsOverTime[]>(`calls-over-time?range=${range}`).then(setCallsOT),

      get<MinutesOverTime[]>(`minutes-over-time?range=${range}`).then(
        setMinutesOT,
      ),
    ]).finally(() => {
      setLCOT(false);
      setLMOT(false);
    });
  }, [range, retry]);

  const statusTotal = callStatus.reduce((s, d) => s + d.value, 0);
  const insights = useMemo(() => {
    if (!minutesOT.length) return null;
    const peak = [...minutesOT].sort((a, b) => b.minutes - a.minutes)[0];
    const avgMin = Math.round(
      minutesOT.reduce((s, d) => s + d.minutes, 0) / minutesOT.length,
    );
    const avgCalls = Math.round(
      minutesOT.reduce((s, d) => s + d.callCount, 0) / minutesOT.length,
    );
    return { peak: peak?.period, avgMin, avgCalls };
  }, [minutesOT]);

  const kpis = [
    {
      label: "Total Calls",
      icon: Phone,
      value: (summary?.calls.total ?? 0).toLocaleString(),
      sub: "All calls",
    },
    {
      label: "Answered",
      icon: PhoneCall,
      value: (summary?.calls.answered ?? 0).toLocaleString(),
      sub: `${summary ? Math.round((summary.calls.answered / (summary.calls.total || 1)) * 100) : 0}% rate`,
    },
    {
      label: "Missed",
      icon: PhoneMissed,
      value: (summary?.calls.missed ?? 0).toLocaleString(),
      sub: "Unanswered",
    },
    {
      label: "Minutes Used",
      icon: Clock,
      value: `${(summary?.minutes.used ?? 0).toLocaleString()}/${(summary?.minutes.limit ?? 0).toLocaleString()}`,
      sub: `${summary?.minutes.percent ?? 0}% used`,
      bar: summary?.minutes.percent,
    },
    {
      label: "Leads",
      icon: Users,
      value: (summary?.leads.total ?? 0).toLocaleString(),
      sub: "Total captured",
    },
    {
      label: "Active Agents",
      icon: Bot,
      value: `${summary?.agents.active ?? 0}/${summary?.agents.total ?? 0}`,
      sub: "Currently active",
      bar:
        summary && summary.agents.total > 0
          ? Math.round((summary.agents.active / summary.agents.total) * 100)
          : 0,
    },
  ];

  if (hasErr)
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
          <AlertCircle size={20} className="text-[var(--danger)]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)] mb-1">
            Failed to load analytics
          </p>
          <p className="text-[11px] text-[var(--text-2)]">
            Could not reach server
          </p>
        </div>
        <button
          onClick={() => setRetry((k) => k + 1)}
          className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-lg text-[var(--text)] cursor-pointer"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[clamp(16px,2vw,22px)] font-bold text-[var(--text)] tracking-tight m-0">
            Analytics
          </h1>
          <p className="text-[11px] text-[var(--text-2)] mt-0.5 m-0">
            Monitor AI voice performance, activity trends and lead conversion
          </p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="bg-[var(--surface)] border border-[var(--border-raw)] rounded-2xl p-4 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--border-2)] cursor-default"
          >
            <div
              className="absolute top-0 left-0 w-[3px] h-full"
              style={{ background: STAT_ACCENTS[i % STAT_ACCENTS.length] }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--text-2)] uppercase tracking-widest">
                {k.label}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
                <k.icon
                  size={13}
                  style={{ color: STAT_ACCENTS[i % STAT_ACCENTS.length] }}
                />
              </div>
            </div>
            {lSum ? (
              <Sk h="26px" w="55%" />
            ) : (
              <p className="text-[1.5rem] font-bold text-[var(--text)] font-mono leading-none m-0">
                {k.value}
              </p>
            )}
            {lSum ? (
              <Sk h="10px" w="70%" />
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-[var(--text-2)] m-0">{k.sub}</p>
                {k.bar !== undefined && (
                  <div className="h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, k.bar)}%`,
                        background: STAT_ACCENTS[i % STAT_ACCENTS.length],
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Donut + Stacked Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Donut */}
        <Card>
          <CardHeader title="Call Status Distribution" />
          {lStatus ? (
            <div className="flex items-center justify-center h-52">
              <Sk h="160px" w="160px" r="50%" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callStatus}
                      dataKey="value"
                      nameKey="status"
                      innerRadius="52%"
                      outerRadius="80%"
                      strokeWidth={0}
                      paddingAngle={2}
                    >
                      {callStatus.map((d, i) => (
                        <Cell
                          key={i}
                          fill={STATUS_COLOR[d.status] ?? C.amber}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="bg-[var(--surface)] border border-[var(--border-raw)] rounded-xl px-3 py-2 text-[11px] font-mono">
                            <span className="capitalize font-bold">
                              {String(payload[0].name)}
                            </span>
                            : {Number(payload[0].value).toLocaleString()}
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-[var(--text)] font-mono">
                    {statusTotal.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[var(--text-2)] uppercase tracking-widest">
                    Total
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {callStatus.map((d) => {
                  const color = STATUS_COLOR[d.status] ?? C.amber;
                  const pct =
                    statusTotal > 0
                      ? Math.round((d.value / statusTotal) * 100)
                      : 0;
                  return (
                    <div key={d.status} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-sm"
                            style={{ background: color }}
                          />
                          <span className="text-[11px] text-[var(--text-2)] capitalize">
                            {d.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[var(--text)]">
                            {d?.value?.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-2)]">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Stacked bar */}
        <Card>
          <CardHeader title="Call Volume Over Time" />
          {lCOT ? (
            <ChartSkeleton />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={callsOT}
                  margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    stroke="var(--border-raw)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{
                      fill: "var(--text-2)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "var(--text-2)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    wrapperStyle={{ outline: "none" }}
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-raw)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                      boxShadow: "0 8px 24px rgba(0,0,0,.2)",
                      padding: "8px 12px",
                    }}
                    labelStyle={{
                      color: "var(--text-2)",
                      fontSize: "10px",
                      marginBottom: "4px",
                    }}
                    itemStyle={{ color: "var(--text)" }}
                    cursor={{ fill: "var(--surface-2)", opacity: 0.5 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "10px" }}
                    formatter={(v) => (
                      <span
                        style={{
                          color: "var(--text-2)",
                          textTransform: "capitalize",
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    stackId="a"
                    fill={C.teal}
                  />
                  <Bar
                    dataKey="missed"
                    name="Missed"
                    stackId="a"
                    fill="var(--danger)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Minutes area chart */}
      <Card>
        <CardHeader title="Minutes Consumption Trend" />
        {lMOT ? (
          <ChartSkeleton />
        ) : (
          <>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={minutesOT}
                  margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gMin" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={C.purple}
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.teal} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--border-raw)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{
                      fill: "var(--text-2)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "var(--text-2)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    wrapperStyle={{ outline: "none" }}
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-raw)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                      boxShadow: "0 8px 24px rgba(0,0,0,.2)",
                      padding: "8px 12px",
                    }}
                    labelStyle={{
                      color: "var(--text-2)",
                      fontSize: "10px",
                      marginBottom: "4px",
                    }}
                    itemStyle={{ color: "var(--text)" }}
                    cursor={{ fill: "var(--surface-2)", opacity: 0.5 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "10px" }}
                    formatter={(v) => (
                      <span
                        style={{
                          color: "var(--text-2)",
                          textTransform: "capitalize",
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    name="Minutes"
                    stroke={C.purple}
                    strokeWidth={1.8}
                    fill="url(#gMin)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="callCount"
                    name="Calls"
                    stroke={C.teal}
                    strokeWidth={1.5}
                    fill="url(#gCalls)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {insights && (
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: "Peak Period", value: insights.peak },
                  {
                    label: "Avg Minutes",
                    value: insights.avgMin.toLocaleString(),
                  },
                  {
                    label: "Avg Calls",
                    value: insights.avgCalls.toLocaleString(),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-lg"
                  >
                    <Zap size={10} style={{ color: C.purple }} />
                    <span className="text-[10px] text-[var(--text-2)]">
                      {item.label}:
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text)] font-mono">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader title="Agent Performance Intelligence" />
        {lAgents ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Sk h="28px" w="28px" r="50%" />
                <Sk h="12px" w="120px" />
                <Sk h="12px" w="60px" />
                <Sk h="8px" w="80px" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr>
                    {[
                      "Agent",
                      "Type",
                      "Total Calls",
                      "Completed",
                      "Missed",
                      "Avg Duration",
                      "Completion %",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-2)] uppercase tracking-wider border-b border-[var(--border-raw)] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a, i) => {
                    const pct =
                      a.total > 0
                        ? Math.round((a.completed / a.total) * 100)
                        : 0;
                    const barColor =
                      pct >= 70
                        ? C.teal
                        : pct >= 40
                          ? C.amber
                          : "var(--danger)";
                    return (
                      <tr
                        key={a.agentId ?? `i-${i}`}
                        className="border-b border-[var(--border-raw)] last:border-0 hover:bg-[var(--surface-2)] transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={a.agentName} />
                            <span className="font-medium text-[var(--text)]">
                              {a.agentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge>{a.agentType}</Badge>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[var(--text)]">
                          {a?.total?.toLocaleString()}
                        </td>
                        <td
                          className="px-3 py-2.5 font-mono"
                          style={{ color: C.teal }}
                        >
                          {a.completed.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[var(--danger)]">
                          {a.missed.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[var(--text-2)]">
                          {a.avgMinutes}s
                        </td>
                        <td className="px-3 py-2.5 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  background: barColor,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-[var(--text)] min-w-[28px] text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {agents.map((a, i) => {
                const pct =
                  a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0;
                const barColor =
                  pct >= 70 ? C.teal : pct >= 40 ? C.amber : "var(--danger)";
                return (
                  <div
                    key={a.agentId}
                    className="bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-xl p-3 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.agentName} />
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[var(--text)] m-0">
                          {a.agentName}
                        </p>
                        <Badge>{a.agentType}</Badge>
                      </div>
                      <span
                        className="text-[13px] font-bold font-mono"
                        style={{ color: barColor }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { l: "Total", v: a.total, c: "var(--text)" },
                        { l: "Done", v: a.completed, c: C.teal },
                        { l: "Missed", v: a.missed, c: "var(--danger)" },
                        {
                          l: "Avg",
                          v: `${a.avgMinutes}m`,
                          c: "var(--text-2)",
                        },
                      ].map((s) => (
                        <div key={s.l} className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-[var(--text-2)] uppercase tracking-wider">
                            {s.l}
                          </span>
                          <span
                            className="text-[13px] font-bold font-mono"
                            style={{ color: s.c }}
                          >
                            {typeof s.v === "number"
                              ? s.v.toLocaleString()
                              : s.v}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-1 rounded-full bg-[var(--surface)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Recent Leads */}
      <Card>
        <CardHeader
          title="Recent Leads"
          action={
            <button
              onClick={() => router.push("/leads")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-lg text-[var(--text-2)] cursor-pointer hover:text-[var(--text)] transition-colors"
            >
              View All <ExternalLink size={10} />
            </button>
          }
        />
        {lLeads ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Sk h="28px" w="28px" r="50%" />
                <Sk h="12px" w="110px" />
                <Sk h="12px" w="80px" />
                <Sk h="12px" w="70px" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr>
                    {[
                      "Lead",
                      "Phone",
                      "Purpose",
                      "Appointment",
                      "Agent",
                      "Created",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-2)] uppercase tracking-wider border-b border-[var(--border-raw)] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className="border-b border-[var(--border-raw)] last:border-0 hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.name} />
                          <span className="font-medium text-[var(--text)] whitespace-nowrap">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[var(--text-2)] whitespace-nowrap">
                        {lead.phone}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-2)] max-w-[140px]">
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                          {lead.purpose}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {lead.appointment ? (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(7,108,90,0.12)",
                              color: C.teal,
                            }}
                          >
                            {lead.appointment}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-2)]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-[var(--text)]">
                            {lead.agent?.name ?? "—"}
                          </span>

                          <span className="text-[10px] text-[var(--text-2)] capitalize">
                            {lead.agent?.type ?? ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[var(--text-2)] whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => router.push("/leads")}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-md text-[var(--text-2)] cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap"
                        >
                          View All
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {leads.map((lead, i) => (
                <div
                  key={lead.id}
                  className="bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text)] m-0 truncate">
                        {lead.name}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--text-2)] m-0">
                        {lead.phone}
                      </p>
                    </div>
                    {lead.appointment && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "rgba(7,108,90,0.12)",
                          color: C.teal,
                        }}
                      >
                        Booked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-2)] m-0">
                    {lead.purpose}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--text-2)]">
                        Agent: {lead.agent?.name ?? "—"}
                      </span>

                      <span className="text-[9px] text-[var(--text-2)] capitalize">
                        {lead.agent?.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-2)]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push("/leads")}
                className="w-full py-2.5 text-[12px] font-semibold bg-[var(--surface-2)] border border-[var(--border-raw)] rounded-xl text-[var(--text)] cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[var(--surface-3)] transition-colors"
              >
                View all leads <ExternalLink size={11} />
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
