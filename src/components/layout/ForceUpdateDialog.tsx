import React, { useEffect } from "react";
import { AlertTriangle, Download } from "lucide-react";
import { useUpdateRequiredStore } from "../../stores/updateRequiredStore";

export const ForceUpdateDialog: React.FC = () => {
  const info = useUpdateRequiredStore((state) => state.info);

  useEffect(() => {
    if (info) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [info]);

  if (!info) {
    return null;
  }

  const handleDownload = () => {
    if (info.update_url) {
      window.open(info.update_url, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      dir="rtl"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-app-separator bg-app-bg-primary shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 border-b border-app-separator bg-app-bg-secondary px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-status-yellow/15 text-app-status-yellow">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-app-label-primary">
              يلزم تحديث التطبيق
            </h3>
            <p className="text-xs text-app-label-secondary mt-1">
              إصدار التطبيق الحالي قديم وغير متوافق مع الخادم
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-xl border border-app-status-yellow/30 bg-app-status-yellow/10 p-3.5 text-xs text-app-label-primary leading-relaxed">
            {info.message_ar}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
              <span className="text-app-label-secondary block mb-1">الإصدار الحالي</span>
              <span className="font-mono font-bold text-app-label-primary inline-block" dir="ltr">
                {info.current_version}
              </span>
            </div>
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
              <span className="text-app-label-secondary block mb-1">الإصدار المطلوب</span>
              <span className="font-mono font-bold text-app-label-primary inline-block" dir="ltr">
                {info.required_version}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-app-separator bg-app-bg-secondary p-4">
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-app-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            تنزيل التحديث
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForceUpdateDialog;
