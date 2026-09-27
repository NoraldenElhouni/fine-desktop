import React, { useState } from "react";
import { Printer, CheckCircle2 } from "lucide-react";
import { PAYMENT_METHOD_LABEL, Sale, formatSizeCm } from "../../api/endpoints/sales";
import { formatDateTime, formatNumber } from "../../lib/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";

interface PosReceiptModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
}

/** The thermal (80mm) counter receipt for a cash sale, printed on the spot. */
export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({ isOpen, sale, onClose }) => {
  const [tenderedInput, setTenderedInput] = useState("");

  if (!isOpen || !sale) {
    return null;
  }

  const totalAmount = Number(sale.total_amount || 0);
  const isCash = sale.payment_method === "cash";
  const tendered = isCash && tenderedInput.trim() !== "" ? Number(tenderedInput) : totalAmount;
  const change = isCash ? Math.max(0, tendered - totalAmount) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-app-status-positive" />
            <span>إيصال نقطة البيع</span>
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        {isCash && (
          <div className="px-5 pt-3 print:hidden">
            <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
              المبلغ المستلم من العميل (للفكة فقط — لا يغيّر مبلغ البيع)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder={String(totalAmount)}
              value={tenderedInput}
              onChange={(e) => setTenderedInput(e.target.value)}
              className="w-40 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
              dir="ltr"
            />
          </div>
        )}

        <DialogBody className="p-0">
          <div
            id="pos-receipt-print-area"
            className="print-area print-thermal flex-1 overflow-y-auto p-6 bg-white text-black font-mono text-xs space-y-4 print:p-2 print:m-0 print:overflow-visible"
          >
            <div className="text-center space-y-1 border-b border-dashed border-gray-300 pb-3">
              <h2 className="text-sm font-bold tracking-wider font-sans">شركة فاين للصناعات والإسفنج</h2>
              <p className="text-[11px] text-gray-600 font-sans">إيصال نقطة البيع</p>
              <div className="text-[10px] text-gray-500 pt-1 space-y-0.5">
                <div>رقم البيع: <span className="font-bold">{sale.order_number}</span></div>
                <div>التاريخ: {formatDateTime(sale.created_at || new Date())}</div>
                <div>
                  طريقة الدفع: {sale.payment_method ? PAYMENT_METHOD_LABEL[sale.payment_method as keyof typeof PAYMENT_METHOD_LABEL] ?? sale.payment_method : "—"}
                  {sale.cash_account?.name ? ` — ${sale.cash_account.name}` : ""}
                </div>
              </div>
            </div>

            <div className="space-y-2 border-b border-dashed border-gray-300 pb-3">
              <div className="flex justify-between font-bold text-[11px] border-b border-gray-200 pb-1">
                <span>الصنف</span>
                <span className="text-end">الكمية × السعر</span>
                <span className="text-end">الإجمالي</span>
              </div>
              {sale.lines?.map((line) => {
                const qty = Number(line.quantity || 1);
                const price = Number(line.unit_price || 0);
                const size = formatSizeCm(line.length_m, line.width_m, line.height_m);
                return (
                  <div key={line.id} className="flex justify-between items-center text-[11px]">
                    <div className="flex-1 truncate pe-2">
                      <div className="font-semibold text-gray-900">{line.description ?? line.inventory_item?.name ?? "صنف"}</div>
                      {(line.inventory_item?.code || size) && (
                        <div className="text-[9px] text-gray-500">{[line.inventory_item?.code, size].filter(Boolean).join(" · ")}</div>
                      )}
                      {line.stock_lot?.lot_number && (
                        <div className="text-[9px] text-gray-700 font-bold">لوت: {line.stock_lot.lot_number}</div>
                      )}
                    </div>
                    <div className="text-end pe-3 text-gray-700 whitespace-nowrap">
                      {formatNumber(qty)} × {formatNumber(price)}
                    </div>
                    <div className="text-end font-bold text-gray-900 whitespace-nowrap">
                      {formatNumber(qty * price)} د.ل
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 text-xs border-b border-dashed border-gray-300 pb-3">
              <div className="flex justify-between font-bold text-sm">
                <span>المجموع الإجمالي:</span>
                <span>{formatNumber(totalAmount)} د.ل</span>
              </div>
              {isCash && (
                <>
                  <div className="flex justify-between text-gray-700 text-[11px]">
                    <span>المبلغ المستلم:</span>
                    <span>{formatNumber(tendered)} د.ل</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-[11px]">
                    <span>الفكة:</span>
                    <span>{formatNumber(change)} د.ل</span>
                  </div>
                </>
              )}
              {sale.payment_method === "receivable" && (
                <div className="flex justify-between text-gray-700 text-[11px] font-bold">
                  <span>مقيّد على ذمة العميل</span>
                  <span>{formatNumber(totalAmount)} د.ل</span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-gray-500 pt-1 space-y-0.5 font-sans">
              <p>شكراً لتعاملكم معنا!</p>
              <p>البضاعة المباعة تخضع لسياسة الاستبدال والضمان الرسمية</p>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Printer className="h-4 w-4" />
            طباعة الإيصال
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
