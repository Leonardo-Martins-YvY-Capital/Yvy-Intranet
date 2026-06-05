import { Link } from '@tanstack/react-router';
import { cn } from "../../lib/utils";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-x-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center gap-x-1.5">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="text-yvy-navy/25 text-xs select-none mx-1.5"
                >
                  /
                </span>
              )}
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "text-xs font-barlowcn uppercase tracking-wider",
                    isLast
                      ? "text-yvy-navy font-semibold"
                      : "text-yvy-navy/50"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={item.to as any}
                  className="text-xs font-barlowcn uppercase tracking-wider text-yvy-navy/50 hover:text-yvy-navy yvy-transition"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
