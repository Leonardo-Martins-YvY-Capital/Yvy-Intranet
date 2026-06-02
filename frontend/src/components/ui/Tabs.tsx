import React, { createContext, useCallback, useContext, useState } from "react";
import { cn } from "../../lib/utils";

// --- Context ---

interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
  variant: "underline" | "pill";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab components must be used within <Tabs>");
  return ctx;
}

// --- Types ---

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  variant?: "underline" | "pill";
  children: React.ReactNode;
  className?: string;
}

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

// --- Tabs root ---

export function Tabs({
  value,
  onValueChange,
  defaultValue = "",
  variant = "underline",
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const setActiveValue = useCallback(
    (v: string) => {
      if (value === undefined) setInternalValue(v);
      onValueChange?.(v);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue, variant }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// --- TabList ---

export function TabList({ className, children, ...props }: TabListProps) {
  const { variant, setActiveValue } = useTabsContext();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const currentIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement
    );
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      nextTab.focus();
      const nextValue = nextTab.dataset.tabValue;
      if (nextValue) setActiveValue(nextValue);
    }
  };

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "flex",
        variant === "underline" && "border-b border-black/20",
        variant === "pill" && "gap-x-1 p-1 bg-yvy-navy/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// --- Tab ---

export function Tab({ value, className, children, ...props }: TabProps) {
  const { activeValue, setActiveValue, variant } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      data-tab-value={value}
      onClick={() => setActiveValue(value)}
      className={cn(
        "font-barlowcn text-sm uppercase tracking-wider font-semibold yvy-transition cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-yvy-royal focus:ring-offset-1",
        variant === "underline" && [
          "px-4 py-2.5 border-b-2 -mb-px",
          isActive
            ? "border-yvy-navy text-yvy-navy"
            : "border-transparent text-yvy-navy/40 hover:text-yvy-navy hover:border-yvy-navy/20",
        ],
        variant === "pill" && [
          "px-4 py-1.5",
          isActive ? "bg-yvy-navy text-white" : "text-yvy-navy hover:bg-yvy-navy/5",
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// --- TabPanel ---

export function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={cn("pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
