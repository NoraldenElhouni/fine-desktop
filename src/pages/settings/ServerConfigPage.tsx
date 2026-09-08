import React, { useEffect, useState } from "react";
import { Server, Check, Shield, RefreshCw } from "lucide-react";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { OperatingUnit } from "../../types/entities";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

export const ServerConfigPage: React.FC = () => {
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
  }, [serverUrl, operatingUnitId, allowManualEntitySelection]);

  useEffect(() => {
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
  }, [serverUrl, selectedUnit]);

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
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-app-bg-secondary rounded-app-lg text-app-label-primary border border-app-separator">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <h1 className={cn(tokens.typography.webUI.t1Emphasized, "text-app-label-primary")}>
            إعدادات سيرفر الشبكة المحلية
          </h1>
          <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-secondary")}>
            تكوين رابط API وحدة التشغيل
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-6 space-y-5">
        <div>
          <label className={cn(tokens.typography.webUI.t2Emphasized, "block text-app-label-primary mb-1.5")}>
            عنوان السيرفر الرئيسي (Server Base URL)
          </label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://192.168.1.100:8000/api/v1"
            dir="ltr"
            className="w-full px-4 py-2.5 bg-app-bg-secondary border border-app-separator rounded-app-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-app-accent transition-all text-start"
          />
          <p className={cn(tokens.typography.webUI.c1Regular, "text-app-label-tertiary mt-1")}>
            مثال:{" "}
            <code className="bg-app-fill-f1 px-1 rounded-app-sm" dir="ltr">
              http://192.168.1.50:8000/api/v1
            </code>
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
            يتم إرسال معرف وحدة التشغيل كـ{" "}
            <code className="bg-app-fill-f1 px-1 rounded-app-sm" dir="ltr">
              X-Operating-Unit-ID
            </code>{" "}
            مع كافة الطلبات.
          </p>
        </div>

        <div className="pt-2 border-t border-app-separator">
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

        <div className="flex items-center justify-end gap-3 border-t border-app-separator pt-4">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-app-accent hover:bg-app-accent-hover text-white text-sm font-medium rounded-app-lg transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="max-w-2xl flex items-start gap-3 rounded-2xl border border-app-separator bg-app-bg-secondary p-4 text-xs text-app-label-secondary">
        <Shield className="w-4 h-4 mt-0.5 shrink-0 text-app-label-tertiary" />
        <p>
          يتم تخزين عنوان السيرفر ومعرف وحدة التشغيل محلياً في المتصفح فقط. كل طلب إلى الـ
          Backend يضيف الترويسة المناسبة آلياً.
        </p>
      </div>
    </div>
  );
};
