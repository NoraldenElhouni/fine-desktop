import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import type { UnitProfitabilityRow } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";

export function useUnitProfitabilityColumns(): ColumnDef<UnitProfitabilityRow, unknown>[] {
  return useMemo<ColumnDef<UnitProfitabilityRow, unknown>[]>(
    () => [
      {
        id: "unit",
        header: "الوحدة التشغيلية",
        accessorFn: (r) => (r.operating_unit_id ? r.unit_name : "غير موزّع (على مستوى الشركة)"),
        cell: ({ row }) => (
          <span className="font-bold text-app-label-primary">
            {row.original.operating_unit_id ? row.original.unit_name : "غير موزّع (على مستوى الشركة)"}
          </span>
        ),
      },
      {
        accessorKey: "revenue",
        header: "الإيرادات",
        meta: { align: "end" },
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.revenue)}</span>,
      },
      {
        accessorKey: "expenses",
        header: "المصروفات",
        meta: { align: "end" },
        cell: ({ row }) => <span className="font-mono">{formatNumber(row.original.expenses)}</span>,
      },
      {
        accessorKey: "net",
        header: "الصافي",
        meta: { align: "end" },
        cell: ({ row }) => (
          <span
            className={`font-mono font-bold ${row.original.net < 0 ? "text-app-status-danger" : "text-app-status-positive"}`}
          >
            {formatNumber(row.original.net)}
          </span>
        ),
      },
    ],
    [],
  );
}
