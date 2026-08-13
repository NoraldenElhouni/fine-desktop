import React, { useState } from "react";
import { Droplets, Plus, AlertTriangle, Share2, Settings2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  useOverheadExpenses,
  useCreateOverheadExpense,
  useAllocateOverhead,
  useOverheadRules,
  useStoreOverheadRule,
} from "../../hooks/useOverhead";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { apiErrorPayload } from "../../api/endpoints/production";
import {
  OVERHEAD_CATEGORY_LABEL,
  ALLOCATION_METHOD_LABEL,
  type AllocationMethod,
  type OverheadCategory,
  type OverheadExpense,
} from "../../api/endpoints/overhead";

const fmt = (v: number | string) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const OverheadExpensesPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [allocating, setAllocating] = useState<OverheadExpense | null>(null);

  // create form
  const [category, setCategory] = useState<OverheadCategory>("electricity");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentSource, setPaymentSource] = useState<"cash" | "payable">("cash");
  const [scope, setScope] = useState<"company" | "unit">("company");
  const [unitId, setUnitId] = useState("");

  // allocation form
  const [method, setMethod] = useState<AllocationMethod>("even_split");
  const [weights, setWeights] = useState<Record<string, string>>({});

  const { data: expenses, isLoading } = useOverheadExpenses();
  const { data: units } = useQuery({ queryKey: ["operatingUnits"], queryFn: () => getOperatingUnits() });
  const { data: rules } = useOverheadRules();
  const createMutation = useCreateOverheadExpense();
  const allocateMutation = useAllocateOverhead();
  const ruleMutation = useStoreOverheadRule();

  const activeRule = rules?.find((r) => r.is_active);
  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        category,
        description: description || undefined,
        amount: num(amount),
        expense_date: expenseDate,
        payment_source: paymentSource,
        is_company_wide: scope === "company",
        operating_unit_id: scope === "unit" ? unitId : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDescription("");
          setAmount("");
        },
        onError: (err) => fail(err, "تعذر تسجيل المصروف."),
      },
    );
  };

  const submitAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocating) return;
    setError(null);

    const weightMap = Object.fromEntries(
      Object.entries(weights).filter(([, v]) => v !== "").map(([k, v]) => [k, num(v)]),
    );

    allocateMutation.mutate(
      {
        id: allocating.id,
        payload: {
          method,
          usage: method === "usage_based" ? weightMap : undefined,
          percentages: method === "manual_percentage" ? weightMap : undefined,
        },
      },
      {
        onSuccess: () => { setAllocating(null); setWeights({}); },
        onError: (err) => fail(err, "تعذر توزيع المصروف."),
      },
    );
  };

  const needsWeights = method === "usage_based" || method === "manual_percentage";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Droplets className="w-7 h-7 text-app-accent" />
            المصاريف العمومية (Overhead)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كل مصروف يقيد في الدفاتر فور تسجيله. المصاريف على مستوى الشركة تُوزَّع على الوحدات لاحقًا؛
            وعند تفعيل التحميل الكامل تدخل حصص وحدات التصنيع في تكلفة الإنتاج.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-app-label-secondary">
            <Settings2 className="w-4 h-4" />
            القاعدة الافتراضية:
            <select
              value={activeRule?.method ?? ""}
              onChange={(e) =>
                ruleMutation.mutate({ method: e.target.value as AllocationMethod })
              }
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs text-app-label-primary focus:outline-none"
            >
              <option value="" disabled>غير محددة</option>
              {(Object.keys(ALLOCATION_METHOD_LABEL) as AllocationMethod[]).map((m) => (
                <option key={m} value={m}>{ALLOCATION_METHOD_LABEL[m]}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> تسجيل مصروف
          </button>
        </div>
      </div>

      {error && !showForm && !allocating && (
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
            {expenses?.data.map((expense) => (
              <div key={expense.id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-app-label-primary">
                    {OVERHEAD_CATEGORY_LABEL[expense.category]}
                  </span>
                  <span className="font-mono text-xs text-app-label-secondary">{expense.expense_date?.slice(0, 10)}</span>
                  <span className="text-xs text-app-label-secondary">
                    {expense.operating_unit?.name ?? "على مستوى الشركة"}
                  </span>
                  <span className="font-mono font-bold text-sm text-app-label-primary">{fmt(expense.amount)}</span>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${expense.status === "allocated" ? "bg-app-status-positive/10 text-app-status-positive" : "bg-app-status-yellow/15 text-app-status-yellow"}`}>
                    {expense.status === "allocated" ? "مُوزَّع" : "مسجّل"}
                  </span>

                  {expense.status === "recorded" && expense.operating_unit_id === null && (
                    <button
                      onClick={() => { setAllocating(expense); setMethod(activeRule?.method ?? "even_split"); setError(null); }}
                      className="ms-auto flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      <Share2 className="w-3.5 h-3.5" /> توزيع على الوحدات
                    </button>
                  )}
                </div>

                {expense.description && (
                  <p className="text-xs text-app-label-secondary">{expense.description}</p>
                )}

                {expense.allocations && expense.allocations.length > 0 && (
                  <div className="text-xs text-app-label-secondary font-mono flex flex-wrap gap-4">
                    {expense.allocations.map((a) => (
                      <span key={a.id}>
                        {a.operating_unit?.name}: {fmt(a.amount)}
                        {a.absorbed && <span className="text-app-accent ms-1">(محمّل على الإنتاج)</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {expenses?.data.length === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">لا توجد مصاريف مسجلة.</div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">تسجيل مصروف عمومي</h3>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submitExpense} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as OverheadCategory)}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  {(Object.keys(OVERHEAD_CATEGORY_LABEL) as OverheadCategory[]).map((c) => (
                    <option key={c} value={c}>{OVERHEAD_CATEGORY_LABEL[c]}</option>
                  ))}
                </select>
                <input
                  type="number" step="0.01" min="0.01" required placeholder="المبلغ (LYD)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-32 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <input
                  type="date" required value={expenseDate} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                />
              </div>

              <input
                type="text" placeholder="وصف (اختياري)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              />

              <div className="flex gap-2">
                <select
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value as "cash" | "payable")}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="cash">دفع نقدي (من الخزينة)</option>
                  <option value="payable">آجل (ذمم دائنة)</option>
                </select>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as "company" | "unit")}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="company">على مستوى الشركة (يُوزَّع لاحقًا)</option>
                  <option value="unit">خاص بوحدة</option>
                </select>
              </div>

              {scope === "unit" && (
                <select
                  required value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="">اختر الوحدة…</option>
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || num(amount) <= 0 || (scope === "unit" && !unitId)}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? "جارٍ التسجيل…" : "تسجيل وقيد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {allocating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">
              توزيع {OVERHEAD_CATEGORY_LABEL[allocating.category]} — {fmt(allocating.amount)}
            </h3>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submitAllocation} className="space-y-3">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as AllocationMethod)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              >
                {(Object.keys(ALLOCATION_METHOD_LABEL) as AllocationMethod[]).map((m) => (
                  <option key={m} value={m}>{ALLOCATION_METHOD_LABEL[m]}</option>
                ))}
              </select>

              {needsWeights && (
                <div className="space-y-2">
                  <p className="text-xs text-app-label-secondary">
                    {method === "usage_based" ? "الاستهلاك المقاس لكل وحدة:" : "النسبة المئوية لكل وحدة (المجموع 100):"}
                  </p>
                  {units?.map((u) => (
                    <div key={u.id} className="flex items-center gap-2">
                      <span className="flex-1 text-xs text-app-label-primary">{u.name}</span>
                      <input
                        type="number" step="0.01" min="0"
                        value={weights[u.id] ?? ""}
                        onChange={(e) => setWeights({ ...weights, [u.id]: e.target.value })}
                        className="w-28 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button" onClick={() => setAllocating(null)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={allocateMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {allocateMutation.isPending ? "جارٍ التوزيع…" : "توزيع وقيد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
