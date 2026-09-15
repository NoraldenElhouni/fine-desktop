import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useConflictStore } from "../../stores/conflictStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "./Dialog";

export const ConflictModal: React.FC = () => {
  const { isOpen, message, dismissConflict } = useConflictStore();

  const handleReload = () => {
    dismissConflict();
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && dismissConflict()}>
      <DialogContent size="md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-status-warning/15 text-app-status-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>تعارض في تحديث البيانات (409 Conflict)</DialogTitle>
              <DialogDescription>
                تم تعديل هذا السجل بواسطة مستخدم آخر أو عملية متزامنة أثناء وجودك في الصفحة.
              </DialogDescription>
            </div>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-3.5">
          <div className="rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3.5 text-xs text-app-label-primary leading-relaxed">
            {message}
          </div>

          <p className="text-[11px] text-app-label-secondary leading-normal">
            لحماية تكامل البيانات ومنع الكتابة فوق تعديلات المستخدمين الآخرين، يرجى إعادة تحميل الصفحة لاسترجاع أحدث نسخة من السجل قبل إعادة المحاولة.
          </p>
        </DialogBody>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
