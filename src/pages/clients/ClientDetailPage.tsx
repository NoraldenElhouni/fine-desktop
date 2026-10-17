import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, FileSpreadsheet, ShoppingCart, User } from "lucide-react";
import { useClient } from "../../hooks/useClients";
import { useSales } from "../../hooks/useSales";
import { Sale } from "../../api/endpoints/sales";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useSalesColumns } from "../../components/table-columns/salesColumns";
import type { ClientStatus, EntityType } from "../../types/entities";

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: "نشط",
  suspended: "موقوف",
  blacklisted: "قائمة سوداء",
};

const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  individual: "فرد",
  organization: "مؤسسة",
};

const money = (v: string | number | null | undefined) => Number(v ?? 0).toLocaleString();

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[11px] font-semibold text-app-label-secondary">{label}</div>
    <div className="text-sm text-app-label-primary mt-0.5">{children}</div>
  </div>
);

/** One client: master data, balance against credit limit, and every sale made to them. */
export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: client, isLoading, isError } = useClient(id);
  const { data: salesPage, isLoading: salesLoading } = useSales({ client_id: id, page, per_page: 20 });

  const columns = useSalesColumns({ onOpen: (sale: Sale) => navigate(`/sales/${sale.id}`) });
  const rows = useMemo(() => salesPage?.data ?? [], [salesPage]);
  const table = useDataTable({
    columns,
    data: rows,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (s) => s.id,
  });

  if (isLoading) {
    return <div className="p-6 text-xs text-app-label-secondary" dir="rtl">جارٍ التحميل…</div>;
  }

  if (isError || !client) {
    return (
      <div className="p-6 space-y-3" dir="rtl">
        <p className="text-sm text-app-status-danger">تعذر تحميل بيانات العميل.</p>
        <button onClick={() => navigate("/clients")} className="text-xs text-app-accent">العودة إلى العملاء</button>
      </div>
    );
  }

  const entity = client.entity;
  const phone = entity?.primary_contact?.phone ?? entity?.phone;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/clients")}
            className="rounded-xl border border-app-separator bg-app-bg-secondary p-2 hover:bg-app-fill-f1 transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-4 h-4 text-app-label-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
              <User className="w-6 h-6 text-app-accent" />
              {entity?.name ?? "عميل"}
            </h1>
            <p className="text-xs text-app-label-secondary mt-1">
              {STATUS_LABEL[client.status] ?? client.status}
              {client.operating_unit?.name ? ` · ${client.operating_unit.name}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/reports/debtors")}
          className="inline-flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3.5 py-2 text-xs font-medium text-app-label-primary hover:bg-app-fill-f1 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-app-accent" />
          كشف الحساب
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-app-label-secondary">الرصيد الحالي</div>
          <div className="text-xl font-bold font-mono text-app-label-primary mt-1">{money(client.current_balance)}</div>
        </div>
        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-app-label-secondary">حد الائتمان</div>
          <div className="text-xl font-bold font-mono text-app-label-primary mt-1">{money(client.credit_limit)}</div>
        </div>
        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-app-label-secondary">مدة السداد</div>
          <div className="text-xl font-bold font-mono text-app-label-primary mt-1">{client.payment_terms_days} يوم</div>
        </div>
      </div>

      <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="النوع">{entity ? ENTITY_TYPE_LABEL[entity.entity_type] ?? entity.entity_type : "—"}</Field>
        <Field label="الرقم الضريبي">{entity?.tax_number || "—"}</Field>
        <Field label="الهاتف"><span dir="ltr">{phone || "—"}</span></Field>
        <Field label="المدينة">{entity?.city || "—"}</Field>
        <Field label="العنوان">{entity?.address || "—"}</Field>
        <Field label="الحساب">
          {client.account ? (
            <span><span className="font-mono">{client.account.account_code}</span> {client.account.name}</span>
          ) : "—"}
        </Field>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-app-accent" />
          المبيعات
        </h2>
        <DataTable table={table}>
          <DataTable.Content
            isLoading={salesLoading}
            emptyMessage="لا توجد مبيعات لهذا العميل."
            emptyIcon={ShoppingCart}
            onRowClick={(s: Sale) => navigate(`/sales/${s.id}`)}
          />
        </DataTable>

        {salesPage && salesPage.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-app-separator px-3 py-1.5 disabled:opacity-40"
            >
              السابق
            </button>
            <span className="text-app-label-secondary">{page} / {salesPage.last_page}</span>
            <button
              onClick={() => setPage((p) => Math.min(salesPage.last_page, p + 1))}
              disabled={page >= salesPage.last_page}
              className="rounded-lg border border-app-separator px-3 py-1.5 disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage;
