import React from "react";
import { cn } from "../../lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export function Table({ className, striped, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse text-sm font-barlow",
          striped && "yvy-table-striped",
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("border-b border-black/20", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("", className)} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  onRowClick?: () => void;
}

export function TableRow({
  className,
  onRowClick,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-black/10 last:border-0",
        onRowClick &&
          "cursor-pointer hover:bg-yvy-navy/[0.025] yvy-transition",
        className
      )}
      onClick={onRowClick}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  className,
  sortable,
  sortDirection,
  onSort,
  children,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold font-barlowcn uppercase tracking-wider text-yvy-navy/60",
        sortable &&
          "cursor-pointer hover:text-yvy-navy yvy-transition select-none",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <span className="inline-flex items-center gap-x-1.5">
        {children}
        {sortable && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={cn(
              "shrink-0 opacity-40",
              sortDirection && "opacity-100 text-yvy-royal"
            )}
          >
            {sortDirection === "asc" ? (
              <path
                d="M2 8l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : sortDirection === "desc" ? (
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M6 2v8M3 5l3-3 3 3M3 7l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        )}
      </span>
    </th>
  );
}

export function TableCell({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm text-yvy-navy font-light font-barlow",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}
