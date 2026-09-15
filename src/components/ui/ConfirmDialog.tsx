import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogBody, DialogFooter, DialogClose } from "./Dialog";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-status-danger/15 text-app-status-danger">
            <AlertCircle className="h-6 w-6" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-status-warning/15 text-app-status-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "primary":
      default:
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-accent/15 text-app-accent">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-app-status-danger text-white hover:opacity-90";
      case "warning":
        return "bg-app-status-warning text-white hover:opacity-90";
      case "primary":
      default:
        return "bg-app-accent text-white hover:opacity-90";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && !isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent size="sm">
        <DialogBody>
          <div className="flex items-start gap-4">
            {getIcon()}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-app-label-primary">{title}</h4>
                {!isLoading && <DialogClose />}
              </div>
              <p className="text-xs text-app-label-secondary leading-relaxed">{message}</p>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition-opacity disabled:opacity-50 ${getConfirmButtonClasses()}`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
