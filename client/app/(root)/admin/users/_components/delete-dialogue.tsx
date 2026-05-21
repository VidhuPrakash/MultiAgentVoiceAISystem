import { useState } from "react";
import { User } from "../page";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteDialog({
  user,
  onClose,
  onSuccess,
}: {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.delete(`/admin/users/${user.id}`);
      if (res.data.success) {
        toast.success("User deleted");
        onSuccess();
        onClose();
      }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--surface)] border-[var(--border-raw)] text-[var(--text)] max-w-sm w-full">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-[var(--danger)]/10 flex items-center justify-center flex-shrink-0">
              <Trash2 size={15} className="text-[var(--danger)]" />
            </div>
            <DialogTitle className="text-[var(--text)] text-base font-semibold">
              Delete User
            </DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-[var(--text-2)] text-sm leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="text-[var(--text)] font-medium">{user?.name}</span> (
          {user?.email})? This will permanently remove all their agents, calls,
          leads, and data. This action cannot be undone.
        </p>
        <DialogFooter className="gap-2 pt-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] h-9"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={del}
            disabled={loading}
            className="h-9 min-w-[100px]"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Trash2 size={14} className="mr-1.5" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
