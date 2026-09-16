import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { formatDateTime } from "../../lib/utils/format";
import { FxRate } from "../../types/procurement";

export function useTreasuryFxRatesColumns(): ColumnDef<FxRate, unknown>[] {
  return useMemo<ColumnDef<FxRate, unknown>[]>(
    () => [
      {
        id: "pair",
        header: "الزوج النقدي",
        accessorFn: (fx) => `${fx.from_currency} / ${fx.to_currency}`,
        meta: { className: "font-bold" },
      },
      {
        id: "rate",
        header: "سعر الصرف",
        accessorFn: (fx) => Number(fx.rate),
        cell: ({ row }) => Number(row.original.rate).toFixed(4),
        meta: { className: "font-mono font-extrabold text-app-status-positive" },
      },
      {
        id: "captured_at",
        header: "تاريخ التسجيل",
        accessorKey: "captured_at",
        cell: ({ row }) => formatDateTime(row.original.captured_at),
        meta: { className: "text-app-label-secondary font-mono text-[11px]" },
      },
    ],
    []
  );
}
