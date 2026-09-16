import React, { useMemo, useState } from "react";
import { Building, Plus, RefreshCw, FileText } from "lucide-react";
import { isAxiosError } from "axios";
import { EntityType } from "../../types/entities";
import {
  useExternalEmployers,
  useEntities,
  useCreateExternalEmployer,
  useOperatingUnits,
} from "../../hooks/usePartners";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useExternalEmployersColumns } from "../../components/table-columns/externalEmployersColumns";

export const ExternalEmployersPage: React.FC = () => {
  const { allowManualEntitySelection } = useServerConfigStore();

  const {
    data: employers = [],
    isLoading,
    error: queryError,
    refetch,
  } = useExternalEmployers();
  const { data: entities = [] } = useEntities();
  const { data: operatingUnits = [] } = useOperatingUnits();
  const createEmployerMutation = useCreateExternalEmployer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [employerName, setEmployerName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [contractRef, setContractRef] = useState("");
  const [multiplier, setMultiplier] = useState<number>(1.15);

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
      operating_unit_id: operatingUnits[0]?.id ?? "",
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

  const totalEmployeesUnderContract = employers.reduce(
    (acc, emp) => acc + ((emp as unknown as { employees_count?: number }).employees_count || 0),
    0
  );

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل سجلات الجهات المشغلة"
    : null;

  const columns = useExternalEmployersColumns();

  const tableData = useMemo(() => employers, [employers]);
  const employersTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (emp) => emp.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
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

      {errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : (
        <DataTable table={employersTable}>
          <DataTable.Header>
            <DataTable.Toolbar>
              <DataTable.SearchInput placeholder="بحث بالاسم أو مرجع العقد..." />
            </DataTable.Toolbar>
          </DataTable.Header>
          <DataTable.Content
            isLoading={isLoading}
            emptyMessage="لا توجد جهات مشغلة مضافة"
            emptyIcon={Building}
          />
          <DataTable.Pagination />
        </DataTable>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>إضافة جهة مشغلة جديدة</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
        <form id="employer-create-form" onSubmit={handleAddEmployer} className="space-y-4" dir="rtl">
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
                  <SearchableSelect<{ id: string; name: string; entity_type?: string }>
                    options={entities}
                    value={
                      entities.find((ent) => ent.id === selectedEntityId) ??
                      null
                    }
                    onChange={(ent) => setSelectedEntityId(ent ? ent.id : "")}
                    getOptionId={(ent) => ent.id}
                    getOptionLabel={(ent) => ent.name}
                    getOptionSubLabel={(ent) =>
                      ent.entity_type === "organization" ? "شركة" : "فرد"
                    }
                    placeholder="-- اختر كيان --"
                    required
                  />
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

        </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="employer-create-form"
              disabled={
                createEmployerMutation.isPending ||
                (entityMode === "existing" && !selectedEntityId) ||
                (entityMode === "auto" && !employerName.trim())
              }
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createEmployerMutation.isPending ? "جاري الحفظ..." : "حفظ الجهة المشغلة"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalEmployersPage;
