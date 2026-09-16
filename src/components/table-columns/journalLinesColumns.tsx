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
        cell: ({ row }) => (
          <span className="font-mono">
            {Number(row.original.debit) > 0 ? formatNumber(row.original.debit) : ""}
          </span>
        ),
      },
      {
        id: "credit",
        header: "دائن",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => (
          <span className="font-mono">
            {Number(row.original.credit) > 0 ? formatNumber(row.original.credit) : ""}
          </span>
        ),
      },
    ],
    [],
  );
}
