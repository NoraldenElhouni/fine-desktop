import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardCheck, PackagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { AsyncSearchableSelect } from "../ui/AsyncSearchableSelect";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useItemCategories } from "../../hooks/useCategories";
import { useAddFoundStock, useApproveStockCount, useCreateStockCount } from "../../hooks/useStockCounts";
import { inventoryApi } from "../../api/endpoints/inventory";
import type { InventoryItem } from "../../api/endpoints/inventory";
import { stockCountErrorMessage, toQty } from "../../api/endpoints/stockCounts";
import type { StockCount } from "../../api/endpoints/stockCounts";
import { toast } from "../../stores/toastStore";
import { formatDate, formatNumber, localDateIso } from "../../lib/utils/format";

const inputClass =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none";
const labelClass = "block text-[11px] font-semibold text-app-label-secondary";

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 rounded-xl bg-app-status-danger/15 border border-app-status-danger/30 p-3 text-xs font-bold text-app-status-danger">
    <AlertCircle className="h-4 w-4 shrink-0" />
    <span>{message}</span>
  </div>
);

const FooterButtons: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}> = ({ onCancel, onConfirm, disabled, icon, label }) => (
  <DialogFooter>
    <button
      type="button"
      onClick={onCancel}
      className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
    >
      تراجع
    </button>
    <button
      type="button"
      onClick={onConfirm}
      disabled={disabled}
      className="flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {icon}
      {label}
    </button>
  </DialogFooter>
);

/**
 * Warehouses a count can be opened on: each top-level warehouse and its
 * sub-warehouses (a lot sits in exactly one of them, and a count snapshots
 * the lots of the warehouse it names).
 */
export function useCountableWarehouses(): { id: string; label: string }[] {
  const { data: warehouses } = useWarehouses();
  return useMemo(
    () =>
      (warehouses ?? []).flatMap((w) => [
        { id: w.id, label: w.name },
        ...(w.children ?? []).map((c) => ({ id: c.id, label: `${w.name} / ${c.name}` })),
      ]),
    [warehouses],
  );
}

interface NewStockCountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (count: StockCount) => void;
}

/** Open a count: the warehouse (and optionally one category) is snapshotted now. */
export const NewStockCountDialog: React.FC<NewStockCountDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [warehouseId, setWarehouseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [blind, setBlind] = useState(false);
  const [notes, setNotes] = useState("");

  const warehouses = useCountableWarehouses();
  const { data: categories } = useItemCategories();
  const create = useCreateStockCount();

  const categoryOptions = useMemo(() => {
    const all = categories ?? [];
    const byId = new Map(all.map((c) => [c.id, c]));
    const pathOf = (id: string): string => {
      const names: string[] = [];
      const seen = new Set<string>();
      let current = byId.get(id);
      while (current && !seen.has(current.id)) {
        names.unshift(current.name);
        seen.add(current.id);
        current = current.parent_id ? byId.get(current.parent_id) : undefined;
      }
      return names.join(" / ");
    };
    return all.map((c) => ({ id: c.id, label: pathOf(c.id) })).sort((a, b) => a.label.localeCompare(b.label, "ar"));
  }, [categories]);

  if (!isOpen) return null;

  const canSubmit = Boolean(warehouseId) && !create.isPending;

  const close = () => {
    setWarehouseId("");
    setCategoryId("");
    setBlind(false);
    setNotes("");
    create.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    create.mutate(
      {
        warehouse_id: warehouseId,
        item_category_id: categoryId || null,
        // Left out: the server dates the count the day it opens (its snapshot holds that day's quantities).
        blind,
        notes: notes.trim() || null,
      },
      {
        onSuccess: (count) => {
          toast.success(`تم فتح الجرد ${count.number} (${formatNumber(count.lines.length)} سطر)`);
          close();
          onCreated(count);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && close()}>
      <DialogContent size="md">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ClipboardCheck className="h-4 w-4 text-app-accent" />
              جرد جديد
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              تُلتقط الآن كميات اللوتات المتاحة والتي تحت الحجر الصحي في المخزن. اللوتات المحجوزة لأمر تقطيع أو بيع، ولوتات تشغيلات الإنتاج غير المغلقة، تُستبعد وتُعرض للعلم.
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>
              المخزن <span className="text-app-status-danger">*</span>
            </label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className={inputClass}>
              <option value="">اختر…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>الفئة (اختياري — تشمل فئاتها الفرعية)</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">كل الأصناف</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>تاريخ الجرد</label>
            <div className={`${inputClass} font-mono bg-app-fill-f1 text-app-label-secondary`} dir="ltr">
              {formatDate(localDateIso())}
            </div>
            <p className="text-[10px] text-app-label-tertiary">
              يُؤرَّخ الجرد بيوم فتحه، لأن اللقطة تحمل كميات ذلك اليوم، ويُرحّل قيد الفروقات بهذا التاريخ.
            </p>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-xs cursor-pointer">
            <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="font-semibold text-app-label-primary">جرد أعمى</span>
              <span className="block text-[11px] text-app-label-secondary">
                تُخفى الكميات الدفترية عن القائمين بالعدّ حتى الإرسال. لا يمكن تغيير هذا الخيار بعد الفتح.
              </span>
            </span>
          </label>

          <div className="space-y-1">
            <label className={labelClass}>ملاحظات</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={2000} className={inputClass} />
          </div>

          {create.isError && <ErrorBox message={stockCountErrorMessage(create.error, "تعذّر فتح الجرد.")} />}
        </DialogBody>

        <FooterButtons
          onCancel={close}
          onConfirm={handleSubmit}
          disabled={!canSubmit}
          icon={<ClipboardCheck className="h-4 w-4" />}
          label={create.isPending ? "جاري الفتح..." : "فتح الجرد"}
        />
      </DialogContent>
    </Dialog>
  );
};

interface AddFoundDialogProps {
  count: StockCount;
  isOpen: boolean;
  onClose: () => void;
}

/** Add found stock: an item counted in the warehouse with no lot on record. */
export const AddFoundDialog: React.FC<AddFoundDialogProps> = ({ count, isOpen, onClose }) => {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [reservedAcknowledged, setReservedAcknowledged] = useState(false);
  const addFound = useAddFoundStock();

  if (!isOpen) return null;

  const isBlock = item?.item_type === "foam_block";
  const qtyValue = qty.trim() === "" ? null : Number(qty);
  const qtyInvalid = qtyValue === null || Number.isNaN(qtyValue) || qtyValue <= 0 || (isBlock && qtyValue !== 1);

  // Lots of this item the count leaves out. An open-batch lot makes approval
  // refuse found stock of the item (COUNT_FOUND_UNCOUNTED_LOT), so it blocks.
  // A reserved lot is not checked at approval: found stock that is really the
  // reserved lot would become a second lot and a surplus that is not there.
  const excludedOfItem = item ? count.excluded_lots.filter((l) => l.inventory_item_id === item.id) : [];
  const reservedOfItem = item ? count.reserved_lots.filter((l) => l.inventory_item_id === item.id) : [];
  const blockedByReserved = reservedOfItem.length > 0 && !reservedAcknowledged;
  const canSubmit = Boolean(item) && !qtyInvalid && excludedOfItem.length === 0 && !blockedByReserved && !addFound.isPending;

  const close = () => {
    setItem(null);
    setQty("");
    setNote("");
    setReservedAcknowledged(false);
    addFound.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit || !item || qtyValue === null) return;
    addFound.mutate(
      { id: count.id, data: { inventory_item_id: item.id, counted_qty: qtyValue, note: note.trim() || null } },
      {
        onSuccess: () => {
          toast.success(`أُضيف ${item.name} كمخزون موجود غير مسجل.`);
          close();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && close()}>
      <DialogContent size="md">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <PackagePlus className="h-4 w-4 text-app-accent" />
              إضافة مخزون موجود غير مسجل
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              صنف وُجد في المخزن ولا لوت له في السجل. يُقيَّم بتكلفة أحدث لوت للصنف في هذا المخزن، وإلا بسعر تكلفة الصنف، ويصبح لوتاً جديداً عند الاعتماد. اللوتات المحجوزة ولوتات تشغيلات الإنتاج غير المغلقة ليست مخزوناً موجوداً غير مسجل.
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>
              الصنف <span className="text-app-status-danger">*</span>
            </label>
            <AsyncSearchableSelect<InventoryItem>
              value={item}
              onChange={(next) => {
                setItem(next);
                setReservedAcknowledged(false);
                if (next?.item_type === "foam_block") setQty("1");
              }}
              queryKey={["stockCountFoundItems"]}
              fetcher={async ({ search, page }) => {
                const res = await inventoryApi.getItems({ search: search || undefined, page, per_page: 20 });
                return { data: res.data.data, hasMore: res.data.current_page < res.data.last_page };
              }}
              getOptionId={(i) => i.id}
              getOptionLabel={(i) => `${i.name} (${i.code})`}
              placeholder="ابحث باسم الصنف أو رمزه…"
            />
            {count.category && (
              <p className="text-[10px] text-app-label-tertiary">هذا جرد لفئة {count.category.name}: يُقبل صنف منها أو من فئاتها الفرعية فقط.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              الكمية المعدودة <span className="text-app-status-danger">*</span>
            </label>
            <input
              type="number"
              min={isBlock ? 1 : 0}
              max={isBlock ? 1 : undefined}
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={`${inputClass} font-mono`}
              dir="ltr"
            />
            {isBlock && (
              <p className="text-[10px] text-app-label-tertiary">البلوك لوت واحد: أضف كل بلوك موجود كسطر مستقل بكمية 1.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>ملاحظة</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={inputClass} />
          </div>

          {excludedOfItem.length > 0 && (
            <ErrorBox
              message={`لهذا الصنف لوتات من تشغيلة إنتاج غير مغلقة في المخزن (${excludedOfItem
                .map((l) => l.lot_number)
                .join("، ")}). ما وُجد منه قد يكون أحدها، فلا يُضاف كمخزون موجود غير مسجل — أغلق التشغيلة أولاً، وإلا يُرفض اعتماد الجرد.`}
            />
          )}

          {reservedOfItem.length > 0 && (
            <label className="flex items-start gap-2 rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3 text-xs text-app-status-warning cursor-pointer">
              <input
                type="checkbox"
                checked={reservedAcknowledged}
                onChange={(e) => setReservedAcknowledged(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                {`لهذا الصنف ${isBlock ? "بلوكات محجوزة" : "لوتات محجوزة"} في المخزن (${reservedOfItem
                  .map((l) => l.lot_number)
                  .join("، ")}) وهي خارج الجرد. لا تُضفها هنا، وإلا يُنشأ لها لوت ثانٍ وتُسجّل زيادة غير موجودة. أؤكد أن ما أضيفه ليس ${
                  isBlock ? "أحد هذه البلوكات" : "من هذه اللوتات"
                }.`}
              </span>
            </label>
          )}

          {addFound.isError && <ErrorBox message={stockCountErrorMessage(addFound.error, "تعذّرت إضافة المخزون الموجود.")} />}
        </DialogBody>

        <FooterButtons
          onCancel={close}
          onConfirm={handleSubmit}
          disabled={!canSubmit}
          icon={<PackagePlus className="h-4 w-4" />}
          label={addFound.isPending ? "جاري الإضافة..." : "إضافة"}
        />
      </DialogContent>
    </Dialog>
  );
};

const SummaryTile: React.FC<{ label: string; qty?: number; value?: number; tone: string }> = ({ label, qty, value, tone }) => (
  <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
    <div className="text-[11px] text-app-label-secondary">{label}</div>
    {qty !== undefined && <div className={`font-mono text-sm font-bold ${tone}`}>{formatNumber(qty, { maximumFractionDigits: 4 })}</div>}
    <div className={`font-mono text-xs ${tone}`}>{formatNumber(value ?? 0)} د.ل</div>
  </div>
);

interface ApproveStockCountDialogProps {
  count: StockCount;
  isOpen: boolean;
  onClose: () => void;
}

/** Approve with the variance summary (quantity and value) and every differing line. */
export const ApproveStockCountDialog: React.FC<ApproveStockCountDialogProps> = ({ count, isOpen, onClose }) => {
  const approve = useApproveStockCount();

  const varianceLines = useMemo(
    () => count.lines.filter((l) => Math.abs(toQty(l.variance_qty) ?? 0) > 0.00001),
    [count.lines],
  );

  if (!isOpen) return null;

  const s = count.summary;

  const close = () => {
    approve.reset();
    onClose();
  };

  const handleApprove = () => {
    approve.mutate(count.id, {
      onSuccess: (approved) => {
        toast.success(
          approved.journal_entry
            ? `تم اعتماد الجرد ${approved.number} وترحيل القيد ${approved.journal_entry.reference ?? ""}`.trim()
            : `تم اعتماد الجرد ${approved.number} — لا فروقات ذات قيمة، فلم يُرحّل قيد.`,
        );
        close();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && close()}>
      <DialogContent size="2xl">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-app-accent" />
              اعتماد الجرد {count.number}
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              {count.warehouse?.name ?? "—"} — تاريخ الجرد {formatDate(count.count_date.slice(0, 10))}
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryTile label="العجز (كمية / قيمة)" qty={s.shortage_qty} value={s.shortage_value} tone="text-app-status-danger" />
            <SummaryTile label="الزيادة (كمية / قيمة)" qty={s.surplus_qty} value={s.surplus_value} tone="text-app-status-positive" />
            <SummaryTile
              label="صافي الفرق"
              value={s.net_value}
              tone={(s.net_value ?? 0) < 0 ? "text-app-status-danger" : "text-app-label-primary"}
            />
          </div>

          {varianceLines.length === 0 ? (
            <p className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-xs text-app-label-secondary">
              لا فروقات: الكميات المعدودة تطابق الدفترية. الاعتماد يغلق الجرد دون حركة أو قيد.
            </p>
          ) : (
            <div className="max-h-72 overflow-auto rounded-xl border border-app-separator">
              <table className="w-full text-start text-xs">
                <thead className="sticky top-0 border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
                  <tr>
                    <th className="px-3 py-2 text-start">الصنف</th>
                    <th className="px-3 py-2 text-start">اللوت</th>
                    <th className="px-3 py-2 text-end">الدفترية</th>
                    <th className="px-3 py-2 text-end">المعدودة</th>
                    <th className="px-3 py-2 text-end">الفرق</th>
                    <th className="px-3 py-2 text-end">قيمة الفرق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-separator text-app-label-primary">
                  {varianceLines.map((l) => {
                    const v = toQty(l.variance_qty) ?? 0;
                    const tone = v < 0 ? "text-app-status-danger" : "text-app-status-positive";
                    return (
                      <tr key={l.id}>
                        <td className="px-3 py-2">
                          <div>{l.item_name ?? "—"}</div>
                          <div className="font-mono text-[10px] text-app-label-tertiary">{l.item_code}</div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px]">{l.is_found ? "موجود غير مسجل" : l.lot_number ?? "—"}</td>
                        <td className="px-3 py-2 text-end font-mono">{formatNumber(l.system_qty, { maximumFractionDigits: 4 })}</td>
                        <td className="px-3 py-2 text-end font-mono">{formatNumber(l.counted_qty, { maximumFractionDigits: 4 })}</td>
                        <td className={`px-3 py-2 text-end font-mono font-bold ${tone}`}>{formatNumber(v, { maximumFractionDigits: 4 })}</td>
                        <td className={`px-3 py-2 text-end font-mono ${tone}`}>{formatNumber(l.variance_value)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <ul className="list-disc space-y-1 ps-5 text-[11px] text-app-label-secondary">
            <li>تُعدَّل اللوتات بحركات تسوية، ويصبح المخزون الموجود غير المسجل لوتاً جديداً، ويُستهلك اللوت الذي يصل إلى صفر.</li>
            <li>يُرحّل قيد واحد بتاريخ الجرد: العجز مدين حساب الهالك للوحدة / دائن حساب المخزون، والزيادة مدين حساب المخزون / دائن 45 أرباح فروقات الجرد.</li>
            <li>القيم المعروضة بتكلفة اللوتات عند فتح الجرد، وتُحتسب نهائياً بتكلفتها عند الاعتماد.</li>
            <li>إن تحرك المخزون أثناء العدّ يُرفض الاعتماد، ويُلغى الجرد ويُعاد.</li>
            <li>لا يعتمد الجرد من فتحه أو أدخل فيه كمية أو أرسله، فيُرفض الاعتماد إن كنت أدخلت أي كمية فيه.</li>
          </ul>

          {approve.isError && <ErrorBox message={stockCountErrorMessage(approve.error, "تعذّر اعتماد الجرد.")} />}
        </DialogBody>

        <FooterButtons
          onCancel={close}
          onConfirm={handleApprove}
          disabled={approve.isPending}
          icon={<CheckCircle2 className="h-4 w-4" />}
          label={approve.isPending ? "جاري الاعتماد..." : "اعتماد الجرد"}
        />
      </DialogContent>
    </Dialog>
  );
};
