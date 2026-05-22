"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Shield,
  Ban,
  Zap,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  UserX,
  X,
  Check,
  Edit2,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { StatCard } from "./_components/stat-card";
import { SkeletonRow } from "./_components/skeleton";
import { fmtDate, initials, UserDrawer } from "./_components/user-details";
import { RoleBadge } from "./_components/role-badge";
import { PlanBadge } from "./_components/plan-badgue";
import { UsageBar } from "./_components/usage-bar";
import { StatusBadge } from "./_components/status-badge";
import { CreateUserDialog } from "./_components/create-user-dialogue";
import { DeleteDialog } from "./_components/delete-dialogue";

export type Role = "user" | "admin";
export type Plan = "free" | "starter" | "pro";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: Plan;
  minutesLimit: number;
  minutesUsed: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface PaginatedResponse {
  rows: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  plan: Plan;
  minutesLimit: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: Role;
  plan?: Plan;
  minutesLimit?: number;
  isBlocked?: boolean;
}

export interface FieldError {
  field: string;
  message: string;
}

export default function UsersPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: PaginatedResponse }>("/admin/users", {
        params: { page, limit },
      })
      .then((res) => {
        setData(res.data.data);
      })
      .catch(() => {
        setError("Failed to load users. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const allRows = data?.rows ?? [];

  const stats = {
    total: data?.total ?? 0,
    admins: allRows.filter((u) => u.role === "admin").length,
    blocked: allRows.filter((u) => u.isBlocked).length,
    pro: allRows.filter((u) => u.plan === "pro").length,
  };

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  return (
    <div className="flex flex-col gap-5 min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[var(--text)] text-xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-[var(--text-2)] text-sm mt-0.5">
            Manage user accounts
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={14} />
          Add User
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total}
          color="bg-[var(--surface-3)] text-[var(--text-2)]"
        />
        <StatCard
          icon={Shield}
          label="Admins"
          value={stats.admins}
          color="bg-[var(--accent-dim)] text-[var(--accent-raw)]"
        />
        <StatCard
          icon={Ban}
          label="Blocked"
          value={stats.blocked}
          color="bg-[var(--danger)]/10 text-[var(--danger)]"
        />
        <StatCard
          icon={Zap}
          label="Pro Plan"
          value={stats.pro}
          color="bg-[var(--accent-glow)] text-[var(--accent-raw)]"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border-raw)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]" role="table">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--border-raw)]">
                {["User", "Role", "Plan", "Usage", "Status", "Joined", ""].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-[var(--text-2)] text-xs font-medium uppercase tracking-wider px-4 py-3 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={32} className="text-[var(--danger)]" />
                      <p className="text-[var(--text-2)] text-sm">{error}</p>
                      <Button
                        onClick={fetchUsers}
                        variant="outline"
                        className="border-[var(--border-2)] text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] h-8 text-xs"
                      >
                        <RefreshCw size={12} className="mr-1.5" />
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : allRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserX size={36} className="text-[var(--text-3)]" />
                      <p className="text-[var(--text-2)] text-sm font-medium">
                        No users found
                      </p>
                      <p className="text-[var(--text-3)] text-xs">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                allRows.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="border-b border-[var(--border-raw)] hover:bg-[var(--surface-3)] cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-[var(--accent-dim)] text-[var(--accent-raw)] text-xs font-semibold">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[var(--text)] text-sm font-medium truncate max-w-[160px]">
                            {user.name}
                          </p>
                          <p className="text-[var(--text-2)] text-xs truncate max-w-[160px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <UsageBar
                        used={user.minutesUsed}
                        limit={user.minutesLimit}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge blocked={user.isBlocked} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-2)] text-sm whitespace-nowrap">
                      {fmtDate(user.createdAt)}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Actions for ${user.name}`}
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[var(--surface-2)] border-[var(--border-raw)] w-40"
                        >
                          <DropdownMenuItem
                            className="text-[var(--text)] text-sm cursor-pointer hover:bg-[var(--surface-3)] focus:bg-[var(--surface-3)]"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye
                              size={13}
                              className="mr-2 text-[var(--text-2)]"
                            />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-[var(--text)] text-sm cursor-pointer hover:bg-[var(--surface-3)] focus:bg-[var(--surface-3)]"
                            onClick={() => {
                              setSelectedUser(user);
                            }}
                          >
                            <Edit2
                              size={13}
                              className="mr-2 text-[var(--text-2)]"
                            />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[var(--border-raw)]" />
                          <DropdownMenuItem
                            className="text-[var(--danger)] text-sm cursor-pointer hover:bg-[var(--danger)]/10 focus:bg-[var(--danger)]/10"
                            onClick={() => setDeleteUser(user)}
                          >
                            <Trash2 size={13} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && allRows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-raw)] bg-[var(--surface)] flex-wrap gap-2">
            <p className="text-[var(--text-2)] text-xs">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, data?.total ?? 0)} of {data?.total ?? 0}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 w-7 border border-[var(--border-raw)] text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={13} />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg =
                  totalPages <= 5
                    ? i + 1
                    : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                        ? totalPages - 4 + i
                        : page - 2 + i;
                return (
                  <Button
                    key={pg}
                    variant="ghost"
                    size="icon"
                    onClick={() => setPage(pg)}
                    className={`h-7 w-7 text-xs border ${
                      pg === page
                        ? "border-[var(--accent-raw)]/40 bg-[var(--accent-dim)] text-[var(--accent-raw)]"
                        : "border-[var(--border-raw)] text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]"
                    }`}
                    aria-label={`Page ${pg}`}
                    aria-current={pg === page ? "page" : undefined}
                  >
                    {pg}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 w-7 border border-[var(--border-raw)] text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs / Drawer */}
      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchUsers}
      />
      <DeleteDialog
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onSuccess={fetchUsers}
      />
      <UserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
