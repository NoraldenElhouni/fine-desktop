import React, { useMemo, useState } from "react";
import { Users, Plus, RefreshCw, CreditCard } from "lucide-react";
import { isAxiosError } from "axios";
import { EntityType } from "../../types/entities";
import { useClients, useCreateClient } from "../../hooks/useClients";
import { useEntities, useOperatingUnits } from "../../hooks/usePartners";
import { useReferenceLookups } from "../../hooks/useReferenceLookups";
import type { LookupEntry } from "../../config/referenceLookups";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../../components/ui/Dialog";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useClientsColumns } from "../../components/table-columns/clientsColumns";

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
  const { data: cities = [] } = useReferenceLookups("cities", { isActive: true });
  const createClientMutation = useCreateClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [clientName, setClientName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(10000);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);

  const resetForm = () => {
    setClientName("");
    setTaxNumber("");
    setClientCity("");
    setClientAddress("");
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
      tax_number:
        entityMode === "auto" && taxNumber.trim()
          ? taxNumber.trim()
          : undefined,
      credit_limit: creditLimit,
      payment_terms_days: paymentTermsDays,
      city: clientCity.trim() || undefined,
      address: clientAddress.trim() || undefined,
    };

    createClientMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تمت إضافة العميل بنجاح");
        setIsModalOpen(false);
        resetForm();
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message =
          payloadErr?.message ||
          (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "تعذر إضافة العميل");
      },
    });
  };

  const totalCreditExposure = clients.reduce(
    (acc, c) => acc + Number(c.credit_limit || 0),
    0,
  );
  const totalOutstandingBalance = clients.reduce(
    (acc, c) => acc + Number(c.current_balance || 0),
    0,
  );
  const totalActiveClients = clients.filter(
    (c) => c.status === "active",
  ).length;

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل سجلات العملاء"
    : null;

  const columns = useClientsColumns();

  const tableData = useMemo(() => clients, [clients]);
  const clientsTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (c) => c.id,
  });

  console.log("ClientsPage render", {
    clients,
    totalCreditExposure,
    totalOutstandingBalance,
    totalActiveClients,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">
            إدارة العملاء والآجل
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            متابعة سقف الائتمان، شروط السداد، ومحفظة عملاء الكيانات بالوحدة
            التشغيلية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
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
            <span className="text-xs font-semibold text-app-label-secondary">
              إجمالي سقف الائتمان
            </span>
            <CreditCard className="h-4 w-4 text-app-accent" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-label-primary">
            {formatNumber(totalCreditExposure)}{" "}
            <span className="text-xs font-normal">د.ل</span>
          </p>
        </div>
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">
              إجمالي المديونية المستحقة
            </span>
            <Users className="h-4 w-4 text-app-status-danger" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-status-danger">
            {formatNumber(totalOutstandingBalance)}{" "}
            <span className="text-xs font-normal">د.ل</span>
          </p>
        </div>
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-label-secondary">
              العملاء النشطون
            </span>
            <Users className="h-4 w-4 text-app-status-positive" />
          </div>
          <p className="mt-2 text-xl font-bold text-app-label-primary">
            {totalActiveClients}{" "}
            <span className="text-xs font-normal">عميل</span>
          </p>
        </div>
      </div>

      {/* Main Table */}
      {errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : (
        <DataTable table={clientsTable}>
          <DataTable.Header>
            <DataTable.Toolbar>
              <DataTable.SearchInput placeholder="بحث بالاسم..." />
            </DataTable.Toolbar>
          </DataTable.Header>
          <DataTable.Content
            isLoading={isLoading}
            emptyMessage="لا يوجد عملاء مضافون"
            emptyIcon={Users}
          />
          <DataTable.Pagination />
        </DataTable>
      )}

      {/* Add Client Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form
              id="client-create-form"
              onSubmit={handleAddClient}
              className="space-y-4"
              dir="rtl"
            >
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الوحدة التشغيلية{" "}
                  <span className="text-app-status-danger">*</span>
                </label>
                <SearchableSelect<{ id: string; name: string }>
                  options={operatingUnits}
                  value={
                    operatingUnits.find(
                      (u) => u.id === selectedOperatingUnitId,
                    ) ?? null
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
                          اسم العميل / الشركة{" "}
                          <span className="text-app-status-danger">*</span>
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
                            onChange={(e) =>
                              setEntityType(e.target.value as EntityType)
                            }
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
                      <label className="block text-xs font-semibold text-app-label-secondary mb-1">الكيان المرتبط</label>
                      <SearchableSelect<{
                        id: string;
                        name: string;
                        entity_type?: string;
                      }>
                        options={entities}
                        value={
                          entities.find((ent) => ent.id === selectedEntityId) ??
                          null
                        }
                        onChange={(ent) =>
                          setSelectedEntityId(ent ? ent.id : "")
                        }
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
                      اسم العميل / الشركة{" "}
                      <span className="text-app-status-danger">*</span>
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
                        onChange={(e) =>
                          setEntityType(e.target.value as EntityType)
                        }
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
                    المدينة
                  </label>
                  <SearchableSelect<LookupEntry>
                    options={cities}
                    value={cities.find((c) => c.name === clientCity) ?? null}
                    onChange={(c) => setClientCity(c ? c.name : "")}
                    getOptionId={(c) => c.id}
                    getOptionLabel={(c) => c.name}
                    getOptionSubLabel={(c) => c.code}
                    placeholder="-- اختر المدينة --"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    العنوان التفصيلي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="مثال: طريق المطار، المنطقة الصناعية"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>

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
                    onChange={(e) =>
                      setPaymentTermsDays(Number(e.target.value))
                    }
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
              form="client-create-form"
              disabled={
                createClientMutation.isPending ||
                (entityMode === "existing" && !selectedEntityId) ||
                (entityMode === "auto" && !clientName.trim())
              }
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createClientMutation.isPending ? "جاري الحفظ..." : "حفظ العميل"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
