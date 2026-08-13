import React, { useState } from "react";
import { Building, Plus, AlertTriangle, CalendarClock, Wrench, PackageX, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  useFixedAssets,
  useFixedAssetSchedule,
  useCreateFixedAsset,
  useDepreciateAsset,
  useDisposeAsset,
  useTransitionAsset,
} from "../../hooks/useFixedAssets";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { apiErrorPayload } from "../../api/endpoints/production";
import {
  ASSET_STATUS_LABEL,
  DEPRECIATION_METHOD_LABEL,
  type DepreciationMethod,
  type FixedAsset,
} from "../../api/endpoints/fixedAssets";

const fmt = (v: number | string) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const STATUS_STYLE: Record<FixedAsset["status"], string> = {
  active: "bg-app-status-positive/10 text-app-status-positive",
  under_maintenance: "bg-app-status-yellow/15 text-app-status-yellow",
  disposed: "bg-app-fill-f1 text-app-label-tertiary",
};

export const FixedAssetsPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<FixedAsset | null>(null);
  const [disposing, setDisposing] = useState<FixedAsset | null>(null);
  const [proceeds, setProceeds] = useState("");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const [form, setForm] = useState({
    name: "",
    asset_code: "",
    acquisition_cost: "",
    acquisition_date: new Date().toISOString().slice(0, 10),
    depreciation_method: "straight_line" as DepreciationMethod,
    useful_life_years: "5",
    salvage_value: "0",
    payment_source: "cash" as "cash" | "payable",
    scope: "unit" as "company" | "unit",
    operating_unit_id: "",
  });

  const { data: assets, isLoading } = useFixedAssets();
  const { data: units } = useQuery({ queryKey: ["operatingUnits"], queryFn: () => getOperatingUnits() });
  const { data: schedule } = useFixedAssetSchedule(scheduleFor?.id);
  const createMutation = useCreateFixedAsset();
  const depreciateMutation = useDepreciateAsset();
  const disposeMutation = useDisposeAsset();
  const transitionMutation = useTransitionAsset();

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const submitAsset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        name: form.name,
        asset_code: form.asset_code,
        acquisition_cost: num(form.acquisition_cost),
        acquisition_date: form.acquisition_date,
        depreciation_method: form.depreciation_method,
        useful_life_years: num(form.useful_life_years),
        salvage_value: num(form.salvage_value),
        payment_source: form.payment_source,
        is_company_wide: form.scope === "company",
        operating_unit_id: form.scope === "unit" ? form.operating_unit_id : undefined,
      },
      {
        onSuccess: () => setShowForm(false),
        onError: (err) => fail(err, "تعذر تسجيل الأصل."),
      },
    );
  };

  const runDepreciation = (asset: FixedAsset) => {
    setError(null);
    depreciateMutation.mutate(
      { id: asset.id, period },
      { onError: (err) => fail(err, "تعذر تسجيل الإهلاك.") },
    );
  };

  const submitDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposing) return;
    setError(null);
    disposeMutation.mutate(
      { id: disposing.id, proceeds: num(proceeds) },
      {
        onSuccess: () => { setDisposing(null); setProceeds(""); },
        onError: (err) => fail(err, "تعذر استبعاد الأصل."),
      },
    );
  };

  const bookValue = (a: FixedAsset) =>
    Number(a.acquisition_cost) - Number(a.accumulated_depreciation);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Building className="w-7 h-7 text-app-accent" />
            الأصول الثابتة (Fixed Assets)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            الشراء يُرسمل الأصل، والإهلاك الشهري يُقيد تلقائيًا أول كل شهر (ويمكن تشغيله يدويًا هنا).
            الاستبعاد يسوّي القيمة الدفترية مقابل المتحصلات ويقيد الفرق ربحًا أو خسارة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-app-label-secondary">
            فترة الإهلاك:
            <input
              type="month" value={period} max={new Date().toISOString().slice(0, 7)}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs font-mono text-app-label-primary focus:outline-none"
            />
          </label>
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> تسجيل أصل
          </button>
        </div>
      </div>

      {error && !showForm && !disposing && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-app-label-secondary border-b border-app-separator bg-app-bg-secondary">
              <tr>
                <th className="px-4 py-2.5 text-start font-bold">الرمز</th>
                <th className="px-4 py-2.5 text-start font-bold">الأصل</th>
                <th className="px-4 py-2.5 text-start font-bold">الوحدة</th>
                <th className="px-4 py-2.5 text-start font-bold">الطريقة</th>
                <th className="px-4 py-2.5 text-end font-bold">التكلفة</th>
                <th className="px-4 py-2.5 text-end font-bold">مجمع الإهلاك</th>
                <th className="px-4 py-2.5 text-end font-bold">القيمة الدفترية</th>
                <th className="px-4 py-2.5 text-start font-bold">الحالة</th>
                <th className="px-4 py-2.5 text-start font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {assets?.data.map((asset) => (
                <tr key={asset.id} className="hover:bg-app-fill-f1">
                  <td className="px-4 py-2 font-mono font-bold text-app-accent">{asset.asset_code}</td>
                  <td className="px-4 py-2 text-app-label-primary">{asset.name}</td>
                  <td className="px-4 py-2 text-app-label-secondary">{asset.operating_unit?.name ?? "الشركة"}</td>
                  <td className="px-4 py-2 text-app-label-secondary">{DEPRECIATION_METHOD_LABEL[asset.depreciation_method]}</td>
                  <td className="px-4 py-2 text-end font-mono">{fmt(asset.acquisition_cost)}</td>
                  <td className="px-4 py-2 text-end font-mono">{fmt(asset.accumulated_depreciation)}</td>
                  <td className="px-4 py-2 text-end font-mono font-bold">{fmt(bookValue(asset))}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STATUS_STYLE[asset.status]}`}>
                      {ASSET_STATUS_LABEL[asset.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      {asset.status === "active" && (
                        <>
                          <button
                            title={`تسجيل إهلاك ${period}`}
                            onClick={() => runDepreciation(asset)}
                            disabled={depreciateMutation.isPending}
                            className="rounded-lg bg-app-accent px-2 py-1 text-[10px] font-bold text-white hover:opacity-90 disabled:opacity-50"
                          >
                            إهلاك {period}
                          </button>
                          <button
                            title="إيقاف للصيانة"
                            onClick={() => transitionMutation.mutate({ id: asset.id, status: "under_maintenance" })}
                            className="p-1 text-app-label-tertiary hover:text-app-status-yellow"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {asset.status === "under_maintenance" && (
                        <button
                          title="إعادة تشغيل"
                          onClick={() => transitionMutation.mutate({ id: asset.id, status: "active" })}
                          className="p-1 text-app-label-tertiary hover:text-app-status-positive"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {asset.status !== "disposed" && (
                        <button
                          title="استبعاد"
                          onClick={() => { setDisposing(asset); setError(null); }}
                          className="p-1 text-app-label-tertiary hover:text-app-status-danger"
                        >
                          <PackageX className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        title="جدول الإهلاك"
                        onClick={() => setScheduleFor(scheduleFor?.id === asset.id ? null : asset)}
                        className="p-1 text-app-label-tertiary hover:text-app-accent"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assets?.data.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-app-label-tertiary">لا توجد أصول مسجلة.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {scheduleFor && schedule && (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <div className="flex items-center gap-2 border-b border-app-separator p-4">
            <CalendarClock className="w-4 h-4 text-app-accent" />
            <span className="text-sm font-bold text-app-label-primary">
              جدول إهلاك {scheduleFor.name}
            </span>
            <span className="ms-auto font-mono text-xs text-app-label-secondary">
              القيمة الدفترية الحالية: {fmt(schedule.book_value)}
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-app-label-secondary border-b border-app-separator sticky top-0 bg-app-bg-secondary">
                <tr>
                  <th className="px-4 py-2 text-start font-bold">الفترة</th>
                  <th className="px-4 py-2 text-end font-bold">قسط الإهلاك</th>
                  <th className="px-4 py-2 text-end font-bold">القيمة الدفترية بعده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-separator">
                {schedule.rows.map((row) => (
                  <tr key={row.period}>
                    <td className="px-4 py-1.5 font-mono">{row.period}</td>
                    <td className="px-4 py-1.5 text-end font-mono">{fmt(row.amount)}</td>
                    <td className="px-4 py-1.5 text-end font-mono">{fmt(row.book_value_after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">تسجيل أصل ثابت</h3>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submitAsset} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text" required placeholder="اسم الأصل"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                />
                <input
                  type="text" required placeholder="الرمز — FA-1001"
                  value={form.asset_code}
                  onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                  className="w-32 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number" step="0.01" min="0.01" required placeholder="تكلفة الشراء"
                  value={form.acquisition_cost}
                  onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <input
                  type="number" step="0.01" min="0" placeholder="قيمة الخردة"
                  value={form.salvage_value}
                  onChange={(e) => setForm({ ...form, salvage_value: e.target.value })}
                  className="w-28 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <input
                  type="date" required value={form.acquisition_date} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })}
                  className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={form.depreciation_method}
                  onChange={(e) => setForm({ ...form, depreciation_method: e.target.value as DepreciationMethod })}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="straight_line">قسط ثابت</option>
                  <option value="declining_balance">قسط متناقص (مضاعف)</option>
                </select>
                <input
                  type="number" min="1" max="100" required placeholder="العمر بالسنوات"
                  value={form.useful_life_years}
                  onChange={(e) => setForm({ ...form, useful_life_years: e.target.value })}
                  className="w-28 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <select
                  value={form.payment_source}
                  onChange={(e) => setForm({ ...form, payment_source: e.target.value as "cash" | "payable" })}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="cash">دفع نقدي</option>
                  <option value="payable">آجل</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value as "company" | "unit" })}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="unit">تابع لوحدة</option>
                  <option value="company">على مستوى الشركة</option>
                </select>
                {form.scope === "unit" && (
                  <select
                    required value={form.operating_unit_id}
                    onChange={(e) => setForm({ ...form, operating_unit_id: e.target.value })}
                    className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                  >
                    <option value="">اختر الوحدة…</option>
                    {units?.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || num(form.acquisition_cost) <= 0 || (form.scope === "unit" && !form.operating_unit_id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? "جارٍ التسجيل…" : "تسجيل ورسملة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {disposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">
              استبعاد {disposing.name}
            </h3>
            <p className="text-xs text-app-label-secondary">
              القيمة الدفترية الحالية {fmt(bookValue(disposing))}. الفرق بين المتحصلات والقيمة الدفترية
              يُقيد ربحًا أو خسارة استبعاد.
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submitDisposal} className="space-y-3">
              <input
                type="number" step="0.01" min="0" required placeholder="متحصلات البيع (LYD)"
                value={proceeds}
                onChange={(e) => setProceeds(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button" onClick={() => setDisposing(null)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={disposeMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-status-danger hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {disposeMutation.isPending ? "جارٍ الاستبعاد…" : "استبعاد وقيد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
