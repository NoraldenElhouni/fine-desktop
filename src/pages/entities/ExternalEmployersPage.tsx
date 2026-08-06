import React, { useEffect, useState } from "react";
import { Building, Plus, RefreshCw, FileText, Percent, Scissors } from "lucide-react";
import { isAxiosError } from "axios";
import { ExternalEmployer, Entity, EntityType } from "../../types/entities";
import { getExternalEmployers, createExternalEmployer, splitExternalEmployerEntity } from "../../api/endpoints/externalEmployers";
import { getEntities } from "../../api/endpoints/entities";

export const ExternalEmployersPage: React.FC = () => {
  const [employers, setEmployers] = useState<ExternalEmployer[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [employerName, setEmployerName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [contractRef, setContractRef] = useState("");
  const [multiplier, setMultiplier] = useState<number>(1.15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [empData, entData] = await Promise.all([getExternalEmployers(), getEntities()]);
      setEmployers(empData);
      setEntities(entData);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setError(message || "تعذر تحميل سجلات الجهات المشغلة");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (entityMode === "existing" && !selectedEntityId) {
      alert("يرجى اختيار الكيان الحالي");
      return;
    }

    if (entityMode === "auto" && !employerName.trim()) {
      alert("يرجى إدخال اسم الجهة المشغلة لإنشاء الكيان التلقائي");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        contract_reference: contractRef.trim() || undefined,
        billing_rate_multiplier: multiplier,
        ...(entityMode === "existing"
          ? { entity_id: selectedEntityId }
          : { name: employerName.trim(), entity_type: entityType, tax_number: taxNumber.trim() || undefined }),
      };

      const newEmployer = await createExternalEmployer(payload);

      setEmployers((prev) => [newEmployer, ...prev]);
      setIsModalOpen(false);
      setEmployerName("");
      setTaxNumber("");
      setSelectedEntityId("");
      setContractRef("");
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : null;
      alert(message || "خطأ أثناء إضافة الجهة المشغلة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSplitEntity = async (emp: ExternalEmployer) => {
    const newName = prompt(`فصل الجهة المشغلة (${emp.entity?.name}) في كيان مستقل.\nأدخل الاسم الجديد للكيان (أو اتركه فارغاً للاحتفاظ بالاسم الحالي):`, emp.entity?.name || "");
    if (newName === null) return;

    try {
      await splitExternalEmployerEntity(emp.id, { new_name: newName.trim() || undefined });
      alert("تم فصل الجهة المشغلة في كيان جديد بنجاح");
      fetchData();
    } catch (err: unknown) {
      const message = isAxiosError(err) ? err.response?.data?.message : null;
      alert(message || "حدث خطأ أثناء فصل الكيان");
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">الجهات المشغلة والشركات الموردة للعمالة</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            إدارة عقود ومحاسبة شركات تعاقد العمالة والجهات الخارجية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة جهة مشغلة
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
          {error}
        </div>
      ) : employers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <Building className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا توجد جهات مشغلة مسجلة</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإضافة شركة أو مكتب تعاقد عمالة خارجية
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم الجهة المشغلة</th>
                <th className="px-4 py-3 text-start font-bold">رقم مرجع العقد</th>
                <th className="px-4 py-3 text-start font-bold">معامل احتساب تكلفة العمالة</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {employers.map((emp) => (
                <tr key={emp.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    {emp.entity?.name || "جهة مشغلة"}
                  </td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-app-accent" />
                      <span>{emp.contract_reference || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <Percent className="h-3.5 w-3.5" />
                      <span>{emp.billing_rate_multiplier}x (تكلفة إضافية)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => handleSplitEntity(emp)}
                      title="فصل الكيان إلى كيان جديد مستقل"
                      className="inline-flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-semibold text-app-label-primary hover:bg-app-fill-f1"
                    >
                      <Scissors className="h-3 w-3 text-app-accent" />
                      <span>فصل الكيان</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add External Employer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-4">إضافة جهة مشغلة للعمالة</h3>
            <form onSubmit={handleAddEmployer} className="space-y-4">
              {/* Entity Selection Mode Toggle */}
              <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
                <label className="block text-xs font-bold text-app-label-primary">
                  الكيان المرتبط بالجهة المشغلة
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold text-app-label-primary">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="entityMode"
                      checked={entityMode === "auto"}
                      onChange={() => setEntityMode("auto")}
                      className="text-app-accent"
                    />
                    <span>إنشاء كيان جديد تلقائياً</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="entityMode"
                      checked={entityMode === "existing"}
                      onChange={() => setEntityMode("existing")}
                      className="text-app-accent"
                    />
                    <span>اختيار كيان حالي</span>
                  </label>
                </div>

                {entityMode === "auto" ? (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                        اسم الشركة / مكتب التعاقد <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={employerName}
                        onChange={(e) => setEmployerName(e.target.value)}
                        placeholder="مثال: شركة النجم لخدمات التوظيف"
                        className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                          نوع الكيان
                        </label>
                        <select
                          value={entityType}
                          onChange={(e) => setEntityType(e.target.value as EntityType)}
                          className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                        >
                          <option value="organization">شركة / مؤسسة</option>
                          <option value="individual">فرد / مكاتب شخصية</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                          الرقم الضريبي (اختياري)
                        </label>
                        <input
                          type="text"
                          value={taxNumber}
                          onChange={(e) => setTaxNumber(e.target.value)}
                          placeholder="مثال: TAX-700600"
                          className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <select
                      required
                      value={selectedEntityId}
                      onChange={(e) => setSelectedEntityId(e.target.value)}
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                    >
                      <option value="">-- اختر كيان شركة / مكتب عمالة --</option>
                      {entities.map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.name} ({ent.entity_type === "organization" ? "شركة" : "فرد"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    رقم مرجع الاتفاقية / العقد
                  </label>
                  <input
                    type="text"
                    value={contractRef}
                    onChange={(e) => setContractRef(e.target.value)}
                    placeholder="AGENCY-2026-001"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    معامل تسعير التكلفة (Billing Multiplier)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.00"
                    max="10.00"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Number(e.target.value))}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
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
                  disabled={
                    isSubmitting ||
                    (entityMode === "existing" && !selectedEntityId) ||
                    (entityMode === "auto" && !employerName.trim())
                  }
                  className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ الجهة المشغلة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalEmployersPage;
