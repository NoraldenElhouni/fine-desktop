import React, { useState } from "react";
import { DollarSign, Printer, CheckCircle2, AlertCircle, TrendingUp, Landmark, Banknote, FileText, Save } from "lucide-react";
import { PAYMENT_METHOD_LABEL, PosDailyReport } from "../../api/endpoints/sales";
import { usePosDailyClose, useSavePosDailyClose } from "../../hooks/useSales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { toast } from "../../stores/toastStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { formatNumber } from "../../lib/utils/format";

interface PosDailyCloseModalProps {
  isOpen: boolean;
  report: PosDailyReport | null;
  isLoading?: boolean;
  onClose: () => void;
}

const METHOD_ICON = { cash: Banknote, bank: Landmark, receivable: FileText } as const;

export const PosDailyCloseModal: React.FC<PosDailyCloseModalProps> = ({
  isOpen,
  report,
  isLoading,
  onClose,
}) => {
  const [countedCash, setCountedCash] = useState<string>("");

  const { data: savedClose } = usePosDailyClose(undefined, isOpen);
  const saveClose = useSavePosDailyClose();

  if (!isOpen) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const expectedCash = savedClose ? Number(savedClose.expected_cash) : Number(report?.expected_cash ?? 0);
  const counted = savedClose
    ? Number(savedClose.counted_cash)
    : countedCash.trim() !== "" ? Number(countedCash) : null;
  const difference = counted !== null ? counted - expectedCash : null;

  const handleSave = () => {
    if (counted === null || savedClose || saveClose.isPending) {
      return;
    }
    saveClose.mutate(
      { counted_cash: counted },
      { onSuccess: () => toast.success("تم حفظ إغلاق الصندوق اليومي") },
    );
  };

  const saveError = saveClose.isError
    ? apiErrorPayload(saveClose.error)?.message || "تعذّر حفظ إغلاق الصندوق"
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="lg">
        <DialogHeader className="print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-accent/15 text-app-accent">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm">إغلاق الصندوق والوردية اليومية (Z-Report)</DialogTitle>
              <DialogDescription className="text-[11px]">
                مطابقة النقد الفعلي بالصندوق مع النقد المستلم فعلياً (مبيعات نقدية + تحصيلات نقدية)
              </DialogDescription>
            </div>
          </div>
          <DialogClose />
        </DialogHeader>

        {/* Content Body */}
        <DialogBody className="print-area space-y-5 print:p-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-app-label-secondary">
              جاري تحميل تقرير الصندوق...
            </div>
          ) : !report ? (
            <div className="py-12 text-center text-xs text-app-label-secondary">
              لا توجد بيانات مبيعات مسجلة لليوم الحالي.
            </div>
          ) : (
            <>
              {/* Top KPI Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-start">
                  <div className="text-[11px] text-app-label-secondary">إجمالي العمليات</div>
                  <div className="text-lg font-bold font-mono text-app-label-primary mt-1">
                    {report.sales_count}
                  </div>
                </div>
                <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-start">
                  <div className="text-[11px] text-app-label-secondary">إجمالي المبيعات</div>
                  <div className="text-lg font-bold font-mono text-app-accent mt-1">
                    {formatNumber(report.total)} <span className="text-xs font-sans">د.ل</span>
                  </div>
                </div>
                <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-start">
                  <div className="text-[11px] text-app-label-secondary">تكلفة البضاعة</div>
                  <div className="text-lg font-bold font-mono text-app-label-primary mt-1">
                    {formatNumber(report.total_cost)} <span className="text-xs font-sans">د.ل</span>
                  </div>
                </div>
              </div>

              {/* Sales by payment method */}
              <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-4 space-y-3">
                <div className="text-xs font-bold text-app-label-primary flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-app-accent" />
                  <span>المبيعات حسب طريقة الدفع</span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {(["cash", "bank", "receivable"] as const).map((method) => {
                    const row = report.by_method?.[method] ?? { count: 0, total: 0 };
                    const Icon = METHOD_ICON[method];
                    return (
                      <div key={method} className="flex items-center justify-between rounded-lg border border-app-separator bg-app-bg-primary p-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-app-accent" />
                          <div>
                            <div className="text-xs font-semibold text-app-label-primary">{PAYMENT_METHOD_LABEL[method]}</div>
                            <div className="text-[10px] text-app-label-secondary">{row.count} عملية</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold font-mono text-app-label-primary">{formatNumber(row.total)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cash actually collected, by treasury — this is what the drawer should match */}
              {report.by_cash_account.length > 0 && (
                <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-4 space-y-2">
                  <div className="text-xs font-bold text-app-label-primary">النقد والمصرفي المُستلم فعلياً حسب الخزينة</div>
                  {report.by_cash_account.map((row) => (
                    <div key={row.cash_account_id ?? "unknown"} className="flex items-center justify-between text-xs">
                      <span className="text-app-label-secondary">{row.name ?? "—"}</span>
                      <span className="font-mono font-bold">{formatNumber(row.total)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cash Drawer Reconciliation Section */}
              <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-4 space-y-3">
                <div className="text-xs font-bold text-app-label-primary">
                  مطابقة النقد في الصندوق (Cash Drawer Reconciliation)
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                      النقد المتوقع حسب النظام
                    </label>
                    <div className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-mono font-bold text-app-label-primary">
                      {formatNumber(expectedCash)} د.ل
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                      النقد الفعلي المعدود بالدرج
                    </label>
                    {savedClose ? (
                      <div className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-mono font-bold text-app-label-primary">
                        {formatNumber(savedClose.counted_cash)} د.ل
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="أدخل المبلغ المعدود..."
                        value={countedCash}
                        onChange={(e) => setCountedCash(e.target.value)}
                        className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-mono text-app-label-primary focus:border-app-accent focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Saved-close confirmation / save error */}
                {savedClose && (
                  <div className="flex items-center gap-2 rounded-xl bg-app-status-info/15 border border-app-status-info/30 p-3 text-xs font-bold text-app-status-info print:hidden">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      تم إغلاق صندوق اليوم وحفظه
                      {savedClose.closed_by?.name ? ` بواسطة ${savedClose.closed_by.name}` : ""}.
                    </span>
                  </div>
                )}
                {saveError && (
                  <div className="flex items-center gap-2 rounded-xl bg-app-status-danger/15 border border-app-status-danger/30 p-3 text-xs font-bold text-app-status-danger print:hidden">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Difference Status */}
                {difference !== null && (
                  <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
                    Math.abs(difference) < 0.001
                      ? "bg-app-status-positive/15 text-app-status-positive border border-app-status-positive/30"
                      : difference > 0
                      ? "bg-app-status-warning/15 text-app-status-warning border border-app-status-warning/30"
                      : "bg-app-status-danger/15 text-app-status-danger border border-app-status-danger/30"
                  }`}>
                    {Math.abs(difference) < 0.001 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>الصندوق متطابق تماماً مع النقد المستلم فعلياً.</span>
                      </>
                    ) : difference > 0 ? (
                      <>
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>يوجد زيادة في الصندوق بمقدار +{formatNumber(difference)} د.ل</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>يوجد عجز في الصندوق بمقدار {formatNumber(difference)} د.ل</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogBody>

        {/* Footer Actions */}
        <DialogFooter className="print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
          >
            إغلاق
          </button>
          {!savedClose && (
            <button
              type="button"
              onClick={handleSave}
              disabled={counted === null || saveClose.isPending}
              className="flex items-center gap-2 rounded-xl bg-app-status-positive px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saveClose.isPending ? "جاري الحفظ..." : "تأكيد وحفظ الإغلاق"}
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Printer className="h-4 w-4" />
            طباعة تقرير الإغلاق (Z-Report)
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
