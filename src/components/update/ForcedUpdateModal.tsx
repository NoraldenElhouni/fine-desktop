import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Download, CheckCircle2, ExternalLink } from "lucide-react";
import { useUpdateStore } from "../../stores/updateStore";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

export const ForcedUpdateModal: React.FC = () => {
  const { isForceUpdateRequired, details, setProgress, setStatus } = useUpdateStore();
  const [countdown, setCountdown] = useState<number>(4);

  // Auto-initiate download when force update is triggered
  useEffect(() => {
    if (!isForceUpdateRequired) return;

    setStatus("checking");

    if (typeof window !== "undefined" && window.electronAPI?.startAutoUpdate) {
      window.electronAPI
        .startAutoUpdate({ downloadUrl: details.directDownloadUrl || details.updateUrl })
        .catch((err: any) => {
          setStatus("error", err?.message || "فشل بدء تحميل التحديث تلقائياً");
        });
    } else {
      // Browser / dev fallback simulation
      const timer = setTimeout(() => {
        setStatus("downloading");
        let p = 0;
        const interval = setInterval(() => {
          p += 25;
          setProgress(p, "4.5 MB/s");
          if (p >= 100) {
            clearInterval(interval);
            setStatus("downloaded");
          }
        }, 500);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isForceUpdateRequired]);

  // Hook up Electron IPC listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI) return;

    const cleanupProgress = window.electronAPI.onUpdateProgress?.((data) => {
      setProgress(data.percent, data.speed);
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded?.(() => {
      setStatus("downloaded");
    });

    const cleanupError = window.electronAPI.onUpdateError?.((msg) => {
      setStatus("error", msg);
    });

    return () => {
      cleanupProgress?.();
      cleanupDownloaded?.();
      cleanupError?.();
    };
  }, [setProgress, setStatus]);

  // Countdown & auto-restart when update is downloaded
  useEffect(() => {
    if (details.status !== "downloaded") return;

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
  }, [details.status]);

  const handleRestart = () => {
    if (typeof window !== "undefined" && window.electronAPI?.installUpdateAndRestart) {
      window.electronAPI.installUpdateAndRestart();
    } else {
      window.location.reload();
    }
  };

  const handleRetry = () => {
    setStatus("checking");
    if (typeof window !== "undefined" && window.electronAPI?.startAutoUpdate) {
      window.electronAPI.startAutoUpdate({ downloadUrl: details.directDownloadUrl || details.updateUrl });
    }
  };

  const handleManualDownload = () => {
    const targetUrl = details.updateUrl || "https://github.com/NoraldenElhouni/fine-desktop/releases/latest";
    window.open(targetUrl, "_blank");
  };

  if (!isForceUpdateRequired) {
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
            تم إصدار نسخة جديدة من النظام وإيقاف النسخ السابقة لضمان أمان البيانات وتوافق قواعد البيانات.
            لا يمكن مواصلة استخدام هذه النسخة حتى اكتمال التحديث.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-app-separator text-xs font-mono" dir="ltr">
            <div>
              <span className="text-app-label-tertiary">Current: </span>
              <span className="text-rose-400 font-semibold">v{details.currentVersion}</span>
            </div>
            <div>
              <span className="text-app-label-tertiary">Required: </span>
              <span className="text-emerald-400 font-semibold">v{details.requiredVersion || details.latestVersion || "Latest"}</span>
            </div>
          </div>
        </div>

        {/* Status / Progress Area */}
        <div className="space-y-2">
          {details.status === "checking" && (
            <div className="flex items-center justify-center gap-2.5 py-4 text-xs text-app-label-secondary">
              <RefreshCw className="w-4 h-4 animate-spin text-app-accent" />
              <span>جاري التحقق من التحديث والاتصال بخادم التحديثات...</span>
            </div>
          )}

          {details.status === "downloading" && (
            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-app-label-secondary flex items-center gap-1.5 font-medium">
                  <Download className="w-4 h-4 text-app-accent animate-bounce" />
                  جاري تحميل التحديث تلقائياً...
                </span>
                <span className="font-mono font-bold text-app-accent" dir="ltr">
                  {details.progressPercent}% {details.downloadSpeed && `(${details.downloadSpeed})`}
                </span>
              </div>
              <div className="h-2.5 w-full bg-app-bg-secondary rounded-full overflow-hidden border border-app-separator">
                <div
                  className="h-full bg-app-accent transition-all duration-300 rounded-full"
                  style={{ width: `${details.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {details.status === "downloaded" && (
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

          {details.status === "error" && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs space-y-1">
              <div className="font-semibold">تعذر إكمال التحميل التلقائي:</div>
              <p className="text-rose-400/90 font-mono text-[11px]">
                {details.errorMessage || "حدث خطأ أثناء تحميل التحديث"}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {details.status === "error" && (
            <>
              <button
                type="button"
                onClick={handleManualDownload}
                className="flex items-center gap-1.5 px-4 py-2 bg-app-bg-secondary hover:bg-app-fill-f1 text-app-label-primary text-xs font-medium rounded-xl border border-app-separator transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                تحميل يدوي من المتصفح
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-5 py-2 bg-app-accent hover:bg-app-accent-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                إعادة المحاولة
              </button>
            </>
          )}

          {details.status === "downloaded" && (
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
