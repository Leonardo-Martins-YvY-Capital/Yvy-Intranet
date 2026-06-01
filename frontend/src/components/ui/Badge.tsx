import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-barlowcn uppercase tracking-wider font-semibold border",
        variant === "success" && "bg-emerald-50 text-emerald-700 border-emerald-200",
        variant === "warning" && "bg-amber-50 text-amber-700 border-amber-200",
        variant === "danger" && "bg-rose-50 text-rose-700 border-rose-200",
        variant === "neutral" && "bg-yvy-navy/10 text-yvy-navy border-yvy-navy/20",
        variant === "info" && "bg-yvy-royal/10 text-yvy-royal border-yvy-royal/20",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
