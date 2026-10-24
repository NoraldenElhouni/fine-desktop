import { useMemo } from "react";
import { Link } from "react-router-dom";
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
        id: "method",
        header: "طريقة السداد",
        accessorFn: (s) =>
          s.method === "cheque"
            ? `شيك صادر ${s.cheque?.cheque_no ?? ""} ${s.cheque?.status_label ?? ""}`
            : "نقداً",
        cell: ({ row }) => {
          const isCheque = row.original.method === "cheque";
          if (!isCheque) {
            return (
              <span className="inline-flex items-center rounded-full bg-app-fill-f1 px-2.5 py-0.5 text-[11px] font-semibold text-app-label-secondary">
                نقداً
              </span>
            );
          }

          const cheque = row.original.cheque;
          const status = cheque?.status;
          const statusLabel =
            cheque?.status_label ||
            (status === "issued"
              ? "صادر"
              : status === "cleared"
              ? "مصروف"
              : status === "cancelled"
              ? "ملغى"
              : status);

          let statusColor = "bg-app-accent/10 text-app-accent border-app-accent/20";
          if (status === "cleared") {
            statusColor = "bg-app-status-positive/10 text-app-status-positive border-app-status-positive/20";
          } else if (status === "cancelled") {
            statusColor = "bg-app-status-danger/10 text-app-status-danger border-app-status-danger/20";
          }

          return (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                شيك صادر
              </span>
              {cheque ? (
                <Link
                  to="/treasury/cheques?direction=outgoing"
                  className="inline-flex items-center gap-1.5 hover:underline"
                  title="عرض في الشيكات الصادرة"
                >
                  <span className="font-mono text-xs font-bold text-app-accent">
                    #{cheque.cheque_no}
                  </span>
                  {statusLabel && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  )}
                </Link>
              ) : null}
            </div>
          );
        },
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
