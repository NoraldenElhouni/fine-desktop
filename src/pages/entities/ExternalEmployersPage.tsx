import React, { useState } from "react";
import { Building, Plus, RefreshCw, FileText, Percent, Scissors } from "lucide-react";
import { isAxiosError } from "axios";
import { ExternalEmployer, EntityType } from "../../types/entities";
import {
  useExternalEmployers,
  useEntities,
  useCreateExternalEmployer,
  useSplitExternalEmployerEntity,
} from "../../hooks/usePartners";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Modal } from "../../components/ui/Modal";

export const ExternalEmployersPage: React.FC = () => {
  const { allowManualEntitySelection } = useServerConfigStore();

  // TanStack Query Hooks
  const {
    data: employers = [],
    isLoading,
    error: queryError,
    refetch,
  } = useExternalEmployers();
  const { data: entities = [] } = useEntities();
  const createEmployerMutation = useCreateExternalEmployer();
  const splitEmployerMutation = useSplitExternalEmployerEntity();

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [employerName, setEmployerName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [contractRef, setContractRef] = useState("");
  const [multiplier, setMultiplier] = useState<number>(1.15);

  // Split Modal
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitTargetEmployer, setSplitTargetEmployer] = useState<ExternalEmployer | null>(null);
  const [splitNewName, setSplitNewName] = useState("");

  const resetForm = () => {
    setEmployerName("");
    setTaxNumber("");
    setSelectedEntityId("");
    setContractRef("");
    setMultiplier(1.15);
    setEntityMode("auto");
  };

  const handleAddEmployer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (entityMode === "existing" && !selectedEntityId) {
      toast.error("يرجى اختيار الكيان الحالي");
      return;
    }

    if (entityMode === "auto" && !employerName.trim()) {
      toast.error("يرجى إدخال اسم الجهة المشغلة لإنشاء الكيان التلقائي");
      return;
    }

    const payload = {
      contract_reference: contractRef.trim() || undefined,
      billing_rate_multiplier: multiplier,
      ...(entityMode === "existing"
        ? { entity_id: selectedEntityId }
        : { name: employerName.trim(), entity_type: entityType, tax_number: taxNumber.trim() || undefined }),
    };

    createEmployerMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تمت إضافة الجهة المشغلة بنجاح");
        setIsModalOpen(false);
        resetForm();
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "خطأ أثناء إضافة الجهة المشغلة");
      },
    });
  };

  const openSplitModal = (emp: ExternalEmployer) => {
    setSplitTargetEmployer(emp);
    setSplitNewName(emp.entity?.name || "");
    setIsSplitModalOpen(true);
  };

  const handleConfirmSplit = () => {
    if (!splitTargetEmployer) return;

    splitEmployerMutation.mutate(
      {
        id: splitTargetEmployer.id,
        payload: { new_name: splitNewName.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success("تم فصل الجهة المشغلة في كيان جديد بنجاح");
          setIsSplitModalOpen(false);
          setSplitTargetEmployer(null);
        },
        onError: (err: unknown) => {
          const payloadErr = apiErrorPayload(err);
          const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
          toast.error(message || "حدث خطأ أثناء فصل الكيان");
        },
      }
    );
  };

  const totalEmployeesUnderContract = employers.reduce(
    (acc, emp) => acc + ((emp as unknown as { employees_count?: number }).employees_count || 0),
    0
  );

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل سجلات الجهات المشغلة"
    : null;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">إدارة الجهات المشغلة (وكالات العمالة)</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            متابعة الشركات الوسيطة الموردة للعمالة، عقود التشغيل، ونسب ومضاعفات الفوترة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">إجمالي الجهات المشغلة</span>
            <Building className="h-4 w-4 text-app-accent" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-label-primary">
            {employers.length} <span className="text-xs font-normal">جهة</span>
          </p>
        </div>
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">العمالة الموردة المرتبطة</span>
            <FileText className="h-4 w-4 text-app-status-positive" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-label-primary">
            {totalEmployeesUnderContract} <span className="text-xs font-normal">عامل</span>
          </p>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : employers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <Building className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا توجد جهات مشغلة مضافة</p>
          <p className="text-xs text-app-label-secondary mt-1">
            أضف الشركات الوسيطة التي تقوم بتوريد العمالة لحساب تكاليف التشغيل
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم الشركة / الجهة</th>
                <th className="px-4 py-3 text-start font-bold">مرجع العقد (Contract Ref)</th>
                <th className="px-4 py-3 text-start font-bold">مضاعف الفوترة (Multiplier)</th>
                <th className="px-4 py-3 text-start font-bold">عدد العمالة التابعة</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {employers.map((emp) => (
                <tr key={emp.id} className="hover:bg-app-bg-secondary/50">
                  <td className="px-4 py-3 font-semibold">
                    <div className="flex flex-col">
                      <span className="text-app-label-primary font-bold">
                        {emp.entity?.name || "بدون اسم"}
                      </span>
                      <span className="text-[10px] text-app-label-secondary">
                        {emp.entity?.tax_number ? `ضريبي: ${emp.entity.tax_number}` : "بدون رقم ضريبي"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-app-label-secondary">
                    {emp.contract_reference || "-"}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-app-label-primary">
                    <span className="inline-flex items-center gap-1 rounded bg-app-bg-secondary px-2 py-0.5">
                      <Percent className="h-3 w-3 text-app-accent" />
                      <span>{emp.billing_rate_multiplier}x</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-app-bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-app-label-primary">
                      {(emp as unknown as { employees_count?: number }).employees_count || 0} عامل
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => openSplitModal(emp)}
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة جهة مشغلة جديدة"
        size="lg"
      >
        <form onSubmit={handleAddEmployer} className="space-y-4" dir="rtl">
          {/* Entity Information (Auto-create or Select Existing) */}
          {allowManualEntitySelection ? (
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
              <label className="block text-xs font-bold text-app-label-primary">
                الكيان المرتبط بالجهة المشغلة
              </label>
              <div className="flex items-center gap-4 text-xs font-semibold text-app-label-primary">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="empEntityMode"
                    checked={entityMode === "auto"}
                    onChange={() => setEntityMode("auto")}
                    className="text-app-accent"
                  />
                  <span>إنشاء شركة جديدة تلقائياً</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="empEntityMode"
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
                      اسم الجهة المشغلة / الشركة <span className="text-app-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      placeholder="مثال: شركة النيزك للخدمات العمالية"
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
                        <option value="individual">فرد / مقاول</option>
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
                        placeholder="مثال: TAX-774411"
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
                    <option value="">-- اختر كيان --</option>
                    {entities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name} ({ent.entity_type === "organization" ? "شركة" : "فرد"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  اسم الجهة المشغلة / الشركة <span className="text-app-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="مثال: شركة النيزك للخدمات العمالية"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    نوع الكيان
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as EntityType)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  >
                    <option value="organization">شركة / مؤسسة</option>
                    <option value="individual">فرد / مقاول</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الرقم الضريبي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="مثال: TAX-774411"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                مرجع العقد (اختياري)
              </label>
              <input
                type="text"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                placeholder="مثال: CNT-2026-09"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                مضاعف الفوترة (Billing Rate Multiplier)
              </label>
              <input
                type="number"
                min="1"
                step="0.05"
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
                createEmployerMutation.isPending ||
                (entityMode === "existing" && !selectedEntityId) ||
                (entityMode === "auto" && !employerName.trim())
              }
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createEmployerMutation.isPending ? "جاري الحفظ..." : "حفظ الجهة المشغلة"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Split External Employer Entity Modal */}
      <Modal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        title="فصل الجهة المشغلة إلى كيان مستقل"
        size="md"
      >
        <div className="space-y-4" dir="rtl">
          <p className="text-xs text-app-label-secondary">
            فصل الجهة المشغلة ({splitTargetEmployer?.entity?.name}) في كيان جديد مستقل.
          </p>
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              الاسم الجديد للكيان (أو اتركه فارغاً للاحتفاظ بالاسم الحالي)
            </label>
            <input
              type="text"
              value={splitNewName}
              onChange={(e) => setSplitNewName(e.target.value)}
              placeholder="اسم الكيان الجديد"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
            <button
              type="button"
              onClick={() => setIsSplitModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={splitEmployerMutation.isPending}
              onClick={handleConfirmSplit}
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {splitEmployerMutation.isPending ? "جاري الفصل..." : "تأكيد الفصل"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExternalEmployersPage;
