import React, { useState, useEffect, useRef } from "react";
import { Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { formatNumber } from "../../lib/utils/format";

interface CashTenderModalProps {
  isOpen: boolean;
  total: number;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: (tenderedAmount: number) => void;
}

export const CashTenderModal: React.FC<CashTenderModalProps> = ({
  isOpen,
  total,
  isBusy = false,
  onClose,
  onConfirm,
}) => {
  const [receivedInput, setReceivedInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReceivedInput("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const received = receivedInput.trim() !== "" ? Number(receivedInput) : 0;
  const isReceivedEntered = receivedInput.trim() !== "" && !isNaN(Number(receivedInput));
  const isBelowTotal = received < total;
  const isConfirmDisabled = !isReceivedEntered || isBelowTotal || isBusy;
  const change = !isBelowTotal && isReceivedEntered ? received - total : 0;

  // Round-ups to the next 5, 10, 50, and 100 above total, plus fixed 20/50/100/200 chips, deduplicated.
  const roundUpSteps = [5, 10, 50, 100];
  const roundUps = roundUpSteps.map((step) => Math.ceil((total + 0.001) / step) * step);
  const fixedChips = [20, 50, 100, 200];
  const numericChips = Array.from(
    new Set([...roundUps.filter((v) => v > total), ...fixedChips])
  ).sort((a, b) => a - b);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isConfirmDisabled) {
        onConfirm(received);
      }
    }
  };

  const handleChipClick = (amount: number) => {
    setReceivedInput(String(amount));
    inputRef.current?.focus();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && !isBusy && onClose()}>
      <DialogContent size="md" className="space-y-0">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-accent/15 text-app-accent">
              <Banknote className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm">استلام النقد (الدفع نقداً)</DialogTitle>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4 pt-2">
          {/* Total due */}
          <div className="flex items-center justify-between rounded-xl border border-app-separator bg-app-bg-secondary p-4">
            <span className="text-xs font-semibold text-app-label-secondary">الإجمالي المستحق</span>
            <span className="text-2xl font-bold font-mono text-app-accent">
              {formatNumber(total)} <span className="text-sm font-sans">د.ل</span>
            </span>
          </div>

          {/* Tendered Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-app-label-secondary">
              المبلغ المستلم
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                step="any"
                min="0"
                placeholder={formatNumber(total)}
                value={receivedInput}
                onChange={(e) => setReceivedInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-4 py-3 text-center text-xl font-mono font-bold text-app-label-primary focus:border-app-accent focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Quick-cash chips */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-app-label-secondary">
              مبالغ سريعة
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleChipClick(total)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                  received === total && receivedInput.trim() !== ""
                    ? "border-app-accent bg-app-accent text-white"
                    : "border-app-separator bg-app-bg-secondary text-app-label-primary hover:bg-app-fill-f1"
                }`}
              >
                المبلغ بالضبط ({formatNumber(total)})
              </button>
              {numericChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition-colors ${
                    received === chip && receivedInput.trim() !== ""
                      ? "border-app-accent bg-app-accent text-white"
                      : "border-app-separator bg-app-bg-secondary text-app-label-primary hover:bg-app-fill-f1"
                  }`}
                >
                  {formatNumber(chip)}
                </button>
              ))}
            </div>
          </div>

          {/* Live Change */}
          <div className="flex items-center justify-between rounded-xl border border-app-separator bg-app-bg-secondary p-4">
            <span className="text-xs font-semibold text-app-label-secondary">الباقي للعميل</span>
            <span className="text-xl font-bold font-mono text-app-status-positive">
              {!isBelowTotal && isReceivedEntered ? formatNumber(change) : "0.00"}{" "}
              <span className="text-xs font-sans">د.ل</span>
            </span>
          </div>

          {/* Warning hint */}
          {isBelowTotal && (
            <p className="text-xs font-semibold text-app-status-danger">
              المبلغ المستلم أقل من الإجمالي
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => !isConfirmDisabled && onConfirm(received)}
            disabled={isConfirmDisabled}
            className="flex-1 rounded-xl bg-app-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isBusy ? "جارٍ إتمام الدفع…" : "تأكيد الدفع"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
