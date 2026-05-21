import { useRef, useState } from "react";
import { FieldError, Plan, Role, UpdateUserPayload, User } from "../page";
import { toast } from "sonner";
import api from "@/lib/api";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "./role-badge";
import { PlanBadge } from "./plan-badgue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, Check, Edit2, Info, Loader2 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserDrawer({
  user,
  onClose,
  onSuccess,
}: {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState<UpdateUserPayload>(() =>
    user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          minutesLimit: user.minutesLimit,
        }
      : {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [rawMinutes, setRawMinutes] = useState(String(user?.minutesLimit ?? 0));

  const prevUserIdRef = useRef<string | undefined>(undefined);
  if (user?.id !== prevUserIdRef.current) {
    prevUserIdRef.current = user?.id;
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        minutesLimit: user.minutesLimit,
      });
      setRawMinutes(String(user.minutesLimit));
      setErrors({});
      setActiveTab("details");
    }
  }

  const set = (k: keyof UpdateUserPayload) => (v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));
  const err = (k: string) =>
    errors[k] ? (
      <p className="text-xs text-[var(--danger)] mt-1">{errors[k]}</p>
    ) : null;

  async function save() {
    if (!user) return;
    setSaving(true);
    setErrors({});
    try {
      const res = await api.patch(`/admin/users/${user.id}`, form);
      if (res.data.success) {
        toast.success("User updated");
        onSuccess();
        onClose();
      }
    } catch (e: unknown) {
      const d = (
        e as {
          response?: { data?: { errors?: FieldError[]; message?: string } };
        }
      )?.response?.data;
      if (d?.errors) {
        const map: Record<string, string> = {};
        (d.errors as FieldError[]).forEach((fe) => {
          map[fe.field] = fe.message;
        });
        setErrors(map);
      } else {
        toast.error(d?.message || "Failed to update user");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleBlock() {
    if (!user) return;
    setBlocking(true);
    try {
      if (!user.isBlocked) {
        const res = await api.post(`/admin/users/${user.id}/block`, {
          isBlocked: true,
        });
        if (res.data.success) {
          toast.success("User blocked");
          onSuccess();
          onClose();
        }
      } else {
        const res = await api.post(`/admin/users/${user.id}/unblock`, {
          isBlocked: false,
        });
        if (res.data.success) {
          toast.success("User unblocked");
          onSuccess();
          onClose();
        }
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setBlocking(false);
    }
  }

  if (!user) return null;
  const pct =
    user.minutesLimit > 0
      ? Math.min((user.minutesUsed / user.minutesLimit) * 100, 100)
      : 0;

  return (
    <Sheet open={!!user} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] bg-[var(--surface)] border-l border-[var(--border-raw)] p-0 overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-raw)]">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback className="bg-[var(--accent-dim)] text-[var(--accent-raw)] text-sm font-semibold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-[var(--text)] font-semibold text-base truncate">
                {user.name}
              </h3>
              <p className="text-[var(--text-2)] text-sm truncate">
                {user.email}
              </p>
              <p className="text-[var(--text-3)] text-xs mt-0.5">
                Joined {fmtDate(user.createdAt)}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <RoleBadge role={user.role} />
              <PlanBadge plan={user.plan} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1"
        >
          <TabsList className="mx-5 mt-4 bg-[var(--surface-2)] border border-[var(--border-raw)] h-9 grid grid-cols-2">
            <TabsTrigger
              value="details"
              className="text-xs data-[state=active]:bg-[var(--surface-3)] data-[state=active]:text-[var(--text)] text-[var(--text-2)]"
            >
              <Info size={13} className="mr-1.5" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              className="text-xs data-[state=active]:bg-[var(--surface-3)] data-[state=active]:text-[var(--text)] text-[var(--text-2)]"
            >
              <Edit2 size={13} className="mr-1.5" />
              Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="px-5 pb-6 mt-4 space-y-4 flex-1"
          >
            {/* Usage */}
            <div className="rounded-lg border border-[var(--border-raw)] bg-[var(--surface-2)] p-4">
              <p className="text-[var(--text-2)] text-xs mb-3 font-medium uppercase tracking-wider">
                Usage
              </p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text)]">
                  {user.minutesUsed} min used
                </span>
                <span className="text-[var(--text-2)]">
                  {user.minutesLimit} min limit
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct > 85 ? "bg-[var(--danger)]" : pct > 60 ? "bg-[var(--warning)]" : "bg-[var(--accent-raw)]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[var(--text-2)] text-xs mt-1.5 text-right">
                {Math.round(pct)}% used
              </p>
            </div>

            {/* Details grid */}
            <div className="rounded-lg border border-[var(--border-raw)] bg-[var(--surface-2)] divide-y divide-[var(--border-raw)]">
              {[
                { label: "Role", value: <RoleBadge role={user.role} /> },
                { label: "Plan", value: <PlanBadge plan={user.plan} /> },
                {
                  label: "Status",
                  value: <StatusBadge blocked={user.isBlocked} />,
                },
                {
                  label: "Minutes Limit",
                  value: (
                    <span className="text-[var(--text)] text-sm">
                      {user.minutesLimit}
                    </span>
                  ),
                },
                {
                  label: "Created",
                  value: (
                    <span className="text-[var(--text)] text-sm">
                      {fmtDate(user.createdAt)}
                    </span>
                  ),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-[var(--text-2)] text-sm">{label}</span>
                  {value}
                </div>
              ))}
            </div>

            {/* Block toggle */}
            <Button
              onClick={toggleBlock}
              disabled={blocking}
              variant={user.isBlocked ? "outline" : "destructive"}
              className={`w-full h-9 ${user.isBlocked ? "border-[var(--border-2)] text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]" : ""}`}
              aria-label={user.isBlocked ? "Unblock user" : "Block user"}
            >
              {blocking ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : user.isBlocked ? (
                <Check size={14} className="mr-1.5" />
              ) : (
                <Ban size={14} className="mr-1.5" />
              )}
              {user.isBlocked ? "Unblock User" : "Block User"}
            </Button>
          </TabsContent>

          <TabsContent value="edit" className="px-5 pb-6 mt-4 space-y-4">
            <div>
              <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
                Full Name
              </Label>
              <Input
                value={form.name || ""}
                onChange={(e) => set("name")(e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9"
              />
              {err("name")}
            </div>
            <div>
              <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
                Email
              </Label>
              <Input
                value={form.email || ""}
                onChange={(e) => set("email")(e.target.value)}
                type="email"
                className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9"
              />
              {err("email")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
                  Role
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => set("role")(v as Role)}
                >
                  <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-2)] text-[var(--text)] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--surface-2)] border-[var(--border-raw)]">
                    <SelectItem
                      value="user"
                      className="text-[var(--text)] text-sm"
                    >
                      User
                    </SelectItem>
                    <SelectItem
                      value="admin"
                      className="text-[var(--text)] text-sm"
                    >
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
                  Plan
                </Label>
                <Select
                  value={form.plan}
                  onValueChange={(v) => set("plan")(v as Plan)}
                >
                  <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-2)] text-[var(--text)] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--surface-2)] border-[var(--border-raw)]">
                    <SelectItem
                      value="free"
                      className="text-[var(--text)] text-sm"
                    >
                      Free
                    </SelectItem>
                    <SelectItem
                      value="starter"
                      className="text-[var(--text)] text-sm"
                    >
                      Starter
                    </SelectItem>
                    <SelectItem
                      value="pro"
                      className="text-[var(--text)] text-sm"
                    >
                      Pro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
                Minutes Limit
              </Label>
              <Input
                value={rawMinutes}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setRawMinutes(raw);
                  set("minutesLimit")(raw === "" ? 0 : Number(raw));
                }}
                type="text"
                inputMode="numeric"
                className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9"
              />
              {err("minutesLimit")}
            </div>
            <Button
              onClick={save}
              disabled={saving}
              className="w-full bg-[var(--accent-raw)] hover:bg-[var(--accent-raw)]/90 text-white h-9 mt-2"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : null}
              Save Changes
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
