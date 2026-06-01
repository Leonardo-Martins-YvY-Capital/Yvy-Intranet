import React from "react";
import { cn } from "../../lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-x-4 border-l-4 p-4",
        variant === "info" && "border-yvy-royal bg-yvy-royal/5 text-yvy-navy",
        variant === "success" && "border-emerald-600 bg-emerald-50 text-emerald-900",
        variant === "warning" && "border-amber-500 bg-amber-50 text-amber-900",
        variant === "error" && "border-rose-600 bg-rose-50 text-rose-900",
        className
      )}
      {...props}
    >
      <div className="flex-1 flex flex-col gap-y-1">
        {title && (
          <p className="text-sm font-semibold font-barlowcn uppercase tracking-wider">
            {title}
          </p>
        )}
        {children && (
          <div className="text-sm font-barlow font-light leading-relaxed">
            {children}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Fechar"
          className="shrink-0 opacity-50 hover:opacity-100 yvy-transition cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
