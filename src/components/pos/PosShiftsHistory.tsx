import React, { useState } from "react";
import { History } from "lucide-react";
import { POS_SHIFT_STATUS_LABEL, PosShift } from "../../api/endpoints/sales";
import { usePosShifts } from "../../hooks/useSales";
import { formatDateTime, formatNumber, localDateIso } from "../../lib/utils/format";

interface PosShiftsHistoryProps {
  onOpenReport: (shift: PosShift) => void;
}

const amount = (v: number | string | null | undefined) => (v === null || v === undefined ? "—" : formatNumber(v));

/** The unit's cashier shifts by date; a row opens its X/Z report. */
export const PosShiftsHistory: React.FC<PosShiftsHistoryProps> = ({ onOpenReport }) => {
  const [from, setFrom] = useState(localDateIso());
  const [to, setTo] = useState(localDateIso());
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = usePosShifts({ from: from || undefined, to: to || undefined, page, per_page: 20 });
  const shifts = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;

  return (
    <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-app-separator bg-app-bg-secondary px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
          <History className="h-4 w-4 text-app-accent" />
          الورديات
        </div>
        <div className="flex items-end gap-2 text-xs">
          <label className="space-y-1">
            <span className="block text-[11px] text-app-label-secondary">من</span>
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              className="rounded-xl border border-app-separator bg-app-bg-primary px-2 py-1.5 text-xs focus:border-app-accent focus:outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-[11px] text-app-label-secondary">إلى</span>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className="rounded-xl border border-app-separator bg-app-bg-primary px-2 py-1.5 text-xs focus:border-app-accent focus:outline-none"
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-app-label-secondary">جاري تحميل الورديات...</div>
      ) : isError ? (
        <div className="py-12 text-center text-xs text-app-status-danger">تعذّر تحميل الورديات.</div>
      ) : shifts.length === 0 ? (
        <div className="py-12 text-center text-xs text-app-label-secondary">لا توجد ورديات في هذه الفترة.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
                <th className="px-4 py-2.5 text-start font-semibold">رقم الوردية</th>
                <th className="px-3 py-2.5 text-start font-semibold">الخزينة</th>
                <th className="px-3 py-2.5 text-start font-semibold">الكاشير</th>
                <th className="px-3 py-2.5 text-start font-semibold">الفتح</th>
                <th className="px-3 py-2.5 text-start font-semibold">الإغلاق</th>
                <th className="px-3 py-2.5 text-end font-semibold">المتوقع</th>
                <th className="px-3 py-2.5 text-end font-semibold">المعدود</th>
                <th className="px-3 py-2.5 text-end font-semibold">الفرق</th>
                <th className="px-4 py-2.5 text-center font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {shifts.map((s) => {
                const diff = s.difference === null || s.difference === undefined ? null : Number(s.difference);
                return (
                  <tr
                    key={s.id}
                    onClick={() => onOpenReport(s)}
                    className="cursor-pointer hover:bg-app-fill-f1 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono font-bold text-app-accent">{s.number}</td>
                    <td className="px-3 py-2.5">{s.cash_account?.name ?? "—"}</td>
                    <td className="px-3 py-2.5">{s.cashier?.name ?? "—"}</td>
                    <td className="px-3 py-2.5 font-mono">{formatDateTime(s.opened_at)}</td>
                    <td className="px-3 py-2.5 font-mono">{s.closed_at ? formatDateTime(s.closed_at) : "—"}</td>
                    <td className="px-3 py-2.5 text-end font-mono">{amount(s.expected_cash)}</td>
                    <td className="px-3 py-2.5 text-end font-mono">{amount(s.counted_cash)}</td>
                    <td
                      className={`px-3 py-2.5 text-end font-mono font-bold ${
                        diff === null || Math.abs(diff) < 0.005
                          ? "text-app-label-primary"
                          : diff < 0
                            ? "text-app-status-danger"
                            : "text-app-status-warning"
                      }`}
                    >
                      {amount(s.difference)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          s.status === "open"
                            ? "bg-app-status-positive/15 text-app-status-positive"
                            : "bg-app-fill-f1 text-app-label-secondary"
                        }`}
                      >
                        {POS_SHIFT_STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-app-separator px-5 py-2 text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-app-separator px-3 py-1 disabled:opacity-40"
          >
            السابق
          </button>
          <span className="font-mono text-app-label-secondary">{page} / {lastPage}</span>
          <button
            type="button"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-app-separator px-3 py-1 disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}
    </section>
  );
};
