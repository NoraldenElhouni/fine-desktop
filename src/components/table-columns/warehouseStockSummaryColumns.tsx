import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { WarehouseStockSummaryRow } from "../../api/endpoints/inventory";
import { formatNumber } from "../../lib/utils/format";

export function useWarehouseStockSummaryColumns(): ColumnDef<WarehouseStockSummaryRow, unknown>[] {
  return useMemo<ColumnDef<WarehouseStockSummaryRow, unknown>[]>(
    () => [
      {
        id: "item",
        header: "الصنف",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-app-label-primary">{row.original.item_name}</div>
            <div className="text-xs text-app-label-tertiary font-mono">{row.original.item_code}</div>
          </div>
        ),
      },
      {
        id: "total_quantity",
        header: "الكمية المتاحة",
        meta: { className: "font-mono text-app-label-primary" },
        cell: ({ row }) => `${formatNumber(row.original.total_quantity)} ${row.original.uom}`,
      },
      {
        id: "avg_unit_cost",
        header: "متوسط سعر الوحدة",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => `${formatNumber(row.original.avg_unit_cost)} LYD`,
      },
      {
        id: "total_value",
        header: "القيمة الإجمالية",
        meta: { className: "font-mono text-app-label-primary" },
        cell: ({ row }) => `${formatNumber(row.original.total_value)} LYD`,
      },
      {
        id: "lots_count",
        header: "عدد الدفعات",
        meta: { align: "center", className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => row.original.lots_count,
      },
    ],
    [],
  );
}
