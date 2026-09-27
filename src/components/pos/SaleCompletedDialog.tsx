import React, { useState } from "react";
import { CheckCircle2, FileText, Receipt as ReceiptIcon, Truck } from "lucide-react";
import { Sale } from "../../api/endpoints/sales";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { formatNumber } from "../../lib/utils/format";
import { PosReceiptModal } from "./PosReceiptModal";
import { SaleInvoiceDialog, DeliveryNoteDialog } from "../print/SalesDocuments";

interface SaleCompletedDialogProps {
  sale: Sale | null;
  onClose: () => void;
}

/** After a checkout with no bundles: what to print, then a fresh cart. */
export const SaleCompletedDialog: React.FC<SaleCompletedDialogProps> = ({ sale, onClose }) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState(false);

  if (!sale) return null;

  return (
    <>
      <Dialog open={Boolean(sale) && !showReceipt && !showInvoice && !showDeliveryNote} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-app-status-positive" />
              تم البيع
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3 text-center">
            <div className="font-mono text-sm font-bold text-app-accent">{sale.order_number}</div>
            <div className="text-2xl font-bold font-mono text-app-label-primary">
              {formatNumber(sale.total_amount)} <span className="text-sm font-sans">د.ل</span>
            </div>
          </DialogBody>
          <DialogFooter className="flex-wrap">
            <button
              type="button"
              onClick={() => setShowReceipt(true)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1"
            >
              <ReceiptIcon className="h-4 w-4" />
              إيصال
            </button>
            <button
              type="button"
              onClick={() => setShowInvoice(true)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1"
            >
              <FileText className="h-4 w-4" />
              فاتورة
            </button>
            <button
              type="button"
              onClick={() => setShowDeliveryNote(true)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1"
            >
              <Truck className="h-4 w-4" />
              إذن استلام
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ms-auto rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
            >
              بيع جديد
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PosReceiptModal isOpen={showReceipt} sale={sale} onClose={() => { setShowReceipt(false); onClose(); }} />
      <SaleInvoiceDialog saleId={showInvoice ? sale.id : null} onClose={() => { setShowInvoice(false); onClose(); }} />
      <DeliveryNoteDialog saleId={showDeliveryNote ? sale.id : null} onClose={() => { setShowDeliveryNote(false); onClose(); }} />
    </>
  );
};
