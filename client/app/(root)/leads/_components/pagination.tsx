import { ChevronLeft, ChevronRight } from "lucide-react";
import { PagBtn } from "../../calls/_components/page-button";

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  const getPages = (): (number | "...")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const arr: (number | "...")[] = [1];
    if (page > 3) arr.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++)
      arr.push(i);
    if (page < pages - 2) arr.push("...");
    arr.push(pages);
    return arr;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-raw)]">
      <p className="text-xs text-[var(--text-2)] shrink-0">
        Showing {from}–{to} of {total} leads
      </p>
      <div className="flex items-center gap-1">
        <PagBtn disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Prev</span>
        </PagBtn>

        {/* Desktop numbered */}
        <div className="hidden sm:flex items-center gap-1">
          {getPages().map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-1.5 text-[var(--text-2)] text-xs"
              >
                …
              </span>
            ) : (
              <PagBtn
                key={p}
                active={p === page}
                onClick={() => onPage(p as number)}
              >
                <span className="text-xs">{p}</span>
              </PagBtn>
            ),
          )}
        </div>

        {/* Mobile current/total */}
        <span className="sm:hidden text-xs text-[var(--text-2)] px-2">
          {page} / {pages}
        </span>

        <PagBtn disabled={page >= pages} onClick={() => onPage(page + 1)}>
          <span className="hidden sm:inline text-xs">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </PagBtn>
      </div>
    </div>
  );
}
