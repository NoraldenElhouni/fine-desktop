import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { WarehouseTransfer, WarehouseTransferStatus } from "../../api/endpoints/warehouseTransfers";

const STATUS_LABEL: Record<WarehouseTransferStatus, string> = {
  draft: "مسودة",
  completed: "مكتمل",
  cancelled: "ملغى",
};

const STATUS_STYLE: Record<WarehouseTransferStatus, string> = {
  draft: "bg-app-bg-secondary text-app-label-secondary",
  completed: "bg-app-status-positive/15 text-app-status-positive",
  cancelled: "bg-app-status-danger/15 text-app-status-danger",
};

export function useWarehouseTransfersColumns(): ColumnDef<WarehouseTransfer, unknown>[] {
  return useMemo<ColumnDef<WarehouseTransfer, unknown>[]>(
    () => [
      {
        id: "transfer_number",
        header: "رقم النقل",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => row.original.transfer_number,
      },
      {
        id: "route",
        header: "من ← إلى",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-xs text-app-label-primary">
            {row.original.from_warehouse?.name ?? "—"} ← {row.original.to_warehouse?.name ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "الحالة",
        enableSorting: false,
        cell: ({ row }) => (
          <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STATUS_STYLE[row.original.status]}`}>
            {STATUS_LABEL[row.original.status]}
          </span>
        ),
      },
      {
        id: "lines_count",
        header: "عدد الأصناف",
        enableSorting: false,
        meta: { align: "center", className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => row.original.lines?.length ?? 0,
      },
      {
        id: "created_at",
        header: "تاريخ الإنشاء",
        meta: { className: "font-mono text-xs text-app-label-secondary" },
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("ar-LY"),
      },
    ],
    [],
  );
}
