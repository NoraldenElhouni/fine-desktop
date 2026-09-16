import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { SalesOrderLine } from "../../api/endpoints/sales";
import { formatNumber } from "../../lib/utils/format";

export function useSalesOrderLinesColumns(): ColumnDef<SalesOrderLine, unknown>[] {
  return useMemo<ColumnDef<SalesOrderLine, unknown>[]>(
    () => [
      {
        id: "item",
        header: "الصنف",
        cell: ({ row }) => (
          <>
            {row.original.inventory_item?.name}
            <span className="text-app-label-tertiary font-mono ms-2">{row.original.inventory_item?.sku}</span>
          </>
        ),
      },
      {
        id: "quantity",
        header: "الكمية",
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) => Number(row.original.quantity),
      },
      {
        id: "unit_price",
        header: "السعر",
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) => formatNumber(row.original.unit_price),
      },
      {
        id: "line_total",
        header: "الإجمالي",
        meta: { align: "end", className: "font-mono font-bold" },
        cell: ({ row }) => formatNumber(Number(row.original.quantity) * Number(row.original.unit_price)),
      },
      {
        id: "unit_cost_actual",
        header: "التكلفة الفعلية",
        meta: { align: "end", className: "font-mono text-app-label-secondary" },
        cell: ({ row }) =>
          Number(row.original.unit_cost_actual) > 0 ? formatNumber(row.original.unit_cost_actual) : "—",
      },
    ],
    [],
  );
}
