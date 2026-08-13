import React, { useState } from "react";
import { Banknote, Plus, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  usePayrollRuns,
  usePayslips,
  useOpenPayrollRun,
  usePayrollAction,
  useSetDeductions,
} from "../../hooks/useHr";
import { apiErrorPayload } from "../../api/endpoints/production";
import { PAYROLL_STATUS_LABEL, type PayrollRun, type Payslip } from "../../api/endpoints/hr";

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
        <div className="flex items-center gap-2">
          <input
            type="month" value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono text-app-label-primary focus:border-app-accent focus:outline-none"
          />
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
                    <table className="w-full text-xs">
                      <thead className="text-app-label-secondary border-b border-app-separator">
                        <tr>
                          <th className="px-2 py-1.5 text-start font-bold">الموظف</th>
                          <th className="px-2 py-1.5 text-start font-bold">الوحدة</th>
                          <th className="px-2 py-1.5 text-end font-bold">أساسي</th>
                          <th className="px-2 py-1.5 text-end font-bold">حضور</th>
                          <th className="px-2 py-1.5 text-end font-bold">إنتاج</th>
                          <th className="px-2 py-1.5 text-end font-bold">إجمالي</th>
                          <th className="px-2 py-1.5 text-start font-bold">استقطاعات</th>
                          <th className="px-2 py-1.5 text-end font-bold">صافي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app-separator">
                        {payslips.map((slip) => (
                          <tr key={slip.id}>
                            <td className="px-2 py-1.5 font-bold text-app-label-primary">
                              {slip.employee?.entity?.name ?? slip.employee_id.slice(0, 8)}
                            </td>
                            <td className="px-2 py-1.5 text-app-label-secondary">{slip.operating_unit?.name}</td>
                            <td className="px-2 py-1.5 text-end font-mono">{fmt(slip.base_pay)}</td>
                            <td className="px-2 py-1.5 text-end font-mono">{fmt(slip.attendance_pay)}</td>
                            <td className="px-2 py-1.5 text-end font-mono">{fmt(slip.labor_log_pay)}</td>
                            <td className="px-2 py-1.5 text-end font-mono font-bold">{fmt(slip.gross_pay)}</td>
                            <td className="px-2 py-1.5">
                              <DeductionEditor
                                payslip={slip}
                                editable={run.status === "calculated"}
                                onError={setError}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-end font-mono font-bold text-app-status-positive">
                              {fmt(slip.net_pay)}
                            </td>
                          </tr>
                        ))}
                        {payslips.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-app-label-tertiary">
                              لم يُحتسب المسير بعد.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
