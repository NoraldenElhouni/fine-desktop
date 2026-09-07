import React, { useState, useEffect } from "react";
import { Server, Check, X, Shield, RefreshCw } from "lucide-react";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { OperatingUnit } from "../../types/entities";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";
import { SearchableSelect } from "../ui/SearchableSelect";

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
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

  useEffect(() => {
    setInputUrl(serverUrl);
    setSelectedUnit(operatingUnitId || "");
    setManualEntityEnabled(allowManualEntitySelection);
  }, [serverUrl, operatingUnitId, allowManualEntitySelection, isOpen]);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, serverUrl]);

  if (!isOpen) return null;

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
      onClose();
      setStatusMsg(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-label-primary/50 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-app-bg-primary rounded-app-xl shadow-xl border border-app-separator max-w-md w-full p-6 space-y-6 animate-scale-up">

        <div className="flex items-center justify-between border-b border-app-separator pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-app-bg-secondary rounded-app-lg text-app-label-primary">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn(tokens.typography.webUI.t1Emphasized, "text-app-label-primary")}>إعدادات سيرفر الشبكة المحلية</h2>
              <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-secondary")}>تكوين رابط API وحدة التشغيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 text-app-label-tertiary hover:text-app-label-primary rounded-app-lg hover:bg-app-fill-f1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(tokens.typography.webUI.t2Emphasized, "block text-app-label-primary mb-1.5")}>
              عنوان السيرفر الرئيسي (Server Base URL)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="http://192.168.1.100:8000/api/v1"
              className="w-full px-4 py-2.5 bg-app-bg-secondary border border-app-separator rounded-app-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-app-accent transition-all"
            />
            <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-tertiary mt-1")}>
              مثال: <code className="bg-app-fill-f1 px-1 rounded-app-sm">http://192.168.1.50:8000/api/v1</code>
            </p>
          </div>

          <div>
            <label className={cn(tokens.typography.webUI.t2Emphasized, "block text-app-label-primary mb-1.5")}>
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
              يتم إرسال معرف وحدة التشغيل كـ <code className="bg-app-fill-f1 px-1 rounded-app-sm">X-Operating-Unit-ID</code> مع كافة الطلبات.
            </p>
          </div>

          <div className="pt-2 border-t border-app-separator">
            <div className="flex items-center justify-between">
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

          {statusMsg && (
            <div
              className={cn(
                "p-3 rounded-app-lg border text-xs font-medium",
                tokens.typography.webUI.c1Emphasized,
                statusMsg.type === "success"
                  ? "bg-app-status-positive/10 text-app-status-positive border border-app-status-positive/30"
                  : "bg-app-status-danger/10 text-app-status-danger border border-app-status-danger/30",
              )}
            >
              {statusMsg.text}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-app-separator pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-app-label-secondary hover:bg-app-fill-f1 rounded-app-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-app-label-primary hover:bg-app-label-primary/90 text-white text-sm font-medium rounded-app-lg transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>

      </div>
    </div>
  );
};
