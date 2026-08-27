import React, { useState } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Send,
} from "lucide-react";
import { isAxiosError } from "axios";
import {
  PaymentRequest,
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

export const TreasuryPage: React.FC = () => {
  const { data: cashAccounts = [], isLoading: isLoadingCash, refetch: refetchCash } = useCashAccounts();
  const { data: fxRates = [], isLoading: isLoadingFx, refetch: refetchFx } = useFxRates();
  const { data: bankHolds = [], isLoading: isLoadingHolds, refetch: refetchHolds } = useBankHolds();
  const { data: pendingPayments = [], isLoading: isLoadingPayments, refetch: refetchPayments } = usePaymentRequests({ status: "pending" });

  const createFxRateMutation = useCreateFxRate();
  const executePaymentMutation = useExecutePaymentRequest();

  const isLoading = isLoadingCash || isLoadingFx || isLoadingHolds || isLoadingPayments;

  const handleRefreshAll = () => {
    refetchCash();
    refetchFx();
    refetchHolds();
    refetchPayments();
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

    const payload: ExecutePaymentPayload = {
      fx_rate_used: fxRateUsed,
      exact_amount_used_lyd: exactAmountUsedLyd > 0 ? exactAmountUsedLyd : undefined,
      bank_reference: bankReference.trim() || undefined,
    };

    executePaymentMutation.mutate(
      { id: selectedPayment.id, payload },
      {
        onSuccess: () => {
          toast.success("تم تنفيذ الدفع وتسوية الفارق في الخزينة بنجاح!");
          setSelectedPayment(null);
          setBankReference("");
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
                    onClick={() => {
                      setSelectedPayment(pay);
                      setExactAmountUsedLyd(
                        pay.bank_hold ? Number(pay.bank_hold.held_amount_lyd) : Number(pay.amount_requested) * 5.2
                      );
                    }}
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
        onClose={() => setSelectedPayment(null)}
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

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={executePaymentMutation.isPending || fxRateUsed <= 0}
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

export default TreasuryPage;
