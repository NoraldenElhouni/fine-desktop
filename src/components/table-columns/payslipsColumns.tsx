import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSetDeductions } from "../../hooks/useHr";
import { apiErrorPayload } from "../../api/endpoints/production";
import { type PayrollRun, type Payslip } from "../../api/endpoints/hr";
import { ColumnDef } from "../ui/DataTable";

const fmt = (v: number | string) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

const DeductionEditor: React.FC<{ payslip: Payslip; editable: boolean; onError: (m: string) => void }> = ({
  payslip,
  editable,
  onError,
}) => {
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState(payslip.deductions ?? []);
  const setDeductions = useSetDeductions();

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-app-label-secondary">
        {(payslip.deductions ?? []).map((d, i) => (
          <span key={i}>{d.type}: {fmt(d.amount)}</span>
        ))}
        {editable && (
          <button
            onClick={() => { setItems(payslip.deductions ?? []); setEditing(true); }}
            className="text-app-accent font-bold hover:opacity-80"
          >
            تعديل الاستقطاعات
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map((d, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text" value={d.type} placeholder="النوع"
            onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}
            className="w-32 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 text-[10px] focus:border-app-accent focus:outline-none"
          />
          <input
            type="number" step="0.01" min="0" value={d.amount}
            onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))}
            className="w-24 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 text-[10px] font-mono focus:border-app-accent focus:outline-none"
          />
          <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="p-0.5 text-app-label-tertiary hover:text-app-status-danger">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 text-[10px] font-bold">
        <button
          onClick={() => setItems([...items, { type: "social_security", amount: 0 }])}
          className="text-app-accent hover:opacity-80"
        >
          + سطر
        </button>
        <button
          onClick={() =>
            setDeductions.mutate(
              { payslipId: payslip.id, deductions: items.filter((d) => d.type.trim() !== "") },
              {
                onSuccess: () => setEditing(false),
                onError: (err) => onError(apiErrorPayload(err)?.message ?? "تعذر حفظ الاستقطاعات."),
              },
            )
          }
          disabled={setDeductions.isPending}
          className="rounded-lg bg-app-accent px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
        >
          حفظ
        </button>
        <button onClick={() => setEditing(false)} className="text-app-label-secondary hover:opacity-80">
          إلغاء
        </button>
      </div>
    </div>
  );
};

export interface UsePayslipsColumnsArgs {
  run: PayrollRun;
  onError: (m: string) => void;
}

export function usePayslipsColumns({ run, onError }: UsePayslipsColumnsArgs): ColumnDef<Payslip, unknown>[] {
  return useMemo<ColumnDef<Payslip, unknown>[]>(
    () => [
      {
        id: "employee",
        header: "الموظف",
        accessorFn: (p) => p.employee?.entity?.name ?? p.employee_id,
        meta: { className: "font-bold text-app-label-primary" },
        cell: ({ row }) => row.original.employee?.entity?.name ?? row.original.employee_id.slice(0, 8),
      },
      {
        id: "unit",
        header: "الوحدة",
        accessorFn: (p) => p.operating_unit?.name,
        meta: { className: "text-app-label-secondary" },
        cell: ({ row }) => row.original.operating_unit?.name,
      },
      {
        accessorKey: "base_pay",
        header: "أساسي",
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) => fmt(row.original.base_pay),
      },
      {
        accessorKey: "attendance_pay",
        header: "حضور",
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) => fmt(row.original.attendance_pay),
      },
      {
        accessorKey: "labor_log_pay",
        header: "إنتاج",
        meta: { align: "end", className: "font-mono" },
        cell: ({ row }) => fmt(row.original.labor_log_pay),
      },
      {
        accessorKey: "gross_pay",
        header: "إجمالي",
        meta: { align: "end", className: "font-mono font-bold" },
        cell: ({ row }) => fmt(row.original.gross_pay),
      },
      {
        id: "deductions",
        header: "استقطاعات",
        enableSorting: false,
        cell: ({ row }) => (
          <DeductionEditor payslip={row.original} editable={run.status === "calculated"} onError={onError} />
        ),
      },
      {
        accessorKey: "net_pay",
        header: "صافي",
        meta: { align: "end", className: "font-mono font-bold text-app-status-positive" },
        cell: ({ row }) => fmt(row.original.net_pay),
      },
    ],
    [run.status, onError],
  );
}
