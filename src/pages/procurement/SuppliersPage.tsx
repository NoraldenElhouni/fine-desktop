import React, { useEffect, useState } from "react";
import { Truck, Plus, RefreshCw, Building, Globe, MapPin } from "lucide-react";
import { isAxiosError } from "axios";
import { Supplier, CreateSupplierPayload } from "../../types/procurement";
import { OperatingUnit } from "../../types/entities";
import { getSuppliers, createSupplier } from "../../api/endpoints/procurement";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [address, setAddress] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [suppliersData, unitsData] = await Promise.all([
        getSuppliers(),
        getOperatingUnits(),
      ]);
      setSuppliers(suppliersData);
      setOperatingUnits(unitsData);
      if (unitsData.length > 0 && !selectedUnitId) {
        setSelectedUnitId(unitsData[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedUnitId) {
      alert("يرجى تعبئة اسم المورد والوحدة التشغيلية");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateSupplierPayload = {
        operating_unit_id: selectedUnitId,
        name: name.trim(),
        contact: contact.trim() || undefined,
        default_currency: defaultCurrency,
        address: address.trim() || undefined,
      };

      await createSupplier(payload);
      setIsModalOpen(false);
      setName("");
      setContact("");
      setAddress("");
      fetchData();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        alert(`خطأ: ${error.response.data.message}`);
      } else {
        alert("حدث خطأ أثناء حفظ بيانات المورد");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={fetchData}
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-4">إضافة مورد خارجي جديد</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الوحدة التشغيلية <span className="text-red-500">*</span>
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
                  اسم الشركة الموردة <span className="text-red-500">*</span>
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
                    العملة الافتراضية
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  >
                    <option value="USD">USD (دولار أمريكي)</option>
                    <option value="EUR">EUR (يورو)</option>
                    <option value="LYD">LYD (دينار ليبي)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    معلومات الاتصال / البريد
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="sales@globalsteel.com"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  العنوان / بلد المورد
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Istanbul Port, Turkey"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !selectedUnitId}
                  className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ المورد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
