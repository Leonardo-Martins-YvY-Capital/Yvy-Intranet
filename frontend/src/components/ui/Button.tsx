import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "yvy-transition cursor-pointer inline-flex items-center justify-center font-barlowcn uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-yvy-royal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          // Variants
          variant === "solid" &&
            "bg-yvy-navy text-white hover:bg-yvy-royal",
          variant === "outline" &&
            "border border-yvy-navy text-yvy-navy hover:bg-yvy-navy hover:text-white",
          variant === "ghost" &&
            "text-yvy-navy hover:bg-yvy-border/10",
          // Sizes
          size === "sm" && "text-xs px-4 py-2",
          size === "md" && "text-sm px-6 py-3",
          size === "lg" && "text-base px-8 py-4",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
