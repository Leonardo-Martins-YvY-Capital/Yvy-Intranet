import { cn } from "../../lib/utils";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  label,
  className,
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div className={cn("w-px self-stretch bg-black/20", className)} />
    );
  }

  if (label) {
    return (
      <div className={cn("flex items-center gap-x-3", className)}>
        <hr className="flex-1 border-0 border-t border-black/20" />
        <span className="text-xs font-barlowcn uppercase tracking-wider text-yvy-navy/40 select-none">
          {label}
        </span>
        <hr className="flex-1 border-0 border-t border-black/20" />
      </div>
    );
  }

  return (
    <hr className={cn("border-0 border-t border-black/20 w-full", className)} />
  );
}
