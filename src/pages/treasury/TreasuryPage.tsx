import React, { useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Send,
  AlertTriangle,
} from "lucide-react";
import { isAxiosError } from "axios";
import {
  PaymentRequest,
  PaymentRoute,
  CreateFxRatePayload,
  ExecutePaymentPayload,
} from "../../types/procurement";
import {
  usePaymentRequests,
  useBankHolds,
  useExecutePaymentRequest,
} from "../../hooks/useProcurement";
import {
  useCashAccounts,
  useFxRates,
  useCreateFxRate,
} from "../../hooks/useTreasury";
import { PayablesPanel } from "./PayablesPanel";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Modal } from "../../components/ui/Modal";

type RouteTab = "all" | "bank" | "market";

export const TreasuryPage: React.FC = () => {
  const { data: cashAccounts = [], isLoading: isLoadingCash, refetch: refetchCash } = useCashAccounts();
  const { data: fxRates = [], isLoading: isLoadingFx, refetch: refetchFx } = useFxRates();
  const { data: bankHolds = [], isLoading: isLoadingHolds, refetch: refetchHolds } = useBankHolds();
  const { data: pendingPayments = [], isLoading: isLoadingPayments, refetch: refetchPayments } = usePaymentRequests({ status: "pending" });
  const { data: allPaymentRequests = [], refetch: refetchAllPayments } = usePaymentRequests();
  const { data: marketPaymentRequests = [], refetch: refetchMarketPayments } = usePaymentRequests({ route: "market" });

  const createFxRateMutation = useCreateFxRate();
  const executePaymentMutation = useExecutePaymentRequest();

  const isLoading = isLoadingCash || isLoadingFx || isLoadingHolds || isLoadingPayments;

  const [activeRouteTab, setActiveRouteTab] = useState<RouteTab>("all");

  const handleRefreshAll = () => {
    refetchCash();
    refetchFx();
    refetchHolds();
    refetchPayments();
    refetchAllPayments();
    refetchMarketPayments();
  };

  // FX Modal State
  const [isFxModalOpen, setIsFxModalOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("LYD");
  const [rate, setRate] = useState<number>(0);

  // Execute Payment Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [fxRateUsed, setFxRateUsed] = useState<number>(5.20);
  const [exactAmountUsedLyd, setExactAmountUsedLyd] = useState<number>(0);
  const [bankReference, setBankReference] = useState<string>("");
  const [extraAllocationNote, setExtraAllocationNote] = useState<string>("");
  const [extraAllocationTouched, setExtraAllocationTouched] = useState(false);

  const bookedRate = selectedPayment?.booked_fx_rate ?? 0;
  const liveExtraAllocationLyd = useMemo(() => {
    if (!selectedPayment) return 0;
    return (Number(fxRateUsed) - Number(bookedRate)) * Number(selectedPayment.amount_requested);
  }, [selectedPayment, fxRateUsed, bookedRate]);

  const requiresNote = Math.abs(liveExtraAllocationLyd) > 0;
  const noteMissing = requiresNote && extraAllocationNote.trim().length === 0;

  const openExecuteModal = (pay: PaymentRequest) => {
    setSelectedPayment(pay);
    setExtraAllocationNote("");
    setExtraAllocationTouched(false);
    setFxRateUsed(5.20);
    setExactAmountUsedLyd(
      pay.bank_hold ? Number(pay.bank_hold.held_amount_lyd) : Number(pay.amount_requested) * 5.2
    );
  };

  const closeExecuteModal = () => {
    setSelectedPayment(null);
    setBankReference("");
    setExtraAllocationNote("");
    setExtraAllocationTouched(false);
  };

  const handleCreateFxRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rate <= 0) return;

    const payload: CreateFxRatePayload = {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      rate,
    };

    createFxRateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تم تسجيل سعر الصرف بنجاح");
        setIsFxModalOpen(false);
        setRate(0);
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "فشل تسجيل سعر الصرف");
      },
    });
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || fxRateUsed <= 0) return;

    if (noteMissing) {
      setExtraAllocationTouched(true);
      toast.error("سبب التكلفة الإضافية مطلوب عند وجود فرق في سعر الصرف.");
      return;
    }

    const payload: ExecutePaymentPayload = {
      fx_rate_used: fxRateUsed,
      exact_amount_used_lyd: exactAmountUsedLyd > 0 ? exactAmountUsedLyd : undefined,
      bank_reference: bankReference.trim() || undefined,
      extra_allocation_note: requiresNote ? extraAllocationNote.trim() : undefined,
    };

    executePaymentMutation.mutate(
      { id: selectedPayment.id, payload },
      {
        onSuccess: () => {
          toast.success("تم تنفيذ الدفع وتسوية الفارق في الخزينة بنجاح!");
          closeExecuteModal();
        },
        onError: (err: unknown) => {
          const payloadErr = apiErrorPayload(err);
          const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
          toast.error(message || "فشل تنفيذ طلب الدفع");
        },
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
            <Wallet className="h-6 w-6 text-app-accent" />
            <span>إدارة الخزينة وسعر الصرف وحجوزات المصارف</span>
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            متابعة أرصدة الحسابات النقدية، أسعار الصرف الحية، وتسوية حوافز وتدفقات الاعتمادات المستندية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
          <button
            onClick={() => setIsFxModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل سعر صرف جديد</span>
          </button>
        </div>
      </div>

      {/* Cash Accounts Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {cashAccounts.length === 0 ? (
          <div className="col-span-3 rounded-2xl border border-dashed border-app-separator bg-app-bg-primary p-4 text-center text-xs text-app-label-secondary">
            لا توجد حسابات خزينة مسجلة حتى الآن.
          </div>
        ) : (
          cashAccounts.map((acc) => (
            <div key={acc.id} className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-label-secondary">{acc.name}</span>
                <span className="rounded-md bg-app-bg-secondary px-2 py-0.5 text-[10px] font-bold text-app-label-primary">
                  {acc.currency}
                </span>
              </div>
              <p className="text-lg font-extrabold text-app-status-positive font-mono">
                {Number(acc.balance).toLocaleString()} {acc.currency}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Two Column Layout: Pending Payments & FX Rates */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pending Payments Section */}
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
            <Send className="h-4 w-4 text-app-accent" />
            <span>طلبات الدفع المالي المعلقة</span>
          </h3>

          {pendingPayments.length === 0 ? (
            <p className="text-xs text-app-label-secondary">لا توجد طلبات دفع معلقة بحاجة للتنفيذ.</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-app-separator bg-app-bg-secondary"
                >
                  <div>
                    <p className="text-xs font-bold text-app-label-primary">
                      طلب دفع #{pay.id.slice(0, 6)} ({pay.route === "bank" ? "اعتماد مصرفي" : "سوق حر"})
                    </p>
                    <p className="text-[11px] text-app-label-secondary font-mono mt-0.5">
                      القيمة: {Number(pay.amount_requested).toLocaleString()} USD
                    </p>
                  </div>
                  <button
                    onClick={() => openExecuteModal(pay)}
                    className="rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                  >
                    تنفيذ الدفع وتسوية
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live FX Rates History Section */}
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-app-accent" />
            <span>أسعار الصرف الرسمية والسائدة</span>
          </h3>

          {fxRates.length === 0 ? (
            <p className="text-xs text-app-label-secondary">لا توجد أسعار صرف مسجلة بالمنظومة.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-secondary">
              <table className="w-full text-xs text-start">
                <thead className="border-b border-app-separator bg-app-bg-primary text-app-label-secondary">
                  <tr>
                    <th className="px-3 py-2 text-start font-bold">الزوج النقدي</th>
                    <th className="px-3 py-2 text-start font-bold">سعر الصرف</th>
                    <th className="px-3 py-2 text-start font-bold">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-separator text-app-label-primary">
                  {fxRates.map((fx) => (
                    <tr key={fx.id}>
                      <td className="px-3 py-2 font-bold">{fx.from_currency} / {fx.to_currency}</td>
                      <td className="px-3 py-2 font-mono font-extrabold text-app-status-positive">{Number(fx.rate).toFixed(4)}</td>
                      <td className="px-3 py-2 text-app-label-secondary font-mono text-[11px]">
                        {new Date(fx.captured_at).toLocaleString("ar-LY")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PayablesPanel />

      {/* Payment Routes Tab Strip — All / Bank / Black market (حوالات السوق) */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
            <Send className="h-4 w-4 text-app-accent" />
            <span>سجل طلبات الدفع حسب المسار</span>
          </h3>
          <div className="inline-flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-secondary p-1">
            {(["all", "bank", "market"] as RouteTab[]).map((tab) => {
              const labels: Record<RouteTab, string> = {
                all: "الكل",
                bank: "اعتمادات بنكية",
                market: "حوالات السوق",
              };
              const isActive = activeRouteTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveRouteTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    isActive
                      ? "bg-app-accent text-white shadow-sm"
                      : "text-app-label-secondary hover:text-app-label-primary"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        <BlackMarketTable
          tab={activeRouteTab}
          allRows={allPaymentRequests}
          marketRows={marketPaymentRequests}
        />
      </div>

      {/* Bank Holds Summary Table */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-app-accent" />
          <span>سجل الحجوزات البنكية والإفراج عن الفروقات (Bank Buffer Holds)</span>
        </h3>

        {bankHolds.length === 0 ? (
          <p className="text-xs text-app-label-secondary">لا توجد حركات حجز احتياطي مصرفية مسجلة.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-secondary">
            <table className="w-full text-xs text-start">
              <thead className="border-b border-app-separator bg-app-bg-primary text-app-label-secondary">
                <tr>
                  <th className="px-3 py-2 text-start font-bold">معرف الحجز</th>
                  <th className="px-3 py-2 text-start font-bold">المبلغ المحجوز بالدينار (Held LYD)</th>
                  <th className="px-3 py-2 text-start font-bold">المبلغ الفعلي المنصرف</th>
                  <th className="px-3 py-2 text-start font-bold">المبلغ المفرج عنه لحساب الشركة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-separator text-app-label-primary">
                {bankHolds.map((bh) => (
                  <tr key={bh.id}>
                    <td className="px-3 py-2 font-mono font-bold">#{bh.id.slice(0, 6)}</td>
                    <td className="px-3 py-2 font-mono">{Number(bh.held_amount_lyd).toLocaleString()} LYD</td>
                    <td className="px-3 py-2 font-mono text-app-status-warning">{Number(bh.exact_amount_used).toLocaleString()} LYD</td>
                    <td className="px-3 py-2 font-mono font-bold text-app-status-positive">
                      +{Number(bh.released_amount).toLocaleString()} LYD (مفرج)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record FX Rate Modal */}
      <Modal
        isOpen={isFxModalOpen}
        onClose={() => setIsFxModalOpen(false)}
        title="تسجيل سعر صرف جديد"
        size="md"
      >
        <form onSubmit={handleCreateFxRate} className="space-y-4" dir="rtl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">من عملة</label>
              <input
                type="text"
                required
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">إلى عملة</label>
              <input
                type="text"
                required
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              سعر الصرف (Exchange Rate) <span className="text-app-status-danger">*</span>
            </label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              required
              value={rate || ""}
              onChange={(e) => setRate(Number(e.target.value))}
              placeholder="5.2000"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
            <button
              type="button"
              onClick={() => setIsFxModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createFxRateMutation.isPending || rate <= 0}
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {createFxRateMutation.isPending ? "جاري الحفظ..." : "حفظ سعر الصرف"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Execute Payment Modal */}
      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={closeExecuteModal}
        title="تنفيذ تسوية الدفع وتثبيت العملة"
        description={selectedPayment ? `المبلغ المطلوب: ${Number(selectedPayment.amount_requested).toLocaleString()} USD` : undefined}
        size="md"
      >
        {selectedPayment && (
          <form onSubmit={handleExecutePayment} className="space-y-4" dir="rtl">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                سعر الصرف المنفذ فعلياً <span className="text-app-status-danger">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                required
                value={fxRateUsed || ""}
                onChange={(e) => setFxRateUsed(Number(e.target.value))}
                placeholder="5.2000"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:outline-none"
              />
              {bookedRate > 0 ? (
                <p className="mt-1 text-[10px] text-app-label-secondary font-mono">
                  السعر المرجعي المحجوز: {Number(bookedRate).toFixed(4)}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                المبلغ المنصرف الفعلي بالدينار (Exact LYD Used)
              </label>
              <input
                type="number"
                step="0.01"
                value={exactAmountUsedLyd || ""}
                onChange={(e) => setExactAmountUsedLyd(Number(e.target.value))}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                الرقم المرجعي للإشعار البنكي / الحوالة
              </label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="BNK-TRF-900800"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>

            {requiresNote ? (
              <div className="rounded-xl border border-app-status-warning/40 bg-app-status-warning/10 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-app-status-warning">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    التكلفة الإضافية (فرق سعر الصرف)
                  </span>
                  <span className="font-mono">
                    {liveExtraAllocationLyd > 0 ? "+" : ""}
                    {Number(liveExtraAllocationLyd).toLocaleString()} LYD
                  </span>
                </div>
                <label className="block text-[11px] font-bold text-app-label-primary">
                  سبب التكلفة الإضافية <span className="text-app-status-danger">*</span>
                </label>
                <textarea
                  required
                  value={extraAllocationNote}
                  onChange={(e) => {
                    setExtraAllocationNote(e.target.value);
                    setExtraAllocationTouched(true);
                  }}
                  onBlur={() => setExtraAllocationTouched(true)}
                  rows={2}
                  placeholder="مثال: شراء عبر الصرّاف بسبب تأخر الاعتماد البنكي"
                  className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
                {extraAllocationTouched && noteMissing ? (
                  <p className="text-[10px] text-app-status-danger font-bold">
                    السبب مطلوب عند وجود فرق في سعر الصرف عن السعر المرجعي.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
              <button
                type="button"
                onClick={closeExecuteModal}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={executePaymentMutation.isPending || fxRateUsed <= 0 || noteMissing}
                className="rounded-xl bg-app-status-positive px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {executePaymentMutation.isPending ? "جاري التأكيد..." : "تأكيد الدفع والتسوية"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

interface BlackMarketTableProps {
  tab: RouteTab;
  allRows: PaymentRequest[];
  marketRows: PaymentRequest[];
}

const BlackMarketTable: React.FC<BlackMarketTableProps> = ({ tab, allRows, marketRows }) => {
  const rows = tab === "market" ? marketRows : allRows;
  const visible = tab === "bank" ? rows.filter((r) => r.route === ("bank" as PaymentRoute)) : rows;

  if (visible.length === 0) {
    return (
      <p className="text-xs text-app-label-secondary">
        {tab === "market" ? "لا توجد حوالات سوق حالية." : "لا توجد طلبات دفع مسجلة."}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-secondary">
      <table className="w-full text-xs text-start">
        <thead className="border-b border-app-separator bg-app-bg-primary text-app-label-secondary">
          <tr>
            <th className="px-3 py-2 text-start font-bold">المعرف</th>
            <th className="px-3 py-2 text-start font-bold">المسار</th>
            <th className="px-3 py-2 text-start font-bold">المبلغ الأجنبي</th>
            <th className="px-3 py-2 text-start font-bold">سعر الصرف</th>
            <th className="px-3 py-2 text-start font-bold">التكلفة الإضافية (LYD)</th>
            <th className="px-3 py-2 text-start font-bold">الملاحظة</th>
            <th className="px-3 py-2 text-start font-bold">الحالة</th>
            <th className="px-3 py-2 text-start font-bold">التاريخ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-separator text-app-label-primary">
          {visible.map((row) => {
            const extra = row.extra_allocation_lyd;
            return (
              <tr key={row.id} className="hover:bg-app-fill-f1/40">
                <td className="px-3 py-2 font-mono">#{row.id.slice(0, 6)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      row.route === "bank"
                        ? "bg-app-accent-subtle text-app-accent"
                        : "bg-app-status-warning/15 text-app-status-warning"
                    }`}
                  >
                    {row.route === "bank" ? "اعتماد مصرفي" : "سوق حر"}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono font-bold">
                  {Number(row.amount_requested).toLocaleString()} USD
                </td>
                <td className="px-3 py-2 font-mono">
                  {row.fx_rate_used !== null && row.fx_rate_used !== undefined
                    ? Number(row.fx_rate_used).toFixed(4)
                    : "—"}
                </td>
                <td className="px-3 py-2 font-mono">
                  {extra === null || extra === undefined ? (
                    <span className="text-app-label-tertiary">—</span>
                  ) : Math.abs(Number(extra)) < 0.0001 ? (
                    <span className="text-app-label-tertiary">0.0000</span>
                  ) : (
                    <span
                      className={
                        Number(extra) > 0
                          ? "text-app-status-warning font-bold"
                          : "text-app-status-positive font-bold"
                      }
                    >
                      {Number(extra) > 0 ? "+" : ""}
                      {Number(extra).toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-app-label-secondary max-w-xs truncate">
                  {row.extra_allocation_note || "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      row.status === "paid"
                        ? "bg-app-status-positive/15 text-app-status-positive"
                        : row.status === "rejected"
                        ? "bg-app-status-danger/15 text-app-status-danger"
                        : "bg-app-status-warning/15 text-app-status-warning"
                    }`}
                  >
                    {row.status === "paid" ? "مدفوع" : row.status === "rejected" ? "مرفوض" : "معلق"}
                  </span>
                </td>
                <td className="px-3 py-2 text-app-label-secondary font-mono text-[10px]">
                  {row.created_at ? new Date(row.created_at).toLocaleString("ar-LY") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TreasuryPage;
