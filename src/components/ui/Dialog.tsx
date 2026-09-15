import React, { createContext, useContext, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils/utils";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  full: "max-w-4xl",
};

interface DialogContextValue {
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside a <Dialog>`);
  }
  return ctx;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
          className
        )}
        dir="rtl"
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </DialogContext.Provider>
  );
};

export interface DialogContentProps {
  size?: DialogSize;
  className?: string;
  children: React.ReactNode;
}

export const DialogContent: React.FC<DialogContentProps> = ({ size = "md", className, children }) => {
  return (
    <div
      className={cn(
        "flex max-h-[90vh] w-full flex-col rounded-2xl border border-app-separator bg-app-bg-primary shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
};

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
  <div
    className={cn(
      "flex items-start justify-between border-b border-app-separator bg-app-bg-secondary px-5 py-4",
      className
    )}
  >
    {children}
  </div>
);

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <h3 className={cn("text-base font-bold text-app-label-primary", className)}>{children}</h3>
);

export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => (
  <div className={cn("text-xs text-app-label-secondary mt-1", className)}>{children}</div>
);

export interface DialogCloseProps {
  className?: string;
}

export const DialogClose: React.FC<DialogCloseProps> = ({ className }) => {
  const { onOpenChange } = useDialogContext("DialogClose");
  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={cn(
        "shrink-0 rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary transition-colors",
        className
      )}
      title="إغلاق"
    >
      <X className="h-4 w-4" />
    </button>
  );
};

export interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogBody: React.FC<DialogBodyProps> = ({ children, className }) => (
  <div className={cn("flex-1 overflow-y-auto p-5", className)}>{children}</div>
);

export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 border-t border-app-separator bg-app-bg-secondary p-4",
      className
    )}
  >
    {children}
  </div>
);
