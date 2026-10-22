import React from "react";
import { useTreasuryOptions } from "../../hooks/useProcurement";
import type { CashAccountKind } from "../../types/procurement";
import { formatNumber } from "../../lib/utils/format";

interface TreasurySelectProps {
  value: string;
  onChange: (cashAccountId: string) => void;
  label?: string;
  /** Limit to treasuries (cash) or bank accounts. */
  kind?: CashAccountKind;
  required?: boolean;
  className?: string;
}

/**
 * The treasury or bank account money leaves from or goes into. Every cash
 * operation names one so the entry lands on that treasury's own ledger
 * account, never on the "الأصول المتداولة" header.
 */
export const TreasurySelect: React.FC<TreasurySelectProps> = ({
  value,
  onChange,
  label = "الخزينة",
  kind,
  required = true,
  className,
}) => {
  const { data: treasuries = [], isLoading } = useTreasuryOptions(kind);

  return (
    <div className={className ?? "space-y-1"}>
      <label className="block text-xs font-semibold text-app-label-secondary">
        {label}
        {required && <span className="text-app-status-danger"> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-sm focus:border-app-accent focus:outline-none"
      >
        <option value="">{isLoading ? "جارٍ التحميل…" : "اختر…"}</option>
        {treasuries.map((t) => {
          const isLyd = !t.currency || t.currency === "LYD" || t.currency === "د.ل";
          const label = isLyd ? `${t.name} — ${formatNumber(t.ledger_balance)}` : `${t.name} — ${t.account_code}`;
          return (
            <option key={t.id} value={t.id}>
              {label}
            </option>
          );
        })}
      </select>
      {!isLoading && treasuries.length === 0 && (
        <p className="text-[11px] text-app-status-yellow">
          لا توجد خزينة مربوطة بحساب محاسبي — أضفها من صفحة الخزينة.
        </p>
      )}
    </div>
  );
};

export default TreasurySelect;
