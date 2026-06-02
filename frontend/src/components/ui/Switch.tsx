import React from "react";
import { cn } from "../../lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, label, id, className }, ref) => {
    const button = (
      <button
        ref={ref}
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full yvy-transition",
          "focus:outline-none focus:ring-2 focus:ring-yvy-royal focus:ring-offset-2",
          checked ? "bg-yvy-navy" : "bg-yvy-navy/20",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white yvy-transition",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    );

    if (!label) return button;

    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-x-3",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        {button}
        <span className="text-sm font-barlow font-light text-yvy-navy select-none">
          {label}
        </span>
      </label>
    );
  }
);

Switch.displayName = "Switch";
