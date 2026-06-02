import React, { createContext, useContext, useId } from "react";
import { cn } from "../../lib/utils";

// --- Context ---

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  name: string;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioItem must be used within RadioGroup");
  return ctx;
}

// --- Types ---

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  layout?: "vertical" | "horizontal";
  children: React.ReactNode;
  className?: string;
}

interface RadioItemProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// --- RadioGroup root ---

export function RadioGroup({
  value,
  onValueChange,
  name,
  layout = "vertical",
  children,
  className,
}: RadioGroupProps) {
  const generatedName = useId();
  const resolvedName = name ?? generatedName;

  return (
    <RadioGroupContext.Provider
      value={{ value, onValueChange, name: resolvedName }}
    >
      <div
        role="radiogroup"
        className={cn(
          "flex",
          layout === "vertical" && "flex-col gap-y-3",
          layout === "horizontal" && "flex-row flex-wrap gap-x-6 gap-y-3",
          className
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

// --- RadioItem ---

export function RadioItem({
  value,
  label,
  description,
  disabled,
}: RadioItemProps) {
  const { value: groupValue, onValueChange, name } = useRadioGroupContext();
  const checked = groupValue === value;

  return (
    <label
      className={cn(
        "flex items-start gap-x-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onValueChange(value)}
        className="yvy-radio mt-0.5"
      />
      <div className="flex flex-col gap-y-0.5">
        <span className="text-sm font-barlow font-light text-yvy-navy leading-5">
          {label}
        </span>
        {description && (
          <span className="text-xs font-barlow font-light text-yvy-navy/50 leading-relaxed">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
