import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle, Plus, Split, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../ui/Dialog";
import { TreasurySelect } from "../treasury/TreasurySelect";
import { useTreasuryOptions } from "../../hooks/useProcurement";
import { SplitPaymentPortionInput } from "../../api/endpoints/sales";
import { formatNumber, localDateIso } from "../../lib/utils/format";

interface PortionRow {
  id: string;
  method: "cash" | "bank" | "cheque";
  amount: string;
  cashAccountId: string;
  tenderedAmount: string;
  chequeNo: string;
  bankName: string;
  drawerName: string;
  dueDate: string;
  isCertified: boolean;
}

interface SplitPaymentModalProps {
  isOpen: boolean;
  total: number;
  clientName?: string;
  isWalkIn?: boolean;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: (portions: SplitPaymentPortionInput[]) => void;
}

const defaultDueDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return localDateIso(d);
};

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  total,
  clientName,
  isWalkIn = false,
  isBusy = false,
  onClose,
  onConfirm,
}) => {
  const { data: cashTreasuries = [] } = useTreasuryOptions("cash");
  const { data: bankTreasuries = [] } = useTreasuryOptions("bank");

  const [rows, setRows] = useState<PortionRow[]>([]);

  // Initialize with one cash row filled with the full total when opening
  useEffect(() => {
    if (isOpen) {
      const defaultCashId = cashTreasuries.length === 1 ? cashTreasuries[0].id : "";
      setRows([
        {
          id: crypto.randomUUID(),
          method: "cash",
          amount: total > 0 ? String(total) : "",
          cashAccountId: defaultCashId,
          tenderedAmount: "",
          chequeNo: "",
          bankName: "",
          drawerName: clientName ?? "",
          dueDate: defaultDueDate(),
          isCertified: false,
        },
      ]);
    }
  }, [isOpen, total, clientName, cashTreasuries]);

  // Auto-fill treasury if options load after modal was opened
  useEffect(() => {
    if (cashTreasuries.length === 1) {
      setRows((prev) =>
        prev.map((r) =>
          r.method === "cash" && !r.cashAccountId
            ? { ...r, cashAccountId: cashTreasuries[0].id }
            : r,
        ),
      );
    }
  }, [cashTreasuries]);

  useEffect(() => {
    if (bankTreasuries.length === 1) {
      setRows((prev) =>
        prev.map((r) =>
          r.method === "bank" && !r.cashAccountId
            ? { ...r, cashAccountId: bankTreasuries[0].id }
            : r,
        ),
      );
    }
  }, [bankTreasuries]);

  const sum = useMemo(() => {
    return rows.reduce((acc, r) => {
      const n = parseFloat(r.amount);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [rows]);

  const remaining = Math.round((total - sum) * 100) / 100;
  const isBalanced = Math.abs(remaining) < 0.005;

  const updateRow = (id: string, patch: Partial<PortionRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleMethodChange = (id: string, newMethod: "cash" | "bank" | "cheque") => {
    if (isWalkIn && newMethod === "cheque") return;
    const defaultTreasuryId =
      newMethod === "cash" && cashTreasuries.length === 1
        ? cashTreasuries[0].id
        : newMethod === "bank" && bankTreasuries.length === 1
          ? bankTreasuries[0].id
          : "";

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          method: newMethod,
          cashAccountId: defaultTreasuryId,
          tenderedAmount: "",
          chequeNo: newMethod === "cheque" ? r.chequeNo : "",
          bankName: newMethod === "cheque" ? r.bankName : "",
          drawerName: newMethod === "cheque" ? (r.drawerName || clientName || "") : "",
          dueDate: newMethod === "cheque" ? (r.dueDate || defaultDueDate()) : "",
          isCertified: newMethod === "cheque" ? r.isCertified : false,
        };
      }),
    );
  };

  const addRow = () => {
    if (rows.length >= 4) return;
    const newAmount = remaining > 0 ? String(remaining) : "";
    const hasCash = rows.some((r) => r.method === "cash");
    const defaultMethod: "cash" | "bank" | "cheque" = hasCash ? "bank" : "cash";
    const defaultTreasuryId =
      defaultMethod === "cash" && cashTreasuries.length === 1
        ? cashTreasuries[0].id
        : defaultMethod === "bank" && bankTreasuries.length === 1
          ? bankTreasuries[0].id
          : "";

    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        method: defaultMethod,
        amount: newAmount,
        cashAccountId: defaultTreasuryId,
        tenderedAmount: "",
        chequeNo: "",
        bankName: "",
        drawerName: clientName ?? "",
        dueDate: defaultDueDate(),
        isCertified: false,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const unmetRuleHint = useMemo((): string | null => {
    if (rows.length < 2) {
      return "يجب إضافة دفعتين على الأقل لتجزئة الدفع.";
    }

    const cashRows = rows.filter((r) => r.method === "cash");
    if (cashRows.length > 1) {
      return "يُسمح بدفعة نقدية واحدة فقط.";
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const amt = parseFloat(row.amount);
      if (row.amount.trim() === "" || isNaN(amt) || amt <= 0) {
        return `الدفعة ${rowNum}: يجب تحديد مبلغ أكبر من صفر.`;
      }

      if (row.method === "cash") {
        if (!row.cashAccountId) {
          return `الدفعة ${rowNum} (نقداً): اختر الخزينة النقدية.`;
        }
        if (row.tenderedAmount.trim() !== "") {
          const tendered = parseFloat(row.tenderedAmount);
          if (isNaN(tendered) || tendered < amt) {
            return `الدفعة ${rowNum} (نقداً): المبلغ المستلم أقل من قيمة الدفعة.`;
          }
        }
      } else if (row.method === "bank") {
        if (!row.cashAccountId) {
          return `الدفعة ${rowNum} (مصرف): اختر الحساب المصرفي.`;
        }
      } else if (row.method === "cheque") {
        if (isWalkIn) {
          return "البيع الآجل أو بالشيك يتطلب عميلاً مسجلاً.";
        }
        if (!row.chequeNo.trim()) {
          return `الدفعة ${rowNum} (شيك): أدخل رقم الشيك.`;
        }
        if (!row.bankName.trim()) {
          return `الدفعة ${rowNum} (شيك): أدخل اسم المصرف.`;
        }
        if (!row.dueDate.trim()) {
          return `الدفعة ${rowNum} (شيك): حدد تاريخ استحقاق الشيك.`;
        }
      }
    }

    if (!isBalanced) {
      return "مجموع الدفعات لا يساوي إجمالي الفاتورة.";
    }

    return null;
  }, [rows, isBalanced, isWalkIn]);

  const canConfirm = unmetRuleHint === null && !isBusy;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const portions: SplitPaymentPortionInput[] = rows.map((r) => {
      const amount = Number(r.amount);
      if (r.method === "cash") {
        const tendered = r.tenderedAmount.trim() !== "" ? Number(r.tenderedAmount) : undefined;
        return {
          method: "cash",
          amount,
          cash_account_id: r.cashAccountId,
          ...(tendered !== undefined ? { tendered_amount: tendered } : {}),
        };
      }
      if (r.method === "bank") {
        return {
          method: "bank",
          amount,
          cash_account_id: r.cashAccountId,
        };
      }
      return {
        method: "cheque",
        amount,
        cheque: {
          cheque_no: r.chequeNo.trim(),
          bank_name: r.bankName.trim(),
          ...(r.drawerName.trim() ? { drawer_name: r.drawerName.trim() } : {}),
          due_date: r.dueDate,
          is_certified: r.isCertified,
        },
      };
    });
    onConfirm(portions);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && !isBusy && onClose()}>
      <DialogContent size="2xl" className="space-y-0">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-accent/15 text-app-accent">
              <Split className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm">دفع مجزأ</DialogTitle>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
          {/* Summary: Total due & Live remaining */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-app-separator bg-app-bg-secondary p-4">
            <div>
              <div className="text-[11px] font-semibold text-app-label-secondary">
                الإجمالي المستحق
              </div>
              <div className="text-xl font-bold font-mono text-app-label-primary">
                {formatNumber(total)} <span className="text-xs font-sans">د.ل</span>
              </div>
            </div>
            <div className="text-end">
              <div className="text-[11px] font-semibold text-app-label-secondary">
                المتبقي
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  isBalanced ? "text-app-status-positive" : "text-app-status-danger"
                }`}
              >
                {formatNumber(remaining)} <span className="text-xs font-sans">د.ل</span>
              </div>
            </div>
          </div>

          {/* Portion rows */}
          <div className="space-y-3">
            {rows.map((row, index) => {
              const rowAmount = parseFloat(row.amount);
              const isRowAmountValid = !isNaN(rowAmount) && rowAmount > 0;
              const rowTendered = parseFloat(row.tenderedAmount);
              const isTenderedEntered = row.tenderedAmount.trim() !== "" && !isNaN(rowTendered);
              const isTenderedBelow = isTenderedEntered && isRowAmountValid && rowTendered < rowAmount;
              const change =
                isTenderedEntered && isRowAmountValid && !isTenderedBelow
                  ? rowTendered - rowAmount
                  : 0;

              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-app-separator bg-app-bg-secondary/40 p-4 space-y-3"
                >
                  {/* Row header: Number, Method, Amount, Remove */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-accent/15 text-xs font-bold text-app-accent">
                      {index + 1}
                    </span>
                    <div className="w-28 shrink-0">
                      <select
                        value={row.method}
                        onChange={(e) =>
                          handleMethodChange(row.id, e.target.value as "cash" | "bank" | "cheque")
                        }
                        className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-2.5 py-2 text-xs font-bold text-app-label-primary focus:border-app-accent focus:outline-none"
                      >
                        <option value="cash">نقداً</option>
                        <option value="bank">مصرف</option>
                        <option value="cheque" disabled={isWalkIn}>
                          شيك
                        </option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="المبلغ"
                          value={row.amount}
                          onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                          className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 pe-10 text-xs font-mono font-bold text-app-label-primary focus:border-app-accent focus:outline-none"
                        />
                        <span className="absolute end-3 top-2 text-xs text-app-label-secondary pointer-events-none">
                          د.ل
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={rows.length <= 1}
                      onClick={() => removeRow(row.id)}
                      className="p-2 rounded-xl text-app-label-secondary hover:text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                      title="حذف الدفعة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cash fields */}
                  {row.method === "cash" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-app-separator/50">
                      <TreasurySelect
                        kind="cash"
                        label="الخزينة النقدية"
                        value={row.cashAccountId}
                        onChange={(id) => updateRow(row.id, { cashAccountId: id })}
                      />
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-app-label-secondary">
                          المبلغ المستلم (لحساب الفكة)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="اختياري"
                            value={row.tenderedAmount}
                            onChange={(e) => updateRow(row.id, { tenderedAmount: e.target.value })}
                            className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 pe-10 text-xs font-mono focus:border-app-accent focus:outline-none"
                          />
                          <span className="absolute end-3 top-2 text-xs text-app-label-secondary pointer-events-none">
                            د.ل
                          </span>
                        </div>
                        {isTenderedEntered && (
                          <div className="text-[11px] font-mono">
                            {isTenderedBelow ? (
                              <span className="text-app-status-danger">
                                المبلغ المستلم أقل من قيمة الدفعة
                              </span>
                            ) : (
                              <span className="text-app-status-positive">
                                الباقي: {formatNumber(change)} د.ل
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bank fields */}
                  {row.method === "bank" && (
                    <div className="pt-2 border-t border-app-separator/50">
                      <TreasurySelect
                        kind="bank"
                        label="الحساب المصرفي"
                        value={row.cashAccountId}
                        onChange={(id) => updateRow(row.id, { cashAccountId: id })}
                      />
                    </div>
                  )}

                  {/* Cheque fields */}
                  {row.method === "cheque" && (
                    <div className="space-y-3 pt-2 border-t border-app-separator/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-app-label-secondary">
                            رقم الشيك <span className="text-app-status-danger">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="رقم الشيك"
                            value={row.chequeNo}
                            onChange={(e) => updateRow(row.id, { chequeNo: e.target.value })}
                            className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-app-label-secondary">
                            المصرف <span className="text-app-status-danger">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="اسم المصرف"
                            value={row.bankName}
                            onChange={(e) => updateRow(row.id, { bankName: e.target.value })}
                            className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-app-label-secondary">
                            اسم الساحب
                          </label>
                          <input
                            type="text"
                            placeholder={clientName || "اسم الساحب (اختياري)"}
                            value={row.drawerName}
                            onChange={(e) => updateRow(row.id, { drawerName: e.target.value })}
                            className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-app-label-secondary">
                            تاريخ الاستحقاق <span className="text-app-status-danger">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={row.dueDate}
                            onChange={(e) => updateRow(row.id, { dueDate: e.target.value })}
                            className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-app-label-primary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.isCertified}
                            onChange={(e) => updateRow(row.id, { isCertified: e.target.checked })}
                            className="rounded border-app-separator text-app-accent focus:ring-app-accent"
                          />
                          <span>شيك مصدق</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add portion button */}
          {rows.length < 4 && (
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-app-accent/50 bg-app-accent/5 px-4 py-2.5 text-xs font-bold text-app-accent hover:bg-app-accent/10 transition-colors w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              إضافة دفعة
            </button>
          )}

          {isWalkIn && (
            <p className="text-[11px] text-app-label-tertiary">
              البيع الآجل أو بالشيك يتطلب عميلاً مسجلاً
            </p>
          )}

          {/* Validation rule hint */}
          {unmetRuleHint && (
            <div className="flex items-center gap-2 rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3 text-xs text-app-status-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{unmetRuleHint}</span>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-app-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isBusy ? "جارٍ إتمام البيع…" : "تأكيد الدفع"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
