import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import {
  useProductionBatches,
  useCreateProductionBatch,
  useUpdateProductionBatch,
  useDeleteProductionBatch,
  expectedOperationNumber,
} from "../../hooks/useProduction";
import { toast } from "../../stores/toastStore";
import { cn } from "../../lib/utils/utils";
import {
  CreateBatchInput,
  ProductionBatch,
  isNonSequentialError,
  apiErrorPayload,
  MAX_BUN_WIDTH_M,
  NonSequentialOperationError,
} from "../../api/endpoints/production";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useProductionBatchesColumns } from "../../components/table-columns/productionBatchesColumns";

const emptyForm = {
  operation_number: "",
  bun_width_m: "2.4",
  density_band: "",
  cure_time_minutes: "",
  conveyor_speed: "",
  status: "planned",
};

export const ProductionBatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [warning, setWarning] = useState<NonSequentialOperationError | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const { data, isLoading, refetch } = useProductionBatches();
  const createMutation = useCreateProductionBatch();
  const updateMutation = useUpdateProductionBatch();
  const deleteMutation = useDeleteProductionBatch();

  const batches = data?.data ?? [];
  const expected = expectedOperationNumber(batches);

  const buildPayload = (confirm = false): CreateBatchInput => ({
    operation_number: Number(form.operation_number),
    bun_width_m: Number(form.bun_width_m),
    status: form.status as CreateBatchInput["status"],
    formula_params: {
      density_band: form.density_band || undefined,
      cure_time_minutes: form.cure_time_minutes ? Number(form.cure_time_minutes) : undefined,
      conveyor_speed: form.conveyor_speed ? Number(form.conveyor_speed) : undefined,
    },
    ...(confirm ? { confirm_non_sequential: true } : {}),
  });

  const submit = (confirm = false) => {
    setError(null);
    createMutation.mutate(buildPayload(confirm), {
      onSuccess: () => {
        setShowForm(false);
        setWarning(null);
        setForm(emptyForm);
        refetch();
      },
      onError: (err: unknown) => {
        const payload = apiErrorPayload(err);

        // A non-sequential number is a warning, not a rejection — surface the
        // expected value and let the operator confirm. Rendering this as a plain
        // validation error would wall them off from every legitimate gap.
        if (isNonSequentialError(payload)) {
          setWarning(payload);
          return;
        }

        setError(
          payload?.errors?.operation_number?.[0] ??
            payload?.message ??
            "تعذر إنشاء دفعة الإنتاج.",
        );
      },
    });
  };

  const handleOpenEdit = (batch: ProductionBatch) => {
    setEditingBatch(batch);
    setEditForm({
      operation_number: String(batch.operation_number),
      bun_width_m: String(batch.bun_width_m),
      density_band: batch.formula_params?.density_band ?? "",
      cure_time_minutes: batch.formula_params?.cure_time_minutes ? String(batch.formula_params.cure_time_minutes) : "",
      conveyor_speed: batch.formula_params?.conveyor_speed ? String(batch.formula_params.conveyor_speed) : "",
      status: batch.status,
    });
    setError(null);
  };

  const submitEdit = () => {
    if (!editingBatch) return;
    setError(null);

    const payload: Partial<CreateBatchInput> & { record_version: number } = {
      bun_width_m: Number(editForm.bun_width_m),
      status: editForm.status as CreateBatchInput["status"],
      formula_params: {
        density_band: editForm.density_band || undefined,
        cure_time_minutes: editForm.cure_time_minutes ? Number(editForm.cure_time_minutes) : undefined,
        conveyor_speed: editForm.conveyor_speed ? Number(editForm.conveyor_speed) : undefined,
      },
      record_version: editingBatch.record_version,
    };

    if ((editingBatch.blocks_count ?? 0) === 0 && Number(editForm.operation_number) !== editingBatch.operation_number) {
      payload.operation_number = Number(editForm.operation_number);
    }

    updateMutation.mutate(
      { id: editingBatch.id, data: payload },
      {
        onSuccess: () => {
          setEditingBatch(null);
          toast.success("تم تحديث دفعة الإنتاج بنجاح");
          refetch();
        },
        onError: (err: unknown) => {
          const payloadErr = apiErrorPayload(err);
          setError(
            payloadErr?.errors?.operation_number?.[0] ??
              payloadErr?.message ??
              "تعذر تعديل دفعة الإنتاج."
          );
        },
      }
    );
  };

  const handleDelete = (batch: ProductionBatch) => {
    setError(null);
    deleteMutation.mutate(batch.id, {
      onError: (err: unknown) =>
        setError(apiErrorPayload(err)?.message ?? "تعذر حذف الدفعة."),
      onSuccess: () => refetch(),
    });
  };

  const openBlocks = (batch: ProductionBatch) => navigate(`/manufacturing/batches/${batch.id}`);

  const columns = useProductionBatchesColumns({
    onOpenBlocks: openBlocks,
    onEdit: handleOpenEdit,
    onDelete: handleDelete,
  });

  const tableData = useMemo(() => batches, [batches]);
  const batchesTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (b) => b.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Factory className="w-7 h-7 text-app-accent" />
            دفعات إنتاج الإسفنج
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            دفعة واحدة لكل صبة. تُسجَّل البلوكات بعد الفرز، من تقرير الإنتاج المكتمل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
          <button
            onClick={() => {
              setForm({ ...emptyForm, operation_number: String(expected) });
              setWarning(null);
              setError(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> دفعة جديدة
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <DataTable table={batchesTable}>
        <DataTable.Header>
          <DataTable.Toolbar>
            <DataTable.SearchInput placeholder="بحث برقم العملية أو الحالة..." />
          </DataTable.Toolbar>
        </DataTable.Header>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage="لا توجد دفعات إنتاج مسجلة بعد."
          emptyIcon={Factory}
        />
        <DataTable.Pagination />
      </DataTable>

      <Dialog
        open={showForm}
        onOpenChange={(next) => {
          setShowForm(next);
          if (!next) setWarning(null);
        }}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle>دفعة إنتاج جديدة</DialogTitle>
                <DialogDescription>
                  آخر عملية كانت {expected - 1} — التالي المتوقع هو{" "}
                  <span className="font-mono font-bold">{expected}</span>.
                </DialogDescription>
              </div>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form
              id="production-batch-form"
              onSubmit={(e) => {
                e.preventDefault();
                submit(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    رقم العملية
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.operation_number}
                    onChange={(e) => {
                      setForm({ ...form, operation_number: e.target.value });
                      setWarning(null);
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    عرض الكتلة (م)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={MAX_BUN_WIDTH_M}
                    required
                    value={form.bun_width_m}
                    onChange={(e) => setForm({ ...form, bun_width_m: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-app-label-tertiary mt-1">
                    الحد الأقصى للماكينة {MAX_BUN_WIDTH_M} م
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-app-bg-secondary rounded-xl border border-app-separator">
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">نطاق الكثافة</label>
                  <input
                    type="text"
                    placeholder="12-14"
                    value={form.density_band}
                    onChange={(e) => setForm({ ...form, density_band: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">الوقت (دقيقة)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.cure_time_minutes}
                    onChange={(e) => setForm({ ...form, cure_time_minutes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">سرعة السير الناقل</label>
                  <input
                    type="number"
                    min="0"
                    value={form.conveyor_speed}
                    onChange={(e) => setForm({ ...form, conveyor_speed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              {warning && (
                <div className="rounded-xl border border-app-status-yellow/40 bg-app-status-yellow/10 p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-app-label-primary">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-app-status-yellow" />
                    <span>
                      آخر عملية كانت{" "}
                      <span className="font-mono font-bold">
                        {warning.expected_operation_number - 1}
                      </span>
                      ، لذا كان المتوقع{" "}
                      <span className="font-mono font-bold">{warning.expected_operation_number}</span>{" "}
                      — وقد أدخلت{" "}
                      <span className="font-mono font-bold">{warning.entered_operation_number}</span>.
                      الفجوات مسموح بها، لكن تأكد من أن هذا ليس خطأ كتابياً.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => submit(true)}
                    disabled={createMutation.isPending}
                    className="w-full px-4 py-2 text-xs font-bold text-white bg-app-status-yellow rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    استخدام {warning.entered_operation_number} على أي حال
                  </button>
                </div>
              )}

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setWarning(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="production-batch-form"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? "جاري الحفظ…" : "إنشاء الدفعة"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Production Batch Dialog */}
      <Dialog
        open={Boolean(editingBatch)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBatch(null);
            setError(null);
          }
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent-subtle text-app-accent">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>تعديل دفعة الإنتاج #{editingBatch?.operation_number}</DialogTitle>
                <DialogDescription>
                  تعديل أبعاد ومعاملات تشغيل دفعة تصنيع البلوكات
                </DialogDescription>
              </div>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form
              id="edit-production-batch-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitEdit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    رقم العملية
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={(editingBatch?.blocks_count ?? 0) > 0}
                    value={editForm.operation_number}
                    onChange={(e) => setEditForm({ ...editForm, operation_number: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono",
                      (editingBatch?.blocks_count ?? 0) > 0 && "opacity-60 cursor-not-allowed bg-app-fill-f2"
                    )}
                  />
                  {(editingBatch?.blocks_count ?? 0) > 0 && (
                    <p className="text-[10px] text-app-label-tertiary mt-1">
                      لا يمكن تعديل رقم العملية بعد تسجيل البلوكات
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    عرض الكتلة (م)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={MAX_BUN_WIDTH_M}
                    required
                    value={editForm.bun_width_m}
                    onChange={(e) => setEditForm({ ...editForm, bun_width_m: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-app-label-tertiary mt-1">
                    الحد الأقصى للماكينة {MAX_BUN_WIDTH_M} م
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-app-bg-secondary rounded-xl border border-app-separator">
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">نطاق الكثافة</label>
                  <input
                    type="text"
                    placeholder="12-14"
                    value={editForm.density_band}
                    onChange={(e) => setEditForm({ ...editForm, density_band: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">الوقت (دقيقة)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.cure_time_minutes}
                    onChange={(e) => setEditForm({ ...editForm, cure_time_minutes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">سرعة السير الناقل</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editForm.conveyor_speed}
                    onChange={(e) => setEditForm({ ...editForm, conveyor_speed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  حالة الدفعة
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                >
                  <option value="planned">مخطط (Planned)</option>
                  <option value="configured">تم الإعداد (Configured)</option>
                  <option value="running">قيد التشغيل (Running)</option>
                  <option value="consumed">مستهلك (Consumed)</option>
                  <option value="curing">قيد التصلب (Curing)</option>
                  <option value="ready_for_grading">جاهز للفرز (Ready for Grading)</option>
                  <option value="graded">تم الفرز (Graded)</option>
                  <option value="closed">مغلق (Closed)</option>
                </select>
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setEditingBatch(null);
                setError(null);
              }}
              className="px-4 py-2 text-xs font-medium text-app-label-secondary hover:text-app-label-primary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="edit-production-batch-form"
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
