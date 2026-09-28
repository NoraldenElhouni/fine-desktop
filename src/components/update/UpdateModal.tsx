import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Download, CheckCircle2 } from "lucide-react";
import { useUpdateStore, type UpdateStatus } from "../../stores/updateStore";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

export const UpdateModal: React.FC = () => {
  const { status, version, progressPercent, downloadSpeed, errorMessage, setStatus, setProgress, setError } =
    useUpdateStore();
  const [countdown, setCountdown] = useState<number>(4);

  // Hook up electron-updater IPC listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI) return;

    const cleanupStatus = window.electronAPI.onUpdateStatus?.((s, v) => {
      setStatus(s as UpdateStatus, v);
    });

    const cleanupProgress = window.electronAPI.onUpdateProgress?.((data) => {
      setProgress(data.percent, data.speed);
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded?.((v) => {
      setStatus("downloaded", v);
    });

    const cleanupError = window.electronAPI.onUpdateError?.((msg) => {
      setError(msg);
    });

    return () => {
      cleanupStatus?.();
      cleanupProgress?.();
      cleanupDownloaded?.();
      cleanupError?.();
    };
  }, [setStatus, setProgress, setError]);

  // Countdown & auto-restart when update is downloaded
  useEffect(() => {
    if (status !== "downloaded") return;

    setCountdown(4);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRestart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const handleRestart = () => {
    window.electronAPI?.installUpdateAndRestart?.();
  };

  const handleRetry = () => {
    window.electronAPI?.checkForUpdates?.();
  };

  // Only take over the screen once an update has actually been found —
  // routine background checks ("checking" / "not-available") stay invisible.
  const isVisible = status === "available" || status === "downloading" || status === "downloaded" || status === "error";
  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="rtl"
      className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
    >
      <div className="w-full max-w-lg rounded-2xl bg-app-bg-primary border border-app-separator shadow-2xl overflow-hidden p-6 text-app-label-primary space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className={cn(tokens.typography.webUI.largeTitleEmphasized, "text-app-label-primary")}>
              تحديث إلزامي للنظام
            </h2>
            <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-secondary")}>
              Mandatory System Update Required
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="p-3.5 rounded-xl bg-app-bg-secondary border border-app-separator text-xs text-app-label-secondary space-y-2">
          <p>
            تم إصدار نسخة جديدة من النظام. سيتم تحميلها وتثبيتها تلقائياً قبل متابعة الاستخدام.
          </p>

          {version && (
            <div className="flex items-center justify-between pt-2 border-t border-app-separator text-xs font-mono" dir="ltr">
              <span className="text-app-label-tertiary">New version:</span>
              <span className="text-emerald-400 font-semibold">v{version}</span>
            </div>
          )}
        </div>

        {/* Status / Progress Area */}
        <div className="space-y-2">
          {status === "available" && (
            <div className="flex items-center justify-center gap-2.5 py-4 text-xs text-app-label-secondary">
              <RefreshCw className="w-4 h-4 animate-spin text-app-accent" />
              <span>جاري بدء تحميل التحديث...</span>
            </div>
          )}

          {status === "downloading" && (
            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-app-label-secondary flex items-center gap-1.5 font-medium">
                  <Download className="w-4 h-4 text-app-accent animate-bounce" />
                  جاري تحميل التحديث تلقائياً...
                </span>
                <span className="font-mono font-bold text-app-accent" dir="ltr">
                  {progressPercent}% {downloadSpeed && `(${downloadSpeed})`}
                </span>
              </div>
              <div className="h-2.5 w-full bg-app-bg-secondary rounded-full overflow-hidden border border-app-separator">
                <div
                  className="h-full bg-app-accent transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {status === "downloaded" && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>اكتمل تحميل التحديث بنجاح!</span>
              </div>
              <p className="text-app-label-secondary">
                سيتم إعادة تشغيل التطبيق وتثبيت التحديث تلقائياً خلال {countdown} ثوانٍ...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs space-y-1">
              <div className="font-semibold">تعذر إكمال التحميل التلقائي:</div>
              <p className="text-rose-400/90 font-mono text-[11px]">
                {errorMessage || "حدث خطأ أثناء تحميل التحديث"}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {status === "error" && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-5 py-2 bg-app-accent hover:bg-app-accent-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة المحاولة
            </button>
          )}

          {status === "downloaded" && (
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 w-full justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة التشغيل والتثبيت الآن ({countdown})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
