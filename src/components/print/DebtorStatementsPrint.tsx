import React, { useMemo } from "react";
import type { DebtorStatementsResponse } from "../../api/endpoints/debtorStatements";
import { useIsCompanyWide } from "../../hooks/useAccounting";
import { formatDate, formatInteger } from "../../lib/utils/format";
import { DEBTOR_STATUS_LABELS } from "../accounting/DebtorStatementSection";
import { Cell, PrintDialog, PrintDocument, PrintTable, money } from "./PrintDocument";

interface DebtorStatementsPrintProps {
  data: DebtorStatementsResponse;
  /** When non-empty, only these clients are printed (and the cover lists only them). */
  onlyClientIds?: string[];
  onClose: () => void;
}

const num = "font-mono text-end";

export const DebtorStatementsPrint: React.FC<DebtorStatementsPrintProps> = ({ data, onlyClientIds, onClose }) => {
  const companyWide = useIsCompanyWide();
  const debtors = useMemo(() => {
    const ids = onlyClientIds ?? [];
    return ids.length ? data.debtors.filter((d) => ids.includes(d.client.id)) : data.debtors;
  }, [data.debtors, onlyClientIds]);

  const filtered = debtors.length !== data.debtors.length;
  // Totals describe the whole report; when a subset is printed, recompute from it.
  const totals = filtered
    ? debtors.reduce(
        (t, d) => ({
          opening: t.opening + d.opening_balance,
          debit: t.debit + d.total_debit,
          credit: t.credit + d.total_credit,
          closing: t.closing + d.closing_balance,
          overdue: t.overdue + d.overdue_amount,
        }),
        { opening: 0, debit: 0, credit: 0, closing: 0, overdue: 0 },
      )
    : {
        opening: data.totals.opening,
        debit: data.totals.debit,
        credit: data.totals.credit,
        closing: data.totals.closing,
        overdue: data.totals.overdue,
      };
  const aging = filtered
    ? debtors.reduce(
        (a, d) => ({
          current: a.current + d.aging.current,
          days_31_60: a.days_31_60 + d.aging.days_31_60,
          days_61_90: a.days_61_90 + d.aging.days_61_90,
          over_90: a.over_90 + d.aging.over_90,
        }),
        { current: 0, days_31_60: 0, days_61_90: 0, over_90: 0 },
      )
    : data.totals.aging;

  return (
    <PrintDialog open onClose={onClose} title="كشف حساب المدينين">
      <PrintDocument
        title="كشف حساب المدينين"
        number={`${data.period.from} → ${data.period.to}`}
        date={data.generated_at}
        meta={[
          { label: "الفترة", value: `${formatDate(data.period.from)} - ${formatDate(data.period.to)}` },
          { label: "عدد المدينين", value: formatInteger(debtors.length) },
          { label: "الوحدة", value: companyWide ? "جميع الوحدات" : "الوحدة الحالية" },
        ]}
        signatures={["المحاسب", "المدير المالي"]}
      >
        <section className="space-y-3">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {[
              ["الرصيد الافتتاحي", totals.opening],
              ["إجمالي المدين", totals.debit],
              ["إجمالي الدائن", totals.credit],
              ["الرصيد الختامي", totals.closing],
              ["المتأخر", totals.overdue],
            ].map(([label, value]) => (
              <div key={label as string} className="flex gap-2">
                <dt className="text-gray-600 shrink-0">{label}:</dt>
                <dd className="font-mono font-semibold">{money(value as number)}</dd>
              </div>
            ))}
          </dl>

          <PrintTable head={["الأعمار", "0 - 30 يوم", "31 - 60 يوم", "61 - 90 يوم", "أكثر من 90 يوم"]}>
            <tr>
              <Cell>إجمالي أعمار الديون</Cell>
              <Cell className={num}>{money(aging.current)}</Cell>
              <Cell className={num}>{money(aging.days_31_60)}</Cell>
              <Cell className={num}>{money(aging.days_61_90)}</Cell>
              <Cell className={num}>{money(aging.over_90)}</Cell>
            </tr>
          </PrintTable>

          <PrintTable head={["العميل", "الرصيد الافتتاحي", "مدين", "دائن", "الرصيد الختامي", "المتأخر"]}>
            {debtors.map((d) => (
              <tr key={d.client.id}>
                <Cell>{d.client.name}</Cell>
                <Cell className={num}>{money(d.opening_balance)}</Cell>
                <Cell className={num}>{money(d.total_debit)}</Cell>
                <Cell className={num}>{money(d.total_credit)}</Cell>
                <Cell className={`${num} font-bold`}>{money(d.closing_balance)}</Cell>
                <Cell className={num}>{money(d.overdue_amount)}</Cell>
              </tr>
            ))}
          </PrintTable>

          {data.unassigned && (
            <p className="text-[11px]">
              قيود ذمم غير مخصصة (غير مدرجة في الإجماليات أعلاه):{" "}
              <span className="font-mono font-semibold">{money(data.unassigned.closing_balance)}</span>
            </p>
          )}
        </section>

        {debtors.map((d) => (
          <section key={d.client.id} className="print-page-break space-y-3">
            <h2 className="border-b border-black pb-1 text-sm font-bold">{d.client.name}</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {[
                ["الهاتف", d.client.phone || "—"],
                ["المدينة", d.client.city || "—"],
                ["الحالة", DEBTOR_STATUS_LABELS[d.client.status]],
                ["حد الائتمان", money(d.client.credit_limit)],
                ["مدة السداد", `${formatInteger(d.client.payment_terms_days)} يوم`],
                ["المتأخر", money(d.overdue_amount)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-gray-600 shrink-0">{label}:</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <PrintTable head={["التاريخ", "المرجع", "البيان", "مدين", "دائن", "الرصيد"]}>
              <tr className="bg-gray-50">
                <Cell colSpan={5} className="font-semibold">رصيد افتتاحي</Cell>
                <Cell className={`${num} font-semibold`}>{money(d.opening_balance)}</Cell>
              </tr>
              {d.lines.map((l, i) => (
                <tr key={`${l.journal_entry_id}-${i}`}>
                  <Cell className="whitespace-nowrap">{formatDate(l.date)}</Cell>
                  <Cell className="font-mono">{l.reference}</Cell>
                  <Cell>{l.description ?? ""}</Cell>
                  <Cell className={num}>{l.debit ? money(l.debit) : ""}</Cell>
                  <Cell className={num}>{l.credit ? money(l.credit) : ""}</Cell>
                  <Cell className={num}>{money(l.running_balance)}</Cell>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <Cell colSpan={3}>الإجمالي / الرصيد الختامي</Cell>
                <Cell className={num}>{money(d.total_debit)}</Cell>
                <Cell className={num}>{money(d.total_credit)}</Cell>
                <Cell className={num}>{money(d.closing_balance)}</Cell>
              </tr>
            </PrintTable>
          </section>
        ))}
      </PrintDocument>
    </PrintDialog>
  );
};

export default DebtorStatementsPrint;
