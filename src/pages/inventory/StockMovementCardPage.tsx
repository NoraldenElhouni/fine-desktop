import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Download, History, Package } from "lucide-react";
import { useStockMovementCard } from "../../hooks/useStockMovementCard";
import { useWarehouses } from "../../hooks/useWarehouses";
import { formatNumber, formatDateTime } from "../../lib/utils/format";
import { downloadCsv, toCsv, type CsvColumn } from "../../lib/utils/csv";
import type { StockMovementCardRow } from "../../api/endpoints/stockMovementCard";

const GROUP_LABELS: Record<string, string> = {
  "purchase receipt": "استلام مشتريات",
  purchase_receipt: "استلام مشتريات",
  "sale issue": "صرف مبيعات",
  sale_issue: "صرف مبيعات",
  "internal transfer": "تحويل داخلي",
  internal_transfer: "تحويل داخلي",
  cutting: "قص وتفصيل",
  scrap: "هالك وخردة",
  adjustment: "تسوية مخزنية",
  other: "حركة أخرى",
};

interface CsvExportRow {
  date: string;
  group: string;
  warehouse: string;
  reference: string;
  reason: string;
  in: number | string;
  out: number | string;
  balance: number | string;
}

export const StockMovementCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const { data: warehouses } = useWarehouses();

  const queryParams = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      warehouse_id: warehouseId || undefined,
    }),
    [from, to, warehouseId],
  );

  const { data: report, isLoading, isError } = useStockMovementCard(id, queryParams);

  const rows: StockMovementCardRow[] = useMemo(() => report?.rows ?? [], [report]);

  const handleExportCsv = () => {
    if (!report) return;

    const csvColumns: CsvColumn<CsvExportRow>[] = [
      { header: "التاريخ", value: (r) => r.date },
      { header: "نوع الحركة", value: (r) => r.group },
      { header: "المخزن", value: (r) => r.warehouse },
      { header: "المرجع", value: (r) => r.reference },
      { header: "البيان", value: (r) => r.reason },
      { header: "وارد", value: (r) => r.in },
      { header: "صادر", value: (r) => r.out },
      { header: "الرصيد", value: (r) => r.balance },
    ];

    const exportRows: CsvExportRow[] = [
      {
        date: report.from || "-",
        group: "رصيد أول المدة",
        warehouse: "-",
        reference: "-",
        reason: "رصيد افتتاحي",
        in: "-",
        out: "-",
        balance: report.opening_balance,
      },
    ];

    rows.forEach((r) => {
      exportRows.push({
        date: r.date ? formatDateTime(r.date) : "-",
        group: GROUP_LABELS[r.group] || r.group,
        warehouse: r.warehouse?.name || "-",
        reference: r.reference_document_type
          ? `${r.reference_document_type} ${r.reference_id?.slice(0, 8) ?? ""}`
          : "-",
        reason: r.reason,
        in: r.in > 0 ? r.in : "-",
        out: r.out > 0 ? r.out : "-",
        balance: r.balance,
      });
    });

    exportRows.push({
      date: report.to || "-",
      group: "رصيد آخر المدة",
      warehouse: "-",
      reference: "-",
      reason: "الإجمالي",
      in: report.totals.in,
      out: report.totals.out,
      balance: report.closing_balance,
    });

    const csv = toCsv(exportRows, csvColumns);
    downloadCsv(`كرت-حركة-الصنف-${report.item.code}-${from || "all"}-${to || "all"}.csv`, csv);
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary p-2 hover:bg-app-fill-f1 transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-4 h-4 text-app-label-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
              <History className="w-7 h-7 text-app-accent" />
              كرت حركة الصنف
            </h1>
            <p className="text-xs text-app-label-secondary mt-1 flex items-center gap-2">
              <Package className="w-4 h-4 text-app-label-tertiary" />
              <span className="font-semibold text-app-label-primary">
                {report?.item.name ?? "الصنف"}
              </span>
              <span className="font-mono text-app-label-tertiary">
                ({report?.item.code ?? id})
              </span>
              {report?.item.unit && (
                <span className="rounded-md bg-app-fill-f1 px-2 py-0.5 text-[10px] text-app-label-secondary">
                  {report.item.unit}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!report || rows.length === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3.5 py-2 text-xs font-medium text-app-label-primary hover:bg-app-fill-f1 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-app-accent" />
          تصدير CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-app-label-secondary">رصيد أول المدة</div>
          <div className="text-xl font-bold font-mono text-app-label-primary mt-1">
            {formatNumber(report?.opening_balance ?? 0, { maximumFractionDigits: 4 })}
          </div>
        </div>

        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-emerald-600">إجمالي الوارد</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            +{formatNumber(report?.totals.in ?? 0, { maximumFractionDigits: 4 })}
          </div>
        </div>

        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-rose-600">إجمالي الصادر</div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">
            -{formatNumber(report?.totals.out ?? 0, { maximumFractionDigits: 4 })}
          </div>
        </div>

        <div className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
          <div className="text-xs font-semibold text-app-accent">رصيد آخر المدة</div>
          <div className="text-xl font-bold font-mono text-app-label-primary mt-1">
            {formatNumber(report?.closing_balance ?? 0, { maximumFractionDigits: 4 })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          من
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          >
          </input>
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          إلى
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          >
          </input>
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          المخزن
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          >
            <option value="">كل المخازن</option>
            {warehouses?.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-xs">
            <thead>
              <tr className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
                <th className="px-4 py-3 text-start font-medium">التاريخ والوقت</th>
                <th className="px-4 py-3 text-start font-medium">نوع الحركة</th>
                <th className="px-4 py-3 text-start font-medium">المخزن</th>
                <th className="px-4 py-3 text-start font-medium">المرجع / البيان</th>
                <th className="px-4 py-3 text-end font-medium">وارد (+)</th>
                <th className="px-4 py-3 text-end font-medium">صادر (-)</th>
                <th className="px-4 py-3 text-end font-medium">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {/* Opening balance row */}
              <tr className="bg-app-bg-secondary/40 font-semibold">
                <td className="px-4 py-2.5 text-start font-mono text-app-label-tertiary">
                  {from || "البداية"}
                </td>
                <td className="px-4 py-2.5 text-start" colSpan={3}>
                  رصيد أول المدة
                </td>
                <td className="px-4 py-2.5 text-end font-mono text-app-label-tertiary">-</td>
                <td className="px-4 py-2.5 text-end font-mono text-app-label-tertiary">-</td>
                <td className="px-4 py-2.5 text-end font-mono font-bold">
                  {formatNumber(report?.opening_balance ?? 0, { maximumFractionDigits: 4 })}
                </td>
              </tr>

              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-secondary">
                    جاري تحميل الحركات...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-rose-600">
                    حدث خطأ أثناء تحميل كرت حركة الصنف.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-secondary">
                    لا توجد حركات مسجلة لهذا الصنف خلال الفترة المحددة.
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-app-fill-f1/50 transition-colors">
                    <td className="px-4 py-2.5 text-start font-mono text-app-label-secondary">
                      {row.date ? formatDateTime(row.date) : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-start">
                      <span className="inline-block rounded-md bg-app-fill-f1 px-2 py-0.5 text-[11px] font-medium text-app-label-primary">
                        {GROUP_LABELS[row.group] || row.group}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-start text-app-label-secondary">
                      {row.warehouse?.name || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-start">
                      <div className="flex flex-col">
                        {row.reference_document_type && (
                          <span className="font-mono text-[11px] text-app-accent">
                            {row.reference_document_type}{" "}
                            {row.reference_id ? row.reference_id.slice(0, 8) : ""}
                          </span>
                        )}
                        <span className="text-app-label-secondary text-[11px]">
                          {row.reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-end font-mono text-emerald-600 font-medium">
                      {row.in > 0 ? `+${formatNumber(row.in, { maximumFractionDigits: 4 })}` : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-end font-mono text-rose-600 font-medium">
                      {row.out > 0 ? `-${formatNumber(row.out, { maximumFractionDigits: 4 })}` : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-end font-mono font-bold">
                      {formatNumber(row.balance, { maximumFractionDigits: 4 })}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              {/* Closing balance row */}
              <tr className="border-t-2 border-app-separator bg-app-bg-secondary font-bold text-app-label-primary">
                <td className="px-4 py-3 text-start font-mono text-app-label-tertiary">
                  {to || "النهاية"}
                </td>
                <td className="px-4 py-3 text-start" colSpan={3}>
                  رصيد آخر المدة والإجماليات
                </td>
                <td className="px-4 py-3 text-end font-mono text-emerald-600">
                  +{formatNumber(report?.totals.in ?? 0, { maximumFractionDigits: 4 })}
                </td>
                <td className="px-4 py-3 text-end font-mono text-rose-600">
                  -{formatNumber(report?.totals.out ?? 0, { maximumFractionDigits: 4 })}
                </td>
                <td className="px-4 py-3 text-end font-mono font-extrabold text-app-accent">
                  {formatNumber(report?.closing_balance ?? 0, { maximumFractionDigits: 4 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockMovementCardPage;
