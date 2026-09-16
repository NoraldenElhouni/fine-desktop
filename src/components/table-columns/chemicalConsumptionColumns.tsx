import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { ConsumptionLine } from "../../api/endpoints/production";

// Chemical consumption report — a handful of lines per batch, no search/pagination needed.
export function useChemicalConsumptionColumns(): ColumnDef<ConsumptionLine, unknown>[] {
  return useMemo<ColumnDef<ConsumptionLine, unknown>[]>(
    () => [
      {
        id: "chemical",
        header: "المادة الكيميائية",
        cell: ({ row }) => row.original.chemical_item?.name ?? row.original.chemical_item?.sku ?? "—",
      },
      {
        id: "consumed",
        header: "المستهلك",
        meta: { className: "font-mono" },
        cell: ({ row }) => row.original.quantity_consumed,
      },
      {
        id: "unit_cost",
        header: "تكلفة الوحدة عند الاستهلاك",
        meta: { className: "font-mono" },
        cell: ({ row }) => row.original.unit_cost_at_consumption,
      },
      {
        id: "line_cost",
        header: "تكلفة البند",
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) =>
          (Number(row.original.quantity_consumed) * Number(row.original.unit_cost_at_consumption)).toFixed(2),
      },
    ],
    [],
  );
}
