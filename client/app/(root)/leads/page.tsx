"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  Phone,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCcw,
  Inbox,
  Search,
  Clock,
  Hash,
  Bot,
  PhoneCall,
  Mic,
  FileText,
  X,
} from "lucide-react";
import { TH } from "./_components/table-head";
import { Avatar } from "./_components/avatar";
import { PurposeBadge } from "./_components/purpose-badge";
import { CallBadge } from "./_components/call-badge";
import { StatsSection } from "./_components/stats-section";
import { TableSkeleton } from "./_components/table-skeleton";
import { MobileCardSkeleton } from "./_components/mobile-card-skeleton";
import { DesktopTable } from "./_components/desktop-table";
import { MobileLeadCard } from "./_components/mobile-lead-card";
import { Pagination } from "./_components/pagination";
import { LeadSheet } from "./_components/details";

export interface Lead {
  id: string;
  name?: string;
  phone?: string;
  purpose?: string;
  service?: string;
  appointmentDate?: string;
  createdAt: string;
  agent?: { name: string; type: string; id: string };
  callStatus?: "completed" | "missed" | "failed" | "in_progress";
  callerId?: string;
  callDuration?: number;
  callStartedAt?: string;
  callId?: string;
  transcript?: { role: "agent" | "caller"; text: string; time?: string }[];
  recordingUrl?: string;
}

interface LeadsResponse {
  rows: Lead[];
  page: number;
  pages: number;
  limit: number;
  total: number;
}

export default function LeadsPage() {
  const [purposeInput, setPurposeInput] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchLeads = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    const params: Record<string, string | number> = {
      page,
      limit: Number(limit),
    };
    if (purposeInput) params.purpose = purposeInput;

    api
      .get("/user/leads", { params })
      .then((r) => setData(r.data.data))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [page, limit, purposeInput]);

  useEffect(() => {
    const loadLeads = () => fetchLeads();
    loadLeads();
  }, [fetchLeads]);

  const handlePurposeChange = (val: string) => {
    setPurposeInput(val);
    setPage(1);
  };

  const openSheet = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedId(null), 300);
  };

  const leads = data?.rows ?? [];
  const hasLeads = leads.length > 0;

  return (
    <div className="min-h-full bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] tracking-tight">
            Leads
          </h1>
          <p className="text-sm text-[var(--text-2)]">
            View, organize and analyze captured customer leads
          </p>
        </div>

        {/* Stats */}
        <StatsSection />

        {/* Filters */}
        <div className=" -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-3 min-w-max sm:min-w-0">
            {/* Purpose search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-2)] pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by purpose…"
                value={purposeInput}
                onChange={(e) => handlePurposeChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-[var(--border-raw)] bg-[var(--surface)] text-[var(--text)] text-sm placeholder:text-[var(--text-2)] focus:outline-none focus:border-[var(--accent-raw)] focus:ring-1 focus:ring-[var(--accent-raw)]/30 transition-all"
              />
              {purposeInput && (
                <button
                  onClick={() => handlePurposeChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-2)] hover:text-[var(--text)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leads list */}
        <div className="space-y-4">
          {isLoading && (
            <>
              <div className="hidden md:block">
                <TableSkeleton />
              </div>
              <div className="md:hidden">
                <MobileCardSkeleton />
              </div>
            </>
          )}

          {!isLoading && !isError && hasLeads && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <DesktopTable leads={leads} onRowClick={openSheet} />
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {leads.map((lead) => (
                  <MobileLeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => openSheet(lead.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <Pagination
                  page={data.page}
                  pages={data.pages}
                  total={data.total}
                  limit={data.limit}
                  onPage={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Sheet */}
      <LeadSheet id={selectedId} open={sheetOpen} onClose={closeSheet} />
    </div>
  );
}
