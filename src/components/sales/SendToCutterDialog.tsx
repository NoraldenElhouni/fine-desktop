import React, { useState } from "react";
import { Scissors } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { useOpenCutterOrders, useSendToCutter } from "../../hooks/useSales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatDateTime } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";

interface SendToCutterDialogProps {
  open: boolean;
  saleId: string;
  componentIds: string[];
  onClose: () => void;
}

/** The chosen pieces join an open cutter order, or start a new one. */
export const SendToCutterDialog: React.FC<SendToCutterDialogProps> = ({ open, saleId, componentIds, onClose }) => {
  const { data: openOrders = [] } = useOpenCutterOrders(open);
  const sendToCutter = useSendToCutter();
  const [target, setTarget] = useState<string>("new");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    sendToCutter.mutate(
      { saleId, componentIds, cutterWorkOrderId: target === "new" ? null : target },
      {
        onSuccess: (order) => {
          toast.success(`تم إرسال القطع إلى أمر التقطيع ${order.order_number}`);
          onClose();
        },
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذّر الإرسال إلى المقص."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-app-accent" />
              إرسال إلى المقص
            </DialogTitle>
            <DialogDescription>{componentIds.length} قطعة/قطع مختارة</DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-2">
          {error && <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">{error}</div>}

          <label className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary p-3 cursor-pointer">
            <input type="radio" checked={target === "new"} onChange={() => setTarget("new")} />
            <span className="text-xs font-semibold">أمر تقطيع جديد</span>
          </label>

          {openOrders.length > 0 && (
            <>
              <p className="text-[11px] text-app-label-tertiary px-1">أو الانضمام إلى أمر مفتوح:</p>
              {openOrders.map((o) => (
                <label key={o.id} className="flex items-center justify-between gap-2 rounded-xl border border-app-separator bg-app-bg-secondary p-3 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input type="radio" checked={target === o.id} onChange={() => setTarget(o.id)} />
                    <span className="font-mono text-xs font-bold">{o.order_number}</span>
                  </span>
                  <span className="text-[11px] text-app-label-tertiary">
                    {o.lines_count} بند · {formatDateTime(o.created_at)}
                  </span>
                </label>
              ))}
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl">
            إلغاء
          </button>
          <button
            onClick={submit}
            disabled={sendToCutter.isPending}
            className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            {sendToCutter.isPending ? "جارٍ الإرسال…" : "إرسال"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
