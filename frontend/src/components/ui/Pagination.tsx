import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Select } from "./Select";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  showPageSize?: boolean;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 1) return total === 1 ? [1] : [];

  const show = new Set<number>();
  show.add(1);
  show.add(total);
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p++) {
    show.add(p);
  }

  const sorted = Array.from(show).sort((a, b) => a - b);
  const result: (number | "...")[] = [];

  result.push(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap === 2) result.push(sorted[i - 1] + 1);
    else if (gap > 2) result.push("...");
    result.push(sorted[i]);
  }

  return result;
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  showPageSize,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-x-4 text-sm",
        className
      )}
    >
      {/* Page size selector (optional) */}
      {showPageSize && onPageSizeChange ? (
        <div className="flex items-center gap-x-2">
          <span className="text-xs font-barlowcn uppercase tracking-wider text-yvy-navy/50 whitespace-nowrap">
            Por página
          </span>
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="py-1.5 text-xs w-20"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <span className="text-xs font-barlow font-light text-yvy-navy/40">
          {totalItems} {totalItems === 1 ? "item" : "itens"}
        </span>
      )}

      {/* Page nav */}
      <div className="flex items-center gap-x-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        {pages.map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-xs font-barlow text-yvy-navy/30 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={cn(
                "min-w-[32px] h-8 px-2 text-xs font-barlowcn uppercase tracking-wider yvy-transition focus:outline-none focus:ring-2 focus:ring-yvy-royal focus:ring-offset-1",
                currentPage === page
                  ? "bg-yvy-navy text-white"
                  : "text-yvy-navy hover:bg-yvy-navy/5"
              )}
            >
              {page}
            </button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Próxima página"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
