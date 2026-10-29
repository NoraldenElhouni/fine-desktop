import React, { useState } from "react";
import { AlertCircle, CheckCircle2, StopCircle } from "lucide-react";
import { PosShift, salesErrorMessage } from "../../api/endpoints/sales";
import { useClosePosShift, usePosShift } from "../../hooks/useSales";
import { formatDateTime, formatNumber } from "../../lib/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";

interface PosCloseShiftDialogProps {
  /** The open shift to close; null keeps the dialog closed. */
  shiftId: string | null;
  onClose: () => void;
  /** Called with the closed shift so its Z-report can be shown. */
  onClosed: (shift: PosShift) => void;
}

const Figure: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-start">
    <div className="text-[11px] text-app-label-secondary">{label}</div>
    <div className={`text-sm font-bold font-mono mt-1 ${accent ? "text-app-accent" : "text-app-label-primary"}`}>
      {formatNumber(value)} <span className="text-[10px] font-sans">د.ل</span>
    </div>
  </div>
);

/** Count the drawer and close the shift; the difference posts to 625 / 44. */
export const PosCloseShiftDialog: React.FC<PosCloseShiftDialogProps> = ({ shiftId, onClose, onClosed }) => {
  const [countedCash, setCountedCash] = useState("");
  const [notes, setNotes] = useState("");
  const { data: shift, isLoading, isFetching } = usePosShift(shiftId);
  const closeShift = useClosePosShift();

  if (!shiftId) {
    return null;
  }

  const totals = shift?.totals;
  const expected = Number(totals?.expected_cash ?? 0);
  const counted = countedCash.trim() === "" ? null : Number(countedCash);
  const countedInvalid = counted === null || Number.isNaN(counted) || counted < 0;
  const difference = !countedInvalid && counted !== null ? counted - expected : null;
  // A refetch may still be bringing the expected cash up to date: never confirm against a stale difference.
  const canSubmit = Boolean(shift) && shift?.status === "open" && !countedInvalid && !isFetching && !closeShift.isPending;

  const reset = () => {
    setCountedCash("");
    setNotes("");
    closeShift.reset();
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit || counted === null) return;
    closeShift.mutate(
      { id: shiftId, counted_cash: counted, notes: notes.trim() || null },
      {
        onSuccess: (closed) => {
          reset();
          onClosed(closed);
        },
      },
    );
  };

  return (
    <Dialog open={Boolean(shiftId)} onOpenChange={(next) => !next && close()}>
      <DialogContent size="lg">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <StopCircle className="h-4 w-4 text-app-status-danger" />
              إغلاق الوردية {shift?.number ?? ""}
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              {shift
                ? `${shift.cash_account?.name ?? "—"} — ${shift.cashier?.name ?? "—"} — منذ ${formatDateTime(shift.opened_at)}`
                : "عدّ النقد في الدرج وأدخله لإغلاق الوردية."}
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-app-label-secondary">جاري تحميل أرقام الوردية...</div>
          ) : !shift ? (
            <div className="py-10 text-center text-xs text-app-status-danger">تعذّر تحميل الوردية.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Figure label="رصيد البداية" value={Number(totals?.opening_float ?? shift.opening_float)} />
                <Figure label="المبيعات النقدية" value={Number(totals?.cash_in ?? 0)} />
                <Figure label="المردودات النقدية" value={Number(totals?.cash_refunds ?? 0)} />
                <Figure label="النقد المتوقع" value={expected} accent />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                    النقد الفعلي المعدود بالدرج <span className="text-app-status-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="أدخل المبلغ المعدود..."
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">ملاحظات</label>
                  <input
                    type="text"
                    maxLength={255}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                  />
                </div>
              </div>

              {difference !== null && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold border ${
                    Math.abs(difference) < 0.005
                      ? "bg-app-status-positive/15 text-app-status-positive border-app-status-positive/30"
                      : difference > 0
                        ? "bg-app-status-warning/15 text-app-status-warning border-app-status-warning/30"
                        : "bg-app-status-danger/15 text-app-status-danger border-app-status-danger/30"
                  }`}
                >
                  {Math.abs(difference) < 0.005 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>الدرج متطابق — لا يوجد فرق.</span>
                    </>
                  ) : difference < 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>عجز {formatNumber(Math.abs(difference))} د.ل — عجز يُسجل على حساب عجز الخزائن</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>زيادة {formatNumber(difference)} د.ل — زيادة تُسجل على حساب زيادة الخزائن</span>
                    </>
                  )}
                </div>
              )}

              {closeShift.isError && (
                <div className="flex items-center gap-2 rounded-xl bg-app-status-danger/15 border border-app-status-danger/30 p-3 text-xs font-bold text-app-status-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{salesErrorMessage(closeShift.error, "تعذّر إغلاق الوردية.")}</span>
                </div>
              )}
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-xl bg-app-status-danger px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <StopCircle className="h-4 w-4" />
            {closeShift.isPending ? "جاري الإغلاق..." : isFetching ? "جاري تحديث الأرقام..." : "تأكيد إغلاق الوردية"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
