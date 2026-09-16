import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { Client } from "../../types/entities";
import { formatNumber } from "../../lib/utils/format";

export function useClientsColumns(): ColumnDef<Client, unknown>[] {
  return useMemo<ColumnDef<Client, unknown>[]>(
    () => [
      {
        id: "name",
        header: "اسم العميل / الكيان",
        accessorFn: (c) => c.entity?.name ?? "",
        meta: { className: "font-semibold" },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-app-label-primary font-bold">
              {row.original.entity?.name || "بدون اسم"}
            </span>
            <span className="text-[10px] text-app-label-secondary">
              {row.original.entity?.tax_number ? `ضريبي: ${row.original.entity.tax_number}` : "بدون رقم ضريبي"}
            </span>
          </div>
        ),
      },
      {
        id: "credit_limit",
        header: "الحد الائتماني (LYD)",
        accessorFn: (c) => Number(c.credit_limit || 0),
        meta: { className: "font-mono" },
        cell: ({ row }) => `${formatNumber(Number(row.original.credit_limit || 0))} د.ل`,
      },
      {
        id: "current_balance",
        header: "الرصيد المستحق (LYD)",
        accessorFn: (c) => Number(c.current_balance || 0),
        meta: { className: "font-mono font-bold" },
        cell: ({ row }) => {
          const creditLimit = Number(row.original.credit_limit || 0);
          const currentBalance = Number(row.original.current_balance || 0);
          const isOverLimit = currentBalance > creditLimit;
          return (
            <span className={currentBalance > 0 ? (isOverLimit ? "text-app-status-danger" : "text-app-label-primary") : "text-app-label-secondary"}>
              {formatNumber(currentBalance)} د.ل
            </span>
          );
        },
      },
      {
        id: "headroom",
        header: "المتبقي من الائتمان",
        enableSorting: false,
        meta: { className: "font-mono" },
        cell: ({ row }) => {
          const creditLimit = Number(row.original.credit_limit || 0);
          const currentBalance = Number(row.original.current_balance || 0);
          const headroom = creditLimit - currentBalance;
          const isOverLimit = currentBalance > creditLimit;
          const isNearLimit = !isOverLimit && headroom <= creditLimit * 0.15;

          return isOverLimit ? (
            <span className="inline-flex items-center rounded-full bg-app-status-danger/15 px-2 py-0.5 text-[10px] font-bold text-app-status-danger">
              تجاوز {formatNumber(Math.abs(headroom))} د.ل
            </span>
          ) : isNearLimit ? (
            <span className="inline-flex items-center rounded-full bg-app-status-warning/15 px-2 py-0.5 text-[10px] font-bold text-app-status-warning">
              {formatNumber(headroom)} د.ل (متبقي)
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-app-status-positive/15 px-2 py-0.5 text-[10px] font-bold text-app-status-positive">
              {formatNumber(headroom)} د.ل (متبقي)
            </span>
          );
        },
      },
      {
        accessorKey: "payment_terms_days",
        header: "فترة السداد الآجل",
        meta: { className: "font-semibold text-app-label-secondary" },
        cell: ({ row }) => `${row.original.payment_terms_days} يوم`,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              row.original.status === "active"
                ? "bg-app-status-positive/15 text-app-status-positive"
                : row.original.status === "suspended"
                ? "bg-app-status-warning/15 text-app-status-warning"
                : "bg-app-status-danger/15 text-app-status-danger"
            }`}
          >
            {row.original.status === "active"
              ? "نشط"
              : row.original.status === "suspended"
              ? "موقوف"
              : row.original.status === "blacklisted"
              ? "محظور"
              : row.original.status}
          </span>
        ),
      },
    ],
    []
  );
}
