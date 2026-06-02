import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

// --- Types ---

interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "full";
  children: React.ReactNode;
  className?: string;
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  children: React.ReactNode;
}

// --- Modal root ---

export const Modal = React.forwardRef<HTMLDialogElement, ModalProps>(
  ({ open, onClose, size = "md", children, className, ...props }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const previousFocus = useRef<Element | null>(null);

    const setRef = (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    // Open / close the native dialog
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (open) {
        previousFocus.current = document.activeElement;
        if (!dialog.open) dialog.showModal();
      } else {
        if (dialog.open) dialog.close();
        if (previousFocus.current instanceof HTMLElement) {
          previousFocus.current.focus();
        }
      }
    }, [open]);

    // Intercept Escape key so onClose controls the state
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const handleCancel = (e: Event) => {
        e.preventDefault();
        onClose();
      };
      dialog.addEventListener("cancel", handleCancel);
      return () => dialog.removeEventListener("cancel", handleCancel);
    }, [onClose]);

    const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
      sm:   "w-[400px]",
      md:   "w-[560px]",
      lg:   "w-[720px]",
      full: "w-screen h-screen max-w-none max-h-none m-0",
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    };

    return (
      <dialog
        ref={setRef}
        aria-modal="true"
        onClick={handleBackdropClick}
        className={cn(
          "yvy-modal bg-white border border-black/20 p-0 m-auto",
          "open:flex open:flex-col",
          "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)]",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </dialog>
    );
  }
);

Modal.displayName = "Modal";

// --- Sub-components ---

export function ModalHeader({
  className,
  onClose,
  children,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-black/20 shrink-0",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="shrink-0 ml-4 opacity-50 hover:opacity-100 yvy-transition cursor-pointer"
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

export function ModalBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-6 py-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-x-3 px-6 py-4 border-t border-black/20 shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
