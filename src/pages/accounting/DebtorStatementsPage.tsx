import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Download,
  Printer,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from "lucide-react";
import { useDebtorStatements } from "../../hooks/useDebtorStatements";
import { useClients } from "../../hooks/useClients";
import type {
  DebtorClientStatus,
  DebtorSection,
  DebtorStatementParams,
  DebtorStatementsResponse,
} from "../../api/endpoints/debtorStatements";
import type { Client } from "../../types/entities";
import { formatInteger, formatNumber } from "../../lib/utils/format";
import { downloadCsv, toCsv, type CsvColumn } from "../../lib/utils/csv";
import { DebtorStatementsPrint } from "../../components/print/DebtorStatementsPrint";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  DebtorStatementSection,
  DEBTOR_STATUS_LABELS,
} from "../../components/accounting/DebtorStatementSection";

interface DebtorFilters {
  from: string;
  to: string;
  clientIds: string[];
  status: DebtorClientStatus | "";
  city: string;
  minBalance: string;
  includeUnassigned: boolean;
}

const isoDate = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validIso = (v: string | null): v is string => {
  if (!v || !ISO_DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00`);
  return !Number.isNaN(d.getTime()) && isoDate(d) === v;
};

/** Single source of initial filter values; `?from=&to=` (YYYY-MM-DD) override the defaults. */
function defaultFilters(search?: URLSearchParams): DebtorFilters {
  const now = new Date();
  const qFrom = search?.get("from") ?? null;
  const qTo = search?.get("to") ?? null;
  return {
    from: validIso(qFrom) ? qFrom : isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: validIso(qTo) ? qTo : isoDate(now),
    clientIds: [],
    status: "",
    city: "",
    minBalance: "",
    includeUnassigned: false,
  };
}

function toParams(f: DebtorFilters): DebtorStatementParams {
  const minBalance = f.minBalance.trim() === "" ? NaN : Number(f.minBalance);
  return {
    from: f.from,
    to: f.to,
    client_ids: f.clientIds.length ? f.clientIds : undefined,
    statuses: f.status ? [f.status] : undefined,
    city: f.city.trim() || undefined,
    min_balance: Number.isFinite(minBalance) ? minBalance : undefined,
    include_unassigned: f.includeUnassigned,
  };
}

interface CsvRow {
  client: string;
  phone: string;
  city: string;
  date: string;
  reference: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
}

const CSV_COLUMNS: CsvColumn<CsvRow>[] = [
  { header: "العميل", value: (r) => r.client },
  { header: "الهاتف", value: (r) => r.phone },
  { header: "المدينة", value: (r) => r.city },
  { header: "التاريخ", value: (r) => r.date },
  { header: "المرجع", value: (r) => r.reference },
  { header: "البيان", value: (r) => r.description },
  { header: "مدين", value: (r) => r.debit },
  { header: "دائن", value: (r) => r.credit },
  { header: "الرصيد", value: (r) => r.balance },
];

function sectionRows(
  section: DebtorSection,
  who: { client: string; phone: string; city: string },
): CsvRow[] {
  const blank: Omit<CsvRow, "description" | "balance"> = {
    ...who,
    date: "",
    reference: "",
    debit: null,
    credit: null,
  };
  return [
    { ...blank, description: "رصيد افتتاحي", balance: section.opening_balance },
    ...section.lines.map((l) => ({
      ...who,
      date: l.date,
      reference: l.reference,
      description: l.description ?? "",
      debit: l.debit,
      credit: l.credit,
      balance: l.running_balance,
    })),
    { ...blank, description: "الرصيد الختامي", balance: section.closing_balance },
  ];
}

function buildCsvRows(data: DebtorStatementsResponse): CsvRow[] {
  const rows: CsvRow[] = data.debtors.flatMap((d) =>
    sectionRows(d, { client: d.client.name, phone: d.client.phone, city: d.client.city }),
  );
  if (data.unassigned) {
    rows.push(...sectionRows(data.unassigned, { client: "قيود ذمم غير مخصصة", phone: "", city: "" }));
  }
  rows.push({
    client: "",
    phone: "",
    city: "",
    date: "",
    reference: "",
    description: "الإجمالي",
    debit: data.totals.debit,
    credit: data.totals.credit,
    balance: data.totals.closing,
  });
  return rows;
}

const SummaryCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: string;
  unit?: boolean;
}> = ({ label, value, icon, tone = "text-app-label-primary", unit = true }) => (
  <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-app-label-secondary">{label}</span>
      {icon}
    </div>
    <p className={`mt-2 text-xl font-bold font-mono ${tone}`}>
      {value} {unit && <span className="text-xs font-normal">د.ل</span>}
    </p>
  </div>
);

const inputClass =
  "rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none";

export const DebtorStatementsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<DebtorFilters>(() => defaultFilters(searchParams));
  // Auto-submit once on mount when both valid dates arrive via the URL (shortcut from reports).
  const [submitted, setSubmitted] = useState<DebtorStatementParams | null>(() =>
    validIso(searchParams.get("from")) && validIso(searchParams.get("to"))
      ? toParams(defaultFilters(searchParams))
      : null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPrint, setShowPrint] = useState(false);

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data, isLoading, isError, error } = useDebtorStatements(submitted);

  const clientName = (c: Client) => c.entity?.name ?? c.id;
  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const availableClients = useMemo(
    () => clients.filter((c) => !filters.clientIds.includes(c.id)),
    [clients, filters.clientIds],
  );

  const patch = (p: Partial<DebtorFilters>) => setFilters((f) => ({ ...f, ...p }));

  const handleShow = () => {
    setSelectedIds([]);
    setSubmitted(toParams(filters));
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const allSelected = Boolean(data?.debtors.length) && selectedIds.length === data?.debtors.length;

  const handleExport = () => {
    if (!data) return;
    const csv = toCsv(buildCsvRows(data), CSV_COLUMNS);
    downloadCsv(`كشف-حساب-المدينين-${data.period.from}-${data.period.to}.csv`, csv);
  };

  const isEmpty = data && data.debtors.length === 0 && !data.unassigned;
  const errMessage =
    (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ??
    "تعذر تحميل كشف حساب المدينين.";

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-bold text-app-label-primary">كشف حساب المدينين</h1>
        <div className="ms-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPrint(true)}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" />
            طباعة
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            تصدير CSV
          </button>
        </div>
      </div>

      {showPrint && data && (
        <DebtorStatementsPrint data={data} onlyClientIds={selectedIds} onClose={() => setShowPrint(false)} />
      )}

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-app-separator bg-app-bg-primary p-3 shadow-sm">
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          من
          <input type="date" value={filters.from} onChange={(e) => patch({ from: e.target.value })} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          إلى
          <input type="date" value={filters.to} onChange={(e) => patch({ to: e.target.value })} className={inputClass} />
        </label>
        <div className="w-56">
          <SearchableSelect<Client>
            options={availableClients}
            value={null}
            onChange={(c) => c && patch({ clientIds: [...filters.clientIds, c.id] })}
            getOptionId={(c) => c.id}
            getOptionLabel={clientName}
            placeholder="إضافة عميل…"
            loading={clientsLoading}
            size="sm"
            ariaLabel="العملاء"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          الحالة
          <select
            value={filters.status}
            onChange={(e) => patch({ status: e.target.value as DebtorClientStatus | "" })}
            className={inputClass}
          >
            <option value="">الكل</option>
            {(Object.keys(DEBTOR_STATUS_LABELS) as DebtorClientStatus[]).map((s) => (
              <option key={s} value={s}>
                {DEBTOR_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          المدينة
          <input
            type="text"
            value={filters.city}
            onChange={(e) => patch({ city: e.target.value })}
            className={`${inputClass} w-28`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          الحد الأدنى للرصيد
          <input
            type="number"
            min="0"
            value={filters.minBalance}
            onChange={(e) => patch({ minBalance: e.target.value })}
            className={`${inputClass} w-28 font-mono`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          <input
            type="checkbox"
            checked={filters.includeUnassigned}
            onChange={(e) => patch({ includeUnassigned: e.target.checked })}
            className="h-4 w-4 accent-app-accent"
          />
          إظهار القيود غير المخصصة
        </label>
        <button
          type="button"
          onClick={handleShow}
          disabled={!filters.from || !filters.to}
          className="rounded-xl bg-app-accent px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          عرض
        </button>
        {filters.clientIds.length > 0 && (
          <div className="flex w-full flex-wrap gap-2">
            {filters.clientIds.map((id) => {
              const c = clientById.get(id);
              return (
                <span
                  key={id}
                  className="flex items-center gap-1 rounded-full bg-app-accent/15 px-2.5 py-1 text-[11px] text-app-accent"
                >
                  {c ? clientName(c) : id}
                  <button
                    type="button"
                    aria-label="إزالة"
                    onClick={() => patch({ clientIds: filters.clientIds.filter((x) => x !== id) })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!submitted && (
        <div className="flex h-40 items-center justify-center text-xs text-app-label-secondary">
          حدد الفترة ثم اضغط «عرض».
        </div>
      )}
      {submitted && isLoading && (
        <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
      )}
      {submitted && isError && (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          {errMessage}
        </div>
      )}
      {isEmpty && (
        <div className="flex h-40 items-center justify-center text-xs text-app-label-secondary">
          لا يوجد مدينون في هذه الفترة
        </div>
      )}

      {data && !isEmpty && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="عدد المدينين"
              value={formatInteger(data.totals.debtors_count)}
              icon={<Users className="h-4 w-4 text-app-accent" />}
              unit={false}
            />
            <SummaryCard
              label="الرصيد الافتتاحي"
              value={formatNumber(data.totals.opening)}
              icon={<Wallet className="h-4 w-4 text-app-accent" />}
            />
            <SummaryCard
              label="إجمالي المدين"
              value={formatNumber(data.totals.debit)}
              icon={<ArrowUpRight className="h-4 w-4 text-app-status-danger" />}
            />
            <SummaryCard
              label="إجمالي الدائن"
              value={formatNumber(data.totals.credit)}
              icon={<ArrowDownLeft className="h-4 w-4 text-app-status-positive" />}
              tone="text-app-status-positive"
            />
            <SummaryCard
              label="الرصيد الختامي"
              value={formatNumber(data.totals.closing)}
              icon={<Wallet className="h-4 w-4 text-app-accent" />}
              tone="text-app-accent"
            />
            <SummaryCard
              label="المتأخر"
              value={formatNumber(data.totals.overdue)}
              icon={<AlertCircle className="h-4 w-4 text-app-status-danger" />}
              tone="text-app-status-danger"
            />
          </div>

          {data.debtors.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-app-label-secondary">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  setSelectedIds(allSelected ? [] : data.debtors.map((d) => d.client.id))
                }
                className="h-4 w-4 accent-app-accent"
              />
              تحديد الكل ({formatInteger(selectedIds.length)} محدد)
            </label>
          )}

          <div className="space-y-3">
            {data.debtors.map((d) => (
              <DebtorStatementSection
                key={d.client.id}
                section={d}
                client={d.client}
                selected={selectedIds.includes(d.client.id)}
                onToggleSelect={() => toggleSelect(d.client.id)}
              />
            ))}
            {data.unassigned && (
              <DebtorStatementSection section={data.unassigned} title="قيود ذمم غير مخصصة" />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DebtorStatementsPage;
