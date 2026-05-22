import { useState } from "react";
import { CreateUserPayload, FieldError } from "../page";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function CreateUserDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "user",
    plan: "free",
    minutesLimit: 100,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof CreateUserPayload) => (v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));
  const err = (k: string) =>
    errors[k] ? (
      <p className="text-xs text-[var(--danger)] mt-1">{errors[k]}</p>
    ) : null;

  async function submit() {
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/admin/users", form);
      if (res.data.success) {
        toast.success("User created");
        onSuccess();
        onClose();
        setForm({
          name: "",
          email: "",
          password: "",
          role: "user",
          plan: "free",
          minutesLimit: 100,
        });
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
        toast.error(d?.message || "Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--surface)] border-[var(--border-raw)] text-[var(--text)] max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-[var(--text)] text-base font-semibold">
            Add New User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
              Full Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9"
              placeholder="Jane Doe"
            />
            {err("name")}
          </div>
          <div>
            <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
              Email
            </Label>
            <Input
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9"
              placeholder="jane@example.com"
              type="email"
            />
            {err("email")}
          </div>
          <div>
            <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
              Password
            </Label>
            <div className="relative">
              <Input
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                type={showPw ? "text" : "password"}
                className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9 pr-10"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {err("password")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[var(--text-2)] text-xs mb-1.5 block">
                Role
              </Label>
              <Select value={form.role} onValueChange={(v) => set("role")(v)}>
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
              <Select value={form.plan} onValueChange={(v) => set("plan")(v)}>
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
              value={form.minutesLimit}
              onChange={(e) => set("minutesLimit")(Number(e.target.value))}
              type="number"
              min={0}
              className="bg-[var(--surface-2)] border-[var(--border-2)] focus-visible:ring-[var(--accent-raw)]/40 text-[var(--text)] h-9"
            />
            {err("minutesLimit")}
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : null}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
