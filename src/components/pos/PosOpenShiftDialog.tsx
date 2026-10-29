import React, { useEffect, useState } from "react";
import { AlertCircle, PlayCircle } from "lucide-react";
import { salesErrorMessage } from "../../api/endpoints/sales";
import { useCurrentPosShift, useOpenPosShift, usePaymentAccounts } from "../../hooks/useSales";
import { toast } from "../../stores/toastStore";
import { formatDateTime } from "../../lib/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";

interface PosOpenShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Open a cashier shift on a cash drawer with its opening float. */
export const PosOpenShiftDialog: React.FC<PosOpenShiftDialogProps> = ({ isOpen, onClose }) => {
  const [drawerId, setDrawerId] = useState("");
  const [openingFloat, setOpeningFloat] = useState("");

  const { data: paymentAccounts = [] } = usePaymentAccounts();
  const drawers = paymentAccounts.filter((a) => a.kind === "cash");
  const linkedDrawers = drawers.filter((a) => a.account_id);
  const { data: existing } = useCurrentPosShift(drawerId || null, isOpen);
  const openShift = useOpenPosShift();

  // One linked drawer is picked for the cashier.
  useEffect(() => {
    if (isOpen && !drawerId && linkedDrawers.length === 1) {
      setDrawerId(linkedDrawers[0].id);
    }
  }, [isOpen, drawerId, linkedDrawers]);

  if (!isOpen) {
    return null;
  }

  const floatValue = openingFloat.trim() === "" ? null : Number(openingFloat);
  const floatInvalid = floatValue === null || Number.isNaN(floatValue) || floatValue < 0;
  const canSubmit = Boolean(drawerId) && !floatInvalid && !existing && !openShift.isPending;

  const close = () => {
    setDrawerId("");
    setOpeningFloat("");
    openShift.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit || floatValue === null) return;
    openShift.mutate(
      { cash_account_id: drawerId, opening_float: floatValue },
      {
        onSuccess: (shift) => {
          toast.success(`تم فتح الوردية ${shift.number}`);
          close();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && close()}>
      <DialogContent size="md">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <PlayCircle className="h-4 w-4 text-app-accent" />
              فتح وردية
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              اختر خزينة الدرج وأدخل رصيد بداية الوردية (الفكة الموجودة في الدرج).
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-app-label-secondary">
              خزينة الدرج <span className="text-app-status-danger">*</span>
            </label>
            <select
              value={drawerId}
              onChange={(e) => setDrawerId(e.target.value)}
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
            >
              <option value="">اختر…</option>
              {drawers.map((a) => (
                <option key={a.id} value={a.id} disabled={!a.account_id}>
                  {a.name}
                  {a.account ? ` — ${a.account.account_code}` : " (غير مربوطة بحساب محاسبي)"}
                </option>
              ))}
            </select>
            {drawers.length === 0 && (
              <p className="text-[11px] text-app-status-warning">لا توجد خزينة نقدية — أضفها من صفحة الخزينة.</p>
            )}
            {existing && (
              <p className="text-[11px] text-app-status-warning">
                هذه الخزينة عليها الوردية المفتوحة {existing.number}
                {existing.cashier?.name ? ` (${existing.cashier.name})` : ""} منذ {formatDateTime(existing.opened_at)}.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-app-label-secondary">
              رصيد بداية الوردية <span className="text-app-status-danger">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
              dir="ltr"
            />
          </div>

          {openShift.isError && (
            <div className="flex items-center gap-2 rounded-xl bg-app-status-danger/15 border border-app-status-danger/30 p-3 text-xs font-bold text-app-status-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{salesErrorMessage(openShift.error, "تعذّر فتح الوردية.")}</span>
            </div>
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
            className="flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PlayCircle className="h-4 w-4" />
            {openShift.isPending ? "جاري الفتح..." : "تأكيد فتح الوردية"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
