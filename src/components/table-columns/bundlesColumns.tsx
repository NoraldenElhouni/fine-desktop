import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { Bundle } from "../../api/endpoints/bundles";
import { formatDate } from "../../lib/utils/format";

export interface UseBundlesColumnsArgs {
  onEdit?: (bundle: Bundle) => void;
  onDelete?: (bundle: Bundle) => void;
}

export function useBundlesColumns({ onEdit, onDelete }: UseBundlesColumnsArgs = {}): ColumnDef<Bundle, unknown>[] {
  return useMemo<ColumnDef<Bundle, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "اسم الحزمة",
        meta: { className: "font-bold text-app-label-primary" },
        cell: ({ row }) => row.original.name,
      },
      {
        id: "scope",
        header: "النطاق",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.operating_unit_id ? (
            <span className="rounded-full bg-app-fill-f1 px-2 py-0.5 text-[10px] font-semibold text-app-label-secondary">
              خاصة بوحدة
            </span>
          ) : (
            <span className="rounded-full bg-app-accent-subtle px-2 py-0.5 text-[10px] font-semibold text-app-accent">
              مشتركة لكل الوحدات
            </span>
          ),
      },
      {
        id: "items",
        header: "الأصناف",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-xs text-app-label-secondary">
            {row.original.items?.map((i) => i.inventory_item?.name).filter(Boolean).join("، ") || "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: "تاريخ الإنشاء",
        meta: { className: "text-app-label-tertiary" },
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const bundle = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(bundle);
                }}
                className="flex items-center gap-1 rounded-lg border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:border-app-accent hover:text-app-accent hover:bg-app-accent-subtle transition-colors"
                title="تعديل الحزمة"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(bundle);
                }}
                className="flex items-center justify-center rounded-lg border border-app-separator p-1.5 text-app-label-secondary hover:border-app-status-danger hover:text-app-status-danger transition-colors"
                title="حذف الحزمة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete],
  );
}
