import React, { useMemo, useState } from "react";
import { Truck, Plus, RefreshCw, Building } from "lucide-react";
import { isAxiosError } from "axios";
import { CreateSupplierPayload } from "../../types/procurement";
import { useSuppliers, useCreateSupplier } from "../../hooks/useProcurement";
import { useOperatingUnits } from "../../hooks/usePartners";
import { useReferenceLookups } from "../../hooks/useReferenceLookups";
import type { LookupEntry } from "../../config/referenceLookups";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useSuppliersColumns } from "../../components/table-columns/suppliersColumns";
import { CoaAccountSelector } from "../../components/accounting/CoaAccountSelector";
import type { CoaAction, NewCoaAccountPayload } from "../../types/entities";

export const SuppliersPage: React.FC = () => {
  const { data: suppliers = [], isLoading, error: queryError, refetch } = useSuppliers();
  const { data: operatingUnits = [] } = useOperatingUnits();
  const { data: currencies = [] } = useReferenceLookups("currencies", { isActive: true });
  const { data: cities = [] } = useReferenceLookups("cities", { isActive: true });
  const createSupplierMutation = useCreateSupplier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [coaAction, setCoaAction] = useState<CoaAction>("create_new");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<NewCoaAccountPayload>({
    parent_account_id: "",
    account_code: "",
    name: "",
    currency: "USD",
  });

  const resetForm = () => {
    setName("");
    setContact("");
    setCity("");
    setAddress("");
    setDefaultCurrency("USD");
    setCoaAction("create_new");
    setSelectedAccountId(null);
    setNewAccount({
      parent_account_id: "",
      account_code: "",
      name: "",
      currency: "USD",
    });
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedUnitId || operatingUnits[0]?.id;
    if (!name.trim() || !unitId) {
      toast.error("يرجى تعبئة اسم المورد والوحدة التشغيلية");
      return;
    }

    if (coaAction === "create_new") {
      if (!newAccount.parent_account_id) {
        toast.error("يرجى اختيار الحساب الأب لإنشاء حساب في دليل الحسابات");
        return;
      }
      if (!newAccount.account_code.trim()) {
        toast.error("يرجى إدخال رمز الحساب الفرعي");
        return;
      }
      if (!newAccount.name.trim()) {
        toast.error("يرجى إدخال اسم الحساب المالي");
        return;
      }
    }

    if (coaAction === "link_existing" && !selectedAccountId) {
      toast.error("يرجى اختيار الحساب المراد ربطه من دليل الحسابات");
      return;
    }

    const fullAddress = [city, address].filter(Boolean).join(" - ");

    const payload: CreateSupplierPayload = {
      operating_unit_id: unitId,
      name: name.trim(),
      contact: contact.trim() || undefined,
      default_currency: defaultCurrency,
      address: fullAddress || undefined,
      coa_action: coaAction,
      account_id: coaAction === "link_existing" ? selectedAccountId : undefined,
      new_account:
        coaAction === "create_new"
          ? {
              parent_account_id: newAccount.parent_account_id,
              account_code: newAccount.account_code.trim(),
              name: newAccount.name.trim(),
              currency: newAccount.currency || defaultCurrency,
            }
          : undefined,
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

  const columns = useSuppliersColumns();
  const tableData = useMemo(() => suppliers, [suppliers]);
  const suppliersTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (sup) => sup.id,
  });

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
      {errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : (
        <DataTable table={suppliersTable}>
          <DataTable.Header>
            <DataTable.Toolbar>
              <DataTable.SearchInput placeholder="بحث بالاسم أو العملة أو الاتصال..." />
            </DataTable.Toolbar>
          </DataTable.Header>
          <DataTable.Content
            isLoading={isLoading}
            emptyMessage="لا يوجد موردون مسجلون — قم بإنشاء سجل للموردين للبدء في إصدار أوامر الاستيراد"
            emptyIcon={Building}
          />
          <DataTable.Pagination />
        </DataTable>
      )}

      {/* Add Supplier Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>إضافة مورد خارجي جديد</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
        <form id="supplier-create-form" onSubmit={handleCreateSupplier} className="space-y-4" dir="rtl">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              الوحدة التشغيلية <span className="text-app-status-danger">*</span>
            </label>
            <SearchableSelect<{ id: string; name: string }>
              options={operatingUnits}
              value={
                operatingUnits.find((u) => u.id === selectedUnitId) ?? null
              }
              onChange={(u) => setSelectedUnitId(u ? u.id : "")}
              getOptionId={(u) => u.id}
              getOptionLabel={(u) => u.name}
              placeholder="-- اختر الوحدة --"
              required
            />
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
              <SearchableSelect<LookupEntry>
                options={currencies}
                value={currencies.find((c) => c.code === defaultCurrency) ?? null}
                onChange={(c) => setDefaultCurrency(c ? c.code : "USD")}
                getOptionId={(c) => c.id}
                getOptionLabel={(c) => `${c.name} (${c.code})`}
                getOptionSubLabel={(c) => c.fields?.symbol}
                placeholder="-- اختر العملة --"
              />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                المدينة / المركز المحلي (اختياري)
              </label>
              <SearchableSelect<LookupEntry>
                options={cities}
                value={cities.find((c) => c.name === city) ?? null}
                onChange={(c) => setCity(c ? c.name : "")}
                getOptionId={(c) => c.id}
                getOptionLabel={(c) => c.name}
                getOptionSubLabel={(c) => c.code}
                placeholder="-- اختر المدينة --"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                العنوان التفصيلي / الدولة والميناء
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: إسطنبول، تركيا - ميناء أمبارلي"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Chart of Accounts Linkage */}
          <CoaAccountSelector
            entityTypeLabel="المورد"
            defaultEntityName={name.trim()}
            currency={defaultCurrency}
            action={coaAction}
            onActionChange={setCoaAction}
            selectedAccountId={selectedAccountId}
            onSelectedAccountIdChange={setSelectedAccountId}
            newAccount={newAccount}
            onNewAccountChange={setNewAccount}
            preferredParentCode="21"
          />

        </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="supplier-create-form"
              disabled={createSupplierMutation.isPending || !name.trim()}
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createSupplierMutation.isPending ? "جاري الحفظ..." : "حفظ المورد"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersPage;
