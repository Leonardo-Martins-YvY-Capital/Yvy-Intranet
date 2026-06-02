import React from "react";
import { cn } from "../../lib/utils";

interface DataListProps extends React.HTMLAttributes<HTMLDListElement> {
  layout?: "horizontal" | "vertical";
}

interface DataListRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DataList({
  layout = "horizontal",
  className,
  children,
  ...props
}: DataListProps) {
  return (
    <dl
      className={cn(
        layout === "horizontal" && "grid grid-cols-[auto_1fr] gap-x-8 gap-y-3",
        layout === "vertical" && "flex flex-col gap-y-4",
        className
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export function DataListRow({ label, value, className }: DataListRowProps) {
  return (
    <>
      <dt
        className={cn(
          "text-xs font-barlowcn uppercase tracking-wider text-yvy-navy/50 font-semibold leading-5",
          className
        )}
      >
        {label}
      </dt>
      <dd className="text-sm font-barlow font-light text-yvy-navy leading-5 m-0">
        {value}
      </dd>
    </>
  );
}
