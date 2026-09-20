import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Scissors, Plus, AlertTriangle, ChevronLeft, Ruler, Package, Scale, CheckCircle2,
  RefreshCw, Trash2,
} from "lucide-react";
import {
  useCutterOrder, useTransitionCutterOrder, useAddCutterLine, useAssignTemplate,
  useRecordWeighIn, useAvailableFoamBlocks, useAttachBlock, useDetachBlock,
} from "../../hooks/useCutter";
import { useInventoryItems } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import {
  CUTTER_STATUS_ORDER, CUTTER_STATUS_LABEL, CUTTER_NEXT_STATUS,
  CutterWorkOrderLine, AvailableFoamBlock,
} from "../../api/endpoints/cutter";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { InventoryItem } from "../../api/endpoints/inventory";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const CutterWorkOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useCutterOrder(orderId);
  const { data: pieceItems } = useInventoryItems({ item_type: "cut_template_piece" });
  const { data: fillItems } = useInventoryItems({ item_type: "byproduct_fill" });
  const { data: warehouses } = useWarehouses();
  const { data: foamBlocksPage } = useAvailableFoamBlocks();
  const foamBlocks: AvailableFoamBlock[] = foamBlocksPage?.data ?? [];

  const transitionMutation = useTransitionCutterOrder();
  const addLineMutation = useAddCutterLine();
  const templateMutation = useAssignTemplate(orderId);
  const weighInMutation = useRecordWeighIn(orderId);
  const attachBlockMutation = useAttachBlock(orderId);
  const detachBlockMutation = useDetachBlock(orderId);

  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState("");
  const [qty, setQty] = useState("1");
  const [pieceItemId, setPieceItemId] = useState("");
  const [tpl, setTpl] = useState<Record<string, { l: string; w: string; h: string }>>({});
  const [weight, setWeight] = useState("");
  const [fillItemId, setFillItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [isChangingBlock, setIsChangingBlock] = useState(false);

  const nextStatus = order ? CUTTER_NEXT_STATUS[order.status] : null;
  const atWeighIn = order?.status === "awaiting_byproduct_weigh_in";
  const hasWeighIn = (order?.byproduct_yields?.length ?? 0) > 0;

  const canSelectBlock = order?.status === "requested" || order?.status === "confirmed";

  const totalRequiredVolumeM3 = (order?.lines ?? []).reduce((acc, line) => {
    const vol = line.template_volume_m3 ? Number(line.template_volume_m3) : 0;
    return acc + vol * (line.quantity || 1);
  }, 0);

  const untemplatedLinesCount = (order?.lines ?? []).filter(
    (l) => !l.template_length_m || !l.template_width_m || !l.template_height_m,
  ).length;

  const chosenBlock = foamBlocks.find((b) => b.id === selectedBlockId);

  const blockMissingForProduction = nextStatus === "in_production" && !order?.stock_lot;
  const untemplatedMissingForProduction = nextStatus === "in_production" && untemplatedLinesCount > 0;
  const cannotAdvanceToProduction = blockMissingForProduction || untemplatedMissingForProduction;

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const advance = () => {
    if (!orderId || !nextStatus) return;
    if (nextStatus === "in_production") {
      if (!order?.stock_lot) {
        setError("يجب اختيار وتثبيت البلوك المراد تقطيعه أولاً قبل بدء الإنتاج.");
        return;
      }
      if (untemplatedLinesCount > 0) {
        setError(`يوجد ${untemplatedLinesCount} بند لم يتم تعيين أبعاد القالب له. يجب تعيين جميع القوالب قبل بدء الإنتاج.`);
        return;
      }
    }
    setError(null);
    transitionMutation.mutate(
      { id: orderId, status: nextStatus },
      { onError: (e) => fail(e, "تعذر ترقية حالة الأمر.") },
    );
  };

  const addLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setError(null);
    addLineMutation.mutate(
      {
        id: orderId,
        data: {
          requested_spec: spec,
          quantity: num(qty) || 1,
          output_inventory_item_id: pieceItemId || undefined,
        },
      },
      {
        onSuccess: () => { setSpec(""); setQty("1"); },
        onError: (e) => fail(e, "تعذرت إضافة البند."),
      },
    );
  };

  const saveTemplate = (line: CutterWorkOrderLine) => {
    const t = tpl[line.id];
    if (!t) return;
    setError(null);
    templateMutation.mutate(
      {
        lineId: line.id,
        data: {
          template_length_m: num(t.l),
          template_width_m: num(t.w),
          template_height_m: num(t.h),
        },
      },
      { onError: (e) => fail(e, "تعذر تعيين القالب.") },
    );
  };

  const submitWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    weighInMutation.mutate(
      {
        weight_kg: num(weight),
        byproduct_inventory_item_id: num(weight) > 0 ? fillItemId || undefined : undefined,
        warehouse_id: num(weight) > 0 ? warehouseId || undefined : undefined,
      },
      { onError: (e) => fail(e, "تعذر تسجيل الوزن.") },
    );
  };

  if (isLoading || !order) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جاري تحميل أمر العمل…
      </div>
    );
  }

  const templateVolume = (t?: { l: string; w: string; h: string }) =>
    t ? num(t.l) * num(t.w) * num(t.h) : 0;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <button
          onClick={() => navigate("/cutter/orders")}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى أوامر العمل
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Scissors className="w-7 h-7 text-app-accent" />
          <span className="font-mono text-app-accent">{order.order_number}</span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          {order.client_id ? "أمر عميل" : "أمر داخلي — بدون فحص ائتماني"} · المواد المحجوزة:{" "}
          <span className="font-mono">{formatNumber(order.wip_cost)} LYD</span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Lifecycle */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          {CUTTER_STATUS_ORDER.map((s) => {
            const reached = CUTTER_STATUS_ORDER.indexOf(s) <= CUTTER_STATUS_ORDER.indexOf(order.status);
            const current = s === order.status;
            return (
              <span
                key={s}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                  current
                    ? "bg-app-accent text-white"
                    : reached
                      ? "bg-app-accent-subtle text-app-accent"
                      : "bg-app-fill-f1 text-app-label-tertiary"
                }`}
              >
                {CUTTER_STATUS_LABEL[s]}
              </span>
            );
          })}

          {nextStatus && (
            <button
              onClick={advance}
              disabled={transitionMutation.isPending || cannotAdvanceToProduction}
              title={cannotAdvanceToProduction ? (blockMissingForProduction ? "يجب اختيار وتثبيت البلوك أولاً" : "يجب تعيين جميع أبعاد القوالب أولاً") : undefined}
              className="ms-auto flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              {transitionMutation.isPending ? "جاري الترقية…" : `ترقية إلى ${CUTTER_STATUS_LABEL[nextStatus]}`}
            </button>
          )}
        </div>

        {blockMissingForProduction && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-app-status-danger bg-app-status-danger/10 border border-app-status-danger/30 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              لا يمكن ترقية أمر العمل إلى مرحلة <strong>قيد التقطيع</strong> حتى يتم اختيار وتثبيت البلوك المراد تقطيعه من الأسفل.
            </span>
          </div>
        )}

        {untemplatedMissingForProduction && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-app-status-yellow bg-app-status-yellow/10 border border-app-status-yellow/30 rounded-xl p-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              يوجد {untemplatedLinesCount} بند لم يتم تعيين أبعاد القالب له. يجب تعيين جميع القوالب قبل بدء التقطيع.
            </span>
          </div>
        )}

        {atWeighIn && !hasWeighIn && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-app-status-yellow">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            لا يمكن لهذا الأمر اجتياز فحص الجودة حتى يتم وزن القصاصات. أدخل <strong>0</strong>{" "}
            إذا لم يكن هناك ما يمكن استرجاعه — تلك إجابة صالحة، لكن يجب تسجيلها.
          </p>
        )}
      </div>

      {/* Block Selection / Management Section */}
      {order.stock_lot && !isChangingBlock ? (
        <div className="rounded-2xl border border-app-accent/40 bg-app-accent-tint shadow-sm">
          <div className="border-b border-app-accent/30 px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-app-accent" />
              <h2 className="text-sm font-bold text-app-label-primary">البلوك المثبت للتقطيع</h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  order.stock_lot.status === "reserved"
                    ? "bg-app-status-info/15 text-app-status-info"
                    : order.stock_lot.status === "consumed"
                      ? "bg-app-fill-f2 text-app-label-secondary"
                      : "bg-app-bg-primary text-app-label-primary"
                }`}
              >
                {order.stock_lot.status === "reserved" ? "محجوز للتقطيع" : order.stock_lot.status === "consumed" ? "تم استهلاكه بالكامل" : order.stock_lot.status}
              </span>
              {canSelectBlock && (
                <div className="flex items-center gap-1.5 ms-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingBlock(true);
                      setSelectedBlockId("");
                    }}
                    className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1 text-xs font-semibold text-app-label-primary hover:border-app-accent hover:text-app-accent transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>تغيير البلوك</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من إلغاء تخصيص هذا البلوك وإعادته للمخزون المتاح؟")) {
                        detachBlockMutation.mutate(undefined, {
                          onError: (e) => fail(e, "تعذر إلغاء تخصيص البلوك."),
                        });
                      }
                    }}
                    disabled={detachBlockMutation.isPending}
                    className="flex items-center gap-1 rounded-lg border border-app-status-danger/30 bg-app-status-danger/10 px-2.5 py-1 text-xs font-semibold text-app-status-danger hover:bg-app-status-danger/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>إلغاء التخصيص</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-app-label-tertiary mb-1">
                رقم اللوت
              </div>
              <div className="font-mono font-bold text-app-accent text-sm">
                {order.stock_lot.lot_number}
              </div>
              <div className="text-[10px] text-app-label-tertiary mt-0.5">
                {order.stock_lot.inventory_item?.sku ?? ""} {order.stock_lot.inventory_item?.name ?? ""}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-app-label-tertiary mb-1">
                السعر المثبت
              </div>
              <div className="font-mono font-bold text-app-label-primary text-sm">
                {formatNumber(Number(order.block_unit_cost_snapshot ?? order.stock_lot.unit_cost))} LYD
              </div>
              <div className="text-[10px] text-app-label-tertiary mt-0.5">
                لا يتأثر بتغييرات سعر المخزون لاحقاً
              </div>
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-app-bg-primary px-2 py-0.5 text-app-label-secondary border border-app-separator">
                {Number(order.block_length_m_snapshot ?? order.stock_lot.length_m ?? 0).toFixed(2)} ×
                {" "}{Number(order.block_width_m_snapshot ?? order.stock_lot.width_m ?? 0).toFixed(2)} ×
                {" "}{Number(order.block_height_m_snapshot ?? order.stock_lot.height_m ?? 0).toFixed(2)} م
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-app-bg-primary px-2 py-0.5 text-app-label-secondary border border-app-separator">
                {Number(order.block_volume_m3_snapshot ?? order.stock_lot.volume_m3 ?? 0).toFixed(4)} م³
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-app-bg-secondary px-2 py-0.5 text-app-label-tertiary">
                {order.stock_lot.warehouse?.name ?? ""}
              </span>
            </div>
            {totalRequiredVolumeM3 > 0 && (
              <div className="md:col-span-2 flex items-center justify-between text-xs bg-app-bg-primary/80 p-2.5 rounded-xl border border-app-separator">
                <span className="text-app-label-secondary">إجمالي حجم القوالب المطلوبة:</span>
                <span className="font-mono font-bold text-app-accent">
                  {totalRequiredVolumeM3.toFixed(4)} م³ من أصل {Number(order.block_volume_m3_snapshot ?? order.stock_lot.volume_m3 ?? 0).toFixed(4)} م³
                </span>
              </div>
            )}
          </div>
        </div>
      ) : canSelectBlock ? (
        <div className="rounded-2xl border border-app-accent bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="border-b border-app-separator bg-app-accent/10 px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-app-accent" />
              <div>
                <h2 className="text-sm font-bold text-app-label-primary">
                  {order.stock_lot ? "تغيير البلوك المخصص للتقطيع" : "اختيار وتثبيت البلوك المراد تقطيعه"}
                </h2>
                <p className="text-[11px] text-app-label-secondary mt-0.5">
                  اختر بلوك إسفنج متاح من المخزن لتثبيت قياساته وسعره وحجزه لأمر العمل قبل البدء بالتقطيع.
                </p>
              </div>
            </div>
            {isChangingBlock && (
              <button
                type="button"
                onClick={() => {
                  setIsChangingBlock(false);
                  setSelectedBlockId("");
                }}
                className="text-xs font-semibold text-app-label-secondary hover:text-app-label-primary px-3 py-1.5 rounded-xl border border-app-separator bg-app-bg-secondary"
              >
                إلغاء التغيير
              </button>
            )}
          </div>

          <div className="p-4 space-y-3">
            {totalRequiredVolumeM3 > 0 && (
              <div className="flex items-center justify-between text-xs bg-app-bg-secondary p-2.5 rounded-xl border border-app-separator">
                <span className="text-app-label-secondary">إجمالي حجم القوالب المطلوبة لبنود الأمر:</span>
                <span className="font-mono font-bold text-app-accent">{totalRequiredVolumeM3.toFixed(4)} م³</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                اختر بلوك إسفنج من المخزن
              </label>
              <SearchableSelect<AvailableFoamBlock>
                options={foamBlocks}
                value={foamBlocks.find((b) => b.id === selectedBlockId) ?? null}
                onChange={(b) => setSelectedBlockId(b ? b.id : "")}
                getOptionId={(b) => b.id}
                getOptionLabel={(b) => b.lot_number}
                getOptionSubLabel={(b) =>
                  `${b.inventory_item?.sku ?? ""} · ${Number(b.volume_m3 ?? 0).toFixed(4)} م³ · ${formatNumber(Number(b.unit_cost))} LYD · ${b.warehouse?.name ?? ""}`
                }
                getOptionSearchText={(b) =>
                  `${b.lot_number} ${b.inventory_item?.sku ?? ""} ${b.inventory_item?.name ?? ""}`
                }
                placeholder="ابحث برقم اللوت أو رمز الصنف…"
              />
            </div>

            {chosenBlock && (
              <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-app-label-tertiary block">رقم اللوت:</span>
                    <span className="font-mono font-bold text-app-accent">{chosenBlock.lot_number}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-label-tertiary block">الأبعاد (م):</span>
                    <span className="font-mono font-semibold text-app-label-primary">
                      {Number(chosenBlock.length_m ?? 0).toFixed(2)} × {Number(chosenBlock.width_m ?? 0).toFixed(2)} × {Number(chosenBlock.height_m ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-label-tertiary block">الحجم الإجمالي:</span>
                    <span className="font-mono font-bold text-app-label-primary">
                      {Number(chosenBlock.volume_m3 ?? 0).toFixed(4)} م³
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-label-tertiary block">تكلفة البلوك:</span>
                    <span className="font-mono font-bold text-app-accent">
                      {formatNumber(Number(chosenBlock.unit_cost))} LYD
                    </span>
                  </div>
                </div>

                {totalRequiredVolumeM3 > 0 && (
                  <div className={`p-2.5 rounded-xl text-xs font-medium ${
                    Number(chosenBlock.volume_m3 ?? 0) < totalRequiredVolumeM3
                      ? "bg-app-status-danger/10 text-app-status-danger border border-app-status-danger/20"
                      : "bg-app-status-positive/10 text-app-status-positive border border-app-status-positive/20"
                  }`}>
                    {Number(chosenBlock.volume_m3 ?? 0) < totalRequiredVolumeM3
                      ? `تنبيه: حجم هذا البلوك (${Number(chosenBlock.volume_m3 ?? 0).toFixed(4)} م³) أقل من إجمالي حجم القوالب (${totalRequiredVolumeM3.toFixed(4)} م³). قد لا يكفي لإنتاج جميع البنود.`
                      : `حجم البلوك كافٍ لإنتاج جميع بنود الأمر (${totalRequiredVolumeM3.toFixed(4)} م³ من أصل ${Number(chosenBlock.volume_m3 ?? 0).toFixed(4)} م³).`
                    }
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      attachBlockMutation.mutate(selectedBlockId, {
                        onSuccess: () => {
                          setIsChangingBlock(false);
                          setSelectedBlockId("");
                        },
                        onError: (err) => fail(err, "تعذر تخصيص البلوك لأمر العمل."),
                      });
                    }}
                    disabled={attachBlockMutation.isPending || !selectedBlockId}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-app-accent text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{attachBlockMutation.isPending ? "جاري التثبيت والحجز…" : "تثبيت وحجز هذا البلوك"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Weigh-in — surfaced above the lines while it is the blocking step */}
      {atWeighIn && (
        <div className="rounded-2xl border border-app-status-yellow/40 bg-app-status-yellow/5 shadow-sm">
          <div className="border-b border-app-separator px-4 py-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-app-status-yellow" />
            <h2 className="text-sm font-bold text-app-label-primary">وزن المنتج الثانوي</h2>
          </div>

          {hasWeighIn ? (
            <div className="p-4 space-y-2">
              {order.byproduct_yields?.map((y) => (
                <div key={y.id} className="flex items-center gap-3 text-xs text-app-label-primary">
                  <CheckCircle2 className="w-4 h-4 text-app-status-positive" />
                  <span className="font-mono font-bold">{Number(y.weight_kg).toFixed(2)} كجم</span>
                  <span className="text-app-label-secondary">
                    يحمل {formatNumber(y.yield_cost)} LYD
                    {Number(y.weight_kg) === 0 && " — لا يوجد ما تم استرجاعه، القيمة تبقى مع القطع"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={submitWeighIn} className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    وزن القصاصات (كجم)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    صنف المنتج الثانوي
                  </label>
                  <SearchableSelect<InventoryItem>
                    options={fillItems?.data ?? []}
                    value={
                      fillItems?.data.find((i) => i.id === fillItemId) ?? null
                    }
                    onChange={(i) => setFillItemId(i ? i.id : "")}
                    getOptionId={(i) => i.id}
                    getOptionLabel={(i) => i.name}
                    getOptionSubLabel={(i) => i.sku}
                    getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                    placeholder={
                      num(weight) === 0 ? "غير مطلوب عند 0 كجم" : "اختر صنف الحشو…"
                    }
                    disabled={num(weight) === 0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    المخزن
                  </label>
                  <SearchableSelect<{ id: string; name: string }>
                    options={warehouses ?? []}
                    value={
                      warehouses?.find((w) => w.id === warehouseId) ?? null
                    }
                    onChange={(w) => setWarehouseId(w ? w.id : "")}
                    getOptionId={(w) => w.id}
                    getOptionLabel={(w) => w.name}
                    placeholder={
                      num(weight) === 0 ? "غير مطلوب عند 0 كجم" : "اختر المخزن…"
                    }
                    disabled={num(weight) === 0}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={weighInMutation.isPending || weight === ""}
                className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                <Scale className="w-4 h-4" />
                {weighInMutation.isPending ? "جاري التسجيل…" : "تسجيل الوزن"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Lines */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">البنود</h2>
          <p className="text-xs text-app-label-secondary mt-0.5">
            الشكل المطلوب هو ما طلبه العميل. القالب هو الصندوق الذي تم قطعه فعلياً —
            وهو ما يحدد التكلفة وأبعاد المخزون والفوترة.
          </p>
        </div>

        <div className="divide-y divide-app-separator">
          {order.lines?.map((line) => {
            const t = tpl[line.id] ?? {
              l: line.template_length_m ? String(line.template_length_m) : "",
              w: line.template_width_m ? String(line.template_width_m) : "",
              h: line.template_height_m ? String(line.template_height_m) : "",
            };
            const liveVolume = templateVolume(t);
            const consumed = line.consumptions ?? [];

            return (
              <div key={line.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-app-label-primary">
                      {line.requested_spec}
                    </div>
                    <div className="text-xs text-app-label-tertiary">
                      الكمية {line.quantity}
                      {line.output_item && ` · المخرجات ${line.output_item.sku}`}
                    </div>
                  </div>
                  {line.template_volume_m3 ? (
                    <span className="px-2 py-1 rounded-full text-xs font-mono bg-app-accent-subtle text-app-accent shrink-0">
                      {Number(line.template_volume_m3).toFixed(4)} م³ لكل واحدة
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-app-status-yellow/15 text-app-status-yellow shrink-0">
                      لا يوجد قالب بعد
                    </span>
                  )}
                </div>

                {/* Template assignment */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-app-bg-secondary rounded-xl p-3">
                  {(["l", "w", "h"] as const).map((k) => (
                    <div key={k}>
                      <label className="block text-[10px] uppercase text-app-label-secondary mb-1">
                        {k === "l" ? "الطول" : k === "w" ? "العرض" : "الارتفاع"} (م)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={t[k]}
                        onChange={(e) => setTpl({ ...tpl, [line.id]: { ...t, [k]: e.target.value } })}
                        className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-primary text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="text-xs">
                    <div className="text-[10px] uppercase text-app-label-secondary mb-1">الحجم</div>
                    <div className="font-mono font-bold text-app-label-primary py-1.5">
                      {liveVolume.toFixed(4)} م³
                    </div>
                  </div>
                  <button
                    onClick={() => saveTemplate(line)}
                    disabled={templateMutation.isPending || liveVolume <= 0}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                  >
                    <Ruler className="w-3.5 h-3.5" /> تعيين القالب
                  </button>
                </div>

                {/* Consumed blocks */}
                {consumed.length > 0 && (
                  <div className="space-y-1">
                    {consumed.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center gap-2 text-xs text-app-label-secondary"
                      >
                        <Package className="w-3.5 h-3.5 text-app-accent" />
                        <span className="font-mono font-bold text-app-label-primary">
                          {c.stock_lot?.lot_number}
                        </span>
                        <span>
                          بلوك {Number(c.block_volume_m3).toFixed(4)} م³ · استُهلك{" "}
                          {Number(c.volume_consumed_m3).toFixed(4)} م³ ({c.consumption_type})
                        </span>
                        <span className="font-mono">
                          القالب {formatNumber(c.consumed_cost)} · القصاصات{" "}
                          {formatNumber(c.remainder_cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Per-line block picker removed in CUT-block-sale: blocks are
                    picked at order creation and snapshotted on the order
                    header. The attached-block card at the top of the page
                    shows the locked dimensions and price. */}
              </div>
            );
          })}

          {(order.lines?.length ?? 0) === 0 && (
            <div className="px-4 py-8 text-center text-xs text-app-label-tertiary">
              لا توجد بنود بعد. أضف ما طلبه العميل أدناه.
            </div>
          )}
        </div>

        {/* Request entry */}
        {order.status === "requested" && (
          <form onSubmit={addLine} className="border-t border-app-separator p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                الشكل المطلوب
              </label>
              <input
                type="text"
                required
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="حشوة وسادة دائرية، نصف قطر 8 سم"
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs border-app-separator focus:border-app-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                الكمية
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">صنف المخرجات</label>
                <SearchableSelect<InventoryItem>
                  options={pieceItems?.data ?? []}
                  value={
                    pieceItems?.data.find((i) => i.id === pieceItemId) ?? null
                  }
                  onChange={(i) => setPieceItemId(i ? i.id : "")}
                  getOptionId={(i) => i.id}
                  getOptionLabel={(i) => i.sku}
                  getOptionSubLabel={(i) => i.name}
                  getOptionSearchText={(i) => `${i.sku} ${i.name}`}
                  placeholder="صنف المخرجات…"
                />
              </div>
              <button
                type="submit"
                disabled={addLineMutation.isPending}
                className="rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
