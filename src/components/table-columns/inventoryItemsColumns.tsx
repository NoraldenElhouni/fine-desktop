import { useMemo } from "react";
import { Pencil, Tags } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { InventoryItem } from "../../api/endpoints/inventory";
import { ITEM_TYPE_LABELS, InventoryItemType } from "../../api/endpoints/categories";
import { formatDate, formatNumber } from "../../lib/utils/format";

export interface UseInventoryItemsColumnsArgs {
  onEdit?: (item: InventoryItem) => void;
}

export function useInventoryItemsColumns({ onEdit }: UseInventoryItemsColumnsArgs = {}): ColumnDef<InventoryItem, unknown>[] {
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
        header: "الفئة والنوع",
        enableSorting: false,
        cell: ({ row }) => {
          const cat = row.original.category;
          const typeLabel =
            ITEM_TYPE_LABELS[row.original.item_type as InventoryItemType] ??
            row.original.item_type;
          return (
            <div className="flex flex-col gap-1 items-start">
              {cat ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                  <Tags className="w-3 h-3" /> {cat.name}
                </span>
              ) : (
                <span className="text-app-label-tertiary text-xs">بدون فئة</span>
              )}
              {typeLabel && (
                <span className="text-[10px] text-app-label-secondary font-medium px-1.5 py-0.5 rounded bg-app-bg-secondary border border-app-separator">
                  {typeLabel}
                </span>
              )}
            </div>
          );
        },
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
        cell: ({ row }) => {
          const item = row.original;
          const cap = Number(item.container_capacity);
          if (cap > 0) {
            return (
              <div className="flex flex-col">
                <span className="font-semibold text-app-label-primary">
                  1 {item.primary_uom || "حاوية"} = {formatNumber(cap)} {item.secondary_uom || item.unit_of_measure}
                </span>
                <span className="text-[10px] text-app-label-tertiary">
                  {item.primary_uom || "each"} / {item.secondary_uom || item.unit_of_measure}
                </span>
              </div>
            );
          }
          return `${item.primary_uom || "each"} / ${item.secondary_uom || item.unit_of_measure}`;
        },
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
          const item = row.original;
          return (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(item);
                }}
                className="flex items-center gap-1 rounded-lg border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:border-app-accent hover:text-app-accent hover:bg-app-accent-subtle transition-colors"
                title="تعديل الصنف"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit]
  );
}

