import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

// --- Types ---

interface ToastData {
  id: number;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<ToastData, "id">) => void;
}

// --- Context ---

const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// --- Individual toast item ---

interface ToastItemProps {
  data: ToastData;
  onDismiss: (id: number) => void;
}

function ToastItem({ data, onDismiss }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setExiting(true);
    setTimeout(() => onDismiss(data.id), 300);
  }, [data.id, onDismiss]);

  React.useEffect(() => {
    const timer = setTimeout(dismiss, data.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [dismiss, data.duration]);

  return (
    <div
      role="alert"
      aria-live={data.variant === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex gap-x-3 border-l-4 p-4 w-full",
        exiting ? "toast-exit" : "toast-enter",
        data.variant === "success" &&
          "border-emerald-600 bg-emerald-50 text-emerald-900",
        data.variant === "error" &&
          "border-rose-600 bg-rose-50 text-rose-900",
        data.variant === "warning" &&
          "border-amber-500 bg-amber-50 text-amber-900",
        data.variant === "info" &&
          "border-yvy-royal bg-white text-yvy-navy"
      )}
    >
      <div className="flex-1 flex flex-col gap-y-1 min-w-0">
        <p className="text-sm font-semibold font-barlowcn uppercase tracking-wider truncate">
          {data.title}
        </p>
        {data.description && (
          <p className="text-xs font-barlow font-light leading-relaxed">
            {data.description}
          </p>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Fechar notificação"
        className="shrink-0 mt-0.5 opacity-50 hover:opacity-100 yvy-transition cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4l8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// --- Provider ---

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const idCounter = useRef(0);

  const onDismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: Omit<ToastData, "id">) => {
    const id = ++idCounter.current;
    setToasts((prev) => {
      const next = [{ ...options, id }, ...prev];
      return next.length > 5 ? next.slice(0, 5) : next;
    });
  }, []);

  const container = (
    <div
      aria-label="Notificações"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-y-2 w-80 pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} data={t} onDismiss={onDismiss} />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(container, document.body)}
    </ToastContext.Provider>
  );
}
