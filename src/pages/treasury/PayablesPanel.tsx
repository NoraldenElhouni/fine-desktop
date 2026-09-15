import React, { useCallback, useEffect, useState } from "react";
import { HandCoins, AlertTriangle } from "lucide-react";
import {
  getPayableOutstanding,
  getPayableSettlements,
  settlePayable,
  type PayableOutstanding,
  type PayableSettlement,
} from "../../api/endpoints/procurement";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

const ACCOUNT_LABEL: Record<string, string> = {
  "2100": "الذمم الدائنة (مشتريات آجلة)",
  "2210": "استقطاعات الرواتب المستحقة",
  "2300": "تكاليف الاستيراد المعلقة (جمارك وشحن)",
};

/**
 * "What do we owe" — the three payables the operational flows accumulate,
 * each settleable against the cash account. The backend caps every payment
 * at the ledger's live outstanding balance.
 */
export const PayablesPanel: React.FC = () => {
  const [outstanding, setOutstanding] = useState<PayableOutstanding[]>([]);
  const [settlements, setSettlements] = useState<PayableSettlement[]>([]);
  const [settling, setSettling] = useState<PayableOutstanding | null>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [balances, history] = await Promise.all([
        getPayableOutstanding(),
        getPayableSettlements(),
      ]);
      setOutstanding(balances);
      setSettlements(history);
    } catch {
      // The treasury page surfaces connection problems globally.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settling) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await settlePayable({
        account_code: settling.account_code,
        amount: Number(amount),
        reference: reference || undefined,
      });
      setSettling(null);
      setAmount("");
      setReference("");
      await refresh();
    } catch (err) {
      setError(apiErrorPayload(err)?.message ?? "تعذر تنفيذ السداد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
        <HandCoins className="h-4 w-4 text-app-accent" />
        <span>الذمم المستحقة للسداد (Outstanding Payables)</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {outstanding.map((payable) => (
          <div
            key={payable.account_code}
            className="rounded-xl border border-app-separator bg-app-bg-secondary p-4 space-y-2"
          >
            <p className="text-[11px] font-bold text-app-label-secondary">
              <span className="font-mono text-app-accent me-1">{payable.account_code}</span>
              {ACCOUNT_LABEL[payable.account_code] ?? payable.account_code}
            </p>
            <p className={`font-mono text-lg font-bold ${Number(payable.outstanding) > 0 ? "text-app-label-primary" : "text-app-status-positive"}`}>
              {formatNumber(payable.outstanding)} <span className="text-[10px] font-normal">LYD</span>
            </p>
            <button
              onClick={() => {
                setSettling(payable);
                setAmount(String(payable.outstanding));
                setError(null);
              }}
              disabled={Number(payable.outstanding) <= 0}
              className="w-full rounded-lg bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              سداد
            </button>
          </div>
        ))}
      </div>

      {settlements.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-secondary">
          <table className="w-full text-xs text-start">
            <thead className="border-b border-app-separator bg-app-bg-primary text-app-label-secondary">
              <tr>
                <th className="px-3 py-2 text-start font-bold">الحساب</th>
                <th className="px-3 py-2 text-end font-bold">المبلغ</th>
                <th className="px-3 py-2 text-start font-bold">المرجع</th>
                <th className="px-3 py-2 text-start font-bold">التاريخ</th>
                <th className="px-3 py-2 text-start font-bold">بواسطة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {settlements.slice(0, 8).map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2">
                    <span className="font-mono font-bold text-app-accent me-1">{s.account_code}</span>
                  </td>
                  <td className="px-3 py-2 text-end font-mono font-bold">{formatNumber(s.amount)}</td>
                  <td className="px-3 py-2 text-app-label-secondary">{s.reference ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-app-label-secondary">{formatDate(s.settled_at)}</td>
                  <td className="px-3 py-2 text-app-label-secondary">{s.settled_by?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(settling)} onOpenChange={(next) => !next && setSettling(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <div>
              {settling && (
                <>
                  <DialogTitle>سداد {ACCOUNT_LABEL[settling.account_code]}</DialogTitle>
                  <DialogDescription>
                    الرصيد المستحق حالياً <span className="font-mono font-bold">{formatNumber(settling.outstanding)}</span> د.ل —
                    يُقيد السداد مديناً على الحساب ودائناً على النقدية، ولا يمكن تجاوز المستحق.
                  </DialogDescription>
                </>
              )}
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {settling && (
            <form id="settle-payable-form" onSubmit={submit} className="space-y-3">
              <input
                type="number" step="0.0001" min="0.0001" max={Number(settling.outstanding)} required
                placeholder="المبلغ (LYD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
              />
              <input
                type="text" placeholder="المرجع — رقم الشيك أو الحوالة (اختياري)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              />
            </form>
            )}
          </DialogBody>
          <DialogFooter>
            <button
              type="button" onClick={() => setSettling(null)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="settle-payable-form"
              disabled={isSubmitting || Number(amount) <= 0}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? "جارٍ السداد…" : "سداد وقيد"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
