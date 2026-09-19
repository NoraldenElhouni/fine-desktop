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
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-app-accent">
              {row.original.journal_entry?.reference ?? "—"}
            </span>
            {row.original.journal_entry?.is_manual && (
              <span className="rounded bg-app-fill-f1 px-1.5 py-0.5 text-[10px] font-semibold text-app-label-secondary">
                يدوي
              </span>
            )}
          </div>
        ),
      },
      {
        id: "date",
        header: "التاريخ",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-app-label-secondary">
            {row.original.journal_entry?.entry_date ? formatDate(row.original.journal_entry.entry_date) : "—"}
          </span>
        ),
      },
      {
        id: "operating_unit",
        header: "الوحدة",
        cell: ({ row }) => (
          <span className="inline-block rounded-md bg-app-bg-secondary px-2 py-0.5 text-xs text-app-label-secondary">
            {row.original.operating_unit?.name ?? "عام الشركة"}
          </span>
        ),
      },
      {
        id: "description",
        header: "الوصف والبيان",
        cell: ({ row }) => {
          const desc = row.original.journal_entry?.description;
          const memo = row.original.memo;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-app-label-primary">{desc ?? "—"}</span>
              {memo && memo !== desc && (
                <span className="text-[11px] text-app-label-tertiary">
                  بيان السطر: {memo}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "debit",
        header: "مدين",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const debit = Number(row.original.debit);
          return (
            <span className={`font-mono text-xs ${debit > 0 ? "font-semibold text-app-label-primary" : "text-app-label-tertiary"}`}>
              {debit > 0 ? formatNumber(debit) : "—"}
            </span>
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
          return (
            <span className={`font-mono text-xs ${credit > 0 ? "font-semibold text-app-label-primary" : "text-app-label-tertiary"}`}>
              {credit > 0 ? formatNumber(credit) : "—"}
            </span>
          );
        },
      },
    ],
    [],
  );
}
