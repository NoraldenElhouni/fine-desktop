import React, { useState } from "react";
import { ChevronDown, ChevronUp, Phone, MapPin } from "lucide-react";
import type {
  DebtorClient,
  DebtorClientStatus,
  DebtorSection,
} from "../../api/endpoints/debtorStatements";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { StatusBadge, type BadgeVariant } from "../ui/StatusBadge";

export const DEBTOR_STATUS_LABELS: Record<DebtorClientStatus, string> = {
  active: "نشط",
  suspended: "موقوف",
  blacklisted: "محظور",
};

const STATUS_VARIANTS: Record<DebtorClientStatus, BadgeVariant> = {
  active: "positive",
  suspended: "warning",
  blacklisted: "danger",
};

export interface DebtorStatementSectionProps {
  section: DebtorSection;
  /** Absent for the unassigned section (no client header details). */
  client?: DebtorClient;
  /** Header title for sections without a client. */
  title?: string;
  defaultOpen?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** When provided, references render as links that call this with the journal entry id. */
  onOpenEntry?: (journalEntryId: string) => void;
}

const Money: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <span className={`font-mono ${className ?? ""}`}>{formatNumber(value)}</span>
);

export const DebtorStatementSection: React.FC<DebtorStatementSectionProps> = ({
  section,
  client,
  title,
  defaultOpen = false,
  selected,
  onToggleSelect,
  onOpenEntry,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const aging = [
    { label: "0-30", value: section.aging.current },
    { label: "31-60", value: section.aging.days_31_60 },
    { label: "61-90", value: section.aging.days_61_90 },
    { label: "+90", value: section.aging.over_90 },
  ];

  return (
    <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-app-bg-secondary">
        {client && onToggleSelect && (
          <input
            type="checkbox"
            checked={Boolean(selected)}
            onChange={onToggleSelect}
            aria-label={`تحديد ${client.name}`}
            className="h-4 w-4 accent-app-accent"
          />
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-start"
          aria-expanded={open}
        >
          <span className="text-sm font-bold text-app-label-primary">
            {client ? client.name : title}
          </span>
          {client && (
            <>
              {client.phone && (
                <span className="flex items-center gap-1 text-[11px] text-app-label-secondary">
                  <Phone className="h-3 w-3" />
                  <span className="font-mono" dir="ltr">{client.phone}</span>
                </span>
              )}
              {client.city && (
                <span className="flex items-center gap-1 text-[11px] text-app-label-secondary">
                  <MapPin className="h-3 w-3" />
                  {client.city}
                </span>
              )}
              <StatusBadge
                status={client.status}
                label={DEBTOR_STATUS_LABELS[client.status]}
                variant={STATUS_VARIANTS[client.status]}
                size="sm"
              />
              <span className="text-[11px] text-app-label-secondary">
                حد الائتمان: <Money value={client.credit_limit} /> د.ل
              </span>
              <span className="text-[11px] text-app-label-secondary">
                مدة السداد: <span className="font-mono">{client.payment_terms_days}</span> يوم
              </span>
            </>
          )}
          <span className="ms-auto text-xs text-app-label-secondary">
            الرصيد الختامي:{" "}
            <Money value={section.closing_balance} className="font-bold text-app-label-primary" /> د.ل
          </span>
          {section.overdue_amount > 0 && (
            <span className="rounded-full bg-app-status-danger/15 px-2 py-0.5 text-[11px] font-bold text-app-status-danger">
              متأخر: <span className="font-mono">{formatNumber(section.overdue_amount)}</span> د.ل
            </span>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-app-label-secondary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-app-label-secondary" />
          )}
        </button>
      </div>

      {open && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-app-separator bg-app-bg-secondary text-[11px] font-bold text-app-label-secondary">
                  <th className="px-3 py-2 text-start">التاريخ</th>
                  <th className="px-3 py-2 text-start">المرجع</th>
                  <th className="px-3 py-2 text-start">البيان</th>
                  <th className="px-3 py-2 text-end">مدين</th>
                  <th className="px-3 py-2 text-end">دائن</th>
                  <th className="px-3 py-2 text-end">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-separator">
                <tr className="bg-app-fill-f1/40 font-semibold text-app-label-secondary">
                  <td className="px-3 py-2" colSpan={3}>رصيد افتتاحي</td>
                  <td className="px-3 py-2 text-end font-mono">—</td>
                  <td className="px-3 py-2 text-end font-mono">—</td>
                  <td className="px-3 py-2 text-end font-mono font-bold text-app-label-primary">
                    {formatNumber(section.opening_balance)}
                  </td>
                </tr>
                {section.lines.map((line, i) => (
                  <tr key={`${line.journal_entry_id}-${i}`} className="hover:bg-app-fill-f1/30">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(line.date)}</td>
                    <td className="px-3 py-2 font-mono">
                      {onOpenEntry ? (
                        <button
                          type="button"
                          onClick={() => onOpenEntry(line.journal_entry_id)}
                          className="text-app-accent hover:underline"
                        >
                          {line.reference}
                        </button>
                      ) : (
                        line.reference
                      )}
                    </td>
                    <td className="px-3 py-2 text-app-label-secondary">{line.description ?? "—"}</td>
                    <td className="px-3 py-2 text-end font-mono">
                      {line.debit ? formatNumber(line.debit) : "—"}
                    </td>
                    <td className="px-3 py-2 text-end font-mono">
                      {line.credit ? formatNumber(line.credit) : "—"}
                    </td>
                    <td className="px-3 py-2 text-end font-mono font-semibold">
                      {formatNumber(line.running_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-app-separator bg-app-bg-secondary font-bold">
                  <td className="px-3 py-2" colSpan={3}>الإجمالي</td>
                  <td className="px-3 py-2 text-end font-mono">{formatNumber(section.total_debit)}</td>
                  <td className="px-3 py-2 text-end font-mono">{formatNumber(section.total_credit)}</td>
                  <td className="px-3 py-2 text-end font-mono">{formatNumber(section.closing_balance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border-t border-app-separator bg-app-separator">
            {aging.map((a) => (
              <div key={a.label} className="bg-app-bg-primary px-3 py-2 text-center">
                <div className="text-[10px] text-app-label-tertiary">{a.label} يوم</div>
                <Money value={a.value} className="text-xs font-semibold text-app-label-primary" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
