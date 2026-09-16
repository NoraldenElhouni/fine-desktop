import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import type { JournalLine } from "../../api/endpoints/accounting";
import { formatDate, formatNumber } from "../../lib/utils/format";

export function useChartOfAccountsLedgerColumns(): ColumnDef<JournalLine, unknown>[] {
  return useMemo<ColumnDef<JournalLine, unknown>[]>(
    () => [
      {
        id: "reference",
        header: "المرجع",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-app-accent">{row.original.journal_entry?.reference}</span>
        ),
      },
      {
        id: "date",
        header: "التاريخ",
        cell: ({ row }) => (
          <span className="font-mono text-app-label-secondary">
            {row.original.journal_entry?.entry_date ? formatDate(row.original.journal_entry.entry_date) : ""}
          </span>
        ),
      },
      {
        id: "description",
        header: "الوصف",
        cell: ({ row }) => (
          <span className="text-app-label-secondary">{row.original.journal_entry?.description}</span>
        ),
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
