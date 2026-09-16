import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { type PayableSettlement } from "../../api/endpoints/procurement";

export function usePayablesSettlementsColumns(): ColumnDef<PayableSettlement, unknown>[] {
  return useMemo<ColumnDef<PayableSettlement, unknown>[]>(
    () => [
      {
        id: "account_code",
        header: "الحساب",
        accessorKey: "account_code",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-app-accent me-1">{row.original.account_code}</span>
        ),
      },
      {
        id: "amount",
        header: "المبلغ",
        accessorFn: (s) => Number(s.amount),
        cell: ({ row }) => formatNumber(row.original.amount),
        meta: { align: "end", className: "font-mono font-bold" },
      },
      {
        id: "reference",
        header: "المرجع",
        accessorFn: (s) => s.reference ?? "—",
        meta: { className: "text-app-label-secondary" },
      },
      {
        id: "settled_at",
        header: "التاريخ",
        accessorKey: "settled_at",
        cell: ({ row }) => formatDate(row.original.settled_at),
        meta: { className: "font-mono text-app-label-secondary" },
      },
      {
        id: "settled_by",
        header: "بواسطة",
        accessorFn: (s) => s.settled_by?.name ?? "—",
        meta: { className: "text-app-label-secondary" },
      },
    ],
    []
  );
}
