import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { formatNumber } from "../../lib/utils/format";
import { PurchaseOrderItem } from "../../types/procurement";

export function usePurchaseOrderLineItemsColumns(): ColumnDef<PurchaseOrderItem, unknown>[] {
  return useMemo<ColumnDef<PurchaseOrderItem, unknown>[]>(
    () => [
      {
        id: "item",
        header: "الصنف",
        cell: ({ row }) => row.original.inventory_item?.name ?? "—",
        meta: { className: "font-semibold" },
      },
      {
        id: "code",
        header: "كود الصنف",
        cell: ({ row }) => row.original.inventory_item?.code ?? "—",
        meta: { className: "font-mono text-app-label-secondary" },
      },
      {
        id: "quantity",
        header: "الكمية",
        cell: ({ row }) => {
          const qty = Number(row.original.quantity);
          const received =
            row.original.received_quantity !== null && row.original.received_quantity !== undefined
              ? Number(row.original.received_quantity)
              : null;
          const uom = row.original.inventory_item?.unit_of_measure ?? "";
          return (
            <div className="flex flex-col items-end">
              <span>
                {formatNumber(qty)} <span className="text-[10px] text-app-label-tertiary">{uom}</span>
              </span>
              {received !== null && (
                <span className="text-[10px] text-app-label-secondary">
                  مستلم: {formatNumber(received)}
                </span>
              )}
            </div>
          );
        },
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
