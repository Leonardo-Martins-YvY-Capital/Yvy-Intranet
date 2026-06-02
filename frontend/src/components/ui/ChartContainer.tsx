import React from "react";
import { cn } from "../../lib/utils";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

interface ChartContainerProps {
  title: string;
  caption?: string;
  loading?: boolean;
  empty?: boolean;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function ChartContainer({
  title,
  caption,
  loading,
  empty,
  actions,
  className,
  children,
}: ChartContainerProps) {
  return (
    <div
      className={cn("bg-white border border-black/20 flex flex-col", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-black/20 gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <h3 className="text-lg font-light font-barlowcn uppercase tracking-wide text-yvy-navy leading-none">
            {title}
          </h3>
          {caption && (
            <p className="text-xs font-barlow font-light text-yvy-navy/40">
              {caption}
            </p>
          )}
        </div>
        {actions && (
          <div className="shrink-0 flex items-center">{actions}</div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {loading ? (
          <div className="flex flex-col gap-y-3">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : empty ? (
          <EmptyState
            title="Sem dados disponíveis"
            description="Nenhum dado encontrado para o período selecionado."
            className="py-10"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
