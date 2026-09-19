import React, { useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Activity,
  Coins,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogClose,
} from "../ui/Dialog";
import { useAccount, useAccountLedger } from "../../hooks/useAccounting";
import { ACCOUNT_TYPE_LABEL, type AccountType } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";
import { DataTable, useDataTable } from "../ui/DataTable";
import { useChartOfAccountsLedgerColumns } from "../table-columns/chartOfAccountsColumns";

const TYPE_STYLE: Record<AccountType, string> = {
  asset: "bg-app-accent-subtle text-app-accent border-app-accent/20",
  liability: "bg-app-status-yellow/15 text-app-status-yellow border-app-status-yellow/30",
  equity: "bg-app-fill-f1 text-app-label-secondary border-app-separator",
  revenue: "bg-app-status-positive/10 text-app-status-positive border-app-status-positive/30",
  expense: "bg-app-status-danger/10 text-app-status-danger border-app-status-danger/30",
};

interface AccountDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  accountId: string | null;
}

export const AccountDetailsDialog: React.FC<AccountDetailsDialogProps> = ({
  open,
  onClose,
  accountId,
}) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: account, isLoading: accountLoading } = useAccount(
    open && accountId ? accountId : undefined
  );

  const { data: ledger, isLoading: ledgerLoading } = useAccountLedger(
    open && accountId ? accountId : undefined,
    {
      page,
      from: from.trim() || undefined,
      to: to.trim() || undefined,
      search: searchTerm.trim() || undefined,
    }
  );

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
  };

  if (!open || !accountId) {
    return null;
  }

  const currency = account?.currency ?? "LYD";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="full" className="max-w-5xl">
        <DialogHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent/10 text-app-accent">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {account ? `${account.account_code} - ${account.name}` : "تفاصيل الحساب والحركة"}
                </DialogTitle>
                {account && (
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      TYPE_STYLE[account.type]
                    }`}
                  >
                    {ACCOUNT_TYPE_LABEL[account.type]}
                  </span>
                )}
                {account && (
                  <span className="rounded-md bg-app-fill-f1 px-2 py-0.5 font-mono text-xs font-semibold text-app-label-secondary">
                    {currency}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-app-label-secondary">
                كشف حركة الحساب المفصل وجميع القيود اليومية المرتبطة به
              </p>
            </div>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4 p-5">
          {accountLoading && !account ? (
            <div className="flex h-24 items-center justify-center text-xs text-app-label-secondary">
              جارٍ تحميل بيانات الحساب…
            </div>
          ) : account ? (
            <>
              {/* Summary KPI Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
                  <div className="flex items-center justify-between text-xs text-app-label-secondary">
                    <span>الرصيد الحالي</span>
                    <Coins className="h-3.5 w-3.5 text-app-accent" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-lg font-bold text-app-label-primary">
                      {formatNumber(account.balance)}
                    </span>
                    <span className="text-[11px] text-app-label-tertiary">{currency}</span>
                  </div>
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

                  {(searchTerm || from || to) && (
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
                          <span className="font-mono font-bold text-app-label-primary">
                            {ledger.total}
                          </span>
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
            </>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
