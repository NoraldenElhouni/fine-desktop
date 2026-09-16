import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { formatNumber } from "../../lib/utils/format";
import { BankHold } from "../../types/procurement";

export function useTreasuryBankHoldsColumns(): ColumnDef<BankHold, unknown>[] {
  return useMemo<ColumnDef<BankHold, unknown>[]>(
    () => [
      {
        id: "id",
        header: "معرف الحجز",
        accessorKey: "id",
        cell: ({ row }) => `#${row.original.id.slice(0, 6)}`,
        meta: { className: "font-mono font-bold" },
      },
      {
        id: "held_amount_lyd",
        header: "المبلغ المحجوز بالدينار (Held LYD)",
        accessorFn: (bh) => Number(bh.held_amount_lyd),
        cell: ({ row }) => `${formatNumber(row.original.held_amount_lyd)} LYD`,
        meta: { className: "font-mono" },
      },
      {
        id: "exact_amount_used",
        header: "المبلغ الفعلي المنصرف",
        accessorFn: (bh) => Number(bh.exact_amount_used),
        cell: ({ row }) => `${formatNumber(row.original.exact_amount_used)} LYD`,
        meta: { className: "font-mono text-app-status-warning" },
      },
      {
        id: "released_amount",
        header: "المبلغ المفرج عنه لحساب الشركة",
        accessorFn: (bh) => Number(bh.released_amount),
        cell: ({ row }) => `+${formatNumber(row.original.released_amount)} LYD (مفرج)`,
        meta: { className: "font-mono font-bold text-app-status-positive" },
      },
    ],
    []
  );
}
