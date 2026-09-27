import React, { useState } from "react";
import { FileText, Printer, ShoppingCart, X } from "lucide-react";
import { useCancelQuotation, useQuotations } from "../../hooks/useSales";
import { QUOTATION_STATUS_LABEL, Quotation } from "../../api/endpoints/sales";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { QuotationPrintDialog } from "../../components/print/SalesDocuments";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";

const STATUS_TABS = ["", "open", "converted", "expired", "cancelled"] as const;

interface QuotationsPageProps {
  onOpenInPos: (quotation: Quotation) => void;
}

/** Saved priced previews — print, reopen in the POS to sell, or cancel. */
export const QuotationsPage: React.FC<QuotationsPageProps> = ({ onOpenInPos }) => {
  const [status, setStatus] = useState<string>("");
  const [printId, setPrintId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Quotation | null>(null);

  const { data, isLoading } = useQuotations({ status: status || undefined });
  const cancelQuotation = useCancelQuotation();
  const quotations = data?.data ?? [];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              status === s ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            {s ? QUOTATION_STATUS_LABEL[s as keyof typeof QUOTATION_STATUS_LABEL] : "الكل"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-14 text-center text-xs text-app-label-secondary">جاري التحميل…</div>
        ) : quotations.length === 0 ? (
          <div className="py-14 text-center text-xs text-app-label-secondary space-y-1">
            <FileText className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
            <p>لا توجد عروض أسعار.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
                <th className="px-4 py-2.5 text-start font-semibold">الرقم</th>
                <th className="px-3 py-2.5 text-start font-semibold">العميل</th>
                <th className="px-3 py-2.5 text-center font-semibold">صالح حتى</th>
                <th className="px-3 py-2.5 text-end font-semibold">الإجمالي</th>
                <th className="px-3 py-2.5 text-center font-semibold">الحالة</th>
                <th className="px-3 py-2.5 w-40" />
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-app-fill-f1/50">
                  <td className="px-4 py-2.5 font-mono font-bold text-app-accent">{q.quotation_number}</td>
                  <td className="px-3 py-2.5">{q.client?.entity?.name ?? "—"}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{formatDate(q.valid_until)}</td>
                  <td className="px-3 py-2.5 text-end font-mono font-bold">{formatNumber(q.total_amount)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusBadge status={q.effective_status} label={QUOTATION_STATUS_LABEL[q.effective_status]} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPrintId(q.id)}
                        title="طباعة"
                        className="rounded-lg p-1.5 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      {q.effective_status === "open" && (
                        <>
                          <button
                            onClick={() => onOpenInPos(q)}
                            className="flex items-center gap-1 rounded-lg bg-app-accent px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
                          >
                            <ShoppingCart className="h-3 w-3" /> بيع الآن
                          </button>
                          <button
                            onClick={() => setCancelTarget(q)}
                            title="إلغاء"
                            className="rounded-lg p-1.5 text-app-label-tertiary hover:bg-app-status-danger/10 hover:text-app-status-danger"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      {q.converted_sale && (
                        <span className="text-[10px] font-mono text-app-label-tertiary">→ {q.converted_sale.order_number}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <QuotationPrintDialog quotationId={printId} onClose={() => setPrintId(null)} />
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          cancelQuotation.mutate(cancelTarget.id, { onSuccess: () => toast.success("تم إلغاء عرض السعر") });
          setCancelTarget(null);
        }}
        title="إلغاء عرض السعر"
        message={`هل تريد إلغاء عرض السعر ${cancelTarget?.quotation_number ?? ""}؟`}
        variant="danger"
      />
    </div>
  );
};
