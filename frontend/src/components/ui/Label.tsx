import React from "react";
import { cn } from "../../lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "font-barlowcn text-xs uppercase font-semibold tracking-wider text-yvy-navy select-none mb-1.5 block",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";
