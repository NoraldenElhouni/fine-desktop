import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, ToastItem } from "../../stores/toastStore";

const ToastIcon: React.FC<{ type: ToastItem["type"] }> = ({ type }) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-app-status-positive shrink-0" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-app-status-danger shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-app-status-warning shrink-0" />;
    case "info":
    default:
      return <Info className="h-4 w-4 text-app-accent shrink-0" />;
  }
};

const ToastStyle: Record<ToastItem["type"], string> = {
  success: "border-app-status-positive/30 bg-app-bg-primary text-app-label-primary shadow-lg",
  error: "border-app-status-danger/30 bg-app-bg-primary text-app-label-primary shadow-lg",
  warning: "border-app-status-warning/30 bg-app-bg-primary text-app-label-primary shadow-lg",
  info: "border-app-separator bg-app-bg-primary text-app-label-primary shadow-lg",
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 start-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      dir="rtl"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 text-xs transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${ToastStyle[item.type]}`}
        >
          <div className="mt-0.5">
            <ToastIcon type={item.type} />
          </div>
          <div className="flex-1 font-semibold leading-relaxed break-words">
            {item.message}
          </div>
          <button
            type="button"
            onClick={() => removeToast(item.id)}
            className="rounded-lg p-0.5 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
