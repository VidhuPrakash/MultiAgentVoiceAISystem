"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Clock,
  PhoneCall,
  Users,
  CalendarDays,
  ArrowUpRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Card from "../admin/dashboard/_components/card";
import { SkeletonLine } from "./_components/skeleton-line";
import { SectionLabel } from "./_components/section-label";
import { ChartTooltip } from "../admin/dashboard/_components/chart-tooltip";

interface BillingPlan {
  current: string;
  name: string;
  price: number;
  features: string[];
}

interface BillingUsage {
  minutesUsed: number;
  minutesLimit: number;
  minutesRemaining: number;
  usagePercent: number;
  callsThisMonth: number;
  minutesThisMonth: number;
}

interface BillingData {
  plan: BillingPlan;
  usage: BillingUsage;
  limits: { agentLimit: number };
  memberSince: string;
}

interface HistoryItem {
  month: string;
  totalCalls: number;
  totalMinutes: number;
  completed: number;
  missed: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  minutesLimit: number;
  agentLimit: number;
  features: string[];
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [billingLoading, setBillingLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [step, setStep] = useState<"list" | "confirm">("list");

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await api.get("/user/billing");
      setBilling(res.data.data);
    } catch {
      toast.error("Failed to load billing data", {
        description: "Please try again.",
      });
    } finally {
      setBillingLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/user/billing/history");
      setHistory(res.data.data);
    } catch {
      toast.error("Failed to load usage history", {
        description: "Please try again.",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await api.get("/user/billing/plans");
      setPlans(res.data.data);
    } catch {
      toast.error("Failed to load plans", {
        description: "Please try again.",
      });
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    const loadData = () => {
      fetchBilling();

      fetchHistory();
    };
    loadData();
  }, []);

  const openUpgradeDialog = async () => {
    setStep("list");
    setSelectedPlan(null);
    setUpgradeMessage("");
    setUpgradeSuccess(false);
    setDialogOpen(true);
    if (!plans.length) await fetchPlans();
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep("confirm");
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setUpgrading(true);
    try {
      await api.post("/user/billing/upgrade", {
        plan: selectedPlan.id,
        message: upgradeMessage || "Need more minutes",
      });
      setUpgradeSuccess(true);
    } catch {
      toast.error("Request failed", {
        description: "Please try again.",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const memberSinceFormatted = billing?.memberSince
    ? new Date(billing.memberSince).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const usagePct = billing?.usage.usagePercent ?? 0;

  const planOrder = ["free", "starter", "pro"];
  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (a, b) => planOrder.indexOf(a.id) - planOrder.indexOf(b.id),
      ),
    [plans],
  );

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <Toaster />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] tracking-tight">
            Billing
          </h1>
          <p className="text-sm text-[var(--text-2)]">
            Manage your billing and plans
          </p>
        </div>
        <Button
          onClick={openUpgradeDialog}
          className="flex items-center gap-2 shrink-0 text-sm font-semibold rounded-xl px-5 py-2.5"
          style={{ background: "var(--accent-raw)", color: "var(--bg)" }}
        >
          <Zap size={14} />
          Upgrade Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {billingLoading ? (
              <div className="space-y-4">
                <SkeletonLine w="w-24" />
                <SkeletonLine w="w-40" h="h-6" />
                <SkeletonLine w="w-full" h="h-2" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <SkeletonLine w="w-full" h="h-16" />
                  <SkeletonLine w="w-full" h="h-16" />
                  <SkeletonLine w="w-full" h="h-16" />
                  <SkeletonLine w="w-full" h="h-16" />
                </div>
              </div>
            ) : billing ? (
              <div>
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                        style={{
                          borderColor: "var(--accent-raw)",
                          color: "var(--accent-raw)",
                          background:
                            "color-mix(in srgb, var(--accent-raw) 10%, transparent)",
                        }}
                      >
                        {billing.plan.name}
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--text)" }}
                    >
                      ${billing.plan.price}
                      <span
                        className="text-sm font-normal ml-1"
                        style={{ color: "var(--text-2)" }}
                      >
                        / month
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "var(--text-2)" }}>
                      Minutes used
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--text)" }}
                    >
                      {billing.usage.minutesUsed}
                      <span
                        className="text-sm font-normal"
                        style={{ color: "var(--text-2)" }}
                      >
                        {" "}
                        / {billing.usage.minutesLimit}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className="mb-1 flex justify-between text-xs"
                  style={{ color: "var(--text-2)" }}
                >
                  <span>Usage this month</span>
                  <span>{usagePct}%</span>
                </div>
                <div
                  className="w-full rounded-full h-2 mb-6 overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${usagePct}%`,
                      background:
                        usagePct > 80
                          ? "#ef4444"
                          : usagePct > 60
                            ? "#f59e0b"
                            : "var(--accent-raw)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: <PhoneCall size={14} />,
                      label: "Calls this month",
                      value: billing.usage.callsThisMonth,
                    },
                    {
                      icon: <Clock size={14} />,
                      label: "Minutes this month",
                      value: `${billing.usage.minutesThisMonth} min`,
                    },
                    {
                      icon: <Users size={14} />,
                      label: "Agent limit",
                      value: `${billing.limits.agentLimit} agents`,
                    },
                    {
                      icon: <CalendarDays size={14} />,
                      label: "Member since",
                      value: memberSinceFormatted,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-3 border"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border-raw)",
                      }}
                    >
                      <div
                        className="flex items-center gap-1.5 mb-2"
                        style={{ color: "var(--text-2)" }}
                      >
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div>
          <Card style={{ height: "100%" }}>
            <SectionLabel>Current Plan Features</SectionLabel>
            {billingLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <SkeletonLine key={i} w="w-full" />
                ))}
              </div>
            ) : billing ? (
              <ul className="space-y-2.5">
                {billing.plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: "var(--text)" }}
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: "var(--accent-raw)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        </div>
      </div>

      <Card>
        <SectionLabel>Voice Activity — Last 6 Months</SectionLabel>
        {historyLoading ? (
          <div
            className="w-full rounded-xl animate-pulse"
            style={{ height: 200, background: "var(--surface-2)" }}
          />
        ) : history.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={history}
              barGap={4}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="var(--border-raw)"
                opacity={0.6}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--text-2)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--text-2)" }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  fill: "color-mix(in srgb, var(--accent-raw) 6%, transparent)",
                }}
              />
              <Bar
                dataKey="totalMinutes"
                name="Minutes"
                fill="var(--accent-raw)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="totalCalls"
                name="Calls"
                fill="var(--surface-3)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p
            className="text-sm text-center py-12"
            style={{ color: "var(--text-2)" }}
          >
            No usage history yet.
          </p>
        )}

        {history.length > 0 && (
          <div
            className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t"
            style={{ borderColor: "var(--border-raw)" }}
          >
            {[
              {
                label: "Peak minutes",
                value: `${Math.max(...history.map((h) => h.totalMinutes))} min`,
              },
              {
                label: "Avg calls / month",
                value: Math.round(
                  history.reduce((s, h) => s + h.totalCalls, 0) /
                    history.length,
                ),
              },
              {
                label: "Completion rate",
                value: (() => {
                  const total = history.reduce((s, h) => s + h.totalCalls, 0);
                  const done = history.reduce((s, h) => s + h.completed, 0);
                  return total ? `${Math.round((done / total) * 100)}%` : "—";
                })(),
              },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xs mb-1" style={{ color: "var(--text-2)" }}>
                  {stat.label}
                </p>
                <p
                  className="text-base font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) {
            setStep("list");
            setSelectedPlan(null);
            setUpgradeSuccess(false);
          }
        }}
      >
        <DialogContent
          className="w-full max-w-lg rounded-2xl border p-0 overflow-hidden"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border-raw)",
            color: "var(--text)",
          }}
        >
          <DialogHeader
            className="px-6 pt-6 pb-4 border-b"
            style={{ borderColor: "var(--border-raw)" }}
          >
            <DialogTitle
              className="text-lg font-bold"
              style={{ color: "var(--text)" }}
            >
              {step === "list" ? "Choose a Plan" : "Request Upgrade"}
            </DialogTitle>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
              {step === "list"
                ? "Select the plan that fits your needs."
                : `Upgrading to ${selectedPlan?.name} — $${selectedPlan?.price}/mo`}
            </p>
          </DialogHeader>

          <div className="px-6 py-5">
            {upgradeSuccess ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle size={40} style={{ color: "var(--accent-raw)" }} />
                <p
                  className="font-semibold text-base"
                  style={{ color: "var(--text)" }}
                >
                  Upgrade Requested
                </p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>
                  Your request has been received. Our team will process it
                  shortly.
                </p>
                <Button
                  className="mt-3 rounded-xl px-6 font-semibold"
                  onClick={() => setDialogOpen(false)}
                  style={{
                    background: "var(--accent-raw)",
                    color: "var(--bg)",
                  }}
                >
                  Done
                </Button>
              </div>
            ) : step === "list" ? (
              <div className="space-y-3">
                {plansLoading
                  ? [0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 rounded-xl animate-pulse"
                        style={{ background: "var(--surface-2)" }}
                      />
                    ))
                  : sortedPlans.map((plan) => {
                      const isCurrent = plan.id === billing?.plan.current;
                      return (
                        <button
                          key={plan.id}
                          disabled={isCurrent}
                          onClick={() => handleSelectPlan(plan)}
                          className="w-full text-left rounded-xl border px-4 py-4 transition-all"
                          style={{
                            background: isCurrent
                              ? "color-mix(in srgb, var(--accent-raw) 6%, var(--surface-2))"
                              : "var(--surface-2)",
                            borderColor: isCurrent
                              ? "var(--accent-raw)"
                              : "var(--border-raw)",
                            cursor: isCurrent ? "default" : "pointer",
                            opacity: isCurrent ? 1 : undefined,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="font-semibold text-sm"
                                  style={{ color: "var(--text)" }}
                                >
                                  {plan.name}
                                </span>
                                {isCurrent && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      background: "var(--accent-raw)",
                                      color: "var(--bg)",
                                    }}
                                  >
                                    Current
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-2)" }}
                              >
                                {plan.agentLimit} agents · {plan.minutesLimit}{" "}
                                min/mo
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className="font-bold text-base"
                                style={{ color: "var(--text)" }}
                              >
                                ${plan.price}
                                <span
                                  className="text-xs font-normal ml-0.5"
                                  style={{ color: "var(--text-2)" }}
                                >
                                  /mo
                                </span>
                              </p>
                              {!isCurrent && (
                                <ArrowUpRight
                                  size={14}
                                  className="ml-auto mt-1"
                                  style={{ color: "var(--accent-raw)" }}
                                />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--border-raw)",
                  }}
                >
                  <p
                    className="text-xs mb-2 font-medium"
                    style={{ color: "var(--text-2)" }}
                  >
                    Plan Features
                  </p>
                  <ul className="space-y-1.5">
                    {selectedPlan?.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--text)" }}
                      >
                        <Check
                          size={13}
                          style={{ color: "var(--accent-raw)" }}
                          className="shrink-0"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label
                    className="text-xs font-medium block mb-1.5"
                    style={{ color: "var(--text-2)" }}
                  >
                    Message (optional)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Tell us why you need this upgrade..."
                    value={upgradeMessage}
                    onChange={(e) => setUpgradeMessage(e.target.value)}
                    className="resize-none text-sm rounded-xl"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border-raw)",
                      color: "var(--text)",
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setStep("list")}
                    style={{
                      borderColor: "var(--border-raw)",
                      color: "var(--text-2)",
                      background: "transparent",
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded-xl font-semibold"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    style={{
                      background: "var(--accent-raw)",
                      color: "var(--bg)",
                    }}
                  >
                    {upgrading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Requesting...
                      </span>
                    ) : (
                      "Request Upgrade"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
