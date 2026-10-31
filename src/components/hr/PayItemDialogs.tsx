import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { SearchableSelect } from "../ui/SearchableSelect";
import { ErrorBox, currentPeriod } from "./AdvanceDialogs";
import {
  ADJUSTMENT_KIND_LABEL,
  ADVANCE_PAY_CODES,
  DEDUCTION_ROLE_LABEL,
  PAY_ITEM_CALC_LABEL,
  PAY_ITEM_KIND_LABEL,
  payItemErrorMessage,
  type DeductionAccountRole,
  type EmployeeAdjustment,
  type EmployeePayItem,
  type PayItemCalculation,
  type PayItemKind,
  type PayItemPayload,
  type AdjustmentPayload,
} from "../../api/endpoints/payItems";
import {
  useCreateAdjustment,
  useCreatePayItem,
  usePayCodes,
  useUpdateAdjustment,
  useUpdatePayItem,
} from "../../hooks/usePayItems";
import { useEmployees } from "../../hooks/useEmployees";
import { localDateIso } from "../../lib/utils/format";
import type { LookupEntry } from "../../config/referenceLookups";
import type { Employee } from "../../types/entities";

const inputClass =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none";
const labelClass = "block text-xs font-semibold text-app-label-secondary mb-1";

/** Payroll pays neither terminated nor piece-rate employees (PAY_EMPLOYEE_NOT_ON_PAYROLL). */
export const isOnPayroll = (employee: Pick<Employee, "status" | "pay_type">): boolean =>
  employee.status !== "terminated" && employee.pay_type !== "piece_rate";

/**
 * The active types of a kind a new line may name (advance recovery never), plus
 * the line's own code when editing so a since-deactivated type still shows.
 */
const useCodeOptions = (kind: PayItemKind, currentCode?: string) => {
  const { allowanceTypes, deductionTypes, nameOf } = usePayCodes();
  const options = useMemo(() => {
    const source: LookupEntry[] = kind === "addition" ? allowanceTypes : deductionTypes;
    const list = source.filter(
      (entry) => entry.isActive && !ADVANCE_PAY_CODES.includes(entry.code.trim().toUpperCase()),
    );
    if (currentCode && !list.some((e) => e.code.trim().toUpperCase() === currentCode.trim().toUpperCase())) {
      list.push({ id: `current-${currentCode}`, code: currentCode, name: nameOf(kind, currentCode), isActive: false, fields: {} });
    }
    return list;
  }, [kind, allowanceTypes, deductionTypes, currentCode, nameOf]);
  return options;
};

const CodeSelect: React.FC<{
  kind: PayItemKind;
  value: string;
  onChange: (code: string) => void;
  options: LookupEntry[];
}> = ({ kind, value, onChange, options }) => {
  const selected = options.find((o) => o.code === value);
  const role = kind === "deduction" ? (selected?.fields.account_role as DeductionAccountRole | undefined) : undefined;
  return (
    <div>
      <label className={labelClass}>{kind === "addition" ? "نوع العلاوة" : "نوع الخصم"}</label>
      <select required value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="" disabled>
          اختر…
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.code}>
            {o.name} ({o.code}){o.isActive ? "" : " — موقوف"}
          </option>
        ))}
      </select>
      {options.length === 0 && (
        <p className="mt-1 text-[11px] text-app-status-yellow">
          لا توجد أنواع مفعّلة — أضفها من الإعدادات ← البيانات المرجعية ({kind === "addition" ? "أنواع العلاوات" : "أنواع الخصومات"}).
        </p>
      )}
      {kind === "deduction" && selected && (
        <p className="mt-1 text-[11px] text-app-label-tertiary">
          يُقيَّد في المسير: {DEDUCTION_ROLE_LABEL[role ?? "liability"]}
        </p>
      )}
    </div>
  );
};

// ─── Standing pay item ──────────────────────────────────────────────────────

interface PayItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  /** Editing an existing item; otherwise a new one. */
  item?: EmployeePayItem | null;
}

/**
 * HR-13: add or edit a standing allowance or deduction. An item that already
 * applied in a payroll that left review keeps its terms; the server then accepts
 * only a new end date (PAY_ITEM_FROZEN), which the error explains.
 */
export const PayItemDialog: React.FC<PayItemDialogProps> = ({ open, onOpenChange, employeeId, item }) => {
  const editing = Boolean(item);
  const [kind, setKind] = useState<PayItemKind>(item?.kind ?? "addition");
  const [code, setCode] = useState(item?.code ?? "");
  const [calc, setCalc] = useState<PayItemCalculation>(item?.calc ?? "fixed");
  const [value, setValue] = useState(item ? String(item.value) : "");
  const [from, setFrom] = useState(item?.effective_from ?? localDateIso());
  const [to, setTo] = useState(item?.effective_to ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const options = useCodeOptions(kind, item && item.kind === kind ? item.code : undefined);
  const create = useCreatePayItem();
  const update = useUpdatePayItem();
  const pending = create.isPending || update.isPending;

  const numericValue = Number(value);
  const valueValid = numericValue > 0 && (calc === "fixed" || numericValue <= 100);

  const close = () => {
    setError(null);
    onOpenChange(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const full: PayItemPayload = {
      kind,
      code,
      calc,
      value: numericValue,
      effective_from: from,
      effective_to: to || null,
      notes: notes.trim() || null,
    };
    if (!item) {
      create.mutate(
        { employeeId, payload: full },
        { onSuccess: close, onError: (err) => setError(payItemErrorMessage(err, "تعذر إضافة البند.")) },
      );
      return;
    }
    // Only what changed: a frozen item takes a new end date and notes, nothing else.
    const changed: Partial<PayItemPayload> & { record_version?: number } = { record_version: item.record_version };
    if (kind !== item.kind) changed.kind = kind;
    if (code !== item.code || kind !== item.kind) changed.code = code;
    if (calc !== item.calc) changed.calc = calc;
    if (Math.abs(numericValue - item.value) > 0.00001) changed.value = numericValue;
    if (from !== item.effective_from) changed.effective_from = from;
    if ((to || null) !== item.effective_to) changed.effective_to = to || null;
    if ((notes.trim() || null) !== item.notes) changed.notes = notes.trim() || null;
    update.mutate(
      { employeeId, itemId: item.id, payload: changed },
      { onSuccess: close, onError: (err) => setError(payItemErrorMessage(err, "تعذر حفظ البند.")) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل بند ثابت" : "إضافة بدل أو استقطاع ثابت"}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {error && <ErrorBox message={error} />}
          <form id="pay-item-form" onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>النوع</label>
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value as PayItemKind);
                    setCode("");
                  }}
                  className={inputClass}
                >
                  {(Object.keys(PAY_ITEM_KIND_LABEL) as PayItemKind[]).map((k) => (
                    <option key={k} value={k}>
                      {k === "addition" ? "استحقاق (بدل / علاوة)" : "استقطاع"}
                    </option>
                  ))}
                </select>
              </div>
              <CodeSelect kind={kind} value={code} onChange={setCode} options={options} />
              <div>
                <label className={labelClass}>طريقة الاحتساب</label>
                <select value={calc} onChange={(e) => setCalc(e.target.value as PayItemCalculation)} className={inputClass}>
                  {(Object.keys(PAY_ITEM_CALC_LABEL) as PayItemCalculation[]).map((c) => (
                    <option key={c} value={c}>
                      {PAY_ITEM_CALC_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{calc === "fixed" ? "المبلغ الشهري (د.ل)" : "النسبة (٪)"}</label>
                <input
                  type="number"
                  min="0.0001"
                  max={calc === "percent_of_base" ? 100 : undefined}
                  step="0.0001"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>يسري من</label>
                <input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>حتى (اختياري)</label>
                <input
                  type="date"
                  min={from || undefined}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
            <p className="text-[11px] text-app-label-tertiary">
              {calc === "percent_of_base"
                ? "تُحتسب النسبة من الراتب الأساسي وأجر الدوام في كل شهر يسري فيه البند."
                : "المبلغ الثابت لا يُجزَّأ: البند الذي يغطي أي يوم من الشهر يُصرف أو يُستقطع كاملاً في ذلك الشهر."}{" "}
              لتغيير قيمة بند طُبّق في مسير معتمد، أنهِه في آخر يوم من آخر شهر يُصرف فيه وأضف بنداً جديداً من الشهر التالي.
            </p>
            <div>
              <label className={labelClass}>ملاحظات (اختياري)</label>
              <input type="text" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={close}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="pay-item-form"
            disabled={pending || !code || !valueValid || !from}
            className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "جارٍ الحفظ…" : editing ? "حفظ" : "إضافة"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── One-off adjustment ─────────────────────────────────────────────────────

interface AdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The employee card fixes the employee; the adjustments page lets HR pick one. */
  employee?: Employee;
  /** Editing a draft; otherwise a new one. */
  adjustment?: EmployeeAdjustment | null;
  /** The month a new entry defaults to (the page's selected month). */
  defaultPeriod?: string;
}

/** HR-13: enter or edit a draft one-off reward or deduction; it counts in payroll once approved. */
export const AdjustmentDialog: React.FC<AdjustmentDialogProps> = ({
  open,
  onOpenChange,
  employee,
  adjustment,
  defaultPeriod,
}) => {
  const editing = Boolean(adjustment);
  const [employeeId, setEmployeeId] = useState(employee?.id ?? adjustment?.employee_id ?? "");
  const [period, setPeriod] = useState(adjustment?.period ?? defaultPeriod ?? currentPeriod());
  const [kind, setKind] = useState<PayItemKind>(adjustment?.kind ?? "addition");
  const [code, setCode] = useState(adjustment?.code ?? "");
  const [amount, setAmount] = useState(adjustment ? String(adjustment.amount) : "");
  const [reason, setReason] = useState(adjustment?.reason ?? "");
  const [error, setError] = useState<string | null>(null);

  const { data: employees = [] } = useEmployees();
  const employeeOptions = useMemo(() => employees.filter(isOnPayroll), [employees]);
  const selected = employee ?? employeeOptions.find((e) => e.id === employeeId) ?? null;

  const options = useCodeOptions(kind, adjustment && adjustment.kind === kind ? adjustment.code : undefined);
  const create = useCreateAdjustment();
  const update = useUpdateAdjustment();
  const pending = create.isPending || update.isPending;
  const amountValue = Number(amount);

  const close = () => {
    setError(null);
    onOpenChange(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (adjustment) {
      // Only what changed: the server re-checks a sent code against the active
      // types, so an unchanged since-deactivated type must not be resent.
      const changed: Partial<Omit<AdjustmentPayload, "employee_id">> & { record_version?: number } = {
        record_version: adjustment.record_version,
      };
      if (period !== adjustment.period) changed.period = period;
      if (kind !== adjustment.kind) changed.kind = kind;
      if (code !== adjustment.code || kind !== adjustment.kind) changed.code = code;
      if (Math.abs(amountValue - adjustment.amount) > 0.00001) changed.amount = amountValue;
      if (reason.trim() !== adjustment.reason) changed.reason = reason.trim();
      update.mutate(
        { id: adjustment.id, payload: changed },
        { onSuccess: close, onError: (err) => setError(payItemErrorMessage(err, "تعذر حفظ التعديل.")) },
      );
      return;
    }
    if (!selected) return;
    create.mutate(
      { employee_id: selected.id, period, kind, code, amount: amountValue, reason: reason.trim() },
      { onSuccess: close, onError: (err) => setError(payItemErrorMessage(err, "تعذر تسجيل المكافأة أو الجزاء.")) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل مكافأة أو جزاء (مسودة)" : "مكافأة أو جزاء لمرة واحدة"}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {error && <ErrorBox message={error} />}
          <form id="adjustment-form" onSubmit={submit} className="space-y-3">
            {editing ? (
              <p className="text-xs text-app-label-secondary">
                الموظف: <span className="font-bold text-app-label-primary">{adjustment?.employee?.name ?? "—"}</span>
              </p>
            ) : (
              !employee && (
                <div>
                  <label className={labelClass}>الموظف</label>
                  <SearchableSelect<Employee>
                    options={employeeOptions}
                    value={selected}
                    onChange={(emp) => setEmployeeId(emp ? emp.id : "")}
                    getOptionId={(emp) => emp.id}
                    getOptionLabel={(emp) => emp.entity?.name ?? emp.job_title ?? emp.id}
                    getOptionSubLabel={(emp) => [emp.employee_number, emp.job_title].filter(Boolean).join(" · ")}
                    getOptionSearchText={(emp) => `${emp.entity?.name ?? ""} ${emp.employee_number ?? ""} ${emp.job_title ?? ""}`}
                    placeholder="الموظف…"
                    required
                  />
                  <p className="mt-1 text-[11px] text-app-label-tertiary">
                    لا يظهر هنا منتهو الخدمة ولا العاملون بالقطعة: المسير لا يصرف لهم.
                  </p>
                </div>
              )
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>الشهر</label>
                <input type="month" required value={period} onChange={(e) => setPeriod(e.target.value)} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>النوع</label>
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value as PayItemKind);
                    setCode("");
                  }}
                  className={inputClass}
                >
                  {(Object.keys(ADJUSTMENT_KIND_LABEL) as PayItemKind[]).map((k) => (
                    <option key={k} value={k}>
                      {ADJUSTMENT_KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </div>
              <CodeSelect kind={kind} value={code} onChange={setCode} options={options} />
              <div>
                <label className={labelClass}>المبلغ (د.ل)</label>
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>السبب</label>
              <input
                type="text"
                required
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={inputClass}
              />
            </div>
            <p className="text-[11px] text-app-label-tertiary">
              تُحفظ مسودةً، ولا تدخل مسير الشهر إلا بعد اعتمادها من المالك أو مدير الحسابات أو مدير الموارد البشرية.
            </p>
          </form>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={close}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="adjustment-form"
            disabled={pending || (!editing && !selected) || !code || !(amountValue > 0) || !period || !reason.trim()}
            className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "جارٍ الحفظ…" : editing ? "حفظ" : "تسجيل"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
