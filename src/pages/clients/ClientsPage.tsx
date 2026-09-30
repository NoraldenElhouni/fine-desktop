import React, { useMemo, useState } from "react";
import { Users, Plus, RefreshCw, CreditCard } from "lucide-react";
import { isAxiosError } from "axios";
import { EntityType, Client, ClientStatus } from "../../types/entities";
import { useClients, useCreateClient, useUpdateClient } from "../../hooks/useClients";
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
import { CoaAccountSelector } from "../../components/accounting/CoaAccountSelector";
import type { CoaAction, NewCoaAccountPayload } from "../../types/entities";

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
  const [clientPhone, setClientPhone] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(10000);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [coaAction, setCoaAction] = useState<CoaAction>("create_new");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<NewCoaAccountPayload>({
    parent_account_id: "",
    account_code: "",
    name: "",
    currency: "LYD",
  });

  // Edit Client States
  const updateClientMutation = useUpdateClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editOperatingUnitId, setEditOperatingUnitId] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const [editEntityType, setEditEntityType] = useState<EntityType>("organization");
  const [editTaxNumber, setEditTaxNumber] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCreditLimit, setEditCreditLimit] = useState<number>(10000);
  const [editPaymentTermsDays, setEditPaymentTermsDays] = useState<number>(30);
  const [editStatus, setEditStatus] = useState<ClientStatus>("active");
  const [editCoaAction, setEditCoaAction] = useState<CoaAction>("none");
  const [editSelectedAccountId, setEditSelectedAccountId] = useState<string | null>(null);
  const [editNewAccount, setEditNewAccount] = useState<NewCoaAccountPayload>({
    parent_account_id: "",
    account_code: "",
    name: "",
    currency: "LYD",
  });

  const resetForm = () => {
    setClientName("");
    setTaxNumber("");
    setClientPhone("");
    setClientCity("");
    setClientAddress("");
    setSelectedEntityId("");
    setCreditLimit(10000);
    setPaymentTermsDays(30);
    setEntityMode("auto");
    setCoaAction("create_new");
    setSelectedAccountId(null);
    setNewAccount({
      parent_account_id: "",
      account_code: "",
      name: "",
      currency: "LYD",
    });
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
      phone: clientPhone.trim() || undefined,
      city: clientCity.trim() || undefined,
      address: clientAddress.trim() || undefined,
      coa_action: coaAction,
      account_id: coaAction === "link_existing" ? selectedAccountId : undefined,
      new_account:
        coaAction === "create_new"
          ? {
              parent_account_id: newAccount.parent_account_id,
              account_code: newAccount.account_code.trim(),
              name: newAccount.name.trim(),
              currency: newAccount.currency || "LYD",
            }
          : undefined,
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

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setEditOperatingUnitId(client.operating_unit_id);
    setEditClientName(client.entity?.name || "");
    setEditEntityType((client.entity?.entity_type as EntityType) || "organization");
    setEditTaxNumber(client.entity?.tax_number || "");
    setEditPhone(client.entity?.phone || client.entity?.primary_contact?.phone || "");
    setEditCity(client.entity?.city || client.entity?.primary_contact?.city || "");
    setEditAddress(client.entity?.address || client.entity?.primary_contact?.address || "");
    setEditCreditLimit(Number(client.credit_limit || 0));
    setEditPaymentTermsDays(client.payment_terms_days ?? 30);
    setEditStatus(client.status || "active");
    setEditCoaAction(client.account_id ? "link_existing" : "none");
    setEditSelectedAccountId(client.account_id || null);
    setEditNewAccount({
      parent_account_id: "",
      account_code: "",
      name: "",
      currency: "LYD",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!editClientName.trim()) {
      toast.error("يرجى إدخال اسم العميل/الشركة");
      return;
    }

    if (editCoaAction === "create_new") {
      if (!editNewAccount.parent_account_id) {
        toast.error("يرجى اختيار الحساب الأب لإنشاء حساب في دليل الحسابات");
        return;
      }
      if (!editNewAccount.account_code.trim()) {
        toast.error("يرجى إدخال رمز الحساب الفرعي");
        return;
      }
      if (!editNewAccount.name.trim()) {
        toast.error("يرجى إدخال اسم الحساب المالي");
        return;
      }
    }

    if (editCoaAction === "link_existing" && !editSelectedAccountId) {
      toast.error("يرجى اختيار الحساب المراد ربطه من دليل الحسابات");
      return;
    }

    const payload = {
      record_version: editingClient.record_version ?? 1,
      operating_unit_id: editOperatingUnitId || editingClient.operating_unit_id,
      name: editClientName.trim(),
      entity_type: editEntityType,
      tax_number: editTaxNumber.trim() || undefined,
      phone: editPhone.trim() || undefined,
      city: editCity.trim() || undefined,
      address: editAddress.trim() || undefined,
      credit_limit: editCreditLimit,
      payment_terms_days: editPaymentTermsDays,
      status: editStatus,
      coa_action: editCoaAction,
      account_id: editCoaAction === "link_existing" ? editSelectedAccountId : (editCoaAction === "none" ? null : undefined),
      new_account:
        editCoaAction === "create_new"
          ? {
              parent_account_id: editNewAccount.parent_account_id,
              account_code: editNewAccount.account_code.trim(),
              name: editNewAccount.name.trim(),
              currency: editNewAccount.currency || "LYD",
            }
          : undefined,
    };

    updateClientMutation.mutate(
      { id: editingClient.id, payload },
      {
        onSuccess: () => {
          toast.success("تم تحديث بيانات العميل بنجاح");
          setIsEditModalOpen(false);
          setEditingClient(null);
        },
        onError: (err: unknown) => {
          const payloadErr = apiErrorPayload(err);
          const message =
            payloadErr?.message ||
            (isAxiosError(err) ? err.response?.data?.message : null);
          toast.error(message || "تعذر تحديث بيانات العميل");
        },
      }
    );
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

  const columns = useClientsColumns({ onEdit: handleOpenEditModal });

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
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="مثال: 0912345678"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                    dir="ltr"
                  />
                </div>
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

              {/* Chart of Accounts Linkage */}
              <CoaAccountSelector
                entityTypeLabel="العميل"
                defaultEntityName={clientName.trim()}
                action={coaAction}
                onActionChange={setCoaAction}
                selectedAccountId={selectedAccountId}
                onSelectedAccountIdChange={setSelectedAccountId}
                newAccount={newAccount}
                onNewAccountChange={setNewAccount}
                preferredParentCode="13"
                useEntityNameDirectly
              />
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

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل والكيان</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form
              id="client-edit-form"
              onSubmit={handleUpdateClient}
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
                      (u) => u.id === editOperatingUnitId,
                    ) ?? null
                  }
                  onChange={(u) => setEditOperatingUnitId(u ? u.id : "")}
                  getOptionId={(u) => u.id}
                  getOptionLabel={(u) => u.name}
                  placeholder="-- اختر الوحدة التشغيلية --"
                  required
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    اسم العميل / الشركة{" "}
                    <span className="text-app-status-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
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
                      value={editEntityType}
                      onChange={(e) =>
                        setEditEntityType(e.target.value as EntityType)
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
                      value={editTaxNumber}
                      onChange={(e) => setEditTaxNumber(e.target.value)}
                      placeholder="مثال: TAX-900800"
                      className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="مثال: 0912345678"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    المدينة
                  </label>
                  <SearchableSelect<LookupEntry>
                    options={cities}
                    value={cities.find((c) => c.name === editCity) ?? null}
                    onChange={(c) => setEditCity(c ? c.name : "")}
                    getOptionId={(c) => c.id}
                    getOptionLabel={(c) => c.name}
                    getOptionSubLabel={(c) => c.code}
                    placeholder="-- اختر المدينة --"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  العنوان التفصيلي (اختياري)
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="مثال: طريق المطار، المنطقة الصناعية"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الحد الائتماني المسموح (LYD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={editCreditLimit}
                    onChange={(e) => setEditCreditLimit(Number(e.target.value))}
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
                    value={editPaymentTermsDays}
                    onChange={(e) =>
                      setEditPaymentTermsDays(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الحالة
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as ClientStatus)
                    }
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  >
                    <option value="active">نشط</option>
                    <option value="suspended">موقوف</option>
                    <option value="blacklisted">محظور</option>
                  </select>
                </div>
              </div>

              {/* Chart of Accounts Linkage */}
              <CoaAccountSelector
                entityTypeLabel="العميل"
                defaultEntityName={editClientName.trim()}
                action={editCoaAction}
                onActionChange={setEditCoaAction}
                selectedAccountId={editSelectedAccountId}
                onSelectedAccountIdChange={setEditSelectedAccountId}
                newAccount={editNewAccount}
                onNewAccountChange={setEditNewAccount}
                preferredParentCode="13"
                useEntityNameDirectly
              />
            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingClient(null);
              }}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="client-edit-form"
              disabled={
                updateClientMutation.isPending || !editClientName.trim()
              }
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {updateClientMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
