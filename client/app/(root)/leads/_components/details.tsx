import { useEffect, useState } from "react";
import { Lead } from "../page";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetSkeleton } from "./sheet-skeleton";
import { SheetBody } from "./details-body";
import api from "@/lib/api";

export function LeadSheet({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchLead() {
      if (!id || !open) return;

      try {
        setIsLoading(true);
        setLead(null);

        const { data } = await api.get(`/user/leads/${id}`);

        if (!ignore) {
          setLead(data.data);
        }
      } catch (err) {
        console.error("Failed to load lead:", err);

        if (!ignore) {
          setLead(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchLead();

    return () => {
      ignore = true;
    };
  }, [id, open]);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="
          w-full
          sm:w-[520px]
          md:w-[600px]
          max-w-full
          p-0
          border-l
          border-[var(--border-raw)]
          bg-[var(--bg)]
          overflow-auto
        "
      >
        <div className="flex flex-col h-full">
          <SheetHeader
            className="
              px-5
              pt-5
              pb-4
              border-b
              border-[var(--border-raw)]
              shrink-0
            "
          >
            <div className="flex items-center justify-between">
              <SheetTitle
                className="
                  text-[var(--text)]
                  font-semibold
                  text-base
                "
              >
                Lead Details
              </SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-5">
              {isLoading ? (
                <SheetSkeleton />
              ) : lead ? (
                <SheetBody lead={lead} />
              ) : (
                <div
                  className="
                    py-10
                    text-center
                    text-[var(--text-2)]
                  "
                >
                  Lead not found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
