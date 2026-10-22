import React, { useState, useEffect } from "react";
import { Search, Calendar, Printer, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../ui/Dialog";
import { PrintDialog, PrintDocument, PrintTable, Cell } from "../print/PrintDocument";
import { BalanceWithSide } from "../table-columns/chartOfAccountsColumns";
import { useCashAccountStatement } from "../../hooks/useTreasury";
import { getCashAccountStatement } from "../../api/endpoints/procurement";
import type { JournalLine, AccountStatementSummary } from "../../api/endpoints/accounting";
import type { CashAccount } from "../../types/procurement";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { toCsv, downloadCsv } from "../../lib/utils/csv";
import { apiErrorMessage } from "../../api/endpoints/production";

interface CashAccountStatementDialogProps {
  open: boolean;
  onClose: () => void;
  cashAccount: CashAccount | null;
}

const getInitialFrom = () => `${new Date().getFullYear()}-01-01`;
const getInitialTo = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CashAccountStatementDialog: React.FC<CashAccountStatementDialogProps> = ({
  open,
  onClose,
  cashAccount,
}) => {
  const [from, setFrom] = useState(getInitialFrom);
  const [to, setTo] = useState(getInitialTo);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<{
    rows: JournalLine[];
    summary: AccountStatementSummary;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setFrom(getInitialFrom());
      setTo(getInitialTo());
      setSearchTerm("");
      setPage(1);
      setExportError(null);
      setPrintData(null);
    }
  }, [open, cashAccount?.id]);

  const isNonLyd = Boolean(
    cashAccount?.currency &&
      cashAccount.currency !== "LYD" &&
      cashAccount.currency !== "د.ل"
  );
  const queryCurrency = isNonLyd ? cashAccount?.currency : undefined;

  const {
    data: statement,
    isLoading,
    error,
  } = useCashAccountStatement(open && cashAccount ? cashAccount.id : null, {
    page,
    from: from.trim() || undefined,
    to: to.trim() || undefined,
    search: searchTerm.trim() || undefined,
    currency: queryCurrency,
  });

  const lines = statement?.data ?? [];
  const summary = statement?.summary;

  const fetchAll = async (): Promise<{
    rows: JournalLine[];
    summary: AccountStatementSummary;
  } | null> => {
    if (!cashAccount) return null;
    setExportError(null);
    setExporting(true);
    try {
      const res = await getCashAccountStatement(cashAccount.id, {
        from: from.trim() || undefined,
        to: to.trim() || undefined,
        search: searchTerm.trim() || undefined,
        all: true,
        currency: queryCurrency,
      });
      return { rows: res.data, summary: res.summary };
    } catch (err) {
      setExportError(apiErrorMessage(err, "تعذر تجهيز كشف الخزينة."));
      return null;
    } finally {
      setExporting(false);
    }
  };

  const exportCsv = async () => {
    const result = await fetchAll();
    if (!result || !cashAccount) return;
    const cur = queryCurrency || "LYD";
    const csv = toCsv<JournalLine>(result.rows, [
      { header: "التاريخ", value: (r) => r.journal_entry?.entry_date?.slice(0, 10) ?? "" },
      { header: "المرجع", value: (r) => r.journal_entry?.reference ?? "" },
      { header: "البيان", value: (r) => r.memo || r.journal_entry?.description || "" },
      { header: "مدين", value: (r) => Number(r.debit) },
      { header: "دائن", value: (r) => Number(r.credit) },
      { header: `الرصيد (${cur})`, value: (r) => r.running_balance ?? null },
    ]);
    downloadCsv(
      `statement-treasury-${cashAccount.name}-${from || "start"}-${to || "today"}.csv`,
      csv
    );
  };

  const openPrint = async () => {
    const result = await fetchAll();
    if (result) {
      setPrintData(result);
    }
  };

  const errorMessage = error ? apiErrorMessage(error, "تعذر تحميل كشف الخزينة.") : null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent size="full" className="max-w-5xl">
          <DialogHeader className="border-b border-app-separator pb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-app-label-primary">
                  كشف خزينة — {cashAccount?.name ?? ""}
                </DialogTitle>
                {isNonLyd && (
                  <span className="rounded-md bg-app-accent-subtle px-2 py-0.5 text-xs font-semibold text-app-accent">
                    الكشف بعملة {cashAccount?.currency}
                  </span>
                )}
              </div>
              <DialogClose />
            </div>
            {cashAccount?.account && (
              <DialogDescription className="text-xs font-mono text-app-label-tertiary">
                {cashAccount.account.account_code} — {cashAccount.account.name}
              </DialogDescription>
            )}
          </DialogHeader>

          <DialogBody className="space-y-4 py-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-app-separator bg-app-bg-secondary p-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-app-label-tertiary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="بحث بالمرجع أو البيان…"
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

                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={exporting || isLoading}
                  className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50 transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  onClick={openPrint}
                  disabled={exporting || isLoading}
                  className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>طباعة</span>
                </button>
              </div>
            </div>

            {(errorMessage || exportError) && (
              <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                {errorMessage || exportError}
              </div>
            )}

            <div className="rounded-xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-end text-xs">
                  <thead>
                    <tr className="border-b border-app-separator bg-app-bg-secondary text-[11px] font-bold text-app-label-secondary">
                      <th className="px-3 py-2 text-start">التاريخ</th>
                      <th className="px-3 py-2 text-start">المرجع</th>
                      <th className="px-3 py-2 text-start">البيان</th>
                      <th className="px-3 py-2 text-end font-mono">مدين</th>
                      <th className="px-3 py-2 text-end font-mono">دائن</th>
                      <th className="px-3 py-2 text-end font-mono">
                        {isNonLyd ? `الرصيد (${cashAccount?.currency})` : "الرصيد"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-separator">
                    <tr className="bg-app-fill-f1/40 font-semibold text-app-label-secondary">
                      <td className="px-3 py-2 text-start" colSpan={3}>
                        رصيد أول المدة
                      </td>
                      <td className="px-3 py-2 text-end font-mono">—</td>
                      <td className="px-3 py-2 text-end font-mono">—</td>
                      <td className="px-3 py-2 text-end font-mono">
                        {summary ? <BalanceWithSide value={summary.opening_balance} /> : "—"}
                      </td>
                    </tr>

                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-app-label-secondary">
                          جارٍ تحميل كشف الخزينة…
                        </td>
                      </tr>
                    ) : lines.length > 0 ? (
                      lines.map((line) => (
                        <tr key={line.id} className="hover:bg-app-fill-f1/30 transition-colors">
                          <td className="px-3 py-2 font-mono text-xs text-app-label-secondary text-start whitespace-nowrap">
                            {line.journal_entry?.entry_date ? formatDate(line.journal_entry.entry_date) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs font-bold text-app-accent text-start whitespace-nowrap">
                            {line.journal_entry?.reference ?? "—"}
                          </td>
                          <td
                            className="px-3 py-2 text-xs text-app-label-primary text-start max-w-xs truncate"
                            title={line.memo || line.journal_entry?.description || undefined}
                          >
                            {line.memo || line.journal_entry?.description || "—"}
                          </td>
                          <td className="px-3 py-2 text-end font-mono text-xs whitespace-nowrap">
                            {Number(line.debit) > 0 ? (
                              <span className="font-semibold text-app-label-primary">
                                {formatNumber(Number(line.debit))}
                              </span>
                            ) : (
                              <span className="text-app-label-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-end font-mono text-xs whitespace-nowrap">
                            {Number(line.credit) > 0 ? (
                              <span className="font-semibold text-app-label-primary">
                                {formatNumber(Number(line.credit))}
                              </span>
                            ) : (
                              <span className="text-app-label-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-end font-mono text-xs whitespace-nowrap">
                            {line.running_balance !== undefined ? (
                              <BalanceWithSide value={line.running_balance} />
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-app-label-tertiary">
                          لا توجد حركات مسجلة خلال هذه الفترة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {summary && (
                    <tfoot>
                      <tr className="border-t-2 border-app-separator bg-app-bg-secondary font-bold text-app-label-primary">
                        <td className="px-3 py-2.5 text-start" colSpan={3}>
                          حركة الفترة والرصيد الختامي
                        </td>
                        <td className="px-3 py-2.5 text-end font-mono text-xs">
                          {formatNumber(summary.period_debit)}
                        </td>
                        <td className="px-3 py-2.5 text-end font-mono text-xs">
                          {formatNumber(summary.period_credit)}
                        </td>
                        <td className="px-3 py-2.5 text-end font-mono text-xs">
                          <BalanceWithSide value={summary.closing_balance} />
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {statement && statement.total > 0 && (
                <div className="flex items-center justify-between border-t border-app-separator px-4 py-2.5 text-xs text-app-label-secondary">
                  <div>
                    إجمالي الحركات:{" "}
                    <span className="font-mono font-bold text-app-label-primary">
                      {statement.total}
                    </span>
                  </div>

                  {statement.last_page > 1 && (
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
                        {page} / {statement.last_page}
                      </span>
                      <button
                        type="button"
                        disabled={page >= statement.last_page}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-lg border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                      >
                        التالي
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="border-t border-app-separator pt-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-app-label-tertiary">
                كشف حركة الخزينة استناداً إلى القيود المحاسبية المرحلة.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrintDialog
        open={printData !== null}
        onClose={() => setPrintData(null)}
        title="طباعة كشف الخزينة"
      >
        {printData && (
          <PrintDocument
            title={`كشف خزينة — ${cashAccount?.name ?? ""}`}
            number={
              cashAccount?.account?.account_code
                ? `${cashAccount.account.account_code} — ${cashAccount.account.name}`
                : (cashAccount?.name ?? "")
            }
            meta={[
              { label: "الفترة", value: `${from || "بداية الدفاتر"} — ${to || "اليوم"}` },
              { label: "العملة", value: queryCurrency || printData.summary.currency || "LYD" },
              { label: "رصيد أول المدة", value: formatNumber(printData.summary.opening_balance) },
              { label: "الرصيد الختامي", value: formatNumber(printData.summary.closing_balance) },
            ]}
            signatures={["أمين الخزينة", "المحاسب", "المدير المالي"]}
          >
            <PrintTable
              head={[
                "التاريخ",
                "المرجع",
                "البيان",
                "مدين",
                "دائن",
                `الرصيد (${queryCurrency || printData.summary.currency || "LYD"})`,
              ]}
            >
              <tr className="font-semibold">
                <Cell colSpan={5}>رصيد أول المدة</Cell>
                <Cell className="text-end font-mono">{formatNumber(printData.summary.opening_balance)}</Cell>
              </tr>
              {printData.rows.map((line) => (
                <tr key={line.id}>
                  <Cell className="font-mono">
                    {line.journal_entry?.entry_date ? formatDate(line.journal_entry.entry_date) : ""}
                  </Cell>
                  <Cell className="font-mono">{line.journal_entry?.reference ?? "—"}</Cell>
                  <Cell>{line.memo || line.journal_entry?.description || "—"}</Cell>
                  <Cell className="text-end font-mono">
                    {Number(line.debit) > 0 ? formatNumber(Number(line.debit)) : ""}
                  </Cell>
                  <Cell className="text-end font-mono">
                    {Number(line.credit) > 0 ? formatNumber(Number(line.credit)) : ""}
                  </Cell>
                  <Cell className="text-end font-mono">{formatNumber(line.running_balance ?? 0)}</Cell>
                </tr>
              ))}
              <tr className="font-bold">
                <Cell colSpan={3}>الإجمالي والرصيد الختامي</Cell>
                <Cell className="text-end font-mono">{formatNumber(printData.summary.period_debit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(printData.summary.period_credit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(printData.summary.closing_balance)}</Cell>
              </tr>
            </PrintTable>
          </PrintDocument>
        )}
      </PrintDialog>
    </>
  );
};

export default CashAccountStatementDialog;
