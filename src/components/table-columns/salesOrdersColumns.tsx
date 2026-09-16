import { useMemo } from "react";
import { Building2, Home } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import { ColumnDef } from "../ui/DataTable";
import { SALES_STATUS_LABEL, SalesOrder } from "../../api/endpoints/sales";
import { formatNumber } from "../../lib/utils/format";

const CHANNEL_LABEL: Record<string, string> = {
  standard: "عادي",
  pos: "نقطة بيع",
};

export interface UseSalesOrdersColumnsArgs {
  navigate: NavigateFunction;
}

export function useSalesOrdersColumns({ navigate }: UseSalesOrdersColumnsArgs): ColumnDef<SalesOrder, unknown>[] {
  return useMemo<ColumnDef<SalesOrder, unknown>[]>(
    () => [
      {
        accessorKey: "order_number",
        header: "الطلب",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => row.original.order_number,
      },
      {
        id: "buyer",
        header: "المشتري",
        enableSorting: false,
        cell: ({ row }) => {
          const o = row.original;
          return o.buyer_type === "client" ? (
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {o.client?.entity?.name ?? "عميل"}
            </span>
          ) : o.buyer_type === "internal_unit" ? (
            <span className="inline-flex items-center gap-1 text-app-label-secondary">
              <Home className="w-3.5 h-3.5" /> {o.buyer_unit?.name ?? "داخلي"}
            </span>
          ) : (
            <span className="text-app-label-tertiary">زبون مباشر</span>
          );
        },
      },
      {
        id: "channel",
        header: "القناة",
        accessorFn: (o) => CHANNEL_LABEL[o.channel] ?? o.channel,
        meta: { className: "text-app-label-secondary" },
        cell: ({ row }) => CHANNEL_LABEL[row.original.channel] ?? row.original.channel,
      },
      {
        accessorKey: "total_amount",
        header: "الإجمالي",
        meta: { className: "font-mono" },
        cell: ({ row }) => formatNumber(row.original.total_amount),
      },
      {
        accessorKey: "amount_paid",
        header: "المدفوع",
        meta: { className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => formatNumber(row.original.amount_paid),
      },
      {
        id: "status",
        header: "الحالة",
        enableSorting: false,
        cell: ({ row }) => {
          const o = row.original;
          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                o.status === "pending_approval"
                  ? "bg-app-status-yellow/15 text-app-status-yellow"
                  : o.status === "rejected"
                    ? "bg-app-status-danger/10 text-app-status-danger"
                    : "bg-app-accent-subtle text-app-accent"
              }`}
            >
              {SALES_STATUS_LABEL[o.status]}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "الإجراءات",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => (
          <button
            onClick={() => navigate(`/sales/orders/${row.original.id}`)}
            className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
          >
            فتح
          </button>
        ),
      },
    ],
    [navigate],
  );
}
