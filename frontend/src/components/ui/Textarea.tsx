import React from "react";
import { cn } from "../../lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  resize?: "none" | "vertical";
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, resize = "vertical", ...props }, ref) => {
    return (
      <textarea
        rows={rows}
        className={cn(
          "flex w-full bg-white border border-black/20 px-4 py-3 font-barlow text-sm text-yvy-navy placeholder:text-yvy-navy/40 focus:outline-none focus:border-yvy-royal focus:ring-1 focus:ring-yvy-royal disabled:cursor-not-allowed disabled:opacity-50 yvy-transition",
          resize === "none" && "resize-none",
          resize === "vertical" && "resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
