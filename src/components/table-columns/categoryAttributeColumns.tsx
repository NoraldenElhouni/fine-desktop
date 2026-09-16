import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { InventoryAttributeDefinition } from "../../api/endpoints/categories";

export interface UseCategoryAttributeColumnsArgs {
  onDelete: (id: string) => void;
}

export function useCategoryAttributeColumns({
  onDelete,
}: UseCategoryAttributeColumnsArgs): ColumnDef<InventoryAttributeDefinition, unknown>[] {
  return useMemo<ColumnDef<InventoryAttributeDefinition, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "اسم الحقل",
        meta: { className: "font-medium" },
        cell: ({ row }) => row.original.name,
      },
      {
        id: "slug",
        accessorKey: "slug",
        header: "المعرف (Slug)",
        meta: { className: "font-mono text-app-accent" },
        cell: ({ row }) => row.original.slug,
      },
      {
        id: "data_type",
        accessorKey: "data_type",
        header: "نوع البيانات",
        meta: { className: "uppercase font-semibold text-[10px]" },
        cell: ({ row }) => row.original.data_type,
      },
      {
        id: "unit_of_measure",
        accessorFn: (attr) => attr.unit_of_measure || "--",
        header: "وحدة القياس",
        meta: { className: "font-semibold text-app-label-secondary" },
        cell: ({ row }) => row.original.unit_of_measure || "--",
      },
      {
        id: "is_required_on_lot",
        header: "مطلوب في الدفعة",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.is_required_on_lot ? (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">مطلوب</span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-app-fill-f1 text-app-label-tertiary">اختياري</span>
          ),
      },
      {
        id: "actions",
        header: "إجراء",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => (
          <button
            onClick={() => onDelete(row.original.id)}
            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [onDelete]
  );
}
