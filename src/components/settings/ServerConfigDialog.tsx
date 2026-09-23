import React, { useEffect, useState } from "react";
import { Server, Check, Shield, RefreshCw, Info } from "lucide-react";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { recordSystemVersion } from "../../api/endpoints/system";
import { OperatingUnit } from "../../types/entities";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";
import { SearchableSelect } from "../ui/SearchableSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../ui/Dialog";

export interface ServerConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServerConfigDialog: React.FC<ServerConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    serverUrl,
    operatingUnitId,
    allowManualEntitySelection,
    setServerUrl,
    setOperatingUnitId,
    setAllowManualEntitySelection,
    setServerConnected,
  } = useServerConfigStore();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [selectedUnit, setSelectedUnit] = useState<string>(operatingUnitId || "");
  const [manualEntityEnabled, setManualEntityEnabled] = useState<boolean>(allowManualEntitySelection);
  const [units, setUnits] = useState<OperatingUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [desktopVersion, setDesktopVersion] = useState<string>("");
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [loadingVersion, setLoadingVersion] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setInputUrl(serverUrl);
      setSelectedUnit(operatingUnitId || "");
      setManualEntityEnabled(allowManualEntitySelection);
      setStatusMsg(null);
    }
  }, [open, serverUrl, operatingUnitId, allowManualEntitySelection]);

  useEffect(() => {
    if (!open) return;
    setLoadingUnits(true);
    getOperatingUnits()
      .then((data) => {
        setUnits(data);
        if (!selectedUnit && data.length > 0) {
          setSelectedUnit(data[0].id);
        }
      })
      .catch(() => {
        // ignore if server connection is currently down
      })
      .finally(() => setLoadingUnits(false));
  }, [open, serverUrl, selectedUnit]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoadingVersion(true);

    const resolveVersions = async () => {
      let dVer = "";
      if (typeof window !== "undefined" && window.electronAPI?.getAppVersion) {
        try {
          dVer = await window.electronAPI.getAppVersion();
        } catch {
          // fallback below
        }
      }
      if (!dVer && typeof __APP_VERSION__ !== "undefined") {
        dVer = __APP_VERSION__;
      }
      if (!dVer) {
        dVer = "1.0.24";
      }

      if (isMounted) {
        setDesktopVersion(dVer);
      }

      try {
        const res = await recordSystemVersion(dVer);
        if (isMounted) {
          setBackendVersion(res.backend_version);
        }
      } catch {
        if (isMounted) {
          setBackendVersion(null);
        }
      } finally {
        if (isMounted) {
          setLoadingVersion(false);
        }
      }
    };

    resolveVersions();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSave = () => {
    if (!inputUrl.trim()) {
      setStatusMsg({ type: "error", text: "يرجى إدخال عنوان السيرفر بشكل صحيح" });
      return;
    }

    setServerUrl(inputUrl.trim());
    setOperatingUnitId(selectedUnit || null);
    setAllowManualEntitySelection(manualEntityEnabled);
    setServerConnected(true, null);
    setStatusMsg({ type: "success", text: "تم حفظ إعدادات الاتصال بالسيرفر بنجاح" });

    setTimeout(() => {
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-app-bg-primary rounded-app-lg text-app-label-primary border border-app-separator">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>إعدادات سيرفر الشبكة المحلية</DialogTitle>
              <DialogDescription>تكوين رابط API وحدة التشغيل</DialogDescription>
            </div>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div>
            <label className={cn(tokens.typography.webUI.c1Emphasized, "block text-app-label-primary mb-1.5")}>
              عنوان السيرفر الرئيسي (Server Base URL)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="http://192.168.1.100:8000/api/v1"
              dir="ltr"
              className="w-full px-3.5 py-2 bg-app-bg-secondary border border-app-separator rounded-app-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-app-accent transition-all text-start"
            />
            <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-tertiary mt-1")}>
              مثال:{" "}
              <code className="bg-app-fill-f1 px-1 rounded-app-sm" dir="ltr">
                http://192.168.1.50:8000/api/v1
              </code>
            </p>
          </div>

          <div>
            <label className={cn(tokens.typography.webUI.c1Emphasized, "block text-app-label-primary mb-1.5")}>
              وحدة التشغيل الرئيسية (Operating Unit)
            </label>
            {loadingUnits ? (
              <div className="flex items-center gap-2 text-xs text-app-label-tertiary py-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> جاري تحميل الوحدات...
              </div>
            ) : (
              <SearchableSelect<OperatingUnit>
                options={units}
                value={units.find((u) => u.id === selectedUnit) ?? null}
                onChange={(u) => setSelectedUnit(u ? u.id : "")}
                getOptionId={(u) => u.id}
                getOptionLabel={(u) => u.name}
                getOptionSubLabel={(u) =>
                  u.unit_type ? `(${u.unit_type})` : ""
                }
                getOptionSearchText={(u) =>
                  `${u.name} ${u.unit_type ?? ""}`
                }
                placeholder="-- بدون تحديد --"
              />
            )}
            <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-tertiary mt-1")}>
              يتم إرسال معرف وحدة التشغيل كـ{" "}
              <code className="bg-app-fill-f1 px-1 rounded-app-sm" dir="ltr">
                X-Operating-Unit-ID
              </code>{" "}
              مع كافة الطلبات.
            </p>
          </div>

          <div className="pt-3 border-t border-app-separator">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className={cn(tokens.typography.webUI.c1Emphasized, "text-app-label-primary")}>
                  السماح بالاختيار اليدوي للكيانات
                </label>
                <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-tertiary mt-0.5")}>
                  عند التعطيل (الافتراضي)، يتم إنشاء الكيان تلقائياً في استمارات الموظفين والعملاء.
                </p>
              </div>
              <input
                type="checkbox"
                checked={manualEntityEnabled}
                onChange={(e) => setManualEntityEnabled(e.target.checked)}
                className="h-4 w-4 rounded-app-sm border-app-label-quaternary text-app-accent focus:ring-app-accent cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-app-lg border border-app-separator bg-app-bg-secondary p-3 text-xs text-app-label-secondary">
            <Shield className="w-4 h-4 mt-0.5 shrink-0 text-app-label-tertiary" />
            <p>
              يتم تخزين عنوان السيرفر ومعرف وحدة التشغيل محلياً في المتصفح فقط. كل طلب إلى الـ
              Backend يضيف الترويسة المناسبة آلياً.
            </p>
          </div>

          <div className="rounded-app-lg border border-app-separator bg-app-bg-secondary p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(tokens.typography.webUI.c1Emphasized, "text-app-label-primary flex items-center gap-1.5")}>
                <Info className="w-3.5 h-3.5 text-app-label-tertiary" />
                معلومات إصدار النظام (Build Versions)
              </span>
              {loadingVersion && (
                <span className="flex items-center gap-1 text-[11px] text-app-label-tertiary">
                  <RefreshCw className="w-3 h-3 animate-spin" /> جاري التحقق...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-start" dir="ltr">
              <div className="p-2 rounded-app-md bg-app-fill-f1 border border-app-separator/50">
                <div className="text-[10px] text-app-label-tertiary uppercase tracking-wider">Desktop App</div>
                <div className="font-mono text-xs font-semibold text-app-label-primary mt-0.5">
                  v{desktopVersion || "..."}
                </div>
              </div>
              <div className="p-2 rounded-app-md bg-app-fill-f1 border border-app-separator/50">
                <div className="text-[10px] text-app-label-tertiary uppercase tracking-wider">Backend API</div>
                <div className="font-mono text-xs font-semibold text-app-label-primary mt-0.5">
                  {backendVersion ? `v${backendVersion}` : loadingVersion ? "..." : "غير متصل"}
                </div>
              </div>
            </div>
          </div>

          {statusMsg && (
            <div
              className={cn(
                "p-3 rounded-app-lg text-xs font-medium",
                tokens.typography.webUI.c1Emphasized,
                statusMsg.type === "success"
                  ? "bg-app-status-positive/10 text-app-status-positive border border-app-status-positive/30"
                  : "bg-app-status-danger/10 text-app-status-danger border border-app-status-danger/30",
              )}
            >
              {statusMsg.text}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-app-label-secondary hover:text-app-label-primary rounded-app-lg hover:bg-app-fill-f1 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-app-accent hover:bg-app-accent-hover text-white text-sm font-medium rounded-app-lg transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
