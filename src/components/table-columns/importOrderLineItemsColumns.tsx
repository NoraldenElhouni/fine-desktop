import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { formatNumber } from "../../lib/utils/format";
import { ImportOrderItem } from "../../types/procurement";

export function useImportOrderLineItemsColumns(): ColumnDef<ImportOrderItem, unknown>[] {
  return useMemo<ColumnDef<ImportOrderItem, unknown>[]>(
    () => [
      {
        id: "item",
        header: "الصنف",
        cell: ({ row }) => row.original.inventory_item?.name ?? "—",
        meta: { className: "font-semibold" },
      },
      {
        id: "sku",
        header: "SKU",
        cell: ({ row }) => row.original.inventory_item?.sku ?? "—",
        meta: { className: "font-mono text-app-label-secondary" },
      },
      {
        id: "quantity",
        header: "الكمية",
        cell: ({ row }) => (
          <>
            {formatNumber(Number(row.original.quantity))}{" "}
            <span className="text-[10px] text-app-label-tertiary">
              {row.original.inventory_item?.unit_of_measure ?? ""}
            </span>
          </>
        ),
        meta: { align: "end", className: "font-mono" },
      },
      {
        id: "unit_price",
        header: "سعر الوحدة",
        cell: ({ row }) => `${formatNumber(Number(row.original.unit_price))} ${row.original.currency}`,
        meta: { align: "end", className: "font-mono" },
      },
      {
        id: "line_total",
        header: "الإجمالي",
        cell: ({ row }) => `${formatNumber(Number(row.original.line_total))} ${row.original.currency}`,
        meta: { align: "end", className: "font-mono font-bold text-app-accent" },
      },
    ],
    []
  );
}
