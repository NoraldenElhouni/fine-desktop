import { useMemo } from "react";
import { Check } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { StockAdjustmentRequest } from "../../api/endpoints/inventory";

export interface UseStockAdjustmentsColumnsArgs {
  onApprove: (id: string) => void;
  isApproving: boolean;
}

export function useStockAdjustmentsColumns({
  onApprove,
  isApproving,
}: UseStockAdjustmentsColumnsArgs): ColumnDef<StockAdjustmentRequest, unknown>[] {
  return useMemo<ColumnDef<StockAdjustmentRequest, unknown>[]>(
    () => [
      {
        id: "lot_number",
        accessorFn: (adj) => adj.stock_lot?.lot_number || adj.stock_lot_id,
        header: "رقم الدفعة",
        meta: { className: "font-mono font-bold text-app-label-primary" },
        cell: ({ row }) => row.original.stock_lot?.lot_number || row.original.stock_lot_id,
      },
      {
        id: "reason_code",
        header: "رمز السبب",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
            {row.original.reason_code}
          </span>
        ),
      },
      {
        id: "quantity_delta",
        accessorKey: "quantity_delta",
        header: "فرق الكمية",
        meta: { className: "font-mono font-bold" },
        cell: ({ row }) => (
          <span className={row.original.quantity_delta < 0 ? "text-app-status-danger" : "text-app-status-positive"}>
            {row.original.quantity_delta > 0 ? `+${row.original.quantity_delta}` : row.original.quantity_delta}
          </span>
        ),
      },
      {
        id: "requested_by",
        accessorFn: (adj) => adj.requested_by?.name || "مستخدم",
        header: "مقدَّم من",
        meta: { className: "font-medium text-app-label-secondary" },
        cell: ({ row }) => row.original.requested_by?.name || "مستخدم",
      },
      {
        id: "status",
        header: "الحالة",
        enableSorting: false,
        cell: ({ row }) => (
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              row.original.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : row.original.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "إجراء",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const adj = row.original;
          return adj.status === "pending" ? (
            <button
              onClick={() => onApprove(adj.id)}
              disabled={isApproving}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-app-accent text-white font-bold text-xs rounded-xl hover:opacity-90 transition shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> اعتماد وترحيل
            </button>
          ) : (
            <span className="text-xs text-app-label-tertiary">تمت التسوية</span>
          );
        },
      },
    ],
    [onApprove, isApproving]
  );
}
