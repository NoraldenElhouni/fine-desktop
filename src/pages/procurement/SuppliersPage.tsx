import React, { useState } from "react";
import { Truck, Plus, RefreshCw, Building, MapPin } from "lucide-react";
import { isAxiosError } from "axios";
import { CreateSupplierPayload } from "../../types/procurement";
import { useSuppliers, useCreateSupplier } from "../../hooks/useProcurement";
import { useOperatingUnits } from "../../hooks/usePartners";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Modal } from "../../components/ui/Modal";

export const SuppliersPage: React.FC = () => {
  const { data: suppliers = [], isLoading, error: queryError, refetch } = useSuppliers();
  const { data: operatingUnits = [] } = useOperatingUnits();
  const createSupplierMutation = useCreateSupplier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [address, setAddress] = useState("");

  const resetForm = () => {
    setName("");
    setContact("");
    setAddress("");
    setDefaultCurrency("USD");
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedUnitId || operatingUnits[0]?.id;
    if (!name.trim() || !unitId) {
      toast.error("يرجى تعبئة اسم المورد والوحدة التشغيلية");
      return;
    }

    const payload: CreateSupplierPayload = {
      operating_unit_id: unitId,
      name: name.trim(),
      contact: contact.trim() || undefined,
      default_currency: defaultCurrency,
      address: address.trim() || undefined,
    };

    createSupplierMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تمت إضافة المورد بنجاح");
        setIsModalOpen(false);
        resetForm();
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "حدث خطأ أثناء حفظ بيانات المورد");
      },
    });
  };

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل قائمة الموردين"
    : null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
            <Truck className="h-6 w-6 text-app-accent" />
            <span>سجل الموردين الخارجيين</span>
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            إدارة بيانات الشركات المزودة للمواد الخام والسلع المستوردة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-app-separator bg-app-bg-primary p-6 text-center">
          <Building className="h-10 w-10 text-app-label-secondary mb-2 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا يوجد موردون مسجلون</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإنشاء سجل للموردين البدء في إصدار أوامر الاستيراد
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم المورد</th>
                <th className="px-4 py-3 text-start font-bold">العملة الافتراضية</th>
                <th className="px-4 py-3 text-start font-bold">معلومات الاتصال</th>
                <th className="px-4 py-3 text-start font-bold">العنوان / المرفأ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-app-accent" />
                      <span>{sup.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className="rounded-md bg-app-bg-secondary px-2 py-1 font-bold text-app-label-primary">
                      {sup.default_currency}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-app-label-secondary">
                    {sup.contact || "—"}
                  </td>
                  <td className="px-4 py-3 text-app-label-secondary">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-app-label-secondary" />
                      <span>{sup.address || "غير محدد"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة مورد خارجي جديد"
        size="md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4" dir="rtl">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              الوحدة التشغيلية <span className="text-app-status-danger">*</span>
            </label>
            <select
              required
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
            >
              <option value="">-- اختر الوحدة --</option>
              {operatingUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              اسم الشركة الموردة <span className="text-app-status-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Global Steel Trading Corp"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                العملة المعتمدة
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              >
                <option value="USD">الدولار الأمريكي (USD)</option>
                <option value="EUR">اليورو الأوروبي (EUR)</option>
                <option value="LYD">الدينار الليبي (LYD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                جهة / هاتف الاتصال
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="هاتف أو بريد أو مسؤول المبيعات"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              العنوان الجغرافي / الدولة والميناء
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: إسطنبول، تركيا - ميناء أمبارلي"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-app-separator">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createSupplierMutation.isPending || !name.trim()}
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createSupplierMutation.isPending ? "جاري الحفظ..." : "حفظ المورد"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
