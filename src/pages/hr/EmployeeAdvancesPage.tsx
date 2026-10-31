import React, { useState } from "react";
import { HandCoins, Pencil } from "lucide-react";
import { EmployeeAdvancesPanel } from "../../components/hr/EmployeeAdvancesPanel";
import { useHrSettings, useUpdateHrSettings } from "../../hooks/useHr";
import { usePermissions } from "../../hooks/usePermissions";
import { employeeErrorMessage } from "../../api/endpoints/employees";
import { formatNumber } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";

/**
 * The company's advance limits (HR-12, decision #14): one advance at most a
 * multiple of the monthly base salary, and the monthly recovery of all open
 * advances at most a percentage of it. HrSettingsController::update lets only
 * the owner or the HR manager change them.
 */
const AdvanceLimits: React.FC = () => {
  const { data: settings } = useHrSettings();
  const update = useUpdateHrSettings();
  const { roleSlugs } = usePermissions();
  // The controller checks the exact slugs; hasRole would also pass admin roles it refuses.
  const canEdit = roleSlugs.some((s) => s === "owner" || s === "hr-manager");
  const [editing, setEditing] = useState(false);
  const [multipleDraft, setMultipleDraft] = useState("");
  const [pctDraft, setPctDraft] = useState("");

  const multiple = settings?.advance_max_salary_multiple ?? 1;
  const pct = settings?.advance_max_deduction_pct ?? 50;

  const startEdit = () => {
    setMultipleDraft(String(multiple));
    setPctDraft(String(pct));
    setEditing(true);
  };

  const save = () => {
    const m = Number(multipleDraft);
    const p = Number(pctDraft);
    if (!Number.isFinite(m) || m < 0 || m > 100 || !Number.isFinite(p) || p < 0 || p > 100) {
      toast.error("أدخل قيمتين بين 0 و100.");
      return;
    }
    update.mutate(
      { advance_max_salary_multiple: m, advance_max_deduction_pct: p },
      {
        onSuccess: () => {
          toast.success("تم تحديث حدود السلف");
          setEditing(false);
        },
        onError: (err) => toast.error(employeeErrorMessage(err, "تعذر تحديث حدود السلف.")),
      },
    );
  };

  const input =
    "w-20 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 font-mono text-xs focus:border-app-accent focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-app-separator bg-app-bg-primary p-4 text-xs shadow-sm">
      <span className="font-bold text-app-label-primary">حدود السلف:</span>
      {editing ? (
        <>
          <label className="flex items-center gap-1.5 text-app-label-secondary">
            أقصى سلفة
            <input type="number" min="0" max="100" step="0.01" value={multipleDraft} onChange={(e) => setMultipleDraft(e.target.value)} className={input} />
            × الراتب الشهري
          </label>
          <label className="flex items-center gap-1.5 text-app-label-secondary">
            أقصى استقطاع شهري
            <input type="number" min="0" max="100" step="0.01" value={pctDraft} onChange={(e) => setPctDraft(e.target.value)} className={input} />
            ٪ من الراتب
          </label>
          <button
            type="button"
            onClick={save}
            disabled={update.isPending}
            className="rounded-lg bg-app-accent px-3 py-1 font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            حفظ
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-app-label-secondary hover:opacity-80">
            إلغاء
          </button>
        </>
      ) : (
        <>
          <span className="text-app-label-secondary">
            أقصى سلفة: <span className="font-mono font-bold text-app-label-primary">{formatNumber(multiple)} ×</span> الراتب الشهري
          </span>
          <span className="text-app-label-secondary">
            أقصى استقطاع شهري لكل السلف المفتوحة: <span className="font-mono font-bold text-app-label-primary">{formatNumber(pct)}٪</span> من الراتب
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1 text-app-accent font-bold hover:opacity-80"
            >
              <Pencil className="h-3 w-3" /> تعديل
            </button>
          )}
        </>
      )}
    </div>
  );
};

/** W5-02: salary advances and loans under HR. */
export const EmployeeAdvancesPage: React.FC = () => (
  <div className="space-y-6 p-6">
    <div>
      <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
        <HandCoins className="w-7 h-7 text-app-accent" />
        السلف والقروض
      </h1>
      <p className="text-xs text-app-label-secondary mt-1">
        يطلبها قسم الموارد البشرية، ويعتمدها ويصرفها من خزينة المالك أو مدير الحسابات أو مدير الموارد البشرية، وتُسترد آلياً
        بأقساط من مسير الرواتب؛ وما لا يُسترد في شهره يُرحَّل إلى الشهر التالي.
      </p>
    </div>
    <AdvanceLimits />
    <EmployeeAdvancesPanel />
  </div>
);

export default EmployeeAdvancesPage;
