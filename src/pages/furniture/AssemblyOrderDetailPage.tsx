import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Printer, XCircle } from "lucide-react";
import { useAssemblyOrder, useCancelAssemblyOrder, useCompleteAssemblyOrder } from "../../hooks/useAssemblyOrders";
import { usePermissions } from "../../hooks/usePermissions";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { AssemblyOrderPrintDialog } from "../../components/print/AssemblyOrderDocument";
import { toast } from "../../stores/toastStore";
import { UOM_LABELS } from "../../api/endpoints/inventory";
import { formatDateTime, formatNumber } from "../../lib/utils/format";
import {
  ASSEMBLY_STATUS_LABEL,
  ASSEMBLY_STATUS_ORDER,
  ASSEMBLY_STATUS_STYLE,
  assemblyErrorMessage,
  sizeLabel,
} from "../../api/endpoints/assemblyOrders";

const qty4 = (v: number | string | null | undefined): string =>
  v === null || v === undefined || v === "" ? "—" : formatNumber(v, { maximumFractionDigits: 4 });
const money = (v: number | string | null | undefined): string =>
  v === null || v === undefined ? "—" : `${formatNumber(v)} د.ل`;
const uom = (u?: string | null) => (u ? UOM_LABELS[u] ?? u : "");

/**
 * One assembly order (W4-07): header and status chips, its components with
 * the lot and actual cost of each, the cost roll-up and the finished lot(s).
 * A draft is completed (consumes the components, produces the lot, posts DR
 * 1134 / CR the component accounts) or cancelled (nothing was reserved).
 */
export const AssemblyOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("edit-furniture");

  const { data: order, isLoading } = useAssemblyOrder(id);
  const complete = useCompleteAssemblyOrder();
  const cancel = useCancelAssemblyOrder();

  const [confirmAction, setConfirmAction] = useState<"complete" | "cancel" | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const handleConfirm = async () => {
    if (!order || !confirmAction) return;
    try {
      if (confirmAction === "complete") {
        const done = await complete.mutateAsync({ id: order.id, recordVersion: order.record_version });
        toast.success(
          `تم إتمام ${done.number} — دخل لوت المنتج التام ${done.finished_stock_lots.map((l) => l.lot_number).join("، ") || ""} بتكلفة ${money(done.summary.total_cost)}`,
        );
      } else {
        await cancel.mutateAsync({ id: order.id, recordVersion: order.record_version });
        toast.success(`تم إلغاء ${order.number}.`);
      }
    } catch (err) {
      toast.error(assemblyErrorMessage(err, "تعذّر تنفيذ الإجراء."));
    }
    setConfirmAction(null);
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">جارٍ تحميل أمر التجميع…</div>;
  }

  if (!order) {
    return <div className="p-6 text-center text-xs text-app-label-secondary">تعذر العثور على أمر التجميع.</div>;
  }

  const s = order.summary;
  const isDraft = order.status === "draft";
  const finishedUom = uom(order.finished_item?.unit_of_measure);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <button
        onClick={() => navigate("/furniture/assembly")}
        className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline w-fit"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى أوامر التجميع
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
            <span className="font-mono">{order.number}</span>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${ASSEMBLY_STATUS_STYLE[order.status]}`}>
              {ASSEMBLY_STATUS_LABEL[order.status]}
            </span>
          </h1>
          <p className="text-xs text-app-label-secondary">
            {order.finished_item?.name ?? "—"}
            {order.finished_item?.code ? ` (${order.finished_item.code})` : ""} — {qty4(order.quantity)} {finishedUom} — إلى{" "}
            {order.output_warehouse?.name ?? "—"}
            {order.bundle ? ` — من قالب الحزمة: ${order.bundle.name}` : ""}
          </p>
          <p className="text-[11px] text-app-label-tertiary">
            أنشأه {order.created_by?.name ?? "—"} في {formatDateTime(order.created_at)}
            {order.completed_by && order.completed_at ? ` · أتمّه ${order.completed_by.name} في ${formatDateTime(order.completed_at)}` : ""}
            {order.cancelled_at ? ` · أُلغي في ${formatDateTime(order.cancelled_at)}` : ""}
            {order.journal_entry ? ` · القيد ${order.journal_entry.reference ?? ""}` : ""}
          </p>
          {order.notes && <p className="text-[11px] text-app-label-secondary">ملاحظات: {order.notes}</p>}

          {/* Status-chip bar */}
          {order.status !== "cancelled" && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {ASSEMBLY_STATUS_ORDER.map((st) => {
                const reached = ASSEMBLY_STATUS_ORDER.indexOf(st) <= ASSEMBLY_STATUS_ORDER.indexOf(order.status);
                return (
                  <span
                    key={st}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      st === order.status
                        ? "bg-app-accent text-white"
                        : reached
                          ? "bg-app-accent/15 text-app-accent"
                          : "bg-app-fill-f1 text-app-label-tertiary"
                    }`}
                  >
                    {ASSEMBLY_STATUS_LABEL[st]}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> طباعة
          </button>
          {isDraft && canEdit && (
            <>
              <button
                onClick={() => setConfirmAction("cancel")}
                className="flex items-center gap-1.5 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 px-3 py-2 text-xs font-semibold text-app-status-danger hover:bg-app-status-danger/20 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> إلغاء الأمر
              </button>
              <button
                onClick={() => setConfirmAction("complete")}
                className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> إتمام التجميع
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
          <div className="text-[11px] text-app-label-secondary">المكونات</div>
          <div className="font-mono text-sm font-bold text-app-label-primary">{formatNumber(s.lines_total)}</div>
        </div>
        <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
          <div className="text-[11px] text-app-label-secondary">التكلفة الإجمالية</div>
          <div className="font-mono text-sm font-bold text-app-label-primary">{money(s.total_cost)}</div>
          {s.total_cost !== null && <div className="text-[10px] text-app-label-tertiary">مدين 1134 / دائن حسابات المكونات</div>}
        </div>
        <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
          <div className="text-[11px] text-app-label-secondary">تكلفة الوحدة</div>
          <div className="font-mono text-sm font-bold text-app-label-primary">
            {s.unit_cost === null ? "—" : `${formatNumber(s.unit_cost, { maximumFractionDigits: 4 })} د.ل`}
          </div>
        </div>
        <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
          <div className="text-[11px] text-app-label-secondary">لوت المنتج التام</div>
          {order.finished_stock_lots.length === 0 ? (
            <div className="text-xs text-app-label-tertiary">{isDraft ? "يُنشأ عند الإتمام" : "—"}</div>
          ) : (
            order.finished_stock_lots.map((lot) => (
              <div key={lot.id} className="font-mono text-[11px] text-app-label-primary">
                {lot.lot_number}: {qty4(lot.quantity)} × {formatNumber(lot.unit_cost, { maximumFractionDigits: 4 })}
              </div>
            ))
          )}
        </div>
      </div>

      {order.finished_stock_lots.length > 1 && (
        <p className="text-[11px] text-app-label-tertiary">
          لم تنقسم التكلفة على الكمية بالتساوي، فحملت وحدة واحدة في لوت مستقل فرق التقريب، ليساوي مجموع اللوتات قيد 1134 تماماً.
        </p>
      )}

      {isDraft && (
        <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-[11px] text-app-label-secondary">
          المسودة لا تحجز شيئاً. عند الإتمام يُصرف كل مكوّن من لوته المختار أو من الأقدم المطابق لمقاسه في مخازن الوحدة، ويُرفض الإتمام كاملاً إن لم يكفِ المخزون.
        </div>
      )}

      {/* Components and cost breakdown */}
      <div className="overflow-x-auto rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <table className="w-full text-start text-xs">
          <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
            <tr>
              <th className="px-3 py-3 text-start w-10">#</th>
              <th className="px-3 py-3 text-start">المكوّن</th>
              <th className="px-3 py-3 text-start">المقاس</th>
              <th className="px-3 py-3 text-start">اللوت</th>
              <th className="px-3 py-3 text-end">الكمية</th>
              <th className="px-3 py-3 text-end">تكلفة الوحدة</th>
              <th className="px-3 py-3 text-end">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator text-app-label-primary">
            {order.lines.map((line, i) => (
              <tr key={line.id}>
                <td className="px-3 py-2 font-mono text-app-label-tertiary">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{line.inventory_item?.name ?? "—"}</div>
                  <div className="text-[10px] font-mono text-app-label-tertiary">{line.inventory_item?.code}</div>
                </td>
                <td className="px-3 py-2 font-mono text-[11px]">{sizeLabel(line.length_m, line.width_m, line.height_m) ?? "—"}</td>
                <td className="px-3 py-2">
                  {line.stock_lot ? (
                    <span className="font-mono text-[11px]">{line.stock_lot.lot_number}</span>
                  ) : (
                    <span className="text-[11px] text-app-label-tertiary">تلقائي — الأقدم أولاً</span>
                  )}
                </td>
                <td className="px-3 py-2 text-end font-mono">
                  {qty4(line.quantity)} <span className="text-[10px] text-app-label-tertiary">{uom(line.inventory_item?.unit_of_measure)}</span>
                </td>
                <td className="px-3 py-2 text-end font-mono">
                  {line.unit_cost === null ? "—" : formatNumber(line.unit_cost, { maximumFractionDigits: 4 })}
                </td>
                <td className="px-3 py-2 text-end font-mono font-bold">{money(line.total_cost)}</td>
              </tr>
            ))}
          </tbody>
          {s.total_cost !== null && (
            <tfoot className="border-t border-app-separator bg-app-bg-secondary font-bold">
              <tr>
                <td colSpan={6} className="px-3 py-2 text-end">
                  إجمالي تكلفة المكونات
                </td>
                <td className="px-3 py-2 text-end font-mono">{money(s.total_cost)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <AssemblyOrderPrintDialog order={isPrintOpen ? order : null} onClose={() => setIsPrintOpen(false)} />

      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction === "complete" ? "إتمام التجميع" : "إلغاء أمر التجميع"}
        message={
          confirmAction === "complete"
            ? `ستُستهلك مكونات "${order.number}" من لوتاتها، ويدخل ${qty4(order.quantity)} ${finishedUom} من ${order.finished_item?.name ?? "المنتج"} مخزن ${order.output_warehouse?.name ?? "الإنتاج"} بمجموع تكلفتها الفعلية، ويُرحّل القيد. لا يمكن التراجع.`
            : `سيُلغى "${order.number}". لم يُحجز له شيء، فلا أثر على المخزون.`
        }
        confirmText={confirmAction === "complete" ? "إتمام" : "إلغاء الأمر"}
        cancelText="تراجع"
        variant={confirmAction === "cancel" ? "danger" : "primary"}
        isLoading={complete.isPending || cancel.isPending}
      />
    </div>
  );
};
