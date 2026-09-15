import React from "react";
import { Printer, CheckCircle2 } from "lucide-react";
import { SalesOrder } from "../../api/endpoints/sales";
import { formatDateTime } from "../../lib/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";

interface PosReceiptModalProps {
  isOpen: boolean;
  order: SalesOrder | null;
  cashReceived?: number;
  onClose: () => void;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  isOpen,
  order,
  cashReceived,
  onClose,
}) => {
  if (!isOpen || !order) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = Number(order.total_amount || 0);
  const tendered = cashReceived !== undefined && cashReceived > 0 ? cashReceived : totalAmount;
  const change = Math.max(0, tendered - totalAmount);

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

        <DialogBody className="p-0">
        {/* Printable Receipt Paper Container */}
        <div
          id="pos-receipt-print-area"
          className="print-area flex-1 overflow-y-auto p-6 bg-white text-black font-mono text-xs space-y-4 print:p-0 print:m-0 print:overflow-visible"
        >
          {/* Receipt Header */}
          <div className="text-center space-y-1 border-b border-dashed border-gray-300 pb-3">
            <h2 className="text-sm font-bold tracking-wider font-sans">شركة فاين للصناعات والإسفنج</h2>
            <p className="text-[11px] text-gray-600 font-sans">إيصال مبيعات نقدية - نقطة البيع</p>
            <div className="text-[10px] text-gray-500 pt-1 space-y-0.5">
              <div>رقم الطلب: <span className="font-bold">{order.order_number}</span></div>
              <div>التاريخ: {formatDateTime(order.created_at || new Date())}</div>
              <div>طريقة الدفع: {order.payment_method === "cash" ? "نقداً (Cash)" : "بطاقة مصرفية (Card)"}</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between font-bold text-[11px] border-b border-gray-200 pb-1">
              <span>الصنف</span>
              <span className="text-end">الكمية × السعر</span>
              <span className="text-end">الإجمالي</span>
            </div>
            {order.lines?.map((line) => {
              const qty = Number(line.quantity || 1);
              const price = Number(line.unit_price || 0);
              const lineTotal = qty * price;
              return (
                <div key={line.id} className="flex justify-between items-center text-[11px]">
                  <div className="flex-1 truncate pe-2">
                    <div className="font-semibold text-gray-900">{line.inventory_item?.name || "صنف تجاري"}</div>
                    {line.inventory_item?.sku && (
                      <div className="text-[9px] text-gray-500">{line.inventory_item.sku}</div>
                    )}
                    {line.stock_lot?.lot_number && (
                      <div className="text-[9px] text-gray-700 font-bold">
                        لوت: {line.stock_lot.lot_number}
                      </div>
                    )}
                  </div>
                  <div className="text-end pe-3 text-gray-700 whitespace-nowrap">
                    {qty} × {price.toLocaleString()}
                  </div>
                  <div className="text-end font-bold text-gray-900 whitespace-nowrap">
                    {lineTotal.toLocaleString()} د.ل
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals & Cash Breakdown */}
          <div className="space-y-1.5 text-xs border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between font-bold text-sm">
              <span>المجموع الإجمالي:</span>
              <span>{totalAmount.toLocaleString()} د.ل</span>
            </div>
            {order.payment_method === "cash" && (
              <>
                <div className="flex justify-between text-gray-700 text-[11px]">
                  <span>المبلغ المستلم:</span>
                  <span>{tendered.toLocaleString()} د.ل</span>
                </div>
                <div className="flex justify-between text-gray-700 text-[11px]">
                  <span>المتبقي للعميل (الفكة):</span>
                  <span>{change.toLocaleString()} د.ل</span>
                </div>
              </>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="text-center text-[10px] text-gray-500 pt-1 space-y-0.5 font-sans">
            <p>شكراً لتعاملكم معنا!</p>
            <p>البضاعة المباعة تخضع لسياسة الاستبدال والضمان الرسمية</p>
          </div>
        </div>
        </DialogBody>

        {/* Modal Action Buttons (hidden during print) */}
        <DialogFooter className="print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            بيع جديد
          </button>
          <button
            type="button"
            onClick={handlePrint}
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
