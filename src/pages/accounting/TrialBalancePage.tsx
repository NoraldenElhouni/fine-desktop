import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, CheckCircle2, AlertTriangle, Printer, FileSpreadsheet } from "lucide-react";
import { useTrialBalance } from "../../hooks/useAccounting";
import { ACCOUNT_TYPE_LABEL, type TrialBalanceRow, type TrialBalanceView } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";
import { toCsv, downloadCsv } from "../../lib/utils/csv";
import { PrintDialog, PrintDocument, PrintTable, Cell } from "../../components/print/PrintDocument";

const VIEW_LABEL: Record<TrialBalanceView, string> = {
  leaf: "الحسابات الفرعية",
  level: "حسب المستوى",
  tree: "الشجرة كاملة",
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const yearStartIso = () => `${new Date().getFullYear()}-01-01`;

/** Blank instead of 0.00, so the eye lands on the figures that matter. */
const amount = (value: number) => (Math.abs(value) < 0.00005 ? "" : formatNumber(value));

const inputClass =
  "rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none";

/**
 * Trial balance with opening, movement and closing columns (FR-FREP-011).
 * Opening and closing are net balances; movement is the period's totals.
 */
export const TrialBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState(yearStartIso());
  const [to, setTo] = useState(todayIso());
  const [view, setView] = useState<TrialBalanceView>("leaf");
  const [level, setLevel] = useState(2);
  const [includeZero, setIncludeZero] = useState(false);
  const [excludeClosing, setExcludeClosing] = useState(false);
  const [printing, setPrinting] = useState(false);

  const params = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      view,
      level: view === "level" ? level : undefined,
      include_zero: includeZero,
      exclude_closing: excludeClosing,
    }),
    [from, to, view, level, includeZero, excludeClosing],
  );
  const { data: tb, isLoading, isError } = useTrialBalance(params);
  const rows = tb?.rows ?? [];

  const rangeLabel = `${from || "بداية الدفاتر"} — ${to || "اليوم"}`;

  const exportCsv = () => {
    const csv = toCsv<TrialBalanceRow>(rows, [
      { header: "الرمز", value: (r) => r.account_code },
      { header: "الحساب", value: (r) => r.name },
      { header: "النوع", value: (r) => ACCOUNT_TYPE_LABEL[r.type] },
      { header: "أول المدة مدين", value: (r) => r.opening_debit },
      { header: "أول المدة دائن", value: (r) => r.opening_credit },
      { header: "حركة الفترة مدين", value: (r) => r.period_debit },
      { header: "حركة الفترة دائن", value: (r) => r.period_credit },
      { header: "الرصيد الختامي مدين", value: (r) => r.closing_debit },
      { header: "الرصيد الختامي دائن", value: (r) => r.closing_credit },
    ]);
    downloadCsv(`trial-balance-${from || "start"}-${to || todayIso()}.csv`, csv);
  };

  const openAccount = (row: TrialBalanceRow) => {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    navigate(`/accounting/accounts/${row.account_id}?${query.toString()}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Scale className="w-7 h-7 text-app-accent" />
            ميزان المراجعة (Trial Balance)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            رصيد أول المدة، وحركة الفترة، والرصيد الختامي لكل حساب. اضغط على أي حساب لفتح كشفه للفترة نفسها.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tb && (
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tb.balanced ? "bg-app-status-positive/10 text-app-status-positive" : "bg-app-status-danger/10 text-app-status-danger"}`}>
              {tb.balanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {tb.balanced ? "متوازن" : "غير متوازن!"}
            </span>
          )}
          <button
            type="button"
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </button>
          <button
            type="button"
            onClick={() => setPrinting(true)}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-40"
          >
            <Printer className="w-4 h-4" /> طباعة
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-app-separator bg-app-bg-primary p-4">
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-app-label-secondary">
          من
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-app-label-secondary">
          إلى
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-app-label-secondary">
          العرض
          <select value={view} onChange={(e) => setView(e.target.value as TrialBalanceView)} className={inputClass}>
            {(Object.keys(VIEW_LABEL) as TrialBalanceView[]).map((v) => (
              <option key={v} value={v}>{VIEW_LABEL[v]}</option>
            ))}
          </select>
        </label>
        {view === "level" && (
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-app-label-secondary">
            المستوى
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className={inputClass}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-1.5 pb-1.5 text-xs font-semibold text-app-label-secondary">
          <input type="checkbox" checked={includeZero} onChange={(e) => setIncludeZero(e.target.checked)} className="accent-app-accent" />
          إظهار الحسابات الصفرية
        </label>
        <label className="flex items-center gap-1.5 pb-1.5 text-xs font-semibold text-app-label-secondary" title="استبعاد قيود إقفال السنة لرؤية أرصدة الإيرادات والمصروفات">
          <input type="checkbox" checked={excludeClosing} onChange={(e) => setExcludeClosing(e.target.checked)} className="accent-app-accent" />
          قبل قيد الإقفال
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-status-danger">تعذر تحميل ميزان المراجعة.</div>
        ) : (
          <table className="w-full min-w-[900px] text-xs">
            <thead className="text-app-label-secondary bg-app-bg-secondary">
              <tr className="border-b border-app-separator">
                <th rowSpan={2} className="px-4 py-2 text-start font-bold align-bottom">الرمز</th>
                <th rowSpan={2} className="px-4 py-2 text-start font-bold align-bottom">الحساب</th>
                <th colSpan={2} className="px-4 py-2 text-center font-bold border-s border-app-separator">رصيد أول المدة</th>
                <th colSpan={2} className="px-4 py-2 text-center font-bold border-s border-app-separator">حركة الفترة</th>
                <th colSpan={2} className="px-4 py-2 text-center font-bold border-s border-app-separator">الرصيد الختامي</th>
              </tr>
              <tr className="border-b border-app-separator text-[11px]">
                {["opening", "period", "closing"].flatMap((g) => [
                  <th key={`${g}-d`} className="px-4 py-1.5 text-end font-semibold border-s border-app-separator">مدين</th>,
                  <th key={`${g}-c`} className="px-4 py-1.5 text-end font-semibold">دائن</th>,
                ])}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {rows.map((row) => (
                <tr key={row.account_id} onClick={() => openAccount(row)} className="cursor-pointer hover:bg-app-fill-f1">
                  <td className="px-4 py-2 font-mono font-bold text-app-accent">{row.account_code}</td>
                  <td
                    className={`px-4 py-2 text-app-label-primary ${row.is_leaf ? "" : "font-bold"}`}
                    style={view === "leaf" ? undefined : { paddingInlineStart: `${1 + (row.level - 1) * 1.25}rem` }}
                  >
                    {row.name}
                    <span className="ms-2 text-[10px] text-app-label-tertiary">{ACCOUNT_TYPE_LABEL[row.type]}</span>
                  </td>
                  <td className="px-4 py-2 text-end font-mono border-s border-app-separator">{amount(row.opening_debit)}</td>
                  <td className="px-4 py-2 text-end font-mono">{amount(row.opening_credit)}</td>
                  <td className="px-4 py-2 text-end font-mono border-s border-app-separator">{amount(row.period_debit)}</td>
                  <td className="px-4 py-2 text-end font-mono">{amount(row.period_credit)}</td>
                  <td className="px-4 py-2 text-end font-mono font-bold border-s border-app-separator">{amount(row.closing_debit)}</td>
                  <td className="px-4 py-2 text-end font-mono font-bold">{amount(row.closing_credit)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-app-label-tertiary">لا توجد حركة في هذه الفترة.</td>
                </tr>
              )}
            </tbody>
            {tb && rows.length > 0 && (
              <tfoot className="border-t-2 border-app-separator bg-app-bg-secondary font-bold">
                <tr>
                  <td colSpan={2} className="px-4 py-2.5 text-app-label-primary">الإجمالي</td>
                  <td className="px-4 py-2.5 text-end font-mono border-s border-app-separator">{formatNumber(tb.totals.opening_debit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono">{formatNumber(tb.totals.opening_credit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono border-s border-app-separator">{formatNumber(tb.totals.period_debit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono">{formatNumber(tb.totals.period_credit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono border-s border-app-separator">{formatNumber(tb.totals.closing_debit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono">{formatNumber(tb.totals.closing_credit)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      <PrintDialog open={printing} onClose={() => setPrinting(false)} title="طباعة ميزان المراجعة">
        {tb && (
          <PrintDocument
            title="ميزان المراجعة"
            number={rangeLabel}
            meta={[
              { label: "العرض", value: VIEW_LABEL[view] },
              { label: "الحالة", value: tb.balanced ? "متوازن" : "غير متوازن" },
              ...(excludeClosing ? [{ label: "ملاحظة", value: "قبل قيد الإقفال" }] : []),
            ]}
            signatures={["المحاسب", "المدير المالي"]}
          >
            <PrintTable
              head={["الرمز", "الحساب", "أول المدة مدين", "أول المدة دائن", "الحركة مدين", "الحركة دائن", "الختامي مدين", "الختامي دائن"]}
            >
              {rows.map((row) => (
                <tr key={row.account_id}>
                  <Cell className="font-mono">{row.account_code}</Cell>
                  <Cell className={row.is_leaf ? "" : "font-bold"}>{row.name}</Cell>
                  <Cell className="text-end font-mono">{amount(row.opening_debit)}</Cell>
                  <Cell className="text-end font-mono">{amount(row.opening_credit)}</Cell>
                  <Cell className="text-end font-mono">{amount(row.period_debit)}</Cell>
                  <Cell className="text-end font-mono">{amount(row.period_credit)}</Cell>
                  <Cell className="text-end font-mono">{amount(row.closing_debit)}</Cell>
                  <Cell className="text-end font-mono">{amount(row.closing_credit)}</Cell>
                </tr>
              ))}
              <tr className="font-bold">
                <Cell colSpan={2}>الإجمالي</Cell>
                <Cell className="text-end font-mono">{formatNumber(tb.totals.opening_debit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(tb.totals.opening_credit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(tb.totals.period_debit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(tb.totals.period_credit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(tb.totals.closing_debit)}</Cell>
                <Cell className="text-end font-mono">{formatNumber(tb.totals.closing_credit)}</Cell>
              </tr>
            </PrintTable>
          </PrintDocument>
        )}
      </PrintDialog>
    </div>
  );
};
