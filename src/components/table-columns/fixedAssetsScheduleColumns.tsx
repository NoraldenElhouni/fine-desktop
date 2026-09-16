import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import type { ScheduleRow } from "../../api/endpoints/fixedAssets";
import { formatNumber } from "../../lib/utils/format";

export function useFixedAssetsScheduleColumns(): ColumnDef<ScheduleRow, unknown>[] {
  return useMemo<ColumnDef<ScheduleRow, unknown>[]>(
    () => [
      {
        accessorKey: "period",
        header: "الفترة",
        cell: ({ row }) => <span className="font-mono">{row.original.period}</span>,
      },
      {
        accessorKey: "amount",
        header: "قسط الإهلاك",
        meta: { align: "end" },
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.amount)}</span>,
      },
      {
        accessorKey: "book_value_after",
        header: "القيمة الدفترية بعده",
        meta: { align: "end" },
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.book_value_after)}</span>,
      },
    ],
    [],
  );
}
