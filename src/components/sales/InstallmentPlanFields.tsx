import React from "react";
import { Lock } from "lucide-react";
import type { CashAccount } from "../../types/procurement";
import {
  MAX_INSTALLMENTS,
  InstallmentPlanInput,
  addMonthsIso,
  previewInstallments,
} from "../../api/endpoints/installments";
import { formatDate, formatNumber, localDateIso } from "../../lib/utils/format";

/** The installment plan form as typed (strings), before it becomes an InstallmentPlanInput. */
export interface InstallmentPlanDraft {
  count: string;
  firstDueDate: string;
  downPayment: string;
  downPaymentMethod: "cash" | "bank";
  cashAccountId: string;
}

/** A fresh draft: three installments, the first a month from today, no down payment. */
export const defaultInstallmentDraft = (): InstallmentPlanDraft => ({
  count: "3",
  firstDueDate: addMonthsIso(localDateIso(), 1),
  downPayment: "",
  downPaymentMethod: "cash",
  cashAccountId: "",
});

/**
 * The draft checked the way the backend checks it (count 1–60, a first due
 * date on or after the sale's date, a down payment below what is owed, paid
 * in cash or by bank into a treasury) — either the request body or the reason
 * it cannot be sent yet.
 */
export function buildInstallmentPlan(
  draft: InstallmentPlanDraft,
  owed: number,
  earliestDueDate: string,
  lockedCashAccountId?: string | null,
): { input: InstallmentPlanInput; error: null } | { input: null; error: string } {
  const count = Number(draft.count);
  if (!Number.isInteger(count) || count < 1 || count > MAX_INSTALLMENTS) {
    return { input: null, error: `عدد الأقساط من 1 إلى ${MAX_INSTALLMENTS}.` };
  }
  if (!draft.firstDueDate) {
    return { input: null, error: "اختر تاريخ استحقاق القسط الأول." };
  }
  if (draft.firstDueDate < earliestDueDate) {
    return { input: null, error: `لا يمكن أن يستحق القسط الأول قبل تاريخ البيع (${formatDate(earliestDueDate)}).` };
  }
  const downRaw = draft.downPayment.trim();
  const down = downRaw === "" ? 0 : Number(downRaw);
  if (!Number.isFinite(down) || down < 0 || down >= owed - 0.0001) {
    return { input: null, error: `الدفعة المقدمة يجب أن تكون أقل من المستحق (${formatNumber(owed)}).` };
  }
  if (!previewInstallments(owed - down, count)) {
    return { input: null, error: "المبلغ أصغر من أن يقسّم على هذا العدد من الأقساط." };
  }
  if (down <= 0) {
    return { input: { count, first_due_date: draft.firstDueDate }, error: null };
  }
  const cashAccountId = draft.downPaymentMethod === "cash" && lockedCashAccountId ? lockedCashAccountId : draft.cashAccountId;
  if (!cashAccountId) {
    return {
      input: null,
      error: draft.downPaymentMethod === "cash" ? "اختر الخزينة التي تستلم الدفعة المقدمة." : "اختر الحساب المصرفي للدفعة المقدمة.",
    };
  }
  return {
    input: {
      count,
      first_due_date: draft.firstDueDate,
      down_payment: down,
      down_payment_method: draft.downPaymentMethod,
      cash_account_id: cashAccountId,
    },
    error: null,
  };
}

interface InstallmentPlanFieldsProps {
  draft: InstallmentPlanDraft;
  onChange: (next: InstallmentPlanDraft) => void;
  /** What the client owes before the down payment (the sale total at checkout, the outstanding on a sold sale). */
  owed: number;
  /** The earliest first due date the backend accepts: the sale's date. */
  earliestDueDate: string;
  /** Treasuries and bank accounts money can be received into. */
  treasuries: CashAccount[];
  /** A cash down payment that must go into this drawer (the open POS shift's). */
  lockedCashAccount?: { id: string; name: string } | null;
  /** Shown under the down payment when it cannot be taken in cash right now (no open shift). */
  cashNotice?: React.ReactNode;
  /** The reason the draft cannot be sent, shown under the fields. */
  error?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none";

/** Count, first due date and optional down payment of an installment plan, with the resulting schedule previewed. */
export const InstallmentPlanFields: React.FC<InstallmentPlanFieldsProps> = ({
  draft,
  onChange,
  owed,
  earliestDueDate,
  treasuries,
  lockedCashAccount,
  cashNotice,
  error,
}) => {
  const patch = (p: Partial<InstallmentPlanDraft>) => onChange({ ...draft, ...p });
  const down = Number(draft.downPayment) > 0 ? Number(draft.downPayment) : 0;
  const count = Number(draft.count);
  const financed = Math.max(0, owed - down);
  const preview = previewInstallments(financed, count);
  const accounts = treasuries.filter((a) => a.kind === draft.downPaymentMethod && a.account_id);
  const isLocked = draft.downPaymentMethod === "cash" && Boolean(lockedCashAccount);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <label className="space-y-1">
          <span className="block text-[11px] font-semibold text-app-label-secondary">عدد الأقساط (شهرية)</span>
          <input
            type="number"
            min={1}
            max={MAX_INSTALLMENTS}
            step={1}
            value={draft.count}
            onChange={(e) => patch({ count: e.target.value })}
            className={`${inputClass} font-mono`}
            dir="ltr"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[11px] font-semibold text-app-label-secondary">استحقاق القسط الأول</span>
          <input
            type="date"
            min={earliestDueDate}
            value={draft.firstDueDate}
            onChange={(e) => patch({ firstDueDate: e.target.value })}
            className={`${inputClass} font-mono`}
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[11px] font-semibold text-app-label-secondary">دفعة مقدمة (اختياري)</span>
          <input
            type="number"
            min={0}
            step="any"
            value={draft.downPayment}
            onChange={(e) => patch({ downPayment: e.target.value })}
            placeholder="0"
            className={`${inputClass} font-mono`}
            dir="ltr"
          />
        </label>
      </div>

      {down > 0 && (
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex gap-1.5">
            {(
              [
                { id: "cash", label: "نقداً" },
                { id: "bank", label: "مصرف" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => patch({ downPaymentMethod: m.id, cashAccountId: "" })}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  draft.downPaymentMethod === m.id
                    ? "border-app-accent bg-app-accent text-white"
                    : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {isLocked ? (
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary">
              <Lock className="h-3.5 w-3.5 text-app-label-secondary" />
              {lockedCashAccount?.name} (خزينة الوردية المفتوحة)
            </div>
          ) : (
            <select
              value={draft.cashAccountId}
              onChange={(e) => patch({ cashAccountId: e.target.value })}
              aria-label="الخزينة المستلمة للدفعة المقدمة"
              className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
            >
              <option value="">{draft.downPaymentMethod === "cash" ? "اختر الخزينة…" : "اختر الحساب المصرفي…"}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      {down > 0 && draft.downPaymentMethod === "cash" && cashNotice}

      {preview && (
        <p className="text-[11px] text-app-label-secondary">
          المبلغ المقسّط <span className="font-mono font-bold text-app-label-primary">{formatNumber(financed)}</span> على{" "}
          <span className="font-mono">{count}</span> {count === 1 ? "قسط" : "أقساط"}:{" "}
          {count === 1 || Math.abs(preview.last - preview.base) < 0.0005 ? (
            <>
              القسط <span className="font-mono font-bold text-app-label-primary">{formatNumber(preview.base, { maximumFractionDigits: 3 })}</span>
            </>
          ) : (
            <>
              القسط <span className="font-mono font-bold text-app-label-primary">{formatNumber(preview.base, { maximumFractionDigits: 3 })}</span>
              {" "}والأخير <span className="font-mono font-bold text-app-label-primary">{formatNumber(preview.last, { maximumFractionDigits: 3 })}</span>
            </>
          )}
          {draft.firstDueDate && (
            <>
              {" "}— من <span className="font-mono">{formatDate(draft.firstDueDate)}</span>
              {count > 1 && (
                <>
                  {" "}إلى <span className="font-mono">{formatDate(addMonthsIso(draft.firstDueDate, count - 1))}</span>
                </>
              )}
            </>
          )}
          . بلا فوائد، والتحصيل يسدد أقدم قسط أولاً.
        </p>
      )}

      {error && <p className="text-[11px] font-semibold text-app-status-warning">{error}</p>}
    </div>
  );
};
