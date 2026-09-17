import { useMemo } from "react";
import { Briefcase } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { Employee } from "../../types/entities";
import { formatNumber } from "../../lib/utils/format";

export function useEmployeesColumns(): ColumnDef<Employee, unknown>[] {
  return useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      {
        id: "name",
        header: "اسم الموظف / الكيان",
        accessorFn: (emp) => emp.entity?.name ?? "",
        meta: { className: "font-semibold" },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-app-label-primary font-bold">
              {row.original.entity?.name || "بدون اسم"}
            </span>
            <span className="text-[10px] text-app-label-secondary">
              {row.original.entity?.tax_number ? `رقم/هوية: ${row.original.entity.tax_number}` : "بدون هوية"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "job_title",
        header: "المسمى الوظيفي",
        meta: { className: "font-medium text-app-label-secondary" },
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-app-accent" />
            <span>{row.original.job_title}</span>
            {row.original.labor_role && (
              <span className="rounded bg-app-bg-secondary px-1.5 py-0.5 text-[10px] text-app-label-secondary">
                {row.original.labor_role}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "pay_type",
        header: "طريقة الدفع",
        meta: { className: "font-semibold text-app-label-secondary" },
        cell: ({ row }) =>
          row.original.pay_type === "monthly"
            ? "راتب شهري"
            : row.original.pay_type === "hourly"
            ? "أجر بالساعة"
            : "إنتاج/قطعة",
      },
      {
        id: "pay_amount",
        header: "الراتب / الأجر",
        enableSorting: false,
        meta: { className: "font-mono font-bold text-app-label-primary" },
        cell: ({ row }) => {
          const emp = row.original;
          return emp.pay_type === "monthly" && emp.monthly_salary
            ? `${formatNumber(emp.monthly_salary)} د.ل / شهر`
            : emp.pay_type === "hourly" && emp.hourly_rate
            ? `${formatNumber(emp.hourly_rate)} د.ل / ساعة`
            : "حسب الإنتاج";
        },
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              row.original.status === "active"
                ? "bg-app-status-positive/15 text-app-status-positive"
                : "bg-app-status-danger/15 text-app-status-danger"
            }`}
          >
            {row.original.status === "active" ? "نشط" : row.original.status === "terminated" ? "منتهي" : row.original.status}
          </span>
        ),
      },
    ],
    []
  );
}
