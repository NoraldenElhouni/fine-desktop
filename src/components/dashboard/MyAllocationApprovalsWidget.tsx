import React from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, ShieldCheck, DollarSign } from "lucide-react";
import { useMyAllocationApprovals } from "../../hooks/useDashboard";
import {
  useApproveLandedCostLine,
  useMarkLandedCostLinePaid,
} from "../../hooks/useProcurement";
import {
  useApproveOverheadAllocation,
  useMarkOverheadAllocationPaid,
} from "../../hooks/useOverhead";
import { apiErrorPayload } from "../../api/endpoints/production";
import { toast } from "../../stores/toastStore";

const fmt = (v: number) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار الاعتماد",
  approved: "معتمد — بانتظار التأكيد",
  paid: "مدفوع",
};

export const MyAllocationApprovalsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useMyAllocationApprovals();
  const approveOverhead = useApproveOverheadAllocation();
  const markPaidOverhead = useMarkOverheadAllocationPaid();
  const approveLanded = useApproveLandedCostLine();
  const markPaidLanded = useMarkLandedCostLinePaid();

  const anyPending = (data?.total ?? 0) > 0;

  const handleApprove = (
    kind: "overhead_allocation" | "landed_cost_line",
    id: string,
    context: { orderId?: string }
  ) => {
    const mutation = kind === "overhead_allocation" ? approveOverhead : approveLanded;
    const vars = kind === "overhead_allocation"
      ? { id }
      : { orderId: context.orderId!, lineId: id };
    mutation.mutate(vars as never, {
      onError: (err) => toast.error(apiErrorPayload(err)?.message ?? "تعذر الاعتماد."),
    });
  };

  const handleMarkPaid = (
    kind: "overhead_allocation" | "landed_cost_line",
    id: string,
    context: { orderId?: string }
  ) => {
    const mutation = kind === "overhead_allocation" ? markPaidOverhead : markPaidLanded;
    const vars = kind === "overhead_allocation"
      ? { id }
      : { orderId: context.orderId!, lineId: id };
    mutation.mutate(vars as never, {
      onError: (err) => toast.error(apiErrorPayload(err)?.message ?? "تعذر تأكيد الدفع."),
    });
  };

  if (isLoading) return null;
  if (!anyPending) return null;

  return (
    <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
          <Inbox className="h-4 w-4 text-app-accent" />
          تكاليف تنتظر قرارك
        </h3>
        <span className="rounded-full bg-app-status-warning/15 px-2.5 py-0.5 text-[10px] font-bold text-app-status-warning">
          {data?.total}
        </span>
      </div>

      <div className="space-y-2">
        {data?.overhead_allocations.map((a) => (
          <div key={a.id} className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-app-label-primary">
                  توزيع مصروف عمومي — {a.category ?? "مصروف"}
                </div>
                <div className="text-[10px] font-mono text-app-label-secondary">
                  {fmt(a.amount)} · {STATUS_LABEL[a.status]}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/accounting/overhead")}
                className="text-[10px] font-bold text-app-accent hover:underline"
              >
                فتح
              </button>
            </div>
            <div className="flex gap-2">
              {a.status === "pending" && (
                <button
                  type="button"
                  onClick={() => handleApprove("overhead_allocation", a.id, {})}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> اعتماد
                </button>
              )}
              {a.status === "approved" && (
                <button
                  type="button"
                  onClick={() => handleMarkPaid("overhead_allocation", a.id, {})}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
                >
                  <DollarSign className="h-3.5 w-3.5" /> تأكيد الدفع
                </button>
              )}
            </div>
          </div>
        ))}
        {data?.landed_cost_lines.map((l) => (
          <div key={l.id} className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-app-label-primary">
                  تكلفة رأسمالية — {l.type}
                </div>
                <div className="text-[10px] font-mono text-app-label-secondary">
                  {fmt(l.amount)} {l.currency} · {STATUS_LABEL[l.status]}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/procurement/import-orders")}
                className="text-[10px] font-bold text-app-accent hover:underline"
              >
                فتح
              </button>
            </div>
            <div className="flex gap-2">
              {l.status === "pending" && (
                <button
                  type="button"
                  onClick={() => handleApprove("landed_cost_line", l.id, { orderId: l.import_order_id })}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> اعتماد
                </button>
              )}
              {l.status === "approved" && (
                <button
                  type="button"
                  onClick={() => handleMarkPaid("landed_cost_line", l.id, { orderId: l.import_order_id })}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
                >
                  <DollarSign className="h-3.5 w-3.5" /> تأكيد الدفع
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
