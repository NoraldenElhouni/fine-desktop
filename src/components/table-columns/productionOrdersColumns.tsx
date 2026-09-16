import { useMemo } from "react";
import { Hammer } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { ORDER_STATUS_LABEL, ProductionOrder } from "../../api/endpoints/furniture";
import { formatNumber } from "../../lib/utils/format";

export interface UseProductionOrdersColumnsArgs {
  onOpenOrder: (order: ProductionOrder) => void;
}

export function useProductionOrdersColumns({
  onOpenOrder,
}: UseProductionOrdersColumnsArgs): ColumnDef<ProductionOrder, unknown>[] {
  return useMemo<ColumnDef<ProductionOrder, unknown>[]>(
    () => [
      {
        id: "order_number",
        accessorKey: "order_number",
        header: "الطلب",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => row.original.order_number,
      },
      {
        id: "product",
        accessorFn: (o) => o.product?.name ?? "—",
        header: "المنتج",
        cell: ({ row }) => row.original.product?.name ?? "—",
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "الكمية",
        meta: { className: "font-bold" },
        cell: ({ row }) => row.original.quantity,
      },
      {
        id: "material_cost",
        accessorKey: "material_cost",
        header: "المواد",
        meta: { className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => formatNumber(row.original.material_cost),
      },
      {
        id: "labor_cost",
        accessorKey: "labor_cost",
        header: "العمالة",
        meta: { className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => formatNumber(row.original.labor_cost),
      },
      {
        id: "status",
        header: "الحالة",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
            {ORDER_STATUS_LABEL[row.original.status]}
          </span>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => (
          <button
            onClick={() => onOpenOrder(row.original)}
            className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
          >
            <Hammer className="w-3.5 h-3.5" /> فتح
          </button>
        ),
      },
    ],
    [onOpenOrder],
  );
}
