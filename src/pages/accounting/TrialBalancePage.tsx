import React from "react";
import { Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTrialBalance } from "../../hooks/useAccounting";
import { ACCOUNT_TYPE_LABEL } from "../../api/endpoints/accounting";

const fmt = (v: number | string) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

export const TrialBalancePage: React.FC = () => {
  const { data: tb, isLoading } = useTrialBalance();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Scale className="w-7 h-7 text-app-accent" />
            ميزان المراجعة (Trial Balance)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            مجاميع الحركة لكل حساب منذ بداية الدفاتر. إذا اختلّ التوازن فهناك ما تجاوز محرك القيود.
          </p>
        </div>
        {tb && (
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tb.balanced ? "bg-app-status-positive/10 text-app-status-positive" : "bg-app-status-danger/10 text-app-status-danger"}`}>
            {tb.balanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {tb.balanced ? "متوازن" : "غير متوازن!"}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-app-label-secondary border-b border-app-separator bg-app-bg-secondary">
              <tr>
                <th className="px-4 py-2.5 text-start font-bold">الرمز</th>
                <th className="px-4 py-2.5 text-start font-bold">الحساب</th>
                <th className="px-4 py-2.5 text-start font-bold">النوع</th>
                <th className="px-4 py-2.5 text-end font-bold">مدين</th>
                <th className="px-4 py-2.5 text-end font-bold">دائن</th>
                <th className="px-4 py-2.5 text-end font-bold">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {tb?.rows.map((row) => (
                <tr key={row.account_code} className="hover:bg-app-fill-f1">
                  <td className="px-4 py-2 font-mono font-bold text-app-accent">{row.account_code}</td>
                  <td className="px-4 py-2 text-app-label-primary">{row.name}</td>
                  <td className="px-4 py-2 text-app-label-secondary">{ACCOUNT_TYPE_LABEL[row.type]}</td>
                  <td className="px-4 py-2 text-end font-mono">{fmt(row.debit)}</td>
                  <td className="px-4 py-2 text-end font-mono">{fmt(row.credit)}</td>
                  <td className={`px-4 py-2 text-end font-mono font-bold ${row.balance < 0 ? "text-app-status-danger" : "text-app-label-primary"}`}>
                    {fmt(row.balance)}
                  </td>
                </tr>
              ))}
              {tb?.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-app-label-tertiary">لا توجد حركة مُرحّلة بعد.</td>
                </tr>
              )}
            </tbody>
            {tb && tb.rows.length > 0 && (
              <tfoot className="border-t-2 border-app-separator bg-app-bg-secondary font-bold">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-app-label-primary">الإجمالي</td>
                  <td className="px-4 py-2.5 text-end font-mono">{fmt(tb.total_debit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono">{fmt(tb.total_credit)}</td>
                  <td className="px-4 py-2.5 text-end font-mono">
                    {fmt(Math.abs(tb.total_debit - tb.total_credit))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
};
