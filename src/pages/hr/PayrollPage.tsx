import React, { useMemo, useState } from "react";
import {
  Banknote,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  ArrowUpRight,
  Layers,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  usePayrollRuns,
  usePayslips,
  useOpenPayrollRun,
  usePayrollAction,
} from "../../hooks/useHr";
import { apiErrorPayload } from "../../api/endpoints/production";
import {
  PAYROLL_STATUS_LABEL,
  type PayrollRun,
  type Payslip,
} from "../../api/endpoints/hr";
import { formatNumber } from "../../lib/utils/format";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { usePayslipsColumns } from "../../components/table-columns/payslipsColumns";

const STATUS_STYLE: Record<PayrollRun["status"], string> = {
  draft: "bg-app-fill-f1 text-app-label-secondary border-app-separator",
  calculated: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  pending_approval: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  approved: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  posted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
};

const NEXT_ACTION: Partial<
  Record<
    PayrollRun["status"],
    { action: "calculate" | "submit" | "approve" | "mark-paid" | "post"; label: string; desc: string }
  >
> = {
  draft: { action: "calculate", label: "احتساب المسير", desc: "تجميع ساعات الحضور وسجلات الإنتاج واحتساب الصافي" },
  calculated: { action: "submit", label: "إرسال للاعتماد المحاسبي", desc: "قفل التعديلات ورفع المسير للمراجعة المحاسبية" },
  pending_approval: { action: "approve", label: "اعتماد المسير", desc: "الموافقة الرسمية من قبل الإدارة المالية" },
  approved: { action: "mark-paid", label: "تأكيد الصرف", desc: "صرف الرواتب للموظفين وإثبات السداد" },
  paid: { action: "post", label: "ترحيل للدفاتر", desc: "ترحيل قيود الرواتب والالتزامات للدفاتر المحاسبية" },
};

function getPreviousMonth(p: string): string {
  const [year, month] = p.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonth(p: string): string {
  const [year, month] = p.split("-").map(Number);
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const PayslipsTable: React.FC<{
  payslips: Payslip[];
  run: PayrollRun;
  onError: (m: string) => void;
}> = ({ payslips, run, onError }) => {
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const columns = usePayslipsColumns({ run, onError });

  const units = useMemo(() => {
    const set = new Set<string>();
    payslips.forEach((p) => {
      if (p.operating_unit?.name) set.add(p.operating_unit.name);
    });
    return Array.from(set);
  }, [payslips]);

  const filteredData = useMemo(() => {
    if (unitFilter === "all") return payslips;
    return payslips.filter((p) => p.operating_unit?.name === unitFilter);
  }, [payslips, unitFilter]);

  const table = useDataTable({
    columns,
    data: filteredData,
    enableSorting: true,
    enableGlobalFilter: true,
    enablePagination: true,
    pageSize: 20,
    getRowId: (p) => p.id,
  });

  return (
    <DataTable table={table}>
      <DataTable.Header>
        <DataTable.Toolbar>
          <DataTable.SearchInput placeholder="بحث باسم الموظف أو الرقم..." />
          {units.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-app-label-secondary">
              <Filter className="w-3.5 h-3.5 text-app-label-tertiary" />
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="rounded-xl border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
              >
                <option value="all">جميع الوحدات ({payslips.length})</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}
        </DataTable.Toolbar>
        <DataTable.Actions>
          <span className="text-xs font-mono text-app-label-secondary">
            عدد القسائم: {filteredData.length}
          </span>
        </DataTable.Actions>
      </DataTable.Header>
      <DataTable.Content emptyMessage="لا توجد قسائم رواتب مطابقة." emptyIcon={Banknote} />
      <DataTable.Pagination />
    </DataTable>
  );
};

export const PayrollPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentMonthStr);
  const [viewMode, setViewMode] = useState<"month" | "all">("month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createPeriod, setCreatePeriod] = useState<string>(currentMonthStr);

  const { data: allRunsData, isLoading: isAllRunsLoading } = usePayrollRuns({ per_page: 50 });
  const openMutation = useOpenPayrollRun();
  const actionMutation = usePayrollAction();

  const allRuns = useMemo(() => allRunsData?.data ?? [], [allRunsData]);

  // Find active run for the selected period
  const activeRun = useMemo(() => {
    return allRuns.find((r) => r.period === selectedPeriod) ?? null;
  }, [allRuns, selectedPeriod]);

  // Fetch payslips for the active run
  const { data: payslips, isLoading: isPayslipsLoading } = usePayslips(activeRun?.id);

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const openRun = (targetPeriod: string) => {
    setError(null);
    openMutation.mutate(targetPeriod, {
      onSuccess: () => {
        setSelectedPeriod(targetPeriod);
        setViewMode("month");
        setIsCreateOpen(false);
      },
      onError: (err) => fail(err, "تعذر فتح المسير."),
    });
  };

  const act = (run: PayrollRun) => {
    const next = NEXT_ACTION[run.status];
    if (!next) return;
    setError(null);
    actionMutation.mutate(
      { id: run.id, action: next.action },
      { onError: (err) => fail(err, "تعذر تنفيذ الإجراء.") },
    );
  };

  // Detailed month statistics
  const monthStats = useMemo(() => {
    if (!activeRun) return null;

    const list = payslips ?? [];
    const baseTotal = list.reduce((sum, p) => sum + Number(p.base_pay || 0), 0);
    const attendanceTotal = list.reduce((sum, p) => sum + Number(p.attendance_pay || 0), 0);
    const laborLogTotal = list.reduce((sum, p) => sum + Number(p.labor_log_pay || 0), 0);
    const grossTotal = Number(activeRun.total_gross || 0);
    const netTotal = Number(activeRun.total_net || 0);
    const deductionsTotal = Number(activeRun.total_deductions || 0);
    const employeeCount = list.length > 0 ? list.length : (activeRun.payslips_count ?? 0);

    // Breakdown data for salary components chart
    const compositionData = [
      { name: "الأساسي", amount: baseTotal, fill: "#3b82f6" },
      { name: "الحضور", amount: attendanceTotal, fill: "#f59e0b" },
      { name: "الإنتاج", amount: laborLogTotal, fill: "#8b5cf6" },
      { name: "الاستقطاعات", amount: deductionsTotal, fill: "#ef4444" },
    ];

    // Breakdown data by operating unit
    const unitMap: Record<string, { unit: string; gross: number; net: number; count: number }> = {};
    list.forEach((p) => {
      const uName = p.operating_unit?.name || "الوحدة الرئيسية";
      if (!unitMap[uName]) {
        unitMap[uName] = { unit: uName, gross: 0, net: 0, count: 0 };
      }
      unitMap[uName].gross += Number(p.gross_pay || 0);
      unitMap[uName].net += Number(p.net_pay || 0);
      unitMap[uName].count += 1;
    });
    const unitData = Object.values(unitMap);

    // Deductions breakdown
    const deductionsMap: Record<string, { type: string; amount: number; count: number }> = {};
    list.forEach((p) => {
      (p.deductions ?? []).forEach((d) => {
        if (!deductionsMap[d.type]) {
          deductionsMap[d.type] = { type: d.type, amount: 0, count: 0 };
        }
        deductionsMap[d.type].amount += Number(d.amount || 0);
        deductionsMap[d.type].count += 1;
      });
    });
    const deductionsData = Object.values(deductionsMap);

    return {
      baseTotal,
      attendanceTotal,
      laborLogTotal,
      grossTotal,
      netTotal,
      deductionsTotal,
      employeeCount,
      compositionData,
      unitData,
      deductionsData,
    };
  }, [activeRun, payslips]);

  // Trend data across all runs for the overview mode
  const trendData = useMemo(() => {
    return [...allRuns]
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((r) => ({
        period: r.period,
        gross: Number(r.total_gross || 0),
        net: Number(r.total_net || 0),
        deductions: Number(r.total_deductions || 0),
        count: r.payslips_count ?? 0,
      }));
  }, [allRuns]);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Banknote className="w-7 h-7 text-app-accent" />
            مسير الرواتب والأجور (Payroll)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            دورة الصرف المعتمدة: احتساب الرواتب والبدلات ← مراجعة الاستقطاعات ← اعتماد الإدارة المالية ← تأكيد الصرف ← الترحيل لدفاتر الحسابات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> فتح مسير شهر جديد
          </button>
        </div>
      </div>

      {/* Filter and Mode Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
        {/* View Mode Toggle */}
        <div className="flex rounded-xl border border-app-separator overflow-hidden bg-app-bg-secondary p-0.5 self-start">
          <button
            onClick={() => setViewMode("month")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "month"
                ? "bg-app-bg-primary text-app-label-primary shadow-sm"
                : "text-app-label-secondary hover:text-app-label-primary"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-app-accent" />
            تفاصيل شهر محدد
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "all"
                ? "bg-app-bg-primary text-app-label-primary shadow-sm"
                : "text-app-label-secondary hover:text-app-label-primary"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-app-accent" />
            نظرة عامة لجميع الشهور ({allRuns.length})
          </button>
        </div>

        {/* Month Selector Controls (Active in Month Mode) */}
        {viewMode === "month" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-app-label-secondary">الشهر المفلتر:</span>
            <div className="flex items-center rounded-xl border border-app-separator bg-app-bg-secondary p-1">
              <button
                onClick={() => setSelectedPeriod((p) => getNextMonth(p))}
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary"
                title="الشهر التالي"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent px-2.5 py-0.5 text-xs font-mono font-bold text-app-label-primary focus:outline-none"
              />
              <button
                onClick={() => setSelectedPeriod((p) => getPreviousMonth(p))}
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary"
                title="الشهر السابق"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {selectedPeriod !== currentMonthStr && (
              <button
                onClick={() => setSelectedPeriod(currentMonthStr)}
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-app-label-secondary hover:text-app-accent hover:bg-app-fill-f1"
              >
                الشهر الحالي
              </button>
            )}

            {allRuns.length > 0 && (
              <select
                value={allRuns.some((r) => r.period === selectedPeriod) ? selectedPeriod : ""}
                onChange={(e) => e.target.value && setSelectedPeriod(e.target.value)}
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-mono text-app-label-primary focus:border-app-accent focus:outline-none"
              >
                <option value="" disabled>
                  اختر من المسيرات المسجلة...
                </option>
                {allRuns.map((r) => (
                  <option key={r.id} value={r.period}>
                    {r.period} ({PAYROLL_STATUS_LABEL[r.status]})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* VIEW MODE: DETAILED MONTH VIEW */}
      {viewMode === "month" && (
        <div className="space-y-6">
          {isAllRunsLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary text-xs text-app-label-secondary">
              جارٍ تحميل بيانات المسير…
            </div>
          ) : !activeRun ? (
            /* Empty State for Month */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-app-separator bg-app-bg-primary p-12 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-accent/10 text-app-accent mb-4">
                <Calendar className="h-7 w-7" />
              </div>
              <h2 className="text-base font-bold text-app-label-primary">
                لا يوجد مسير رواتب مسجل لشهر ({selectedPeriod})
              </h2>
              <p className="text-xs text-app-label-secondary mt-1.5 max-w-md">
                يمكنك فتح مسير رواتب جديد لهذا الشهر للبدء في تجميع بيانات الحضور وسجلات العمل واحتساب المستحقات آلياً.
              </p>
              <button
                onClick={() => openRun(selectedPeriod)}
                disabled={openMutation.isPending}
                className="mt-5 flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Plus className="w-4 h-4" /> فتح مسير شهر {selectedPeriod} الآن
              </button>
            </div>
          ) : (
            /* Month Details and Visualization */
            <div className="space-y-6">
              {/* Month Status & Workflow Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-app-accent/15 text-app-accent">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-mono text-app-label-primary">
                        مسير شهر {activeRun.period}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          STATUS_STYLE[activeRun.status]
                        }`}
                      >
                        {PAYROLL_STATUS_LABEL[activeRun.status]}
                      </span>
                    </div>
                    <p className="text-xs text-app-label-secondary mt-0.5">
                      {NEXT_ACTION[activeRun.status]?.desc ?? "المسير معتمد ومرحل بالكامل إلى شجرة الحسابات."}
                    </p>
                  </div>
                </div>

                {NEXT_ACTION[activeRun.status] && (
                  <button
                    onClick={() => act(activeRun)}
                    disabled={actionMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {NEXT_ACTION[activeRun.status]?.label}
                  </button>
                )}
              </div>

              {/* KPI Summary Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Gross Pay */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-app-label-secondary block">
                    إجمالي المستحق (Gross)
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-app-label-primary">
                      {formatNumber(monthStats?.grossTotal)}
                    </span>
                    <span className="text-[10px] text-app-label-tertiary font-mono">د.ل</span>
                  </div>
                </div>

                {/* Base Pay */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-app-label-secondary block">
                    الراتب الأساسي (Base)
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                      {formatNumber(monthStats?.baseTotal)}
                    </span>
                    <span className="text-[10px] text-app-label-tertiary font-mono">د.ل</span>
                  </div>
                </div>

                {/* Attendance Pay */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-app-label-secondary block">
                    أجر الحضور والدوام
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                      {formatNumber(monthStats?.attendanceTotal)}
                    </span>
                    <span className="text-[10px] text-app-label-tertiary font-mono">د.ل</span>
                  </div>
                </div>

                {/* Production Pay */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-app-label-secondary block">
                    أجور الإنتاج والمهام
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                      {formatNumber(monthStats?.laborLogTotal)}
                    </span>
                    <span className="text-[10px] text-app-label-tertiary font-mono">د.ل</span>
                  </div>
                </div>

                {/* Total Deductions */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-app-label-secondary block">
                    إجمالي الاستقطاعات
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                      {formatNumber(monthStats?.deductionsTotal)}
                    </span>
                    <span className="text-[10px] text-app-label-tertiary font-mono">د.ل</span>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
                    صافي الصرف (Net)
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatNumber(monthStats?.netTotal)}
                    </span>
                    <span className="text-[10px] text-emerald-600/70 font-mono">د.ل</span>
                  </div>
                </div>
              </div>

              {/* Visualizations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualization 1: Salary Composition Breakdown */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-app-accent" />
                      <h3 className="text-sm font-bold text-app-label-primary">
                        توزيع بنود الرواتب لشهر {activeRun.period}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-app-label-secondary">
                      المجموع: {formatNumber(monthStats?.grossTotal)} د.ل
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    {monthStats?.grossTotal === 0 && monthStats?.employeeCount === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-app-label-tertiary">
                        لم يتم احتساب المسير بعد لتوليد الرسم البياني.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthStats?.compositionData}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150,150,150,0.15)" />
                          <XAxis type="number" tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(v: number | string | undefined) => [
                              `${formatNumber(v ?? 0)} د.ل`,
                              "المبلغ",
                            ]}
                          />
                          <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                            {monthStats?.compositionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Visualization 2: Cost by Operating Unit */}
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-app-accent" />
                      <h3 className="text-sm font-bold text-app-label-primary">
                        توزيع تكلفة الرواتب حسب الوحدة التشغيلية
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-app-label-secondary">
                      عدد الوحدات: {monthStats?.unitData.length ?? 0}
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    {!monthStats?.unitData || monthStats.unitData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-app-label-tertiary">
                        لا توجد وحدات تشغيلية مسندة في هذا المسير.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthStats.unitData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" />
                          <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                          <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(v: number | string | undefined) => [
                              `${formatNumber(v ?? 0)} د.ل`,
                              "",
                            ]}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="gross" name="إجمالي المستحق" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="net" name="صافي الصرف" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown Tags if any exist */}
              {monthStats?.deductionsData && monthStats.deductionsData.length > 0 && (
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                  <span className="text-xs font-bold text-app-label-primary block mb-2">
                    تفاصيل الاستقطاعات لشهر {activeRun.period}:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {monthStats.deductionsData.map((d) => (
                      <div
                        key={d.type}
                        className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300 font-mono"
                      >
                        <span className="font-bold">{d.type}:</span>
                        <span>{formatNumber(d.amount)} د.ل</span>
                        <span className="text-[10px] text-rose-500/70">({d.count} موظف)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Payslips Table Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-app-accent" />
                    <h3 className="text-base font-bold text-app-label-primary">
                      قسائم رواتب الموظفين (تفاصيل شهر {activeRun.period})
                    </h3>
                  </div>
                  <span className="text-xs text-app-label-secondary font-mono">
                    إجمالي الموظفين: {monthStats?.employeeCount ?? 0}
                  </span>
                </div>

                {isPayslipsLoading ? (
                  <div className="flex h-48 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary text-xs text-app-label-secondary">
                    جارٍ تحميل قسائم الرواتب…
                  </div>
                ) : payslips && payslips.length > 0 ? (
                  <PayslipsTable payslips={payslips} run={activeRun} onError={setError} />
                ) : (
                  <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-8 text-center text-xs text-app-label-tertiary">
                    لم تُحتسب قسائم الرواتب بعد. اضغط على زر "احتساب المسير" أعلاه لتوليد القسائم آلياً.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE: ALL MONTHS OVERVIEW */}
      {viewMode === "all" && (
        <div className="space-y-6">
          {/* Trend Chart Card */}
          <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-app-accent" />
                <h3 className="text-base font-bold text-app-label-primary">
                  مقارنة حركة الرواتب عبر الشهور (Payroll Expenses Trend)
                </h3>
              </div>
              <span className="text-xs font-mono text-app-label-secondary">
                إجمالي الفترات: {allRuns.length}
              </span>
            </div>

            <div className="h-72 w-full">
              {trendData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-app-label-tertiary">
                  لا توجد بيانات مسيرات كافية لعرض الرسم البياني.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number | string | undefined) => [
                        `${formatNumber(v ?? 0)} د.ل`,
                        "",
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="gross" name="إجمالي المستحق" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="net" name="صافي الصرف" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="deductions" name="الاستقطاعات" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* All Months Summary Grid / List */}
          <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
            <div className="border-b border-app-separator bg-app-bg-secondary px-5 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-app-label-primary">
                سجل كافة مسيرات الرواتب
              </h3>
              <span className="text-xs text-app-label-secondary">
                اضغط على أي شهر لعرض تفاصيله ورسومه البيانية
              </span>
            </div>

            {isAllRunsLoading ? (
              <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
                جارٍ التحميل…
              </div>
            ) : allRuns.length === 0 ? (
              <div className="p-10 text-center text-xs text-app-label-tertiary">
                لا توجد مسيرات مسجلة حتى الآن.
              </div>
            ) : (
              <div className="divide-y divide-app-separator">
                {allRuns.map((run) => {
                  const next = NEXT_ACTION[run.status];

                  return (
                    <div
                      key={run.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-app-fill-f1 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedPeriod(run.period);
                            setViewMode("month");
                          }}
                          className="font-mono font-bold text-app-accent text-sm hover:underline"
                        >
                          {run.period}
                        </button>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            STATUS_STYLE[run.status]
                          }`}
                        >
                          {PAYROLL_STATUS_LABEL[run.status]}
                        </span>
                        <span className="text-xs text-app-label-secondary font-mono">
                          {run.payslips_count ?? 0} موظف
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="text-app-label-secondary">
                          <span>إجمالي: </span>
                          <span className="font-bold text-app-label-primary">{formatNumber(run.total_gross)}</span>
                        </div>
                        <div className="text-app-label-secondary">
                          <span>استقطاعات: </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatNumber(run.total_deductions)}
                          </span>
                        </div>
                        <div className="text-app-label-secondary">
                          <span>صافي: </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatNumber(run.total_net)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {next && (
                          <button
                            onClick={() => act(run)}
                            disabled={actionMutation.isPending}
                            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
                          >
                            {next.label}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPeriod(run.period);
                            setViewMode("month");
                          }}
                          className="rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                        >
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Open New Payroll Run */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl">
            <h3 className="text-lg font-bold text-app-label-primary flex items-center gap-2">
              <Banknote className="w-5 h-5 text-app-accent" />
              فتح مسير رواتب جديد
            </h3>
            <p className="text-xs text-app-label-secondary mt-1">
              حدد الشهر لإنشاء مسير رواتب جديد. سيتمكن النظام من جمع سجلات الدوام وتكاليف الإنتاج واحتسابها.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                فترة المسير (الشهر والسنة)
              </label>
              <input
                type="month"
                value={createPeriod}
                onChange={(e) => setCreatePeriod(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-sm font-mono text-app-label-primary focus:border-app-accent focus:outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2 text-xs font-bold text-app-label-secondary hover:bg-app-fill-f1"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => openRun(createPeriod)}
                disabled={openMutation.isPending}
                className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {openMutation.isPending ? "جارٍ الفتح…" : `فتح مسير ${createPeriod}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
