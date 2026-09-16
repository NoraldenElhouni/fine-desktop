import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { BomComponentLine } from "../../api/endpoints/furniture";

export interface UseProductionOrderBomColumnsArgs {
  orderQuantity: number | undefined;
}

// BOM lines — a small, fixed-size breakdown for this one order, so no search/pagination.
export function useProductionOrderBomColumns({
  orderQuantity,
}: UseProductionOrderBomColumnsArgs): ColumnDef<BomComponentLine, unknown>[] {
  return useMemo<ColumnDef<BomComponentLine, unknown>[]>(
    () => [
      {
        id: "item",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <>
            {row.original.inventory_item?.name}
            <span className="text-app-label-tertiary font-mono ms-2">{row.original.inventory_item?.sku}</span>
          </>
        ),
      },
      {
        id: "quantity",
        header: "",
        enableSorting: false,
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) => (
          <>
            × {Number(row.original.quantity)} لكل وحدة ← {Number(row.original.quantity) * (orderQuantity ?? 0)}{" "}
            إجمالي
          </>
        ),
      },
    ],
    [orderQuantity],
  );
}
