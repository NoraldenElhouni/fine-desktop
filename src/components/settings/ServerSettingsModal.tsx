import React, { useState, useEffect } from "react";
import { Server, Check, X, Shield, RefreshCw } from "lucide-react";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { OperatingUnit } from "../../types/entities";

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
    setServerUrl,
    setOperatingUnitId,
    setServerConnected,
  } = useServerConfigStore();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [selectedUnit, setSelectedUnit] = useState<string>(operatingUnitId || "");
  const [units, setUnits] = useState<OperatingUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setInputUrl(serverUrl);
    setSelectedUnit(operatingUnitId || "");
  }, [serverUrl, operatingUnitId, isOpen]);

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
    setServerConnected(true, null);
    setStatusMsg({ type: "success", text: "تم حفظ إعدادات الاتصال بالسيرفر بنجاح" });
    
    setTimeout(() => {
      onClose();
      setStatusMsg(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 max-w-md w-full p-6 space-y-6 animate-scale-up">
        
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">إعدادات سيرفر الشبكة المحلية</h2>
              <p className="text-xs text-neutral-500">تكوين رابط API وحدة التشغيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              عنوان السيرفر الرئيسي (Server Base URL)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="http://192.168.1.100:8000/api/v1"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
            <p className="text-xs text-neutral-400 mt-1">
              مثال: <code className="bg-neutral-100 px-1 rounded">http://192.168.1.50:8000/api/v1</code>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              وحدة التشغيل الرئيسية (Operating Unit)
            </label>
            {loadingUnits ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> جاري تحميل الوحدات...
              </div>
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              >
                <option value="">-- بدون تحديد --</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} {unit.unit_type ? `(${unit.unit_type})` : ""}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-neutral-400 mt-1">
              يتم إرسال معرف وحدة التشغيل كـ <code className="bg-neutral-100 px-1 rounded">X-Operating-Unit-ID</code> مع كافة الطلبات.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {statusMsg.text}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>

      </div>
    </div>
  );
};
