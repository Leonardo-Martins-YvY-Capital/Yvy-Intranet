import React from "react";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-white border border-black/20 px-4 py-3 font-barlow text-sm text-yvy-navy placeholder:text-yvy-navy/40 focus:outline-none focus:border-yvy-royal focus:ring-1 focus:ring-yvy-royal disabled:cursor-not-allowed disabled:opacity-50 yvy-transition",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
