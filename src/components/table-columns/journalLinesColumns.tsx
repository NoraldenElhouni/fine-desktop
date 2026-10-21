import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import type { JournalLine } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";

export function useJournalLinesColumns(): ColumnDef<JournalLine, unknown>[] {
  return useMemo<ColumnDef<JournalLine, unknown>[]>(
    () => [
      {
        id: "account",
        header: "الحساب",
        enableSorting: false,
        cell: ({ row }) => (
          <>
            <span className="font-mono font-bold">{row.original.account?.account_code}</span>
            <span className="ms-2 text-app-label-secondary">{row.original.account?.name}</span>
          </>
        ),
      },
      {
        accessorKey: "memo",
        header: "البيان",
        enableSorting: false,
        cell: ({ row }) => <span className="text-app-label-secondary">{row.original.memo ?? ""}</span>,
      },
      {
        id: "debit",
        header: "مدين",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const debit = Number(row.original.debit);
          if (debit <= 0) return null;
          return (
            <div className="flex flex-col items-end">
              <span className="font-mono">{formatNumber(debit)}</span>
              {row.original.currency && row.original.original_amount && (
                <span className="font-mono text-[10px] text-app-label-tertiary">
                  {formatNumber(Number(row.original.original_amount))} {row.original.currency}
                  {row.original.fx_rate ? ` × ${Number(row.original.fx_rate)}` : ""}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "credit",
        header: "دائن",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const credit = Number(row.original.credit);
          if (credit <= 0) return null;
          return (
            <div className="flex flex-col items-end">
              <span className="font-mono">{formatNumber(credit)}</span>
              {row.original.currency && row.original.original_amount && (
                <span className="font-mono text-[10px] text-app-label-tertiary">
                  {formatNumber(Number(row.original.original_amount))} {row.original.currency}
                  {row.original.fx_rate ? ` × ${Number(row.original.fx_rate)}` : ""}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );
}
