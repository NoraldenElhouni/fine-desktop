import React, { useMemo, useState } from "react";
import { Banknote, Plus, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import {
  usePayrollRuns,
  usePayslips,
  useOpenPayrollRun,
  usePayrollAction,
} from "../../hooks/useHr";
import { apiErrorPayload } from "../../api/endpoints/production";
import { PAYROLL_STATUS_LABEL, type PayrollRun, type Payslip } from "../../api/endpoints/hr";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { usePayslipsColumns } from "../../components/table-columns/payslipsColumns";

const fmt = (v: number | string) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

const STATUS_STYLE: Record<PayrollRun["status"], string> = {
  draft: "bg-app-fill-f1 text-app-label-secondary",
  calculated: "bg-app-status-yellow/15 text-app-status-yellow",
  pending_approval: "bg-app-status-yellow/15 text-app-status-yellow",
  approved: "bg-app-accent-subtle text-app-accent",
  paid: "bg-app-accent-subtle text-app-accent",
  posted: "bg-app-status-positive/10 text-app-status-positive",
};

const NEXT_ACTION: Partial<Record<PayrollRun["status"], { action: "calculate" | "submit" | "approve" | "mark-paid" | "post"; label: string }>> = {
  draft: { action: "calculate", label: "احتساب" },
  calculated: { action: "submit", label: "إرسال للاعتماد" },
  pending_approval: { action: "approve", label: "اعتماد" },
  approved: { action: "mark-paid", label: "تأكيد الصرف" },
  paid: { action: "post", label: "ترحيل للدفاتر" },
};

const PayslipsTable: React.FC<{ payslips: Payslip[]; run: PayrollRun; onError: (m: string) => void }> = ({
  payslips,
  run,
  onError,
}) => {
  const columns = usePayslipsColumns({ run, onError });

  const tableData = useMemo(() => payslips, [payslips]);
  const table = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (p) => p.id,
  });

  return (
    <DataTable table={table}>
      <DataTable.Content emptyMessage="لم يُحتسب المسير بعد." emptyIcon={Banknote} />
    </DataTable>
  );
};

export const PayrollPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: runs, isLoading } = usePayrollRuns();
  const { data: payslips } = usePayslips(expanded ?? undefined);
  const openMutation = useOpenPayrollRun();
  const actionMutation = usePayrollAction();

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const openRun = () => {
    setError(null);
    openMutation.mutate(period, { onError: (err) => fail(err, "تعذر فتح المسير.") });
  };

  const act = (run: PayrollRun) => {
    const next = NEXT_ACTION[run.status];
    if (!next) return;
    setError(null);
    actionMutation.mutate({ id: run.id, action: next.action }, { onError: (err) => fail(err, "تعذر تنفيذ الإجراء.") });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Banknote className="w-7 h-7 text-app-accent" />
            مسير الرواتب (Payroll)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            المسير يمر بكل البوابات: احتساب ← مراجعة ← اعتماد محاسبي ← صرف ← ترحيل للدفاتر.
            الاستقطاعات تُعدَّل أثناء المراجعة فقط، والصافي يُحتسب آليًا.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">فترة المسير</label>
            <input
              type="month" value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono text-app-label-primary focus:border-app-accent focus:outline-none"
            />
          </div>
          <button
            onClick={openRun}
            disabled={openMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> فتح مسير {period}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <div className="divide-y divide-app-separator">
            {runs?.data.map((run) => {
              const next = NEXT_ACTION[run.status];

              return (
              <div key={run.id}>
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                    className="flex items-center gap-2 font-mono font-bold text-app-accent text-sm hover:opacity-80"
                  >
                    {expanded === run.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {run.period}
                  </button>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STATUS_STYLE[run.status]}`}>
                    {PAYROLL_STATUS_LABEL[run.status]}
                  </span>
                  <span className="text-xs font-mono text-app-label-secondary">
                    إجمالي {fmt(run.total_gross)} | استقطاعات {fmt(run.total_deductions)} | صافي {fmt(run.total_net)}
                  </span>

                  {next && (
                    <button
                      onClick={() => act(run)}
                      disabled={actionMutation.isPending}
                      className="ms-auto rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {next.label}
                    </button>
                  )}
                </div>

                {expanded === run.id && payslips && (
                  <div className="px-4 pb-4">
                    <PayslipsTable payslips={payslips} run={run} onError={setError} />
                  </div>
                )}
              </div>
              );
            })}
            {runs?.data.length === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">لا توجد مسيرات بعد.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
