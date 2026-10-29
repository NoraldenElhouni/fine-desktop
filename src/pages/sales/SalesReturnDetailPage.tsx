import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, FileText, Printer, Undo2, UserRound } from "lucide-react";
import { useSalesReturn } from "../../hooks/useSales";
import { REFUND_METHOD_LABEL, RETURN_CONDITION_LABEL, salesReturnBuyer } from "../../api/endpoints/sales";
import { apiErrorMessage } from "../../api/endpoints/production";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { SalesReturnNoticeDialog, SalesReturnReceiptModal } from "../../components/print/SalesReturnDocuments";

/** One sales return: its lines, how the customer was refunded, and its two prints. */
export const SalesReturnDetailPage: React.FC = () => {
  const { returnId } = useParams<{ returnId: string }>();
  const navigate = useNavigate();
  const { data: salesReturn, isLoading, error } = useSalesReturn(returnId);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary" dir="rtl">
        جاري تحميل المرتجع…
      </div>
    );
  }

  if (!salesReturn) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-status-danger" dir="rtl">
        {apiErrorMessage(error, "تعذّر تحميل المرتجع.")}
      </div>
    );
  }

  const lines = salesReturn.lines ?? [];

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <button
          onClick={() => navigate(`/sales/${salesReturn.sales_order_id}`)}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2"
        >
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى البيع
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Undo2 className="w-7 h-7 text-app-accent" />
          مرتجع
          <span className="font-mono text-app-accent">{salesReturn.number}</span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1 flex items-center gap-1.5">
          <UserRound className="w-3.5 h-3.5" /> {salesReturnBuyer(salesReturn)}
          {" · "}{formatDate(salesReturn.return_date)}
          {salesReturn.order?.order_number && (
            <>
              {" · "}البيع{" "}
              <button
                onClick={() => navigate(`/sales/${salesReturn.sales_order_id}`)}
                className="font-mono text-app-accent hover:underline"
              >
                {salesReturn.order.order_number}
              </button>
            </>
          )}
          {salesReturn.created_by && ` · أنشأه ${salesReturn.created_by.name}`}
        </p>
      </div>

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-xs text-app-label-secondary">
          إجمالي المردود <span className="font-mono font-bold text-app-label-primary">{formatNumber(salesReturn.amount)}</span>
          {" · "}طريقة الرد{" "}
          <span className="font-semibold text-app-label-primary">
            {REFUND_METHOD_LABEL[salesReturn.refund_method] ?? salesReturn.refund_method}
            {salesReturn.cash_account?.name ? ` — ${salesReturn.cash_account.name}` : ""}
          </span>
          {salesReturn.journal_entry?.reference && (
            <> · القيد <span className="font-mono">{salesReturn.journal_entry.reference}</span></>
          )}
        </div>
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <Printer className="w-4 h-4" /> إيصال المرتجع
          </button>
          <button
            onClick={() => setShowNotice(true)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <FileText className="w-4 h-4" /> إشعار مرتجع
          </button>
        </div>
      </div>

      {salesReturn.reason?.trim() && (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 text-xs text-app-label-primary">
          <span className="text-app-label-secondary">السبب: </span>{salesReturn.reason.trim()}
        </div>
      )}

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">البنود المرتجعة</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
              <th className="px-4 py-2 text-start font-semibold">البيان</th>
              <th className="px-3 py-2 text-center font-semibold">الكمية</th>
              <th className="px-3 py-2 text-start font-semibold">الحالة</th>
              <th className="px-3 py-2 text-end font-semibold">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator">
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="px-4 py-2.5">
                  <div className="font-semibold">
                    {line.order_line?.description ?? line.order_line?.inventory_item?.name ?? "—"}
                  </div>
                  {line.order_line?.inventory_item?.code && (
                    <div className="text-[10px] text-app-label-tertiary font-mono">{line.order_line.inventory_item.code}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center font-mono">{formatNumber(line.quantity, { maximumFractionDigits: 4 })}</td>
                <td className="px-3 py-2.5 text-app-label-secondary">{RETURN_CONDITION_LABEL[line.condition] ?? line.condition}</td>
                <td className="px-3 py-2.5 text-end font-mono font-bold">{formatNumber(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SalesReturnReceiptModal salesReturn={showReceipt ? salesReturn : null} onClose={() => setShowReceipt(false)} />
      <SalesReturnNoticeDialog salesReturn={showNotice ? salesReturn : null} onClose={() => setShowNotice(false)} />
    </div>
  );
};
