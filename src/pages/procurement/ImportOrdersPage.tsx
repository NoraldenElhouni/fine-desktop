import React, { useState } from "react";
import {
  FileCheck,
  Plus,
  RefreshCw,
  Building,
  DollarSign,
  Package,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Anchor,
  Truck,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { isAxiosError } from "axios";
import {
  ImportOrder,
  ImportOrderStatus,
  CreateImportOrderPayload,
  TransitionImportOrderPayload,
  PaymentRoute,
  LandedCostType,
} from "../../types/procurement";
import {
  useImportOrders,
  useSuppliers,
  useCreateImportOrder,
  useTransitionImportOrder,
  useLandedCostLines,
  useCreateLandedCostLine,
  useApproveLandedCostLine,
  useMarkLandedCostLinePaid,
} from "../../hooks/useProcurement";
import { useOperatingUnits } from "../../hooks/usePartners";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { AllocationPaymentActions } from "../../components/allocations/AllocationPaymentActions";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

const STAGES: { key: ImportOrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "draft", label: "مسودة", icon: Clock },
  { key: "pending_payment", label: "في انتظار تحديد الدفع", icon: DollarSign },
  { key: "awaiting_bank_approval", label: "اعتماد مصرفي", icon: ShieldCheck },
  { key: "awaiting_transfer", label: "حوالة سوق", icon: Send },
  { key: "paid", label: "تم مدفوع", icon: CheckCircle2 },
  { key: "in_transit", label: "في الشحن البحرية", icon: Truck },
  { key: "at_port", label: "وصلت الميناء", icon: Anchor },
  { key: "awaiting_receipt", label: "نقل للمخزن", icon: WarehouseIcon },
  { key: "received", label: "تم الاستلام", icon: Package },
  { key: "complete", label: "مكتمل ومحسوب", icon: FileCheck },
];

export const ImportOrdersPage: React.FC = () => {
  const { data: orders = [], isLoading, error: queryError, refetch } = useImportOrders();
  const { data: suppliers = [] } = useSuppliers();
  const { data: operatingUnits = [] } = useOperatingUnits();

  const createOrderMutation = useCreateImportOrder();
  const transitionMutation = useTransitionImportOrder();
  const createLandedCostMutation = useCreateLandedCostLine();
  const approveLandedCostMutation = useApproveLandedCostLine();
  const markLandedCostPaidMutation = useMarkLandedCostLinePaid();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detail Modal & Stepper State
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null);
  const { data: landedCosts = [], isLoading: isLoadingCosts, refetch: refetchCosts } = useLandedCostLines(selectedOrder?.id);
  const isSubmitting = createOrderMutation.isPending || transitionMutation.isPending || createLandedCostMutation.isPending;

  // Transition Form State
  const [transitionRoute, setTransitionRoute] = useState<PaymentRoute>("bank");
  const [heldAmountLyd, setHeldAmountLyd] = useState<number>(0);
  const [amountRequested, setAmountRequested] = useState<number>(0);
  const [invoiceRef, setInvoiceRef] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [receivedQty, setReceivedQty] = useState<number>(0);

  // Landed Cost Form State
  const [costType, setCostType] = useState<LandedCostType>("freight");
  const [costAmount, setCostAmount] = useState<number>(0);
  const [costNote, setCostNote] = useState<string>("");
  const [costNoteTouched, setCostNoteTouched] = useState(false);
  const [lineError, setLineError] = useState<Record<string, string>>({});

  // Create Form State
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);

  const openOrderDetail = (order: ImportOrder) => {
    setSelectedOrder(order);
    setAmountRequested(Number(order.negotiated_price) * Number(order.quantity));
    setReceivedQty(Number(order.quantity));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedUnitId || operatingUnits[0]?.id;
    if (!unitId || !selectedSupplierId || negotiatedPrice <= 0 || quantity <= 0) {
      toast.error("يرجى تعبئة كافة الحقول المطلوبة بمقادير صحيحة");
      return;
    }

    const payload: CreateImportOrderPayload = {
      operating_unit_id: unitId,
      supplier_id: selectedSupplierId,
      currency,
      negotiated_price: negotiatedPrice,
      quantity,
    };

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تم إنشاء أمر الاستيراد بنجاح");
        setIsModalOpen(false);
        setNegotiatedPrice(0);
        setQuantity(0);
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "حدث خطأ أثناء إنشاء أمر الاستيراد");
      },
    });
  };

  const handleApplyTransition = async (action: any) => {
    if (!selectedOrder) return;

    let payload: TransitionImportOrderPayload = { action };

    if (action === "select_route") {
      payload = {
        action,
        route: transitionRoute,
        amount_requested: amountRequested,
        held_amount_lyd: transitionRoute === "bank" ? heldAmountLyd : undefined,
        invoice_ref: invoiceRef || undefined,
      };
    } else if (action === "receive_goods") {
      payload = {
        action,
        warehouse_id: warehouseId || (operatingUnits[0]?.id || undefined),
        received_qty: receivedQty,
      };
    }

    transitionMutation.mutate(
      { id: selectedOrder.id, payload },
      {
        onSuccess: (res) => {
          setSelectedOrder(res.data);
          toast.success("تم تنفيذ المرحلة بنجاح!");
        },
        onError: (err: unknown) => {
          const payloadErr = apiErrorPayload(err);
          const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
          toast.error(message || "فشل تنفيذ المرحلة المالية/اللوجستية");
        },
      }
    );
  };

  const handleAddLandedCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || costAmount <= 0) return;

    const noteRequired = costType === "fx_spread" && costAmount > 0;
    if (noteRequired && costNote.trim().length === 0) {
      setCostNoteTouched(true);
      toast.error("سبب فرق سعر الصرف مطلوب عند تسجيل قيمة غير صفرية.");
      return;
    }

    createLandedCostMutation.mutate(
      {
        orderId: selectedOrder.id,
        payload: {
          type: costType,
          amount: costAmount,
          currency: "LYD",
          note: costNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("تمت إضافة التكلفة الإضافية بنجاح");
          setCostAmount(0);
          setCostNote("");
          setCostNoteTouched(false);
          refetchCosts();
        },
        onError: (err: unknown) => {
          const payloadErr = apiErrorPayload(err);
          const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
          toast.error(message || "فشل إضافة خط التكلفة");
        },
      }
    );
  };

  const getStatusBadge = (status: ImportOrderStatus) => {
    switch (status) {
      case "draft":
        return <span className="rounded-full bg-app-bg-secondary px-2.5 py-1 text-[10px] font-bold text-app-label-secondary">مسودة</span>;
      case "pending_payment":
        return <span className="rounded-full bg-app-status-warning/15 px-2.5 py-1 text-[10px] font-bold text-app-status-warning">في انتظار الدفع</span>;
      case "awaiting_bank_approval":
        return <span className="rounded-full bg-app-accent/15 px-2.5 py-1 text-[10px] font-bold text-app-accent">حجز بنكي</span>;
      case "paid":
        return <span className="rounded-full bg-app-status-positive/15 px-2.5 py-1 text-[10px] font-bold text-app-status-positive">مدفوع</span>;
      case "in_transit":
        return <span className="rounded-full bg-app-accent/15 px-2.5 py-1 text-[10px] font-bold text-app-accent">في الشحن</span>;
      case "at_port":
        return <span className="rounded-full bg-app-bg-secondary px-2.5 py-1 text-[10px] font-bold text-app-label-primary">وصل الميناء</span>;
      case "received":
        return <span className="rounded-full bg-app-status-positive/15 px-2.5 py-1 text-[10px] font-bold text-app-status-positive">مستلم</span>;
      case "complete":
        return <span className="rounded-full bg-app-status-positive/25 px-2.5 py-1 text-[10px] font-extrabold text-app-status-positive">مكتمل ومحسوب</span>;
      default:
        return <span className="rounded-full bg-app-bg-secondary px-2.5 py-1 text-[10px] font-bold text-app-label-secondary">{status}</span>;
    }
  };


  return (
<div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
            <Package className="h-6 w-6 text-app-accent" />
            <span>منظومة أوامر الاستيراد الخارجي والتكاليف</span>
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            تتبع مسار التوريد الخارجي: من الاتفاق المالي وحجوزات المصارف حتى تفريغ الشحنات واحتساب التكلفة الرأسمالية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء أمر استيراد جديد</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-app-separator bg-app-bg-primary p-6 text-center">
          <Package className="h-10 w-10 text-app-label-secondary mb-2 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا توجد أوامر استيراد حالية</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإنشاء أمر استيراد جديد للبدء في تتبع الاعتمادات المستندية والشحن
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">المورد الخارجي</th>
                <th className="px-4 py-3 text-start font-bold">الكمية المتعاقد عليها</th>
                <th className="px-4 py-3 text-start font-bold">سعر الوحدة النقدية</th>
                <th className="px-4 py-3 text-start font-bold">إجمالي الاعتماد المستهدف</th>
                <th className="px-4 py-3 text-start font-bold">الحالة الحالية</th>
                <th className="px-4 py-3 text-end font-bold">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {orders.map((ord) => {
                const totalAmount = Number(ord.negotiated_price) * Number(ord.quantity);
                return (
                  <tr key={ord.id} className="hover:bg-app-fill-f1 transition-colors">
                    <td className="px-4 py-3 font-bold">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-app-accent" />
                        <span>{ord.supplier?.name || "مورد غير محدد"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {formatNumber(ord.quantity)} وحدة
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatNumber(ord.negotiated_price)} {ord.currency}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {formatNumber(totalAmount)} {ord.currency}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(ord.status)}</td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="inline-flex items-center gap-1 rounded-lg bg-app-bg-secondary px-3 py-1 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
                      >
                        <span>تتبع التفاصيل</span>
                        <ArrowRight className="h-3.5 w-3.5 rotate-180 text-app-accent" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Import Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-4">إنشاء أمر استيراد جديد</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الوحدة التشغيلية <span className="text-app-status-danger">*</span>
                </label>
                <SearchableSelect<{ id: string; name: string }>
                  options={operatingUnits}
                  value={
                    operatingUnits.find((u) => u.id === selectedUnitId) ??
                    null
                  }
                  onChange={(u) => setSelectedUnitId(u ? u.id : "")}
                  getOptionId={(u) => u.id}
                  getOptionLabel={(u) => u.name}
                  placeholder="-- اختر الوحدة --"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  المورد الخارجي <span className="text-app-status-danger">*</span>
                </label>
                <SearchableSelect<{ id: string; name: string; default_currency?: string }>
                  options={suppliers}
                  value={
                    suppliers.find((s) => s.id === selectedSupplierId) ??
                    null
                  }
                  onChange={(s) => setSelectedSupplierId(s ? s.id : "")}
                  getOptionId={(s) => s.id}
                  getOptionLabel={(s) => s.name}
                  getOptionSubLabel={(s) => s.default_currency}
                  getOptionSearchText={(s) =>
                    `${s.name} ${s.default_currency ?? ""}`
                  }
                  placeholder="-- اختر المورد --"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">العملة</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="LYD">LYD</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    السعر المتفق عليه للوحدة <span className="text-app-status-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={negotiatedPrice || ""}
                    onChange={(e) => setNegotiatedPrice(Number(e.target.value))}
                    placeholder="120.50"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الكمية المتعاقد عليها <span className="text-app-status-danger">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSupplierId || negotiatedPrice <= 0}
                  className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ أمر الاستيراد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Stepper & Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-app-separator bg-app-bg-primary p-6 shadow-2xl space-y-6" dir="rtl">
            
            {/* Modal Title & Close */}
            <div className="flex items-center justify-between border-b border-app-separator pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-app-label-primary">
                    أمر استيراد #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-app-label-secondary mt-1">
                  المورد: <span className="font-bold text-app-label-primary">{selectedOrder.supplier?.name}</span> |
                  الكمية: {formatNumber(selectedOrder.quantity)} | إجمالي العقد:{" "}
                  <span className="font-bold text-emerald-600 font-mono">
                    {formatNumber(Number(selectedOrder.negotiated_price) * Number(selectedOrder.quantity))}{" "}
                    {selectedOrder.currency}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-app-separator px-3 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
              >
                إغلاق
              </button>
            </div>

            {/* Stepper Progress */}
            <div>
              <h4 className="text-xs font-bold text-app-label-secondary mb-3">مسار المراحل الزمنية والاعتمادات:</h4>
              <div className="grid grid-cols-5 gap-2">
                {STAGES.map((stg, idx) => {
                  const currentIdx = STAGES.findIndex((s) => s.key === selectedOrder.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const Icon = stg.icon;

                  return (
                    <div
                      key={stg.key}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? "bg-app-accent/10 border-app-accent text-app-accent font-bold ring-2 ring-app-accent/20"
                          : isDone
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-app-bg-secondary border-app-separator text-app-label-secondary opacity-50"
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-[11px] leading-tight">{stg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Action Trigger Panel */}
            <div className="rounded-2xl border border-app-separator bg-app-bg-secondary p-4 space-y-3">
              <h4 className="text-xs font-bold text-app-label-primary flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-app-accent" />
                <span>العمليات المتاحة للمرحلة الحالية:</span>
              </h4>

              {selectedOrder.status === "draft" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-label-secondary">
                    تحويل أمر الاستيراد للمالية لتحديد وسيلة الدفع (مصرفي / سوق)
                  </p>
                  <button
                    onClick={() => handleApplyTransition("pending_payment")}
                    disabled={createOrderMutation.isPending || transitionMutation.isPending}
                    className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    إرسال للمالية للموافقة
                  </button>
                </div>
              )}

              {selectedOrder.status === "pending_payment" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-app-label-secondary mb-1">مسار الدفع</label>
                      <select
                        value={transitionRoute}
                        onChange={(e) => setTransitionRoute(e.target.value as PaymentRoute)}
                        className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="bank">اعتماد مصرفي (حجز بالدينار + موافقة)</option>
                        <option value="market">شراء عبر سوق الصرف</option>
                      </select>
                    </div>
                    {transitionRoute === "bank" && (
                      <div>
                        <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                          قيمة الحجز الاحتياطي بالحساب (LYD)
                        </label>
                        <input
                          type="number"
                          value={heldAmountLyd || ""}
                          onChange={(e) => setHeldAmountLyd(Number(e.target.value))}
                          placeholder="مثال: 65000"
                          className="w-full rounded-xl border border-app-separator bg-app-bg-primary px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleApplyTransition("select_route")}
                      disabled={isSubmitting || (transitionRoute === "bank" && heldAmountLyd <= 0)}
                      className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                      تأكيد خطة الدفع
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.status === "paid" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-label-secondary">تأكيد تم انطلاق الشحنة في البحر</p>
                  <button
                    onClick={() => handleApplyTransition("shipment")}
                    disabled={createOrderMutation.isPending || transitionMutation.isPending}
                    className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    تأكيد الانطلاق والشحن
                  </button>
                </div>
              )}

              {selectedOrder.status === "in_transit" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-label-secondary">تأكيد وصول السفينة إلى الميناء الخارجي / المحلي</p>
                  <button
                    onClick={() => handleApplyTransition("arrive_port")}
                    disabled={createOrderMutation.isPending || transitionMutation.isPending}
                    className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    تأكيد الوصول للميناء
                  </button>
                </div>
              )}

              {selectedOrder.status === "at_port" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-label-secondary">بدء إجراءات النقل والشحن الداخلي لمخازن الشركة</p>
                  <button
                    onClick={() => handleApplyTransition("transport_warehouse")}
                    disabled={createOrderMutation.isPending || transitionMutation.isPending}
                    className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    بدء النقل للمخازن
                  </button>
                </div>
              )}

              {selectedOrder.status === "awaiting_receipt" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-label-secondary">فحص واستلام البضاعة بالكامل بالمركز الرئيسي</p>
                  <button
                    onClick={() => handleApplyTransition("receive_goods")}
                    disabled={createOrderMutation.isPending || transitionMutation.isPending}
                    className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    تأكيد الاستلام بالمخزن
                  </button>
                </div>
              )}

              {selectedOrder.status === "received" && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-app-label-secondary">إغلاق وتكتمل التكاليف الرأسمالية كاملة</p>
                  <button
                    onClick={() => handleApplyTransition("complete")}
                    disabled={createOrderMutation.isPending || transitionMutation.isPending}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    إغلاق أمر الاستيراد
                  </button>
                </div>
              )}

              {selectedOrder.status === "complete" && (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تم إغلاق الأمر واحتساب كافة التكاليف الرأسمالية بالمخزون.</span>
                </p>
              )}
            </div>

            {/* Landed Costs Breakdown Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-label-primary flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-app-accent" />
                  <span>التكاليف الإضافية والرأسمالية (Landed Costs Allocation):</span>
                </h4>
              </div>

              {/* Add Cost Form */}
              <form onSubmit={handleAddLandedCost} className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={costType}
                    onChange={(e) => setCostType(e.target.value as LandedCostType)}
                    className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                  >
                    <option value="freight">شحن بحري / جوي (Freight)</option>
                    <option value="customs">رسوم جمركية (Customs)</option>
                    <option value="fx_spread">فوارق عملة (FX Spread)</option>
                    <option value="local_transport">نقل داخلي (Local Transport)</option>
                    <option value="other">مصاريف أخرى (Other)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={costAmount || ""}
                    onChange={(e) => setCostAmount(Number(e.target.value))}
                    placeholder="القيمة بالدينار (LYD)"
                    className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || costAmount <= 0}
                    className="rounded-xl bg-app-accent px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    إضافة خط تكلفة
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-app-label-secondary">
                    ملاحظة {costType === "fx_spread" ? <span className="text-app-status-danger">*</span> : null}
                  </label>
                  <textarea
                    value={costNote}
                    onChange={(e) => {
                      setCostNote(e.target.value);
                      setCostNoteTouched(true);
                    }}
                    onBlur={() => setCostNoteTouched(true)}
                    rows={2}
                    placeholder={
                      costType === "fx_spread"
                        ? "مثال: فرق سعر بسبب الصرّاف الموازي"
                        : "اختياري — سبب هذه التكلفة"
                    }
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                  />
                  {costType === "fx_spread" && costNoteTouched && costNote.trim().length === 0 ? (
                    <p className="text-[10px] text-app-status-danger font-bold">
                      السبب مطلوب عند تسجيل فرق سعر صرف بقيمة غير صفرية.
                    </p>
                  ) : null}
                </div>
              </form>

              {/* Cost Lines List */}
              {isLoadingCosts ? (
                <div className="flex justify-center p-3">
                  <RefreshCw className="h-4 w-4 animate-spin text-app-accent" />
                </div>
              ) : landedCosts.length === 0 ? (
                <p className="text-xs text-app-label-secondary">لا توجد خطوط تكلفة مضافة حتى الآن.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-secondary">
                  <table className="w-full text-xs text-start">
                    <thead className="border-b border-app-separator bg-app-bg-primary text-app-label-secondary">
                      <tr>
                        <th className="px-3 py-2 text-start font-bold">نوع التكلفة</th>
                        <th className="px-3 py-2 text-start font-bold">المبلغ</th>
                        <th className="px-3 py-2 text-start font-bold">الملاحظة</th>
                        <th className="px-3 py-2 text-start font-bold">المسؤول</th>
                        <th className="px-3 py-2 text-end font-bold">الحالة والإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-separator">
                      {landedCosts.map((lc) => {
                        const orderUnitId = selectedOrder.operating_unit_id;
                        const unit = operatingUnits.find((u) => u.id === orderUnitId);
                        const managerId = unit?.manager_user_id ?? null;
                        return (
                          <tr key={lc.id}>
                            <td className="px-3 py-2 font-semibold">{lc.type}</td>
                            <td className="px-3 py-2 font-mono font-bold">{formatNumber(lc.amount)} {lc.currency}</td>
                            <td className="px-3 py-2 text-app-label-secondary max-w-xs truncate">
                              {lc.note || "—"}
                            </td>
                            <td className="px-3 py-2 text-app-label-secondary">
                              {lc.payer?.name ?? lc.approver?.name ?? "—"}
                            </td>
                            <td className="px-3 py-2 text-end">
                              <AllocationPaymentActions
                                status={lc.status}
                                managerId={managerId}
                                isPending={
                                  approveLandedCostMutation.isPending &&
                                  approveLandedCostMutation.variables?.lineId === lc.id
                                }
                                isMarkingPaid={
                                  markLandedCostPaidMutation.isPending &&
                                  markLandedCostPaidMutation.variables?.lineId === lc.id
                                }
                                errorMessage={lineError[lc.id] ?? null}
                                onApprove={(note) =>
                                  approveLandedCostMutation.mutate(
                                    { orderId: selectedOrder.id, lineId: lc.id, note },
                                    {
                                      onSuccess: () =>
                                        setLineError((prev) => {
                                          const { [lc.id]: _drop, ...rest } = prev;
                                          return rest;
                                        }),
                                      onError: (err: unknown) =>
                                        setLineError((prev) => ({
                                          ...prev,
                                          [lc.id]: apiErrorPayload(err)?.message ?? "تعذر الاعتماد.",
                                        })),
                                    },
                                  )
                                }
                                onMarkPaid={(note) =>
                                  markLandedCostPaidMutation.mutate(
                                    { orderId: selectedOrder.id, lineId: lc.id, note },
                                    {
                                      onSuccess: () =>
                                        setLineError((prev) => {
                                          const { [lc.id]: _drop, ...rest } = prev;
                                          return rest;
                                        }),
                                      onError: (err: unknown) =>
                                        setLineError((prev) => ({
                                          ...prev,
                                          [lc.id]: apiErrorPayload(err)?.message ?? "تعذر تأكيد الدفع.",
                                        })),
                                    },
                                  )
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ImportOrdersPage;
