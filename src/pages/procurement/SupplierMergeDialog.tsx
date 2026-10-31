import React, { useMemo, useState } from "react";
import { GitMerge } from "lucide-react";
import type { Supplier } from "../../types/procurement";
import { useMergeSupplier } from "../../hooks/useProcurement";
import { supplierErrorMessage } from "../../api/endpoints/procurement";
import { toast } from "../../stores/toastStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

/**
 * W5-07: merge a duplicate supplier (the source) into another supplier of the
 * same unit. The source's purchase orders, cheques and payment requests move to
 * the target, its ledger account too when it carries postings, and the source
 * is deleted.
 */
interface SupplierMergeDialogProps {
  source: Supplier | null;
  /** Preselected target (from the edit form's duplicate warning). */
  initialTargetId?: string | null;
  suppliers: Supplier[];
  onClose: () => void;
  /** After a successful merge (the source no longer exists). */
  onMerged?: () => void;
}

const accountLabel = (s: Supplier | null | undefined): string =>
  s?.account ? `${s.account.account_code} - ${s.account.name}` : "بلا حساب خاص (سلف الموردين 15)";

export const SupplierMergeDialog: React.FC<SupplierMergeDialogProps> = ({
  source,
  initialTargetId,
  suppliers,
  onClose,
  onMerged,
}) => (
  <Dialog open={source !== null} onOpenChange={(open) => !open && onClose()}>
    {source && (
      <MergeForm
        key={`${source.id}-${initialTargetId ?? ""}`}
        source={source}
        initialTargetId={initialTargetId}
        suppliers={suppliers}
        onClose={onClose}
        onMerged={onMerged}
      />
    )}
  </Dialog>
);

const MergeForm: React.FC<Omit<SupplierMergeDialogProps, "source"> & { source: Supplier }> = ({
  source,
  initialTargetId,
  suppliers,
  onClose,
  onMerged,
}) => {
  const merge = useMergeSupplier();
  const [targetId, setTargetId] = useState<string>(initialTargetId ?? "");
  const [error, setError] = useState<string | null>(null);

  // Only suppliers of the source's own unit can absorb it.
  const candidates = useMemo(
    () => suppliers.filter((s) => s.id !== source.id && s.operating_unit_id === source.operating_unit_id),
    [suppliers, source]
  );
  const target = candidates.find((s) => s.id === targetId) ?? null;

  const submit = () => {
    if (!target) {
      setError("اختر المورد الذي يُدمج فيه.");
      return;
    }
    setError(null);
    merge.mutate(
      { id: source.id, targetId: target.id },
      {
        onSuccess: (result) => {
          const m = result.moved;
          toast.success(
            `تم دمج «${source.name}» في «${result.data.name}» — نُقل ${m.purchase_orders} أمر شراء و${m.cheques} شيك و${m.payment_requests} طلب دفع.`
          );
          onMerged?.();
          onClose();
        },
        onError: (err) => setError(supplierErrorMessage(err, "تعذر دمج الموردين.")),
      }
    );
  };

  return (
    <DialogContent size="lg">
      <DialogHeader>
        <DialogTitle>دمج مورد مكرر</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4 text-xs" dir="rtl">
          <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
            <div className="text-[11px] text-app-label-secondary">المورد المكرر (سيُحذف بعد الدمج)</div>
            <div className="mt-0.5 font-bold text-app-label-primary">{source.name}</div>
            <div className="mt-1 text-[11px] text-app-label-secondary">
              {source.operating_unit?.name ?? "—"}
              {source.tax_number && <span className="ms-2 font-mono">ض: {source.tax_number}</span>}
              <span className="ms-2 font-mono">{accountLabel(source)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              يُدمج في المورد <span className="text-app-status-danger">*</span>
            </label>
            <SearchableSelect<Supplier>
              options={candidates}
              value={target}
              onChange={(s) => setTargetId(s ? s.id : "")}
              getOptionId={(s) => s.id}
              getOptionLabel={(s) => s.name}
              getOptionSubLabel={(s) => [s.tax_number ? `ض: ${s.tax_number}` : "", accountLabel(s)].filter(Boolean).join(" — ")}
              getOptionSearchText={(s) => `${s.name} ${s.tax_number ?? ""} ${s.account?.account_code ?? ""}`}
              placeholder="-- اختر المورد الباقي --"
              emptyMessage="لا يوجد مورد آخر في هذه الوحدة"
            />
          </div>

          <ul className="list-disc space-y-1 ps-5 text-app-label-secondary">
            <li>تنتقل أوامر الشراء والشيكات الصادرة وطلبات الدفع من المكرر إلى المورد الباقي.</li>
            <li>
              القيود المرحّلة لا تُعدّل: إن كان على حساب المكرر حركات صار حسابه حساب المورد الباقي. يُرفض الدمج إن
              كان لكل منهما حساب خاص عليه حركات.
            </li>
            <li>يُرفض الدمج إن كان أمر شراء في منتصف الطريق سيُسوّى على حساب آخر بعد الدمج.</li>
            <li>يُحذف المورد المكرر ويُسجَّل الدمج في سجل التدقيق للمورد الباقي.</li>
          </ul>

          {error && (
            <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-app-status-danger">
              {error}
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={merge.isPending || !target}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          <GitMerge className="h-4 w-4" />
          <span>{merge.isPending ? "جاري الدمج..." : "دمج"}</span>
        </button>
      </DialogFooter>
    </DialogContent>
  );
};

export default SupplierMergeDialog;
