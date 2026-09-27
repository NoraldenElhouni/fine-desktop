import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShieldAlert, X } from "lucide-react";
import { useCreditApprovals, useDecideCredit } from "../../hooks/useSales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatDateTime, formatNumber } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";

/** Receivable sales that went over the client's credit limit at the counter — manager decision only. */
export const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useCreditApprovals("pending");
  const decide = useDecideCredit();
  const [error, setError] = useState<string | null>(null);

  const approvals = data?.data ?? [];

  const act = (id: string, approve: boolean) => {
    setError(null);
    decide.mutate(
      { id, approve },
      {
        onSuccess: () => toast.success(approve ? "تمت الموافقة وصُرف البيع" : "تم رفض البيع"),
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذّر تنفيذ القرار."),
      },
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {error && (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">{error}</div>
      )}

      {isLoading ? (
        <div className="py-14 text-center text-xs text-app-label-secondary">جاري التحميل…</div>
      ) : approvals.length === 0 ? (
        <div className="py-14 text-center text-xs text-app-label-secondary space-y-1">
          <ShieldAlert className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
          <p>لا توجد مبيعات بانتظار الموافقة.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((a) => (
            <div key={a.id} className="rounded-2xl border border-app-status-warning/40 bg-app-status-warning/5 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs">
                  <button
                    onClick={() => navigate(`/sales/${a.sales_order_id}`)}
                    className="font-mono font-bold text-app-accent hover:underline"
                  >
                    {a.sales_order?.order_number}
                  </button>
                  {" · "}
                  <span className="text-app-label-secondary">{a.sales_order?.client?.entity?.name ?? "—"}</span>
                  {" · "}
                  <span className="text-app-label-tertiary">{formatDateTime(a.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => act(a.id, true)}
                    disabled={decide.isPending}
                    className="flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> موافقة
                  </button>
                  <button
                    onClick={() => act(a.id, false)}
                    disabled={decide.isPending}
                    className="flex items-center gap-1 rounded-xl border border-app-status-danger/40 px-3 py-1.5 text-xs font-bold text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> رفض
                  </button>
                </div>
              </div>
              <p className="text-xs text-app-label-primary">
                يتجاوز سقف العميل بمقدار{" "}
                <span className="font-mono font-bold">{formatNumber(a.amount_over_limit)}</span> د.ل. الموافقة تصرف البيع
                فوراً؛ الرفض يلغيه ولا يُصرف شيء.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
