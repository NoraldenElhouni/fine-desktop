import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useConflictStore } from "../../stores/conflictStore";

export const ConflictModal: React.FC = () => {
  const { isOpen, message, dismissConflict } = useConflictStore();

  if (!isOpen) {
    return null;
  }

  const handleReload = () => {
    dismissConflict();
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-status-warning/15 text-app-status-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3
              id="conflict-dialog-title"
              className="text-base font-bold text-app-label-primary"
            >
              تعارض في تحديث البيانات (409 Conflict)
            </h3>
            <p className="text-xs text-app-label-secondary mt-1">
              تم تعديل هذا السجل بواسطة مستخدم آخر أو عملية متزامنة أثناء وجودك في الصفحة.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissConflict}
            className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary transition-colors"
            title="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conflict Details */}
        <div className="rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3.5 text-xs text-app-label-primary leading-relaxed">
          {message}
        </div>

        <p className="text-[11px] text-app-label-secondary leading-normal">
          لحماية تكامل البيانات ومنع الكتابة فوق تعديلات المستخدمين الآخرين، يرجى إعادة تحميل الصفحة لاسترجاع أحدث نسخة من السجل قبل إعادة المحاولة.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-app-separator">
          <button
            type="button"
            onClick={dismissConflict}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
          >
            إغلاق ومراجعة المدخلات
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    </div>
  );
};
