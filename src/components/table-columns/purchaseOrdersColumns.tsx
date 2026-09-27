import { useMemo, type ReactNode } from "react";
import { Building, ArrowRight, Edit } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { formatNumber } from "../../lib/utils/format";
import { PurchaseOrder, PurchaseOrderStatus, getPurchaseOrderTotal } from "../../types/procurement";

export interface UsePurchaseOrdersColumnsArgs {
  getStatusBadge: (status: PurchaseOrderStatus) => ReactNode;
  onOpenDetail: (order: PurchaseOrder) => void;
  onEditItems?: (order: PurchaseOrder) => void;
}

export function usePurchaseOrdersColumns({
  getStatusBadge,
  onOpenDetail,
  onEditItems,
}: UsePurchaseOrdersColumnsArgs): ColumnDef<PurchaseOrder, unknown>[] {
  return useMemo<ColumnDef<PurchaseOrder, unknown>[]>(
    () => [
      {
        id: "supplier",
        header: "المورد",
        accessorFn: (ord) => ord.supplier?.name || "مورد غير محدد",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-app-accent" />
            <span>{row.original.supplier?.name || "مورد غير محدد"}</span>
          </div>
        ),
      },
      {
        id: "kind",
        header: "النوع",
        accessorFn: (ord) => ord.kind,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              row.original.kind === "local"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-purple-50 text-purple-700 border border-purple-200"
            }`}
          >
            {row.original.kind === "local" ? "محلي" : "أجنبي"}
          </span>
        ),
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
        accessorFn: (ord) => {
          const items = ord.items?.data;
          if (items && items.length > 1) {
            return items.length;
          }
          if (items && items.length === 1) {
            return Number(items[0].unit_price);
          }
          return Number(ord.negotiated_price);
        },
        cell: ({ row }) => {
          const items = row.original.items?.data;
          if (items && items.length > 1) {
            return `${items.length} أصناف`;
          }
          if (items && items.length === 1) {
            return `${formatNumber(items[0].unit_price)} ${row.original.currency}`;
          }
          return `${formatNumber(row.original.negotiated_price)} ${row.original.currency}`;
        },
        meta: { className: "font-mono" },
      },
      {
        id: "total_amount",
        header: "إجمالي الاعتماد المستهدف",
        accessorFn: (ord) => getPurchaseOrderTotal(ord),
        cell: ({ row }) =>
          `${formatNumber(getPurchaseOrderTotal(row.original))} ${row.original.currency}`,
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
          <div className="flex items-center justify-end gap-1.5">
            {row.original.status === "draft" && onEditItems && (
              <button
                onClick={() => onEditItems(row.original)}
                className="inline-flex items-center gap-1 rounded-lg border border-app-accent/30 bg-app-accent-subtle px-2.5 py-1 text-xs font-semibold text-app-accent hover:bg-app-accent hover:text-white transition-colors"
                title="تعديل بنود الأمر"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>تعديل</span>
              </button>
            )}
            <button
              onClick={() => onOpenDetail(row.original)}
              className="inline-flex items-center gap-1 rounded-lg bg-app-bg-secondary px-3 py-1 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
            >
              <span>تتبع التفاصيل</span>
              <ArrowRight className="h-3.5 w-3.5 rotate-180 text-app-accent" />
            </button>
          </div>
        ),
      },
    ],
    [getStatusBadge, onOpenDetail, onEditItems]
  );
}
