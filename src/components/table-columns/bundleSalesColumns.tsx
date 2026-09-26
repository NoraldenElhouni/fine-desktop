import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import type { BundleSalesRow } from "../../api/endpoints/bundles";
import { formatNumber } from "../../lib/utils/format";

export function useBundleSalesColumns(): ColumnDef<BundleSalesRow, unknown>[] {
  return useMemo<ColumnDef<BundleSalesRow, unknown>[]>(
    () => [
      {
        id: "bundle_name",
        accessorKey: "bundle_name",
        header: "الحزمة",
        meta: { className: "font-bold text-app-label-primary" },
        cell: ({ row }) => row.original.bundle_name,
      },
      {
        accessorKey: "orders_count",
        header: "عدد الطلبات",
        meta: { align: "end" },
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.orders_count)}</span>,
      },
      {
        accessorKey: "total_quantity",
        header: "إجمالي الكمية",
        meta: { align: "end" },
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.total_quantity)}</span>,
      },
      {
        accessorKey: "total_revenue",
        header: "إجمالي الإيرادات",
        meta: { align: "end" },
        cell: ({ row }) => (
          <span className="font-mono font-bold text-app-status-positive">
            {formatNumber(row.original.total_revenue)}
          </span>
        ),
      },
    ],
    [],
  );
}
