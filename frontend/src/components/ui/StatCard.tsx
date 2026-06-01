import { cn } from "../../lib/utils";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  caption?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  caption,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "bg-white border border-black/20 p-6 lg:p-8 flex flex-col gap-y-3",
          className
        )}
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white border border-black/20 p-6 lg:p-8 flex flex-col gap-y-2",
        className
      )}
    >
      <p className="text-xs font-semibold font-barlowcn uppercase tracking-wider text-yvy-navy/50">
        {label}
      </p>
      <p className="text-4xl font-light font-barlowcn text-yvy-navy leading-none">
        {value}
      </p>
      {(delta || caption) && (
        <div className="flex items-center gap-x-2 mt-1">
          {delta && (
            <Badge
              variant={
                delta.direction === "up"
                  ? "success"
                  : delta.direction === "down"
                  ? "danger"
                  : "neutral"
              }
              size="sm"
            >
              {delta.direction === "up"
                ? "▲"
                : delta.direction === "down"
                ? "▼"
                : "—"}{" "}
              {delta.value}
            </Badge>
          )}
          {caption && (
            <span className="text-xs font-light font-barlow text-yvy-navy/40">
              {caption}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
