import { useMemo, type ReactNode } from "react";
import { Building, ArrowRight } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { formatNumber } from "../../lib/utils/format";
import { ImportOrder, ImportOrderStatus } from "../../types/procurement";

export interface UseImportOrdersColumnsArgs {
  getStatusBadge: (status: ImportOrderStatus) => ReactNode;
  onOpenDetail: (order: ImportOrder) => void;
}

export function useImportOrdersColumns({
  getStatusBadge,
  onOpenDetail,
}: UseImportOrdersColumnsArgs): ColumnDef<ImportOrder, unknown>[] {
  return useMemo<ColumnDef<ImportOrder, unknown>[]>(
    () => [
      {
        id: "supplier",
        header: "المورد الخارجي",
        accessorFn: (ord) => ord.supplier?.name || "مورد غير محدد",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-app-accent" />
            <span>{row.original.supplier?.name || "مورد غير محدد"}</span>
          </div>
        ),
        meta: { className: "font-bold" },
      },
      {
        id: "quantity",
        header: "الكمية المتعاقد عليها",
        accessorFn: (ord) => Number(ord.quantity),
        cell: ({ row }) => `${formatNumber(row.original.quantity)} وحدة`,
        meta: { className: "font-mono font-semibold" },
      },
      {
        id: "negotiated_price",
        header: "سعر الوحدة النقدية",
        accessorFn: (ord) => Number(ord.negotiated_price),
        cell: ({ row }) => `${formatNumber(row.original.negotiated_price)} ${row.original.currency}`,
        meta: { className: "font-mono" },
      },
      {
        id: "total_amount",
        header: "إجمالي الاعتماد المستهدف",
        accessorFn: (ord) => Number(ord.negotiated_price) * Number(ord.quantity),
        cell: ({ row }) =>
          `${formatNumber(Number(row.original.negotiated_price) * Number(row.original.quantity))} ${row.original.currency}`,
        meta: { className: "font-mono font-bold text-emerald-700" },
      },
      {
        id: "status",
        header: "الحالة الحالية",
        enableSorting: false,
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: "actions",
        header: "الإجراء",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => (
          <button
            onClick={() => onOpenDetail(row.original)}
            className="inline-flex items-center gap-1 rounded-lg bg-app-bg-secondary px-3 py-1 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
          >
            <span>تتبع التفاصيل</span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-app-accent" />
          </button>
        ),
      },
    ],
    [getStatusBadge, onOpenDetail]
  );
}
