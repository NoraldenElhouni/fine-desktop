import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { InventoryMovement } from "../../api/endpoints/inventory";
import { formatNumber } from "../../lib/utils/format";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  receipt: "استلام",
  issue: "صرف",
  transfer: "تحويل",
  adjustment: "تسوية",
  consumption: "استهلاك إنتاج",
  production_output: "ناتج إنتاج",
  byproduct_yield: "منتج ثانوي",
  sale: "بيع",
};

export function useInventoryMovementColumns(): ColumnDef<InventoryMovement, unknown>[] {
  return useMemo<ColumnDef<InventoryMovement, unknown>[]>(
    () => [
      {
        id: "created_at",
        header: "التاريخ",
        meta: { className: "font-mono text-xs text-app-label-secondary" },
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString("ar-LY"),
      },
      {
        id: "sku",
        header: "الصنف (رمز)",
        meta: { className: "font-mono text-app-label-primary" },
        cell: ({ row }) => row.original.sku,
      },
      {
        id: "movement_type",
        header: "نوع الحركة",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-fill-f1 text-app-label-secondary">
            {MOVEMENT_TYPE_LABELS[row.original.movement_type] ?? row.original.movement_type}
          </span>
        ),
      },
      {
        id: "quantity_delta",
        header: "الكمية",
        meta: {
          className: "font-mono font-bold",
        },
        cell: ({ row }) => {
          const delta = Number(row.original.quantity_delta);
          return (
            <span className={delta >= 0 ? "text-emerald-600" : "text-app-status-danger"}>
              {delta >= 0 ? "+" : ""}
              {formatNumber(delta)}
            </span>
          );
        },
      },
      {
        id: "unit_cost",
        header: "سعر الوحدة",
        meta: { className: "font-mono text-app-label-primary" },
        cell: ({ row }) => `${formatNumber(row.original.unit_cost)} LYD`,
      },
      {
        id: "value",
        header: "القيمة",
        meta: { className: "font-mono text-app-label-primary" },
        cell: ({ row }) =>
          `${formatNumber(Math.abs(Number(row.original.quantity_delta)) * Number(row.original.unit_cost))} LYD`,
      },
      {
        id: "reference",
        header: "المستند المرجعي",
        enableSorting: false,
        meta: { className: "text-xs text-app-label-tertiary" },
        cell: ({ row }) => row.original.reference_document_type ?? "--",
      },
    ],
    [],
  );
}
