import React, { useMemo, useState } from "react";
import { AlertTriangle, Download, TrendingUp } from "lucide-react";
import { useSalesMarginReport } from "../../hooks/useSalesMarginReport";
import type { SalesMarginGroupBy, SalesMarginRow } from "../../api/endpoints/salesMargin";
import { formatNumber } from "../../lib/utils/format";
import { downloadCsv, toCsv, type CsvColumn } from "../../lib/utils/csv";

interface CsvExportRow {
  label: string;
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  margin_pct: string;
}

export const SalesMarginReportPage: React.FC = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [groupBy, setGroupBy] = useState<SalesMarginGroupBy>("item");

  const queryParams = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      group_by: groupBy,
    }),
    [from, to, groupBy],
  );

  const report = useSalesMarginReport(queryParams);
  const rows: SalesMarginRow[] = useMemo(() => report.data?.rows ?? [], [report.data]);

  const handleExportCsv = () => {
    if (!report.data || rows.length === 0) return;

    const labelHeader =
      groupBy === "item"
        ? "الصنف"
        : groupBy === "category"
          ? "الفئة"
          : groupBy === "client"
            ? "العميل"
            : "رقم الفاتورة";

    const csvColumns: CsvColumn<CsvExportRow>[] = [
      { header: labelHeader, value: (r) => r.label },
      { header: "الكمية المباعة", value: (r) => r.quantity },
      { header: "إجمالي الإيرادات", value: (r) => r.revenue },
      { header: "التكلفة الفعلية", value: (r) => r.cost },
      { header: "هامش الربح", value: (r) => r.margin },
      { header: "نسبة الهامش", value: (r) => r.margin_pct },
    ];

    const exportRows: CsvExportRow[] = rows.map((r) => ({
      label: r.label,
      quantity: r.quantity,
      revenue: r.revenue,
      cost: r.cost,
      margin: r.margin,
      margin_pct: r.margin_pct !== null ? `${r.margin_pct}%` : "-",
    }));

    exportRows.push({
      label: "الإجمالي",
      quantity: report.data.totals.quantity,
      revenue: report.data.totals.revenue,
      cost: report.data.totals.cost,
      margin: report.data.totals.margin,
      margin_pct: report.data.totals.margin_pct !== null ? `${report.data.totals.margin_pct}%` : "-",
    });

    const csv = toCsv(exportRows, csvColumns);
    downloadCsv(`هامش-ربح-المبيعات-${groupBy}-${from || "all"}-${to || "all"}.csv`, csv);
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-app-accent" />
          هامش ربح المبيعات
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          تقرير هامش الربح الإجمالي (الإيرادات ناقص التكلفة الفعلية) مجمّعاً حسب الصنف، الفئة، العميل، أو الفاتورة.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-app-label-secondary">
            من
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-app-label-secondary">
            إلى
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-app-label-secondary">
            التجميع
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as SalesMarginGroupBy)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            >
              <option value="item">حسب الصنف</option>
              <option value="category">حسب الفئة</option>
              <option value="client">حسب العميل</option>
              <option value="sale">حسب الفاتورة</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!report.data || rows.length === 0}
          className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          تصدير CSV
        </button>
      </div>

      {report.data && report.data.lines_missing_cost > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            تنبيه: يوجد {report.data.lines_missing_cost} سطر مبيعات بدون تكلفة فعلية مسجلة — تم احتساب تكلفتها بـ 0.
          </span>
        </div>
      )}

      {report.isLoading ? (
        <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
      ) : (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-semibold">
                <tr>
                  <th className="px-4 py-3 text-right">
                    {groupBy === "item" && "الصنف"}
                    {groupBy === "category" && "الفئة"}
                    {groupBy === "client" && "العميل"}
                    {groupBy === "sale" && "رقم الفاتورة"}
                  </th>
                  <th className="px-4 py-3 text-left">الكمية المباعة</th>
                  <th className="px-4 py-3 text-left">إجمالي الإيرادات</th>
                  <th className="px-4 py-3 text-left">التكلفة الفعلية</th>
                  <th className="px-4 py-3 text-left">هامش الربح</th>
                  <th className="px-4 py-3 text-left">نسبة الهامش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-separator text-app-label-primary">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-app-label-tertiary">
                      لا توجد مبيعات في هذه الفترة.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.key} className="hover:bg-app-fill-f1/50 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{row.label}</td>
                      <td className="px-4 py-2.5 text-left font-mono">{formatNumber(row.quantity)}</td>
                      <td className="px-4 py-2.5 text-left font-mono">{formatNumber(row.revenue)}</td>
                      <td className="px-4 py-2.5 text-left font-mono">{formatNumber(row.cost)}</td>
                      <td
                        className={`px-4 py-2.5 text-left font-mono font-bold ${
                          row.margin >= 0 ? "text-app-status-positive" : "text-app-status-danger"
                        }`}
                      >
                        {formatNumber(row.margin)}
                      </td>
                      <td className="px-4 py-2.5 text-left font-mono">
                        {row.margin_pct !== null ? `${formatNumber(row.margin_pct)}%` : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && report.data && (
                <tfoot className="border-t-2 border-app-separator bg-app-bg-secondary font-bold text-app-label-primary">
                  <tr>
                    <td className="px-4 py-3">الإجمالي</td>
                    <td className="px-4 py-3 text-left font-mono">{formatNumber(report.data.totals.quantity)}</td>
                    <td className="px-4 py-3 text-left font-mono">{formatNumber(report.data.totals.revenue)}</td>
                    <td className="px-4 py-3 text-left font-mono">{formatNumber(report.data.totals.cost)}</td>
                    <td
                      className={`px-4 py-3 text-left font-mono ${
                        report.data.totals.margin >= 0 ? "text-app-status-positive" : "text-app-status-danger"
                      }`}
                    >
                      {formatNumber(report.data.totals.margin)}
                    </td>
                    <td className="px-4 py-3 text-left font-mono">
                      {report.data.totals.margin_pct !== null
                        ? `${formatNumber(report.data.totals.margin_pct)}%`
                        : "-"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesMarginReportPage;
