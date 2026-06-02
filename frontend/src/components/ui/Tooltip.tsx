import React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
}

const placementClasses: Record<NonNullable<TooltipProps["placement"]>, string> = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  content,
  placement = "top",
  children,
  className,
}: TooltipProps) {
  return (
    <div className={cn("relative inline-flex group", className)}>
      {children}
      <div
        role="tooltip"
        className={cn(
          "absolute z-50 pointer-events-none",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "transition-opacity duration-150",
          "bg-yvy-navy text-white text-xs font-barlow font-light px-2.5 py-1.5 whitespace-nowrap",
          placementClasses[placement]
        )}
      >
        {content}
      </div>
    </div>
  );
}
