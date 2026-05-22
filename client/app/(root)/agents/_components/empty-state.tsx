import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--border-2] bg-[--surface] py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[--border-2] bg-[--surface-2]">
        <Bot className="h-6 w-6 text-[--accent-raw]" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[--text]">
        No agents yet
      </h3>
      <p className="mt-1.5 max-w-xs text-xs text-[--text-2]">
        Create your first AI voice agent to start handling calls, bookings, and
        FAQs automatically.
      </p>
      <Button
        onClick={onCreate}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Create your first agent
      </Button>
    </div>
  );
}
