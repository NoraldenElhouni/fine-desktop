import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  EyeOff,
  PackagePlus,
  Printer,
  Save,
  ScanLine,
  Send,
  XCircle,
} from "lucide-react";
import { useCancelStockCount, useStockCount, useSubmitStockCount, useUpdateStockCountLines } from "../../hooks/useStockCounts";
import { usePermissions } from "../../hooks/usePermissions";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { AddFoundDialog, ApproveStockCountDialog } from "../../components/inventory/StockCountDialogs";
import { StockCountSheetDialog } from "../../components/print/StockCountSheet";
import { STOCK_COUNT_APPROVER_ROLES, STOCK_COUNT_COUNTER_ROLES } from "../../routes/routes.config";
import { toast } from "../../stores/toastStore";
import { formatDate, formatDateTime, formatNumber } from "../../lib/utils/format";
import { downloadCsv, toCsv } from "../../lib/utils/csv";
import {
  LOT_STATUS_LABEL,
  STOCK_COUNT_STATUS_LABEL,
  STOCK_COUNT_STATUS_ORDER,
  STOCK_COUNT_STATUS_STYLE,
  StockCount,
  StockCountExcludedLot,
  StockCountLine,
  stockCountErrorMessage,
  toQty,
} from "../../api/endpoints/stockCounts";

interface LineDraft {
  counted?: string;
  note?: string;
}

const qty4 = (v: number | string | null | undefined): string =>
  v === null || v === undefined || v === "" ? "—" : formatNumber(v, { maximumFractionDigits: 4 });

/** The counted figure as the input shows it ("" = not counted yet). */
const serverCounted = (line: StockCountLine): string => {
  const n = toQty(line.counted_qty);
  return n === null ? "" : String(n);
};

const isBlock = (line: StockCountLine): boolean => line.item_type === "foam_block";

/** A foam block lot holds one block: it counts 0 or 1 (INV-02). */
const countedInvalid = (line: StockCountLine, value: string): boolean => {
  if (value.trim() === "") return false;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return true;
  return isBlock(line) && n !== 0 && n !== 1;
};

const ExcludedLotsPanel: React.FC<{ title: string; hint: string; lots: StockCountExcludedLot[]; showQty: boolean }> = ({
  title,
  hint,
  lots,
  showQty,
}) =>
  lots.length === 0 ? null : (
    <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 space-y-2">
      <div>
        <h3 className="text-xs font-bold text-app-label-primary">
          {title} ({formatNumber(lots.length)})
        </h3>
        <p className="text-[11px] text-app-label-secondary">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {lots.map((lot) => (
          <span key={lot.id} className="rounded-lg bg-app-fill-f1 px-2 py-1 text-[11px] text-app-label-primary">
            <span className="font-mono">{lot.lot_number}</span> — {lot.inventory_item?.name ?? "—"}
            {showQty && <span className="font-mono text-app-label-secondary"> ({qty4(lot.quantity)})</span>}
          </span>
        ))}
      </div>
    </div>
  );

const LEAVE_PROMPT = "لم تُحفظ بعض الكميات المعدودة وستضيع إن غادرت الصفحة. هل تريد المغادرة؟";

const exportCsv = (count: StockCount) => {
  const hidden = count.system_quantities_hidden;
  const csv = toCsv(count.lines, [
    { header: "رمز الصنف", value: (l) => l.item_code ?? "" },
    { header: "الصنف", value: (l) => l.item_name ?? "" },
    { header: "الوحدة", value: (l) => l.unit_of_measure ?? "" },
    { header: "اللوت", value: (l) => (l.is_found ? `موجود غير مسجل${l.new_lot_number ? ` (${l.new_lot_number})` : ""}` : l.lot_number ?? "") },
    { header: "حالة اللوت", value: (l) => (l.lot_status ? LOT_STATUS_LABEL[l.lot_status] ?? l.lot_status : "") },
    ...(hidden
      ? []
      : [{ header: "الكمية الدفترية", value: (l: StockCountLine) => toQty(l.system_qty), decimals: 4 }]),
    { header: "الكمية المعدودة", value: (l) => toQty(l.counted_qty), decimals: 4 },
    ...(hidden
      ? []
      : [
          { header: "الفرق", value: (l: StockCountLine) => toQty(l.variance_qty), decimals: 4 },
          { header: "تكلفة الوحدة", value: (l: StockCountLine) => toQty(l.unit_cost), decimals: 4 },
          { header: "قيمة الفرق", value: (l: StockCountLine) => toQty(l.variance_value) },
        ]),
    { header: "ملاحظة", value: (l) => l.note ?? "" },
  ]);
  downloadCsv(`${count.number}.csv`, csv);
};

const StockCountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole, hasPermission } = usePermissions();

  const { data: count, isLoading } = useStockCount(id);
  const saveLines = useUpdateStockCountLines();
  const submit = useSubmitStockCount();
  const cancel = useCancelStockCount();

  const [drafts, setDrafts] = useState<Record<string, LineDraft>>({});
  const [scan, setScan] = useState("");
  const [uncountedOnly, setUncountedOnly] = useState(false);
  /** The line to bring on screen; `input` also focuses its counted box (else the scan box keeps focus). */
  const [focusTarget, setFocusTarget] = useState<{ lineId: string; input: boolean } | null>(null);
  const [isFoundOpen, setIsFoundOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"submit" | "cancel" | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const scanRef = useRef<HTMLInputElement | null>(null);

  const canCount = hasRole(STOCK_COUNT_COUNTER_ROLES) && hasPermission("edit-inventory");
  const canApprove = hasRole(STOCK_COUNT_APPROVER_ROLES) && hasPermission("approve-stock-counts");
  const canCancel = canCount || canApprove;

  const editable = count?.status === "draft" || count?.status === "counting";
  const isOpen = editable || count?.status === "submitted";
  const canEnter = editable && canCount;
  const hidden = count?.system_quantities_hidden ?? false;

  const lines = useMemo(() => count?.lines ?? [], [count]);

  const effectiveCounted = (line: StockCountLine): string => drafts[line.id]?.counted ?? serverCounted(line);
  const effectiveNote = (line: StockCountLine): string => drafts[line.id]?.note ?? line.note ?? "";

  const dirtyLines = lines.filter((l) => {
    const d = drafts[l.id];
    if (!d) return false;
    return (d.counted !== undefined && d.counted.trim() !== serverCounted(l)) || (d.note !== undefined && d.note !== (l.note ?? ""));
  });
  const invalidLines = lines.filter((l) => countedInvalid(l, effectiveCounted(l)));
  const dirtyIds = new Set(dirtyLines.map((l) => l.id));

  /** Line id -> 1-based row number, so a filtered view keeps the full-list numbering. */
  const lineNumbers = useMemo(() => new Map(lines.map((l, i) => [l.id, i + 1])), [lines]);

  /**
   * The "not counted" view filters on the saved count, and keeps a line being
   * edited: filtering on the live draft would unmount the row on its first
   * typed digit and take the focus with it. A line leaves the view once its
   * count is saved.
   */
  const inUncountedView = (line: StockCountLine): boolean =>
    serverCounted(line) === "" || drafts[line.id] !== undefined;
  const visibleLines = uncountedOnly ? lines.filter(inUncountedView) : lines;

  // Unsaved counts live only in this page's state: confirm before leaving.
  const hasUnsaved = dirtyLines.length > 0;
  const hasUnsavedRef = useRef(hasUnsaved);
  useEffect(() => {
    hasUnsavedRef.current = hasUnsaved;
  }, [hasUnsaved]);
  useEffect(() => {
    // In-app links (sidebar, section tabs, breadcrumbs) are anchors; HashRouter
    // has no navigation blocker, so a capture-phase click guard asks first.
    const onClick = (e: MouseEvent) => {
      if (!hasUnsavedRef.current || e.defaultPrevented || e.button !== 0) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      if (!window.confirm(LEAVE_PROMPT)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const setDraft = (lineId: string, patch: LineDraft) =>
    setDrafts((prev) => ({ ...prev, [lineId]: { ...prev[lineId], ...patch } }));

  // A scanned line is brought on screen once it is rendered.
  useEffect(() => {
    if (!focusTarget) return;
    rowRefs.current[focusTarget.lineId]?.scrollIntoView({ block: "center" });
    const input = focusTarget.input ? inputRefs.current[focusTarget.lineId] : null;
    if (input) {
      input.focus();
      input.select();
    } else {
      scanRef.current?.focus({ preventScroll: true });
    }
    setFocusTarget(null);
  }, [focusTarget, visibleLines.length]);

  /**
   * A barcode reader types the code and Enter. A lot number picks its line
   * (a scanned foam block is there, so it counts 1 and the scan box keeps
   * focus for the next block); an item code picks that item's first line not
   * counted yet and focuses its counted box for the quantity.
   */
  const handleScan = () => {
    const raw = scan.trim();
    const code = raw.toLowerCase();
    if (!code || !count) return;
    const byLot = lines.filter((l) => l.lot_number?.toLowerCase() === code);
    const matches = byLot.length > 0 ? byLot : lines.filter((l) => l.item_code?.toLowerCase() === code);

    if (matches.length === 0) {
      // A lot the count leaves out is on the floor but must not be counted,
      // nor added as found stock (a second lot and a surplus that is not there).
      const isCode = (lot: StockCountExcludedLot) =>
        lot.lot_number.toLowerCase() === code || lot.inventory_item?.code?.toLowerCase() === code;
      const reserved = count.reserved_lots.filter(isCode);
      const openBatch = count.excluded_lots.filter(isCode);
      const lotList = (lots: StockCountExcludedLot[]) => lots.map((l) => l.lot_number).join("، ");
      if (reserved.length > 0) {
        toast.error(`خارج الجرد: ${lotList(reserved)} محجوز لأمر تقطيع أو بيع — لا يُعدّ ولا يُضاف كمخزون موجود غير مسجل.`);
      } else if (openBatch.length > 0) {
        toast.error(`خارج الجرد: ${lotList(openBatch)} من تشغيلة إنتاج غير مغلقة — لا يُعدّ ولا يُضاف كمخزون موجود غير مسجل.`);
      } else {
        toast.error(`لا يوجد في هذا الجرد سطر للرمز ${raw} — إن وُجد الصنف فعلاً فأضفه كمخزون موجود غير مسجل.`);
      }
      scanRef.current?.select();
      return;
    }

    const target = matches.find((l) => effectiveCounted(l).trim() === "") ?? matches[0];
    const autoCounted = canEnter && byLot.length > 0 && isBlock(target);
    if (autoCounted) {
      setDraft(target.id, { counted: "1" });
    }
    // A block counted by its scan may leave the "not counted" view; a line
    // that needs a quantity typed must be on screen.
    if (uncountedOnly && !autoCounted && !inUncountedView(target)) {
      setUncountedOnly(false);
    }
    setScan("");
    setFocusTarget({ lineId: target.id, input: !autoCounted });
  };

  /** Enter in a counted box moves to the next line, for keyed-in counts. */
  const focusNext = (lineId: string) => {
    const index = visibleLines.findIndex((l) => l.id === lineId);
    const next = visibleLines[index + 1];
    if (next) {
      inputRefs.current[next.id]?.focus();
      inputRefs.current[next.id]?.select();
    } else {
      scanRef.current?.focus();
    }
  };

  const handleSave = () => {
    if (!count || dirtyLines.length === 0 || invalidLines.length > 0) return;
    // Drafts as sent: on success only these are dropped, so a count typed
    // while the request is in flight stays a draft.
    const sent = drafts;
    saveLines.mutate(
      {
        id: count.id,
        lines: dirtyLines.map((l) => {
          const counted = effectiveCounted(l).trim();
          const d = drafts[l.id];
          return {
            id: l.id,
            counted_qty: counted === "" ? null : Number(counted),
            ...(d?.note !== undefined ? { note: d.note.trim() || null } : {}),
          };
        }),
      },
      {
        onSuccess: () => {
          setDrafts((prev) => {
            const next: Record<string, LineDraft> = {};
            for (const [lineId, draft] of Object.entries(prev)) {
              if (sent[lineId] !== draft) next[lineId] = draft;
            }
            return next;
          });
          toast.success("تم حفظ الكميات المعدودة.");
        },
        onError: (err) => toast.error(stockCountErrorMessage(err, "تعذّر حفظ الكميات.")),
      },
    );
  };

  const handleConfirm = async () => {
    if (!count || !confirmAction) return;
    try {
      if (confirmAction === "submit") {
        await submit.mutateAsync(count.id);
        toast.success("تم إرسال الجرد للاعتماد.");
      } else {
        await cancel.mutateAsync(count.id);
        setDrafts({});
        toast.success("تم إلغاء الجرد.");
      }
    } catch (err) {
      toast.error(stockCountErrorMessage(err, "تعذّر تنفيذ الإجراء."));
    }
    setConfirmAction(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">جارٍ تحميل الجرد…</div>
    );
  }

  if (!count) {
    return <div className="p-6 text-center text-xs text-app-label-secondary">تعذر العثور على الجرد.</div>;
  }

  const s = count.summary;
  const uncounted = lines.filter((l) => effectiveCounted(l).trim() === "").length;
  const isOwnCount = Boolean(user?.id) && (user?.id === count.created_by_user_id || user?.id === count.submitted_by_user_id);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <button
        onClick={() => {
          if (!hasUnsaved || window.confirm(LEAVE_PROMPT)) navigate("/inventory/counts");
        }}
        className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline w-fit"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الجرد
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
            <span className="font-mono">{count.number}</span>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STOCK_COUNT_STATUS_STYLE[count.status]}`}>
              {STOCK_COUNT_STATUS_LABEL[count.status]}
            </span>
            {count.blind && (
              <span className="flex items-center gap-1 rounded-full bg-app-fill-f1 px-2 py-1 text-[10px] font-bold text-app-label-secondary">
                <EyeOff className="h-3 w-3" /> جرد أعمى
              </span>
            )}
          </h1>
          <p className="text-xs text-app-label-secondary">
            {count.warehouse?.name ?? "—"}
            {count.category ? ` — الفئة: ${count.category.name}` : " — كل الأصناف"} — تاريخ الجرد {formatDate(count.count_date.slice(0, 10))}
          </p>
          <p className="text-[11px] text-app-label-tertiary">
            فتحه {count.created_by?.name ?? "—"} في {formatDateTime(count.created_at)}
            {count.submitted_by && count.submitted_at ? ` · أرسله ${count.submitted_by.name} في ${formatDateTime(count.submitted_at)}` : ""}
            {count.approved_by && count.approved_at ? ` · اعتمده ${count.approved_by.name} في ${formatDateTime(count.approved_at)}` : ""}
            {count.journal_entry ? ` · القيد ${count.journal_entry.reference ?? ""}` : ""}
          </p>
          {count.notes && <p className="text-[11px] text-app-label-secondary">ملاحظات: {count.notes}</p>}

          {/* Status-chip bar */}
          {count.status !== "cancelled" && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {STOCK_COUNT_STATUS_ORDER.map((st) => {
                const reached = STOCK_COUNT_STATUS_ORDER.indexOf(st) <= STOCK_COUNT_STATUS_ORDER.indexOf(count.status);
                return (
                  <span
                    key={st}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      st === count.status
                        ? "bg-app-accent text-white"
                        : reached
                          ? "bg-app-accent/15 text-app-accent"
                          : "bg-app-fill-f1 text-app-label-tertiary"
                    }`}
                  >
                    {STOCK_COUNT_STATUS_LABEL[st]}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSheetId(count.id)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> ورقة الجرد
          </button>
          <button
            onClick={() => exportCsv(count)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          {isOpen && canCancel && (
            <button
              onClick={() => setConfirmAction("cancel")}
              className="flex items-center gap-1.5 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 px-3 py-2 text-xs font-semibold text-app-status-danger hover:bg-app-status-danger/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> إلغاء الجرد
            </button>
          )}
          {canEnter && (
            <button
              onClick={() => setConfirmAction("submit")}
              disabled={dirtyLines.length > 0 || uncounted > 0 || lines.length === 0}
              title={
                dirtyLines.length > 0
                  ? "احفظ الكميات أولاً"
                  : uncounted > 0
                    ? "أدخل الكمية المعدودة لكل الأسطر أولاً"
                    : undefined
              }
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> إرسال للاعتماد
            </button>
          )}
          {count.status === "submitted" && canApprove && (
            <button
              onClick={() => setIsApproveOpen(true)}
              disabled={isOwnCount}
              title={isOwnCount ? "فتحتَ هذا الجرد أو أرسلته، فيعتمده شخص آخر." : undefined}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" /> اعتماد
            </button>
          )}
        </div>
      </div>

      {count.status === "submitted" && canApprove && isOwnCount && (
        <div className="flex items-center gap-2 rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3 text-xs text-app-status-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          فتحتَ هذا الجرد أو أرسلته، فيعتمده شخص آخر.
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
          <div className="text-[11px] text-app-label-secondary">المعدودة</div>
          <div className="font-mono text-sm font-bold text-app-label-primary">
            {formatNumber(s.lines_counted)} / {formatNumber(s.lines_total)}
          </div>
        </div>
        <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
          <div className="text-[11px] text-app-label-secondary">موجود غير مسجل</div>
          <div className="font-mono text-sm font-bold text-app-label-primary">{formatNumber(s.found_lines)}</div>
        </div>
        {hidden ? (
          <div className="col-span-2 lg:col-span-3 flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-primary p-3 text-[11px] text-app-label-secondary">
            <EyeOff className="h-4 w-4 shrink-0" />
            جرد أعمى: الكميات الدفترية والفروقات مخفية حتى الإرسال.
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
              <div className="text-[11px] text-app-label-secondary">العجز</div>
              <div className="font-mono text-sm font-bold text-app-status-danger">{qty4(s.shortage_qty)}</div>
              <div className="font-mono text-[11px] text-app-status-danger">{formatNumber(s.shortage_value)} د.ل</div>
            </div>
            <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
              <div className="text-[11px] text-app-label-secondary">الزيادة</div>
              <div className="font-mono text-sm font-bold text-app-status-positive">{qty4(s.surplus_qty)}</div>
              <div className="font-mono text-[11px] text-app-status-positive">{formatNumber(s.surplus_value)} د.ل</div>
            </div>
            <div className="rounded-xl border border-app-separator bg-app-bg-primary p-3">
              <div className="text-[11px] text-app-label-secondary">صافي الفرق</div>
              <div className={`font-mono text-sm font-bold ${(s.net_value ?? 0) < 0 ? "text-app-status-danger" : "text-app-label-primary"}`}>
                {formatNumber(s.net_value)} د.ل
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toolbar: scanner / search + entry actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <ScanLine className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-app-label-tertiary" />
          <input
            ref={scanRef}
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleScan();
              }
            }}
            placeholder="امسح الباركود أو اكتب رقم اللوت أو رمز الصنف ثم Enter"
            className="w-full rounded-xl border border-app-separator bg-app-bg-secondary py-2 ps-9 pe-3 text-xs font-mono focus:border-app-accent focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary cursor-pointer">
          <input type="checkbox" checked={uncountedOnly} onChange={(e) => setUncountedOnly(e.target.checked)} />
          غير المعدود فقط ({formatNumber(uncounted)})
        </label>
        {canEnter && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFoundOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
            >
              <PackagePlus className="w-3.5 h-3.5" /> موجود غير مسجل
            </button>
            <button
              onClick={handleSave}
              disabled={dirtyLines.length === 0 || invalidLines.length > 0 || saveLines.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saveLines.isPending ? "جاري الحفظ..." : `حفظ الكميات${dirtyLines.length > 0 ? ` (${formatNumber(dirtyLines.length)})` : ""}`}
            </button>
          </div>
        )}
      </div>

      {invalidLines.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          كميات غير صحيحة في {formatNumber(invalidLines.length)} سطر: لا تكون سالبة، ولوت البلوك يُعدّ 0 أو 1 فقط.
        </div>
      )}

      {/* Count entry grid */}
      <div className="overflow-x-auto rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <table className="w-full text-start text-xs">
          <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
            <tr>
              <th className="px-3 py-3 text-start w-10">#</th>
              <th className="px-3 py-3 text-start">الصنف</th>
              <th className="px-3 py-3 text-start">اللوت</th>
              {!hidden && <th className="px-3 py-3 text-end">الدفترية</th>}
              <th className="px-3 py-3 text-start w-32">المعدودة</th>
              {!hidden && <th className="px-3 py-3 text-end">الفرق</th>}
              {!hidden && <th className="px-3 py-3 text-end">قيمة الفرق</th>}
              <th className="px-3 py-3 text-start">ملاحظة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator text-app-label-primary">
            {visibleLines.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-app-label-secondary">
                  {lines.length === 0 ? "لا توجد لوتات قابلة للجرد في هذا المخزن." : "كل الأسطر معدودة."}
                </td>
              </tr>
            )}
            {visibleLines.map((line) => {
              const counted = effectiveCounted(line);
              const invalid = countedInvalid(line, counted);
              const variance = toQty(line.variance_qty);
              const tone = variance === null || variance === 0 ? "" : variance < 0 ? "text-app-status-danger" : "text-app-status-positive";
              const isDirty = dirtyIds.has(line.id);
              return (
                <tr
                  key={line.id}
                  ref={(el) => {
                    rowRefs.current[line.id] = el;
                  }}
                  className={isDirty ? "bg-app-accent/5" : undefined}
                >
                  <td className="px-3 py-2 text-app-label-tertiary font-mono">{lineNumbers.get(line.id)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{line.item_name ?? "—"}</div>
                    <div className="text-[10px] text-app-label-tertiary font-mono">
                      {line.item_code} {line.unit_of_measure ? `· ${line.unit_of_measure}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {line.is_found ? (
                      <span className="rounded-full bg-app-status-warning/15 px-2 py-0.5 text-[10px] font-bold text-app-status-warning">
                        موجود غير مسجل
                      </span>
                    ) : (
                      <span className="font-mono text-[11px]">{line.lot_number ?? "—"}</span>
                    )}
                    {line.new_lot_number && <div className="font-mono text-[10px] text-app-label-tertiary">لوت جديد: {line.new_lot_number}</div>}
                    {line.lot_status && line.lot_status !== "available" && (
                      <div className="text-[10px] text-app-label-tertiary">{LOT_STATUS_LABEL[line.lot_status] ?? line.lot_status}</div>
                    )}
                  </td>
                  {!hidden && <td className="px-3 py-2 text-end font-mono">{qty4(line.system_qty)}</td>}
                  <td className="px-3 py-2">
                    {canEnter ? (
                      <input
                        ref={(el) => {
                          inputRefs.current[line.id] = el;
                        }}
                        type="number"
                        min={0}
                        max={isBlock(line) ? 1 : undefined}
                        step={isBlock(line) ? 1 : "any"}
                        value={counted}
                        onChange={(e) => setDraft(line.id, { counted: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            focusNext(line.id);
                          }
                        }}
                        className={`w-28 rounded-lg border bg-app-bg-secondary px-2 py-1 text-xs font-mono focus:outline-none ${
                          invalid ? "border-app-status-danger" : "border-app-separator focus:border-app-accent"
                        }`}
                        dir="ltr"
                      />
                    ) : (
                      <span className="font-mono font-bold">{qty4(line.counted_qty)}</span>
                    )}
                  </td>
                  {!hidden && <td className={`px-3 py-2 text-end font-mono font-bold ${tone}`}>{qty4(line.variance_qty)}</td>}
                  {!hidden && <td className={`px-3 py-2 text-end font-mono ${tone}`}>{line.variance_value === null ? "—" : formatNumber(line.variance_value)}</td>}
                  <td className="px-3 py-2">
                    {canEnter ? (
                      <input
                        value={effectiveNote(line)}
                        onChange={(e) => setDraft(line.id, { note: e.target.value })}
                        maxLength={500}
                        className="w-full min-w-32 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 text-xs focus:border-app-accent focus:outline-none"
                      />
                    ) : (
                      <span className="text-[11px] text-app-label-secondary">{line.note ?? ""}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ExcludedLotsPanel
        title="لوتات محجوزة — خارج الجرد"
        hint="محجوزة لأمر تقطيع أو بيع وقيمتها في حساب الإنتاج تحت التشغيل، فلا تُعدّ هنا."
        lots={count.reserved_lots}
        showQty={!hidden}
      />
      <ExcludedLotsPanel
        title="لوتات تشغيلات إنتاج غير مغلقة — خارج الجرد"
        hint="لا تكلفة لها بعد حتى تُغلق التشغيلة، فلا تُعدّ هنا ولا تُضاف كمخزون موجود غير مسجل."
        lots={count.excluded_lots}
        showQty={!hidden}
      />

      <AddFoundDialog count={count} isOpen={isFoundOpen} onClose={() => setIsFoundOpen(false)} />
      <ApproveStockCountDialog count={count} isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} />
      <StockCountSheetDialog countId={sheetId} onClose={() => setSheetId(null)} />

      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction === "submit" ? "إرسال الجرد للاعتماد" : "إلغاء الجرد"}
        message={
          confirmAction === "submit"
            ? `بعد الإرسال لا تُعدّل كميات "${count.number}"، ويعتمده المالك أو المدير المالي.`
            : `سيُلغى "${count.number}" دون أي أثر على المخزون، ويمكن فتح جرد جديد للمخزن بعده.`
        }
        confirmText={confirmAction === "submit" ? "إرسال" : "إلغاء الجرد"}
        cancelText="تراجع"
        variant={confirmAction === "cancel" ? "danger" : "primary"}
        isLoading={submit.isPending || cancel.isPending}
      />
    </div>
  );
};

export default StockCountDetailPage;
