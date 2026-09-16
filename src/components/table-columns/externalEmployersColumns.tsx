import { useMemo } from "react";
import { Percent } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { ExternalEmployer } from "../../types/entities";

export function useExternalEmployersColumns(): ColumnDef<ExternalEmployer, unknown>[] {
  return useMemo<ColumnDef<ExternalEmployer, unknown>[]>(
    () => [
      {
        id: "name",
        header: "اسم الشركة / الجهة",
        accessorFn: (emp) => emp.entity?.name ?? "",
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
        accessorKey: "contract_reference",
        header: "مرجع العقد (Contract Ref)",
        meta: { className: "font-mono font-medium text-app-label-secondary" },
        cell: ({ row }) => row.original.contract_reference || "-",
      },
      {
        id: "multiplier",
        header: "مضاعف الفوترة (Multiplier)",
        accessorFn: (emp) => Number(emp.billing_rate_multiplier),
        meta: { className: "font-mono font-bold text-app-label-primary" },
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 rounded bg-app-bg-secondary px-2 py-0.5">
            <Percent className="h-3 w-3 text-app-accent" />
            <span>{row.original.billing_rate_multiplier}x</span>
          </span>
        ),
      },
      {
        id: "employees_count",
        header: "عدد العمالة التابعة",
        accessorFn: (emp) => (emp as unknown as { employees_count?: number }).employees_count || 0,
        cell: ({ row }) => (
          <span className="rounded-full bg-app-bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-app-label-primary">
            {(row.original as unknown as { employees_count?: number }).employees_count || 0} عامل
          </span>
        ),
      },
    ],
    []
  );
}
