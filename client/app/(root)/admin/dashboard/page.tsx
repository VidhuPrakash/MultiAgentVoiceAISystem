"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Phone, Bot, Ban, Clock, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "./_components/stat-card";
import Card from "./_components/card";
import { CardHeader } from "./_components/card-header";
import { RangeDropdown } from "./_components/range-drop-down";
import { ChartSkeleton } from "./_components/chart-skeleton";
import { ChartTooltip } from "./_components/chart-tooltip";
import { PlanDonut } from "./_components/plan-donate";
import { TopUsers } from "./_components/top-users";
import { CallStatusBars } from "./_components/call-status-bar";
import { AvgDurationBars } from "./_components/avg-duration-bar";

export type Range = "daily" | "monthly" | "yearly";

export interface Summary {
  totalUsers: number;
  totalCalls: number;
  totalAgents: number;
  blockedUsers: number;
  totalMinutes: number;
}

export interface PeriodCount {
  period: string;
  count: number;
}

export interface PlanDist {
  plan: string;
  count: number;
}

export interface TopUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro";
  minutesUsed: number;
  minutesLimit: number;
}

export interface CallStatus {
  status: string;
  count: number;
}

export interface AvgDuration {
  period: string;
  avgDuration: number;
}

export const COLORS = {
  amber: "#EF9F27",
  teal: "#1D9E75",
  blue: "#378ADD",
  purple: "#7F77DD",
  coral: "#D85A30",
  gray: "#888780",
  red: "#E24B4A",
};

export const STATUS_COLORS: Record<string, string> = {
  completed: COLORS.teal,
  missed: COLORS.amber,
  failed: COLORS.red,
  "in-progress": COLORS.blue,
};

export default function AnalyticsDashboard() {
  const [usersRange, setUsersRange] = useState<Range>("monthly");
  const [callsRange, setCallsRange] = useState<Range>("monthly");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [usersOverTime, setUsersOverTime] = useState<PeriodCount[]>([]);
  const [planDist, setPlanDist] = useState<PlanDist[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [callsOverTime, setCallsOverTime] = useState<PeriodCount[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus[]>([]);
  const [avgDuration, setAvgDuration] = useState<AvgDuration[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingTopUsers, setLoadingTopUsers] = useState(true);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingDuration, setLoadingDuration] = useState(true);
  const [errorTopUsers, setErrorTopUsers] = useState(false);

  async function apiFetch<T>(path: string): Promise<T> {
    const res = await api.get<{ success: boolean; data: T }>(
      `/admin/analytics/${path}`,
    );
    return res.data.data;
  }

  // Static fetches
  useEffect(() => {
    apiFetch<Summary>("summary")
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoadingSummary(false));
    apiFetch<PlanDist[]>("plan-distribution")
      .then(setPlanDist)
      .catch(() => {})
      .finally(() => setLoadingPlan(false));
    apiFetch<TopUser[]>("top-minutes-users")
      .then(setTopUsers)
      .catch(() => setErrorTopUsers(true))
      .finally(() => setLoadingTopUsers(false));
    apiFetch<CallStatus[]>("call-status")
      .then(setCallStatus)
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
    apiFetch<AvgDuration[]>("avg-call-duration")
      .then(setAvgDuration)
      .catch(() => {})
      .finally(() => setLoadingDuration(false));
  }, []);

  // Users range
  useEffect(() => {
    apiFetch<PeriodCount[]>(`users-over-time?range=${usersRange}`)
      .then((data) => {
        setUsersOverTime(data);
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
    return () => {
      setLoadingUsers(true);
    };
  }, [usersRange]);

  // Calls range
  useEffect(() => {
    apiFetch<PeriodCount[]>(`calls-over-time?range=${callsRange}`)
      .then((data) => {
        setCallsOverTime(data);
      })
      .catch(() => {})
      .finally(() => setLoadingCalls(false));
    return () => {
      setLoadingCalls(true);
    };
  }, [callsRange]);

  const statCards = [
    { label: "Total Users", value: summary?.totalUsers ?? 0, icon: Users },
    { label: "Total Calls", value: summary?.totalCalls ?? 0, icon: Phone },
    { label: "Total Agents", value: summary?.totalAgents ?? 0, icon: Bot },
    { label: "Blocked Users", value: summary?.blockedUsers ?? 0, icon: Ban },
    { label: "Total Minutes", value: summary?.totalMinutes ?? 0, icon: Clock },
  ];

  return (
    <>
      {/* ── Outermost container: full-height flex column ── */}
      <div
        className="outer-wrap"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxSizing: "border-box",
          overflow: "hidden",
          background: "var(--bg, var(--surface-2, #f5f5f3))",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(16px, 2vw, 22px)",
                fontWeight: 700,
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "-0.02em",
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                margin: "1px 0 0",
                fontSize: "11px",
                color: "var(--text-2)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Platform wide metrics &amp; usage
            </p>
          </div>
        </div>

        {/* Stat cards row */}
        <div
          style={{
            flexShrink: 0,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "clamp(6px, 1vw, 10px)",
          }}
          // Responsive: on small screens collapse to 2-3 cols
          className="stat-grid"
        >
          {statCards.map((c, i) => (
            <StatCard
              key={c.label}
              label={c.label}
              value={c.value}
              icon={c.icon}
              loading={loadingSummary}
              idx={i}
            />
          ))}
        </div>

        <div
          className="row-2"
          style={{
            flex: "1 1 0",
            display: "grid",
            gridTemplateColumns: "70fr 30fr",
            gap: "clamp(6px, 1vw, 10px)",
            minHeight: 0,
          }}
        >
          {/* Users over time */}
          <Card>
            <CardHeader
              title="New Users Over Time"
              action={
                <RangeDropdown value={usersRange} onChange={setUsersRange} />
              }
            />
            <div style={{ flex: 1, minHeight: 0 }}>
              {loadingUsers ? (
                <ChartSkeleton />
              ) : (
                <div className="an-fade" style={{ height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={usersOverTime}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="var(--border-raw)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{
                          fill: "var(--text-3)",
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: "var(--text-3)",
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip unit="users" />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS.amber}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4, fill: COLORS.amber, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>

          {/* Plan distribution */}
          <Card>
            <CardHeader title="Plan Distribution" />
            <PlanDonut data={planDist} loading={loadingPlan} />
          </Card>
        </div>

        {/* ── Row 3: Top Users (40%) + Calls chart (30%) + Status+Duration (30%) ── */}
        <div
          className="row-3"
          style={{
            flex: "1.1 1 0",
            display: "grid",
            gridTemplateColumns: "40fr 30fr 30fr",
            gap: "clamp(6px, 1vw, 10px)",
            minHeight: 0,
          }}
        >
          {/* Top 5 users */}
          <Card>
            <CardHeader title="Top 5 by Minutes Used" />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <TopUsers
                data={topUsers}
                loading={loadingTopUsers}
                error={errorTopUsers}
              />
            </div>
          </Card>

          {/* Calls over time */}
          <Card>
            <CardHeader
              title="Calls Over Time"
              action={
                <RangeDropdown value={callsRange} onChange={setCallsRange} />
              }
            />
            <div style={{ flex: 1, minHeight: 0 }}>
              {loadingCalls ? (
                <ChartSkeleton />
              ) : (
                <div className="an-fade" style={{ height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={callsOverTime}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
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
                          fill: "var(--text-3)",
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: "var(--text-3)",
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip unit="calls" />} />
                      <Bar
                        dataKey="count"
                        fill={COLORS.blue}
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>

          {/* Call status + Avg duration stacked */}
          <Card style={{ gap: 0 }}>
            {/* Status section */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardHeader title="Call Status" />
              <CallStatusBars data={callStatus} loading={loadingStatus} />
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "var(--border-raw)",
                margin: "50px 0",
                flexShrink: 0,
              }}
            />

            {/* Avg duration section */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardHeader title="Avg Duration" />
              <AvgDurationBars data={avgDuration} loading={loadingDuration} />
            </div>
          </Card>
        </div>
      </div>

      {/* ── Responsive overrides ── */}
      <style>{`
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr !important; }
          .row-2, .row-3 { grid-template-columns: 1fr !important; flex: none !important; }
          .row-2 > *, .row-3 > * { min-height: 320px; }
          .outer-wrap { overflow: auto !important; height: auto !important; min-height: 100%; }
        }
      `}</style>
    </>
  );
}
