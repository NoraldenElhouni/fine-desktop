import React, { useState } from "react";
import { BadgeDollarSign, Plus, AlertTriangle } from "lucide-react";
import { useLaborRates, useCreateLaborRate } from "../../hooks/useHr";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { LaborRoleRate } from "../../api/endpoints/hr";

const fmt = (v: number | string) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

export const LaborRatesPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [rate, setRate] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));

  const { data: rates, isLoading } = useLaborRates();
  const createMutation = useCreateLaborRate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      { role: role.trim(), hourly_rate: Number(rate), effective_from: effectiveFrom },
      {
        onSuccess: () => { setRole(""); setRate(""); },
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذر نشر الأجر."),
      },
    );
  };

  const byRole = new Map<string, LaborRoleRate[]>();
  for (const r of rates ?? []) {
    byRole.set(r.role, [...(byRole.get(r.role) ?? []), r]);
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <BadgeDollarSign className="w-7 h-7 text-app-accent" />
          أجور الأدوار (Labor Role Rates)
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          الأجور مُصدَّرة بإصدارات لا تُعدَّل: النسخة الأحدث بتاريخ سريانها هي المعتمدة، وما سُجّل من ساعات
          بسعر قديم يبقى كما هو.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <input
          type="text" required placeholder="الدور — tailor / carpenter"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
        />
        <input
          type="number" step="0.01" min="0.01" required placeholder="الأجر بالساعة"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-32 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
        />
        <input
          type="date" required value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !role.trim() || Number(rate) <= 0}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> نشر إصدار جديد
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <div className="divide-y divide-app-separator">
            {[...byRole.entries()].map(([roleName, versions]) => (
              <div key={roleName} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-app-accent text-sm">{roleName}</span>
                  <span className="text-xs font-bold text-app-label-primary">
                    {fmt(versions[0].hourly_rate)} / ساعة
                  </span>
                  <span className="text-[10px] text-app-label-tertiary">
                    ساري من {versions[0].effective_from?.slice(0, 10)}
                  </span>
                </div>
                {versions.length > 1 && (
                  <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] font-mono text-app-label-tertiary">
                    {versions.slice(1).map((v) => (
                      <span key={v.id}>{fmt(v.hourly_rate)} من {v.effective_from?.slice(0, 10)}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {byRole.size === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">
                لا توجد أجور منشورة — تُستخدم أجور الـ BOM كبديل حتى تُنشر.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
