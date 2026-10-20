import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RotateCcw, Layers, ArrowUpRight, ArrowDownLeft, Calendar, Coins, Printer, FileSpreadsheet } from "lucide-react";
import { useAccount, useAccountLedger, useIsCompanyWide } from "../../hooks/useAccounting";
import { accountingApi, type JournalLine } from "../../api/endpoints/accounting";
import { apiErrorMessage } from "../../api/endpoints/production";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { toCsv, downloadCsv } from "../../lib/utils/csv";
import { DataTable, useDataTable } from "../ui/DataTable";
import { BalanceWithSide, useChartOfAccountsLedgerColumns } from "../table-columns/chartOfAccountsColumns";
import { PrintDialog, PrintDocument, PrintTable, Cell } from "../print/PrintDocument";

export interface AccountDetailsContentProps {
  accountId: string;
}

/**
 * KPI cards + filter toolbar + ledger table for one account. Shared by the
 * `AccountDetailsDialog` modal and the full-page `AccountDetailPage` — pass an
 * `accountId` and it renders itself; callers own their own header chrome.
 */
export const AccountDetailsContent: React.FC<AccountDetailsContentProps> = ({ accountId }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  // The trial balance drills down with ?from=&to= so the statement opens on the same period.
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [printRows, setPrintRows] = useState<JournalLine[] | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const companyWide = useIsCompanyWide();
  const [includeChildren, setIncludeChildren] = useState(false);

  const { data: account, isLoading: accountLoading } = useAccount(accountId);

  const { data: ledger, isLoading: ledgerLoading } = useAccountLedger(accountId, {
    page,
    from: from.trim() || undefined,
    to: to.trim() || undefined,
    search: searchTerm.trim() || undefined,
    include_children: includeChildren,
  });

  const columns = useChartOfAccountsLedgerColumns();
  const ledgerData = useMemo(() => ledger?.data ?? [], [ledger]);

  const table = useDataTable({
    columns,
    data: ledgerData,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (row) => row.id,
  });

  const handleResetFilters = () => {
    setSearchTerm("");
    setFrom("");
    setTo("");
    setPage(1);
    setIncludeChildren(false);
  };

  const currency = account?.currency ?? "LYD";
  const summary = ledger?.summary;

  /** Every line in the current filters, for print and CSV. */
  const fetchAll = async (): Promise<JournalLine[] | null> => {
    setExportError(null);
    setExporting(true);
    try {
      const res = await accountingApi.getAccountLedger(accountId, {
        from: from.trim() || undefined,
        to: to.trim() || undefined,
        search: searchTerm.trim() || undefined,
        include_children: includeChildren,
        company_wide: companyWide,
        all: true,
      });
      return res.data.data;
    } catch (err) {
      setExportError(apiErrorMessage(err, "تعذر تجهيز كشف الحساب."));
      return null;
    } finally {
      setExporting(false);
    }
  };

  const exportCsv = async () => {
    const rows = await fetchAll();
    if (!rows || !account) return;
    const csv = toCsv<JournalLine>(rows, [
      { header: "التاريخ", value: (r) => r.journal_entry?.entry_date?.slice(0, 10) ?? "" },
      { header: "المرجع", value: (r) => r.journal_entry?.reference ?? "" },
      { header: "الوصف", value: (r) => r.journal_entry?.description ?? "" },
      { header: "البيان", value: (r) => r.memo ?? "" },
      { header: "الوحدة", value: (r) => r.operating_unit?.name ?? "" },
      { header: "مدين", value: (r) => Number(r.debit) },
      { header: "دائن", value: (r) => Number(r.credit) },
      { header: "الرصيد", value: (r) => r.running_balance ?? null },
    ]);
    downloadCsv(`statement-${account.account_code}-${from || "start"}-${to || "today"}.csv`, csv);
  };

  const openPrint = async () => {
    const rows = await fetchAll();
    if (rows) setPrintRows(rows);
  };

  if (accountLoading && !account) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-app-label-secondary">
        جارٍ تحميل بيانات الحساب…
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <>
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
          <div className="flex items-center justify-between text-xs text-app-label-secondary">
            <span>{account.has_children ? "الرصيد التجميعي" : "الرصيد الحالي"}</span>
            <Coins className="h-3.5 w-3.5 text-app-accent" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-bold text-app-label-primary">
              {formatNumber(account.balance)}
            </span>
            <span className="text-[11px] text-app-label-tertiary">{currency}</span>
          </div>
          {account.has_children && account.direct_balance !== undefined && (
            <div className="mt-1 text-[11px] text-app-label-tertiary">
              المباشر: <span className="font-mono font-semibold">{formatNumber(account.direct_balance)}</span> {currency}
            </div>
          )}
          {account.fiscal_year_opening_balance !== undefined && (
            <div className="mt-1 text-[11px] text-app-label-tertiary">
              الرصيد الافتتاحي للسنة: <span className="font-mono font-semibold">{formatNumber(account.fiscal_year_opening_balance)}</span> {currency}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
          <div className="flex items-center justify-between text-xs text-app-label-secondary">
            <span>إجمالي المدين</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-app-status-positive" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-bold text-app-status-positive">
              {formatNumber(account.total_debit)}
            </span>
            <span className="text-[11px] text-app-label-tertiary">{currency}</span>
          </div>
          {account.has_children && account.direct_debit !== undefined && (
            <div className="mt-1 text-[11px] text-app-label-tertiary">
              المباشر: <span className="font-mono font-semibold">{formatNumber(account.direct_debit)}</span> {currency}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
          <div className="flex items-center justify-between text-xs text-app-label-secondary">
            <span>إجمالي الدائن</span>
            <ArrowDownLeft className="h-3.5 w-3.5 text-app-status-danger" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-bold text-app-status-danger">
              {formatNumber(account.total_credit)}
            </span>
            <span className="text-[11px] text-app-label-tertiary">{currency}</span>
          </div>
          {account.has_children && account.direct_credit !== undefined && (
            <div className="mt-1 text-[11px] text-app-label-tertiary">
              المباشر: <span className="font-mono font-semibold">{formatNumber(account.direct_credit)}</span> {currency}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
          <div className="flex items-center justify-between text-xs text-app-label-secondary">
            <span>الحساب الأب / التصنيف</span>
            <Layers className="h-3.5 w-3.5 text-app-label-tertiary" />
          </div>
          <div className="mt-1 truncate text-xs font-semibold text-app-label-primary">
            {account.parent ? `${account.parent.account_code} - ${account.parent.name}` : "حساب رئيسي (مستوى أول)"}
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-app-separator bg-app-bg-secondary p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-app-label-tertiary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="بحث برقم القيد أو الوصف أو البيان…"
            className="w-full rounded-lg border border-app-separator bg-app-bg-primary py-1.5 pe-3 ps-8 text-xs text-app-label-primary placeholder:text-app-label-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-app-label-tertiary" />
            <span className="text-xs text-app-label-secondary">من:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 font-mono text-xs text-app-label-primary focus:outline-none focus:ring-1 focus:ring-app-accent"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-app-label-secondary">إلى:</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 font-mono text-xs text-app-label-primary focus:outline-none focus:ring-1 focus:ring-app-accent"
            />
          </div>

          {account.has_children && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-app-label-secondary hover:text-app-label-primary px-1">
              <input
                type="checkbox"
                checked={includeChildren}
                onChange={(e) => {
                  setIncludeChildren(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-app-separator text-app-accent focus:ring-app-accent"
              />
              <span>تضمين الحسابات الفرعية</span>
            </label>
          )}

          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting}
            className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            type="button"
            onClick={openPrint}
            disabled={exporting}
            className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" /> كشف حساب
          </button>

          {(searchTerm || from || to || includeChildren) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs text-app-label-secondary hover:bg-app-fill-f1"
            >
              <RotateCcw className="h-3 w-3" />
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {exportError && <p className="text-xs text-app-status-danger">{exportError}</p>}

      {summary && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2.5 text-xs text-app-label-secondary">
          <span className="flex items-center gap-2">رصيد أول المدة <BalanceWithSide value={summary.opening_balance} /></span>
          <span>
            حركة الفترة: مدين <span className="font-mono font-semibold text-app-label-primary">{formatNumber(summary.period_debit)}</span>
            {" · "}دائن <span className="font-mono font-semibold text-app-label-primary">{formatNumber(summary.period_credit)}</span>
          </span>
          <span className="ms-auto flex items-center gap-2 font-semibold text-app-label-primary">الرصيد الختامي <BalanceWithSide value={summary.closing_balance} /></span>
        </div>
      )}

      {/* Transactions Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-primary">
        {ledgerLoading ? (
          <div className="flex h-36 items-center justify-center text-xs text-app-label-secondary">
            جارٍ تحميل الحركات…
          </div>
        ) : (
          <>
            <DataTable table={table} className="rounded-none border-0 shadow-none">
              <DataTable.Content emptyMessage="لا توجد حركات مسجلة لهذا الحساب وفق خيارات البحث المحددة." />
            </DataTable>

            {ledger && ledger.total > 0 && (
              <div className="flex items-center justify-between border-t border-app-separator px-4 py-2.5 text-xs text-app-label-secondary">
                <div>
                  إجمالي الحركات:{" "}
                  <span className="font-mono font-bold text-app-label-primary">{ledger.total}</span>
                </div>

                {ledger.last_page > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                    >
                      السابق
                    </button>
                    <span className="font-mono text-xs text-app-label-secondary">
                      {page} / {ledger.last_page}
                    </span>
                    <button
                      type="button"
                      disabled={page >= ledger.last_page}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <PrintDialog open={printRows !== null} onClose={() => setPrintRows(null)} title="طباعة كشف الحساب">
        {printRows && summary && (
          <PrintDocument
            title="كشف حساب"
            number={`${account.account_code} — ${account.name}`}
            meta={[
              { label: "الفترة", value: `${from || "بداية الدفاتر"} — ${to || "اليوم"}` },
              { label: "العملة", value: currency },
              { label: "رصيد أول المدة", value: formatNumber(summary.opening_balance) },
              { label: "الرصيد الختامي", value: formatNumber(summary.closing_balance) },
            ]}
            signatures={["المحاسب", "المدير المالي"]}
          >
            <PrintTable head={["التاريخ", "المرجع", "البيان", "مدين", "دائن", "الرصيد"]}>
              <tr className="font-semibold">
                <Cell colSpan={5}>رصيد أول المدة</Cell>
                <Cell className="text-end font-mono">{formatNumber(summary.opening_balance)}</Cell>
              </tr>
              {printRows.map((line) => (
                <tr key={line.id}>
                  <Cell className="font-mono">{line.journal_entry?.entry_date ? formatDate(line.journal_entry.entry_date) : ""}</Cell>
                  <Cell className="font-mono">{line.journal_entry?.reference}</Cell>
                  <Cell>{line.memo || line.journal_entry?.description}</Cell>
                  <Cell className="text-end font-mono">{Number(line.debit) > 0 ? formatNumber(Number(line.debit)) : ""}</Cell>
                  <Cell className="text-end font-mono">{Number(line.credit) > 0 ? formatNumber(Number(line.credit)) : ""}</Cell>
                  <Cell className="text-end font-mono">{formatNumber(line.running_balance ?? 0)}</Cell>
                </tr>
              ))}
              <tr className="font-bold">
                <Cell colSpan={3}>الإجمالي والرصيد الختامي</Cell>
                <Cell className="text-end font-mono">{formatNumber(summary.period_debit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(summary.period_credit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(summary.closing_balance)}</Cell>
              </tr>
            </PrintTable>
          </PrintDocument>
        )}
      </PrintDialog>
    </>
  );
};
