import React, { useState } from "react";
import { Users, Plus, RefreshCw, CreditCard } from "lucide-react";
import { isAxiosError } from "axios";
import { EntityType } from "../../types/entities";
import { useClients, useCreateClient } from "../../hooks/useClients";
import { useEntities, useOperatingUnits } from "../../hooks/usePartners";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Modal } from "../../components/ui/Modal";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

export const ClientsPage: React.FC = () => {
  const { allowManualEntitySelection } = useServerConfigStore();
  const [selectedOperatingUnitId, setSelectedOperatingUnitId] = useState("");

  const {
    data: clients = [],
    isLoading,
    error: queryError,
    refetch,
  } = useClients();
  const { data: entities = [] } = useEntities();
  const { data: operatingUnits = [] } = useOperatingUnits();
  const createClientMutation = useCreateClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [clientName, setClientName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(10000);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);

  const resetForm = () => {
    setClientName("");
    setTaxNumber("");
    setSelectedEntityId("");
    setCreditLimit(10000);
    setPaymentTermsDays(30);
    setEntityMode("auto");
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedOperatingUnitId || operatingUnits[0]?.id;

    if (entityMode === "existing" && !selectedEntityId) {
      toast.error("يرجى اختيار الكيان الحالي");
      return;
    }

    if (entityMode === "auto" && !clientName.trim()) {
      toast.error("يرجى إدخال اسم العميل/الشركة لإنشاء الكيان التلقائي");
      return;
    }

    if (!unitId) {
      toast.error("يرجى اختيار الوحدة التشغيلية");
      return;
    }

    const payload = {
      operating_unit_id: unitId,
      entity_id: entityMode === "existing" ? selectedEntityId : undefined,
      name: entityMode === "auto" ? clientName.trim() : undefined,
      entity_type: entityMode === "auto" ? entityType : undefined,
      tax_number: entityMode === "auto" && taxNumber.trim() ? taxNumber.trim() : undefined,
      credit_limit: creditLimit,
      payment_terms_days: paymentTermsDays,
    };

    createClientMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تمت إضافة العميل بنجاح");
        setIsModalOpen(false);
        resetForm();
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "تعذر إضافة العميل");
      },
    });
  };

  const totalCreditExposure = clients.reduce((acc, c) => acc + Number(c.credit_limit || 0), 0);
  const totalOutstandingBalance = clients.reduce((acc, c) => acc + Number(c.current_balance || 0), 0);
  const totalActiveClients = clients.filter((c) => c.status === "active").length;

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل سجلات العملاء"
    : null;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">إدارة العملاء والآجل</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            متابعة سقف الائتمان، شروط السداد، ومحفظة عملاء الكيانات بالوحدة التشغيلية
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
            إضافة عميل
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">إجمالي سقف الائتمان</span>
            <CreditCard className="h-4 w-4 text-app-accent" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-label-primary">
            {formatNumber(totalCreditExposure)} <span className="text-xs font-normal">د.ل</span>
          </p>
        </div>
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">إجمالي المديونية المستحقة</span>
            <Users className="h-4 w-4 text-app-status-danger" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-status-danger">
            {formatNumber(totalOutstandingBalance)} <span className="text-xs font-normal">د.ل</span>
          </p>
        </div>
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">العملاء النشطون</span>
            <Users className="h-4 w-4 text-app-status-positive" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-label-primary">
            {totalActiveClients} <span className="text-xs font-normal">عميل</span>
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
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <Users className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا يوجد عملاء مضافون</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإضافة عميل جديد لربطه بسقف ائتماني وشروط سداد
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم العميل / الكيان</th>
                <th className="px-4 py-3 text-start font-bold">الحد الائتماني (LYD)</th>
                <th className="px-4 py-3 text-start font-bold">الرصيد المستحق (LYD)</th>
                <th className="px-4 py-3 text-start font-bold">المتبقي من الائتمان</th>
                <th className="px-4 py-3 text-start font-bold">فترة السداد الآجل</th>
                <th className="px-4 py-3 text-start font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {clients.map((client) => {
                const creditLimit = Number(client.credit_limit || 0);
                const currentBalance = Number(client.current_balance || 0);
                const headroom = creditLimit - currentBalance;
                const isOverLimit = currentBalance > creditLimit;
                const isNearLimit = !isOverLimit && headroom <= creditLimit * 0.15;

                return (
                  <tr key={client.id} className="hover:bg-app-bg-secondary/50">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex flex-col">
                        <span className="text-app-label-primary font-bold">
                          {client.entity?.name || "بدون اسم"}
                        </span>
                        <span className="text-[10px] text-app-label-secondary">
                          {client.entity?.tax_number ? `ضريبي: ${client.entity.tax_number}` : "بدون رقم ضريبي"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatNumber(creditLimit)} د.ل
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={currentBalance > 0 ? (isOverLimit ? "text-app-status-danger" : "text-app-label-primary") : "text-app-label-secondary"}>
                        {formatNumber(currentBalance)} د.ل
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {isOverLimit ? (
                        <span className="inline-flex items-center rounded-full bg-app-status-danger/15 px-2 py-0.5 text-[10px] font-bold text-app-status-danger">
                          تجاوز {formatNumber(Math.abs(headroom))} د.ل
                        </span>
                      ) : isNearLimit ? (
                        <span className="inline-flex items-center rounded-full bg-app-status-warning/15 px-2 py-0.5 text-[10px] font-bold text-app-status-warning">
                          {formatNumber(headroom)} د.ل (متبقي)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-app-status-positive/15 px-2 py-0.5 text-[10px] font-bold text-app-status-positive">
                          {formatNumber(headroom)} د.ل (متبقي)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-app-label-secondary">
                      {client.payment_terms_days} يوم
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        client.status === "active"
                          ? "bg-app-status-positive/15 text-app-status-positive"
                          : client.status === "suspended"
                          ? "bg-app-status-warning/15 text-app-status-warning"
                          : "bg-app-status-danger/15 text-app-status-danger"
                      }`}>
                        {client.status === "active" ? "نشط" : client.status === "suspended" ? "موقوف" : client.status === "blacklisted" ? "محظور" : client.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة عميل جديد"
        size="lg"
      >
        <form onSubmit={handleAddClient} className="space-y-4" dir="rtl">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              الوحدة التشغيلية <span className="text-app-status-danger">*</span>
            </label>
            <SearchableSelect<{ id: string; name: string }>
              options={operatingUnits}
              value={
                operatingUnits.find((u) => u.id === selectedOperatingUnitId) ??
                null
              }
              onChange={(u) => setSelectedOperatingUnitId(u ? u.id : "")}
              getOptionId={(u) => u.id}
              getOptionLabel={(u) => u.name}
              placeholder="-- اختر الوحدة التشغيلية --"
              required
            />
          </div>

          {allowManualEntitySelection ? (
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
              <label className="block text-xs font-bold text-app-label-primary">
                الكيان المرتبط بالعميل
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
                      اسم العميل / الشركة <span className="text-app-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="مثال: شركة الصحراء للمقاولات"
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
                        <option value="individual">فرد</option>
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
                        placeholder="مثال: TAX-900800"
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
                  اسم العميل / الشركة <span className="text-app-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="مثال: شركة الصحراء للمقاولات"
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
                    <option value="individual">فرد</option>
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
                    placeholder="مثال: TAX-900800"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                الحد الائتماني المسموح (LYD)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                فترة السداد الآجل (أيام)
              </label>
              <input
                type="number"
                min="0"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
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
                createClientMutation.isPending ||
                (entityMode === "existing" && !selectedEntityId) ||
                (entityMode === "auto" && !clientName.trim())
              }
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createClientMutation.isPending ? "جاري الحفظ..." : "حفظ العميل"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
