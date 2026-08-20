import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  showCloseButton = true,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "flex max-h-[90vh] w-full flex-col rounded-2xl border border-app-separator bg-app-bg-primary shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-app-separator bg-app-bg-secondary px-5 py-4">
            <div className="flex-1 pe-3">
              {typeof title === "string" ? (
                <h3 className="text-base font-bold text-app-label-primary">
                  {title}
                </h3>
              ) : (
                title
              )}
              {description && (
                <div className="text-xs text-app-label-secondary mt-1">
                  {description}
                </div>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary transition-colors"
                title="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-app-separator bg-app-bg-secondary p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
