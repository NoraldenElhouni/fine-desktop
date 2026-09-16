import { useMemo } from "react";
import { Tags } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { InventoryItem } from "../../api/endpoints/inventory";
import { formatDate } from "../../lib/utils/format";

export function useInventoryItemsColumns(): ColumnDef<InventoryItem, unknown>[] {
  return useMemo<ColumnDef<InventoryItem, unknown>[]>(
    () => [
      {
        id: "sku",
        accessorKey: "sku",
        header: "رمز الصنف (SKU)",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => row.original.sku,
      },
      {
        id: "name",
        accessorKey: "name",
        header: "الاسم",
        meta: { className: "font-medium" },
        cell: ({ row }) => row.original.name,
      },
      {
        id: "category",
        header: "الفئة",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.category ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
              <Tags className="w-3 h-3" /> {row.original.category.name}
            </span>
          ) : (
            <span className="text-app-label-tertiary">بدون فئة</span>
          ),
      },
      {
        id: "attributes",
        header: "الخصائص المسندة",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.attribute_definitions && row.original.attribute_definitions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.attribute_definitions.map((attr) => (
                <span key={attr.id} className="px-2 py-0.5 text-[10px] font-medium rounded bg-app-bg-secondary border border-app-separator text-app-label-primary">
                  {attr.name} ({attr.unit_of_measure || attr.data_type})
                </span>
              ))}
            </div>
          ) : (
            <span className="text-app-label-tertiary text-[10px]">لا توجد خصائص</span>
          ),
      },
      {
        id: "uom",
        header: "وحدة القياس المزدوجة (حاوية / قياس)",
        enableSorting: false,
        meta: { className: "font-mono font-medium text-app-label-secondary" },
        cell: ({ row }) => `${row.original.primary_uom || "each"} / ${row.original.secondary_uom || row.original.unit_of_measure}`,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: "تاريخ الإنشاء",
        meta: { className: "text-app-label-tertiary" },
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    []
  );
}
