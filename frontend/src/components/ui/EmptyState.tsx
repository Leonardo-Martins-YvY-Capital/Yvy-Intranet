import React from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-8 gap-y-3",
        className
      )}
    >
      {icon && <div className="text-yvy-navy/25 mb-2">{icon}</div>}
      <p className="text-xl font-light font-barlowcn uppercase tracking-wide text-yvy-navy/50">
        {title}
      </p>
      {description && (
        <p className="text-sm font-light font-barlow text-yvy-navy/40 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
