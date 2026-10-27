import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  Building2,
  Clock,
  FileText,
  Landmark,
  Package,
  Play,
  Plus,
  Receipt,
  ShoppingCart,
  Split,
  Trash2,
  UserPlus,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import {
  useCheckout,
  useConvertQuotation,
  useCreateQuotation,
  useDeleteHeldCart,
  useHeldCarts,
  useHoldCart,
  usePaymentAccounts,
} from "../../hooks/useSales";
import { useClients } from "../../hooks/useClients";
import { useOperatingUnits } from "../../hooks/useOperatingUnits";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import {
  CartLine,
  CartLineInput,
  CheckoutInput,
  HeldCart,
  HeldCartPayload,
  PAYMENT_METHOD_LABEL,
  PaymentMethod,
  Quotation,
  SALES_ERROR_MESSAGE,
  Sale,
  SplitPaymentPortionInput,
  formatSizeCm,
} from "../../api/endpoints/sales";
import { InventoryItem, suggestedPrice } from "../../api/endpoints/inventory";
import { Bundle } from "../../api/endpoints/bundles";
import { apiErrorMessage, apiErrorPayload } from "../../api/endpoints/production";
import type { Client, OperatingUnit } from "../../types/entities";
import { toast } from "../../stores/toastStore";
import { SearchableSelect } from "../ui/SearchableSelect";
import { QuickClientDialog } from "../clients/QuickClientDialog";
import { ProductPickerDialog } from "./ProductPickerDialog";
import { BundlePickerDialog } from "../sales/BundlePickerDialog";
import { BlockPicker, PickedBlock } from "./BlockPicker";
import { SaleCompletedDialog } from "./SaleCompletedDialog";
import { CashTenderModal } from "./CashTenderModal";
import { SplitPaymentModal } from "./SplitPaymentModal";
import { QuotationPrintDialog } from "../print/SalesDocuments";
import { formatNumber } from "../../lib/utils/format";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const newRequestId = () => crypto.randomUUID();

function parseHeldCartPayload(raw: unknown): HeldCartPayload | null {
  try {
    let parsed = raw;
    if (typeof raw === "string") {
      parsed = JSON.parse(raw);
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as Record<string, unknown>).version === 1 &&
      Array.isArray((parsed as Record<string, unknown>).cart)
    ) {
      return parsed as HeldCartPayload;
    }
    return null;
  } catch {
    return null;
  }
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return "منذ لحظات";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "منذ يوم";
  if (diffDays === 2) return "منذ يومين";
  if (diffDays <= 10) return `منذ ${diffDays} أيام`;
  return `منذ ${diffDays} يوماً`;
}

type BuyerMode = "client" | "walk_in" | "internal";

interface NewSalePanelProps {
  /** A quotation the client came back with — its lines load into the cart. */
  loadedQuotation: Quotation | null;
  onQuotationDone: () => void;
}

export const NewSalePanel: React.FC<NewSalePanelProps> = ({ loadedQuotation, onQuotationDone }) => {
  const navigate = useNavigate();
  const currentUnitId = useServerConfigStore((s) => s.operatingUnitId);

  const [buyerMode, setBuyerMode] = useState<BuyerMode>("client");
  const [clientId, setClientId] = useState<string | null>(null);
  const [buyerUnitId, setBuyerUnitId] = useState<string | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashAccountId, setCashAccountId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState("");
  const [requestId, setRequestId] = useState(newRequestId);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isBundlePickerOpen, setIsBundlePickerOpen] = useState(false);
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
  const [isCashTenderOpen, setIsCashTenderOpen] = useState(false);
  const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);
  const [blockPicker, setBlockPicker] = useState<{ item: InventoryItem; editingKey: string | null } | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [printQuotationId, setPrintQuotationId] = useState<string | null>(null);

  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [holdCartLabel, setHoldCartLabel] = useState("");
  const [holdCartError, setHoldCartError] = useState<string | null>(null);

  const [isHeldCartsDialogOpen, setIsHeldCartsDialogOpen] = useState(false);
  const [resumeConfirmCart, setResumeConfirmCart] = useState<HeldCart | null>(null);
  const [deletingCartId, setDeletingCartId] = useState<string | null>(null);

  const { data: clients = [] } = useClients();
  const { data: units = [] } = useOperatingUnits();
  const { data: paymentAccounts = [] } = usePaymentAccounts();
  const checkout = useCheckout();
  const convert = useConvertQuotation();
  const createQuotation = useCreateQuotation();
  const { data: heldCarts = [] } = useHeldCarts();
  const holdCart = useHoldCart();
  const deleteHeldCart = useDeleteHeldCart();

  const client = buyerMode === "client" ? (clients.find((c) => c.id === clientId) ?? null) : null;
  const otherUnits = units.filter((u) => u.id !== currentUnitId);
  const isInternal = buyerMode === "internal";
  const isWalkIn = buyerMode === "walk_in";
  const treasuries = paymentAccounts.filter((a) => a.kind === method);
  const linkedTreasuries = treasuries.filter((a) => a.account_id);

  // A quotation the client came back with fills the cart.
  useEffect(() => {
    if (!loadedQuotation) return;
    setBuyerMode("client");
    setClientId(loadedQuotation.client_id);
    setWalkInName("");
    setWalkInPhone("");
    setNotes(loadedQuotation.notes ?? null);
    const qInvDiscount = Number(loadedQuotation.invoice_discount ?? 0);
    setInvoiceDiscount(qInvDiscount > 0 ? String(qInvDiscount) : "");
    setCart(
      (loadedQuotation.lines ?? []).map((l) => {
        const lineDisc = Number(l.discount_amount ?? 0);
        return {
          key: crypto.randomUUID(),
          lineType: l.line_type,
          itemId: l.inventory_item_id ?? undefined,
          bundleId: l.bundle_id ?? undefined,
          name: l.description ?? l.bundle?.name ?? l.inventory_item?.name ?? "",
          code: l.inventory_item?.code,
          qty: String(Number(l.quantity)),
          price: String(Number(l.unit_price)),
          discount: lineDisc > 0 ? String(lineDisc) : "",
          size: l.length_m && l.width_m && l.height_m
            ? { length_m: Number(l.length_m), width_m: Number(l.width_m), height_m: Number(l.height_m) }
            : null,
        };
      }),
    );
    setRequestId(newRequestId());
    setError(null);
  }, [loadedQuotation]);

  // One linked treasury of the chosen kind is picked for the cashier.
  useEffect(() => {
    if (method === "receivable" || method === "split") {
      setCashAccountId(null);
    } else if (!linkedTreasuries.some((a) => a.id === cashAccountId)) {
      setCashAccountId(linkedTreasuries.length === 1 ? linkedTreasuries[0].id : null);
    }
  }, [method, linkedTreasuries, cashAccountId]);

  // Reset method if split is selected without client or in internal mode, or receivable in walk-in mode
  useEffect(() => {
    if ((isInternal || (buyerMode === "client" && !clientId)) && method === "split") {
      setMethod("cash");
    } else if (isWalkIn && method === "receivable") {
      setMethod("cash");
    }
  }, [isInternal, isWalkIn, buyerMode, clientId, method]);

  const grossTotal = useMemo(() => cart.reduce((s, l) => s + num(l.qty) * num(l.price), 0), [cart]);
  const lineDiscountsTotal = useMemo(
    () => (isInternal ? 0 : cart.reduce((s, l) => s + Math.max(0, num(l.discount)), 0)),
    [cart, isInternal],
  );
  const subtotal = grossTotal - lineDiscountsTotal;
  const invDiscount = isInternal ? 0 : num(invoiceDiscount);
  const invoiceDiscountInvalid = !isInternal && (invDiscount < 0 || invDiscount > subtotal);
  const totalDiscount = lineDiscountsTotal + Math.max(0, invDiscount);
  const total = Math.max(0, subtotal - Math.max(0, invDiscount));
  const creditLimit = Number(client?.credit_limit ?? 0);
  const balance = Number(client?.current_balance ?? 0);
  const available = creditLimit - balance;
  const needsApproval = method === "receivable" && client !== null && total > available;
  const hasBundle = cart.some((l) => l.lineType === "bundle");

  const resetCart = () => {
    setCart([]);
    setInvoiceDiscount("");
    setRequestId(newRequestId());
    setError(null);
    setNotes(null);
    if (loadedQuotation) onQuotationDone();
  };

  const updateLine = (key: string, patch: Partial<CartLine>) =>
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const addItem = (item: InventoryItem) => {
    setIsProductPickerOpen(false);
    if (item.item_type === "foam_block") {
      setBlockPicker({ item, editingKey: null });
      return;
    }
    const existing = cart.find((l) => l.lineType === "item" && l.itemId === item.id && !l.stockLotId);
    if (existing) {
      updateLine(existing.key, { qty: String(num(existing.qty) + 1) });
      return;
    }
    const unitPrice = suggestedPrice(item, 1);
    setCart((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        lineType: "item",
        itemId: item.id,
        name: item.name,
        code: item.code,
        qty: "1",
        price: unitPrice !== null ? String(unitPrice) : "",
        discount: "",
      },
    ]);
  };

  const addBundle = (bundle: Bundle, suggestedTotal: number | null) => {
    if (isInternal) return;
    setCart((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        lineType: "bundle",
        bundleId: bundle.id,
        name: bundle.name,
        qty: "1",
        price: suggestedTotal !== null ? String(suggestedTotal) : "",
        discount: "",
      },
    ]);
  };

  const pickBlock = (block: PickedBlock) => {
    if (!blockPicker) return;
    const { item, editingKey } = blockPicker;
    const size = block.id ? { length_m: block.length_m, width_m: block.width_m, height_m: block.height_m } : null;
    const unitPrice = size ? suggestedPrice(item, 1, size) : null;

    if (editingKey) {
      updateLine(editingKey, {
        stockLotId: block.id || null,
        stockLotLabel: block.lot_number || null,
        size,
        qty: "1",
        ...(unitPrice !== null ? { price: String(unitPrice) } : {}),
      });
      return;
    }
    if (!block.id) return;
    setCart((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        lineType: "item",
        itemId: item.id,
        name: item.name,
        code: item.code,
        qty: "1",
        price: unitPrice !== null ? String(unitPrice) : "",
        discount: "",
        stockLotId: block.id,
        stockLotLabel: block.lot_number,
        size,
      },
    ]);
  };

  const cartLines = (): CartLineInput[] =>
    cart.map((l) => {
      const disc = isInternal ? 0 : num(l.discount);
      return {
        line_type: l.lineType,
        inventory_item_id: l.itemId ?? null,
        bundle_id: l.bundleId ?? null,
        stock_lot_id: l.stockLotId ?? null,
        quantity: num(l.qty),
        unit_price: num(l.price),
        ...(isInternal ? {} : { discount_amount: disc }),
        length_m: l.size?.length_m ?? null,
        width_m: l.size?.width_m ?? null,
        height_m: l.size?.height_m ?? null,
      };
    });

  const buyerPayload = (): Pick<CheckoutInput, "client_id" | "buyer_unit_id" | "walk_in_name" | "walk_in_phone"> => {
    if (isInternal) {
      return { client_id: null, buyer_unit_id: buyerUnitId };
    }
    if (isWalkIn) {
      const trimmedName = walkInName.trim();
      const trimmedPhone = walkInPhone.trim();
      return {
        ...(trimmedName ? { walk_in_name: trimmedName } : {}),
        ...(trimmedPhone ? { walk_in_phone: trimmedPhone } : {}),
      };
    }
    return { client_id: clientId, buyer_unit_id: null };
  };

  const onSold = (sale: Sale) => {
    resetCart();
    if (!isInternal) setClientId(null);
    setWalkInName("");
    setWalkInPhone("");

    if (sale.status === "pending_approval") {
      toast.warning(`البيع ${sale.order_number} تجاوز سقف ائتمان العميل وينتظر موافقة المدير.`);
      return;
    }

    toast.success(`تم البيع ${sale.order_number}`);
    const bundleLine = sale.lines?.find((l) => l.line_type === "bundle");
    if (bundleLine) {
      navigate(`/sales/${sale.id}/bundles/${bundleLine.id}`);
      return;
    }
    setCompletedSale(sale);
  };

  const fail = (err: unknown) => {
    const payload = apiErrorPayload(err);
    const fieldError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    setError(
      (payload?.code && SALES_ERROR_MESSAGE[payload.code]) || fieldError || payload?.message || "تعذّر إتمام العملية.",
    );
  };

  const executeCheckout = (tenderedAmount?: number) => {
    setError(null);
    const lines = cartLines();

    if (loadedQuotation) {
      convert.mutate(
        {
          id: loadedQuotation.id,
          client_request_id: requestId,
          payment_method: method,
          cash_account_id: cashAccountId,
          notes: notes ?? undefined,
          invoice_discount: invDiscount,
          lines,
          tendered_amount: tenderedAmount,
        },
        {
          onSuccess: (sale) => {
            setIsCashTenderOpen(false);
            onSold(sale);
          },
          onError: (err) => {
            setIsCashTenderOpen(false);
            fail(err);
          },
        },
      );
      return;
    }

    checkout.mutate(
      {
        client_request_id: requestId,
        ...buyerPayload(),
        payment_method: isInternal ? null : method,
        cash_account_id: isInternal ? null : cashAccountId,
        notes: notes ?? undefined,
        ...(isInternal ? {} : { invoice_discount: invDiscount }),
        lines,
        tendered_amount: tenderedAmount,
      },
      {
        onSuccess: (sale) => {
          setIsCashTenderOpen(false);
          onSold(sale);
        },
        onError: (err) => {
          setIsCashTenderOpen(false);
          fail(err);
        },
      },
    );
  };

  const executeSplitCheckout = (portions: SplitPaymentPortionInput[]) => {
    setError(null);
    const lines = cartLines();

    if (loadedQuotation) {
      convert.mutate(
        {
          id: loadedQuotation.id,
          client_request_id: requestId,
          payment_method: "split",
          notes: notes ?? undefined,
          invoice_discount: invDiscount,
          lines,
          payments: portions,
        },
        {
          onSuccess: (sale) => {
            setIsSplitPaymentOpen(false);
            onSold(sale);
          },
          onError: (err) => {
            setIsSplitPaymentOpen(false);
            fail(err);
          },
        },
      );
      return;
    }

    checkout.mutate(
      {
        client_request_id: requestId,
        ...buyerPayload(),
        payment_method: "split",
        notes: notes ?? undefined,
        invoice_discount: invDiscount,
        lines,
        payments: portions,
      },
      {
        onSuccess: (sale) => {
          setIsSplitPaymentOpen(false);
          onSold(sale);
        },
        onError: (err) => {
          setIsSplitPaymentOpen(false);
          fail(err);
        },
      },
    );
  };

  const submit = () => {
    setError(null);
    if (!isInternal && method === "cash") {
      setIsCashTenderOpen(true);
      return;
    }
    if (!isInternal && method === "split") {
      setIsSplitPaymentOpen(true);
      return;
    }
    executeCheckout();
  };

  const saveQuotation = () => {
    if (buyerMode !== "client" || !clientId) return;
    setError(null);
    createQuotation.mutate(
      { client_id: clientId, notes: notes ?? undefined, invoice_discount: invDiscount, lines: cartLines() },
      {
        onSuccess: (quotation) => {
          toast.success(`تم حفظ عرض السعر ${quotation.quotation_number}`);
          resetCart();
          setPrintQuotationId(quotation.id);
        },
        onError: fail,
      },
    );
  };

  const handleHoldCart = () => {
    setHoldCartError(null);
    const trimmedWalkInName = walkInName.trim();
    const trimmedWalkInPhone = walkInPhone.trim();
    const trimmedInvDisc = invoiceDiscount.trim();
    const payload: HeldCartPayload = {
      version: 1,
      cart,
      ...(!isInternal && trimmedInvDisc ? { invoiceDiscount: trimmedInvDisc } : {}),
      client_id: buyerMode === "client" ? clientId : null,
      buyer_mode: buyerMode,
      buyer_unit_id: isInternal ? buyerUnitId : null,
      ...(isWalkIn && trimmedWalkInName ? { walkInName: trimmedWalkInName } : {}),
      ...(isWalkIn && trimmedWalkInPhone ? { walkInPhone: trimmedWalkInPhone } : {}),
      payment_method: isInternal ? null : method,
      cash_account_id: isInternal ? null : cashAccountId,
      notes: notes ?? null,
    };

    holdCart.mutate(
      {
        label: holdCartLabel.trim() || null,
        client_id: buyerMode === "client" ? clientId : null,
        payload,
        total,
        line_count: cart.length,
      },
      {
        onSuccess: () => {
          setIsHoldDialogOpen(false);
          setHoldCartLabel("");
          resetCart();
          if (buyerMode === "client") setClientId(null);
          if (isInternal) setBuyerUnitId(null);
          setWalkInName("");
          setWalkInPhone("");
          toast.success("تم تعليق الفاتورة بنجاح");
        },
        onError: (err) => {
          const p = apiErrorPayload(err);
          const msg =
            (p?.code && SALES_ERROR_MESSAGE[p.code]) || apiErrorMessage(err, "تعذر تعليق الفاتورة.");
          setHoldCartError(msg);
        },
      },
    );
  };

  const executeResume = (hc: HeldCart, payload: HeldCartPayload) => {
    setCart(
      payload.cart.map((l) => ({
        ...l,
        key: l.key || crypto.randomUUID(),
        discount: l.discount ?? "",
      })),
    );
    const resumedMode: BuyerMode =
      payload.buyer_mode === "walk_in"
        ? "walk_in"
        : payload.buyer_mode === "internal" || Boolean(payload.buyer_unit_id)
          ? "internal"
          : payload.client_id
            ? "client"
            : "walk_in";
    setBuyerMode(resumedMode);
    setInvoiceDiscount(
      resumedMode === "internal" || !payload.invoiceDiscount ? "" : String(payload.invoiceDiscount),
    );
    setClientId(resumedMode === "client" ? (payload.client_id ?? null) : null);
    setBuyerUnitId(resumedMode === "internal" ? (payload.buyer_unit_id ?? null) : null);
    setWalkInName(resumedMode === "walk_in" ? (payload.walkInName ?? "") : "");
    setWalkInPhone(resumedMode === "walk_in" ? (payload.walkInPhone ?? "") : "");
    const resumedMethod = payload.payment_method ?? "cash";
    setMethod(resumedMode === "walk_in" && resumedMethod === "receivable" ? "cash" : resumedMethod);
    setCashAccountId(payload.cash_account_id ?? null);
    setNotes(payload.notes ?? null);
    setRequestId(newRequestId());
    setError(null);
    if (loadedQuotation) {
      onQuotationDone();
    }

    deleteHeldCart.mutate(hc.id, {
      onError: (err) => {
        toast.warning(apiErrorMessage(err, "تعذر حذف الفاتورة المعلقة من الخادم بعد استئنافها."));
      },
    });

    setIsHeldCartsDialogOpen(false);
    setResumeConfirmCart(null);
    toast.success("تم استئناف الفاتورة بنجاح");
  };

  const handleResumeClick = (hc: HeldCart) => {
    const parsed = parseHeldCartPayload(hc.payload);
    if (!parsed || parsed.version !== 1) {
      toast.error("تعذر استئناف هذه الفاتورة");
      return;
    }

    if (cart.length > 0) {
      setResumeConfirmCart(hc);
    } else {
      executeResume(hc, parsed);
    }
  };

  const handleDeleteHeldCart = () => {
    if (!deletingCartId) return;
    deleteHeldCart.mutate(deletingCartId, {
      onSuccess: () => {
        setDeletingCartId(null);
        toast.success("تم حذف الفاتورة المعلقة");
      },
      onError: (err) => {
        toast.error(apiErrorMessage(err, "تعذر حذف الفاتورة المعلقة."));
      },
    });
  };

  const linesValid =
    cart.length > 0 &&
    cart.every((l) => {
      const qtyVal = num(l.qty);
      const priceVal = num(l.price);
      const lineGross = qtyVal * priceVal;
      const discVal = isInternal ? 0 : num(l.discount);
      return (
        qtyVal > 0 &&
        l.price.trim() !== "" &&
        priceVal >= 0 &&
        (l.lineType === "item" || priceVal > 0) &&
        discVal >= 0 &&
        discVal <= lineGross
      );
    });
  const buyerValid = isInternal ? Boolean(buyerUnitId) : isWalkIn ? true : Boolean(clientId);
  const paymentValid = isInternal || method === "receivable" || method === "split" || Boolean(cashAccountId);
  const canCheckout = linesValid && !invoiceDiscountInvalid && buyerValid && paymentValid && (isInternal || total > 0);
  const isBusy = checkout.isPending || convert.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-sm font-bold text-app-label-primary">فاتورة نقطة البيع</h2>
        <button
          type="button"
          onClick={() => setIsHeldCartsDialogOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-primary px-3.5 py-1.5 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1 transition-colors shadow-sm"
        >
          <Clock className="h-4 w-4 text-app-accent" />
          <span>الفواتير المعلقة</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              heldCarts.length > 0 ? "bg-app-accent text-white" : "bg-app-bg-secondary text-app-label-secondary"
            }`}
          >
            {heldCarts.length}
          </span>
        </button>
      </div>

      {loadedQuotation && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-app-accent/40 bg-app-accent/10 p-3 text-xs">
          <span className="flex items-center gap-2 font-semibold text-app-accent">
            <FileText className="h-4 w-4" />
            تحويل عرض السعر <span className="font-mono">{loadedQuotation.quotation_number}</span> إلى بيع — يمكن تعديل الأسعار قبل الإتمام.
          </span>
          <button type="button" onClick={resetCart} className="text-app-label-secondary hover:text-app-status-danger">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Buyer */}
      <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold text-app-label-primary">
            <UserRound className="h-4 w-4 text-app-accent" />
            المشتري
          </h3>
          {!loadedQuotation && (
            <div className="inline-flex rounded-xl border border-app-separator p-0.5 bg-app-bg-secondary">
              {([
                { value: "client", label: "عميل", icon: UserRound },
                { value: "walk_in", label: "زبون عام", icon: UserRound },
                { value: "internal", label: "وحدة داخلية", icon: Building2 },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setBuyerMode(opt.value);
                    if (opt.value === "internal") {
                      setCart((prev) => prev.filter((l) => l.lineType === "item").map((l) => ({ ...l, discount: "" })));
                      setInvoiceDiscount("");
                    }
                    if (opt.value === "walk_in" && method === "receivable") setMethod("cash");
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold ${
                    buyerMode === opt.value ? "bg-app-bg-primary text-app-accent shadow-sm" : "text-app-label-secondary"
                  }`}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isInternal ? (
          <div className="space-y-1">
            <SearchableSelect<OperatingUnit>
              options={otherUnits}
              value={otherUnits.find((u) => u.id === buyerUnitId) ?? null}
              onChange={(u) => setBuyerUnitId(u ? u.id : null)}
              getOptionId={(u) => u.id}
              getOptionLabel={(u) => u.name}
              placeholder="اختر الوحدة المستلمة…"
              size="sm"
            />
            <p className="text-[11px] text-app-label-tertiary">
              التحويل الداخلي ينقل الأصناف بسعر التكلفة — بدون دفع ولا إيراد. الحزم لا تُحوَّل داخلياً.
            </p>
          </div>
        ) : isWalkIn ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              maxLength={100}
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="اسم الزبون (اختياري)"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
            />
            <input
              type="tel"
              maxLength={30}
              value={walkInPhone}
              onChange={(e) => setWalkInPhone(e.target.value)}
              placeholder="رقم الهاتف (اختياري)"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableSelect<Client>
                  options={clients}
                  value={client}
                  onChange={(c) => setClientId(c ? c.id : null)}
                  getOptionId={(c) => c.id}
                  getOptionLabel={(c) => c.entity?.name ?? c.id}
                  getOptionSubLabel={(c) => c.entity?.primary_contact?.phone ?? undefined}
                  getOptionSearchText={(c) => `${c.entity?.name ?? ""} ${c.entity?.primary_contact?.phone ?? ""}`}
                  placeholder="ابحث عن العميل بالاسم أو الهاتف…"
                  disabled={Boolean(loadedQuotation)}
                  size="sm"
                />
              </div>
              {!loadedQuotation && (
                <button
                  type="button"
                  onClick={() => setIsQuickClientOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-app-accent/40 bg-app-accent/10 px-3 text-xs font-bold text-app-accent hover:bg-app-accent/15"
                >
                  <UserPlus className="h-4 w-4" />
                  عميل جديد
                </button>
              )}
            </div>
            {client && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-app-label-secondary font-mono">
                <span>سقف الائتمان {formatNumber(creditLimit)}</span>
                <span>الرصيد المستحق {formatNumber(balance)}</span>
                <span className={available > 0 ? "text-app-status-positive" : "text-app-status-danger"}>
                  المتاح {formatNumber(available)}
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Payment */}
      {!isInternal && (
        <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold text-app-label-primary">
            <Wallet className="h-4 w-4 text-app-accent" />
            طريقة الدفع
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { value: "cash", icon: Wallet, label: PAYMENT_METHOD_LABEL.cash },
                { value: "bank", icon: Landmark, label: PAYMENT_METHOD_LABEL.bank },
                {
                  value: "receivable",
                  icon: FileText,
                  label: PAYMENT_METHOD_LABEL.receivable,
                  disabled: isWalkIn,
                  tooltip: isWalkIn ? "البيع الآجل أو بالشيك يتطلب عميلاً مسجلاً" : undefined,
                },
                {
                  value: "split",
                  icon: Split,
                  label: PAYMENT_METHOD_LABEL.split,
                  disabled: isInternal || (buyerMode === "client" && !clientId),
                  tooltip: buyerMode === "client" && !clientId ? "يتطلب اختيار عميل" : undefined,
                },
              ] as {
                value: PaymentMethod;
                icon: typeof Wallet;
                label: string;
                disabled?: boolean;
                tooltip?: string;
              }[]
            ).map((opt) => (
              <div key={opt.value} title={opt.tooltip} className="w-full">
                <button
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => setMethod(opt.value)}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                    method === opt.value
                      ? "border-app-accent bg-app-accent text-white"
                      : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:text-app-label-primary"
                  } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              </div>
            ))}
          </div>

          {isWalkIn && (
            <p className="text-[11px] text-app-label-tertiary">
              البيع الآجل أو بالشيك يتطلب عميلاً مسجلاً
            </p>
          )}

          {method === "split" ? (
            <p className="text-[11px] text-app-label-secondary">
              يتم تحديد طرق الدفع (نقداً / مصرف / شيك) والخزائن والمبالغ لكل دفعة عند إتمام البيع.
            </p>
          ) : method !== "receivable" ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-app-label-secondary">
                {method === "cash" ? "الخزينة المستلمة" : "الحساب المصرفي المستلم"}
              </label>
              <select
                value={cashAccountId ?? ""}
                onChange={(e) => setCashAccountId(e.target.value || null)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              >
                <option value="">اختر…</option>
                {treasuries.map((a) => (
                  <option key={a.id} value={a.id} disabled={!a.account_id}>
                    {a.name}
                    {a.account ? ` — ${a.account.account_code}` : " (غير مربوطة بحساب محاسبي)"}
                  </option>
                ))}
              </select>
              {treasuries.length === 0 && (
                <p className="text-[11px] text-app-status-warning">
                  لا توجد {method === "cash" ? "خزينة" : "حسابات مصرفية"} — أضفها من صفحة الخزينة.
                </p>
              )}
            </div>
          ) : (
            <p className={`text-[11px] ${needsApproval ? "text-app-status-warning font-semibold" : "text-app-label-tertiary"}`}>
              {needsApproval
                ? `هذا البيع يتجاوز المتاح من سقف العميل بمقدار ${formatNumber(total - available)} — سيُرسل لموافقة المدير ولن يُصرف شيء قبلها.`
                : "يُقيَّد المبلغ على حساب ذمم العميل ويُحصَّل لاحقاً."}
            </p>
          )}
        </section>
      )}

      {/* Cart */}
      <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-app-separator px-5 py-3 bg-app-bg-secondary">
          <div className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <ShoppingCart className="h-4 w-4 text-app-accent" />
            السلة ({cart.length})
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button type="button" onClick={resetCart} className="text-[11px] text-app-status-danger hover:underline font-semibold">
                تفريغ
              </button>
            )}
            {!isInternal && (
              <button
                type="button"
                onClick={() => setIsBundlePickerOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-app-accent/40 bg-app-accent/10 px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent/15"
              >
                <Boxes className="w-4 h-4" />
                حزمة
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsProductPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              صنف
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-14 text-center text-xs text-app-label-secondary space-y-1">
            <Receipt className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
            <p className="font-semibold text-app-label-primary">السلة فارغة</p>
            <p className="text-[11px]">أضف أصنافاً من المخزون أو حزمة كاملة مثل «جلسة عربية».</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
                <th className="px-4 py-2.5 text-start font-semibold">البيان</th>
                <th className="px-3 py-2.5 text-center font-semibold w-24">الكمية</th>
                <th className="px-3 py-2.5 text-center font-semibold w-32">{isInternal ? "بالتكلفة" : "سعر الوحدة"}</th>
                {!isInternal && <th className="px-3 py-2.5 text-center font-semibold w-28">خصم</th>}
                <th className="px-4 py-2.5 text-end font-semibold w-28">الإجمالي</th>
                <th className="px-3 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {cart.map((l) => {
                const size = l.size ? formatSizeCm(l.size.length_m, l.size.width_m, l.size.height_m) : null;
                const lineGross = num(l.qty) * num(l.price);
                const lineDisc = isInternal ? 0 : num(l.discount);
                const lineDiscInvalid = !isInternal && (lineDisc < 0 || lineDisc > lineGross);
                const lineNet = lineGross - lineDisc;
                return (
                  <tr key={l.key} className="hover:bg-app-fill-f1/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 font-semibold text-app-label-primary">
                        {l.lineType === "bundle" && <Boxes className="h-3.5 w-3.5 text-app-accent" />}
                        {l.name}
                      </div>
                      <div className="text-[10px] text-app-label-secondary font-mono">
                        {l.lineType === "bundle"
                          ? "حزمة — يُحدَّد محتواها بعد البيع"
                          : [l.code, size].filter(Boolean).join(" · ")}
                      </div>
                      {l.stockLotId && (
                        <button
                          type="button"
                          onClick={() =>
                            setBlockPicker({
                              item: { id: l.itemId as string, name: l.name, code: l.code ?? "" } as InventoryItem,
                              editingKey: l.key,
                            })
                          }
                          className="mt-1 inline-flex items-center gap-1 rounded-md bg-app-accent/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-app-accent hover:bg-app-accent/20"
                        >
                          <Package className="h-3 w-3" />
                          لوت {l.stockLotLabel}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={l.qty}
                        readOnly={Boolean(l.stockLotId)}
                        onChange={(e) => updateLine(l.key, { qty: e.target.value })}
                        className={`w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none ${
                          l.stockLotId ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      {isInternal ? (
                        <div className="text-center text-[11px] text-app-label-tertiary">تكلفة المخزون</div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="السعر"
                          value={l.price}
                          onChange={(e) => updateLine(l.key, { price: e.target.value })}
                          className="w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none"
                        />
                      )}
                    </td>
                    {!isInternal && (
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="خصم"
                          value={l.discount}
                          onChange={(e) => updateLine(l.key, { discount: e.target.value })}
                          className={`w-full px-2 py-1 border rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:outline-none ${
                            lineDiscInvalid
                              ? "border-app-status-danger text-app-status-danger focus:border-app-status-danger"
                              : "border-app-separator focus:border-app-accent"
                          }`}
                        />
                      </td>
                    )}
                    <td
                      className={`px-4 py-2.5 text-end font-mono font-bold ${
                        lineDiscInvalid ? "text-app-status-danger" : "text-app-label-primary"
                      }`}
                    >
                      {isInternal ? "—" : formatNumber(lineNet)}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setCart((prev) => prev.filter((x) => x.key !== l.key))}
                        className="p-1.5 rounded-lg text-app-label-secondary hover:text-app-status-danger hover:bg-app-status-danger/10"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Checkout */}
      <section className="rounded-2xl border border-app-separator bg-app-bg-secondary shadow-sm p-5 space-y-4">
        {!isInternal && (
          <div className="space-y-2.5 border-b border-app-separator pb-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="pos-invoice-discount" className="text-xs font-semibold text-app-label-secondary">
                خصم على الفاتورة
              </label>
              <input
                id="pos-invoice-discount"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={invoiceDiscount}
                onChange={(e) => setInvoiceDiscount(e.target.value)}
                className={`w-36 px-2.5 py-1 border rounded-lg bg-app-bg-primary text-xs font-mono text-end focus:outline-none ${
                  invoiceDiscountInvalid
                    ? "border-app-status-danger text-app-status-danger focus:border-app-status-danger"
                    : "border-app-separator focus:border-app-accent"
                }`}
              />
            </div>
            {invoiceDiscountInvalid && (
              <p className="text-[11px] text-app-status-danger font-semibold">
                لا يمكن أن يتجاوز خصم الفاتورة المجموع بعد خصم البنود ({formatNumber(subtotal)} د.ل).
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-app-label-secondary">
              <span>المجموع</span>
              <span className="font-mono">{formatNumber(grossTotal)} د.ل</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex items-center justify-between text-xs text-app-status-warning font-semibold">
                <span>الخصم</span>
                <span className="font-mono">-{formatNumber(totalDiscount)} د.ل</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-app-label-primary">الصافي</span>
              <span className="text-2xl font-bold font-mono text-app-accent">
                {formatNumber(total)} <span className="text-sm font-sans">د.ل</span>
              </span>
            </div>
          </div>
        )}
        {hasBundle && (
          <p className="text-[11px] text-app-label-secondary">
            بعد الإتمام تنتقل مباشرة لتحديد قطع الحزمة ومقاساتها، ثم تجهيزها من المخزون أو إرسالها للمقص.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={!canCheckout || isBusy}
            className="flex-1 min-w-[16rem] rounded-xl bg-app-accent px-5 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40"
          >
            {isBusy
              ? "جارٍ إتمام البيع…"
              : isInternal
                ? "إتمام التحويل الداخلي"
                : needsApproval
                  ? `إرسال للموافقة — ${formatNumber(total)} د.ل`
                  : `إتمام البيع — ${formatNumber(total)} د.ل`}
          </button>
          {!isInternal && !loadedQuotation && (
            <button
              type="button"
              onClick={saveQuotation}
              disabled={!linesValid || invoiceDiscountInvalid || buyerMode !== "client" || !clientId || createQuotation.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-4 py-3 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-40"
            >
              <FileText className="h-4 w-4 text-app-accent" />
              {createQuotation.isPending ? "جارٍ الحفظ…" : "حفظ كعرض سعر"}
            </button>
          )}
          {!loadedQuotation && (
            <button
              type="button"
              onClick={() => {
                setHoldCartError(null);
                setHoldCartLabel("");
                setIsHoldDialogOpen(true);
              }}
              disabled={cart.length === 0 || isBusy || holdCart.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-4 py-3 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-40"
            >
              <Clock className="h-4 w-4 text-app-accent" />
              <span>تعليق الفاتورة</span>
            </button>
          )}
        </div>
      </section>

      <ProductPickerDialog open={isProductPickerOpen} onClose={() => setIsProductPickerOpen(false)} onPick={addItem} />
      <BundlePickerDialog open={isBundlePickerOpen} onClose={() => setIsBundlePickerOpen(false)} onPick={addBundle} />
      <QuickClientDialog
        open={isQuickClientOpen}
        onClose={() => setIsQuickClientOpen(false)}
        onCreated={(c) => setClientId(c.id)}
      />
      {blockPicker && (
        <BlockPicker
          isOpen
          onClose={() => setBlockPicker(null)}
          onPick={pickBlock}
          inventoryItemId={blockPicker.item.id}
          inventoryItemName={blockPicker.item.name}
          initiallySelectedLotId={
            blockPicker.editingKey ? cart.find((l) => l.key === blockPicker.editingKey)?.stockLotId ?? null : null
          }
        />
      )}
      <SaleCompletedDialog sale={completedSale} onClose={() => setCompletedSale(null)} />
      <CashTenderModal
        isOpen={isCashTenderOpen}
        total={total}
        isBusy={isBusy}
        onClose={() => setIsCashTenderOpen(false)}
        onConfirm={(tendered) => executeCheckout(tendered)}
      />
      <SplitPaymentModal
        isOpen={isSplitPaymentOpen}
        total={total}
        clientName={isWalkIn ? walkInName.trim() || undefined : client?.entity?.name}
        isWalkIn={isWalkIn}
        isBusy={isBusy}
        onClose={() => setIsSplitPaymentOpen(false)}
        onConfirm={executeSplitCheckout}
      />
      <QuotationPrintDialog quotationId={printQuotationId} onClose={() => setPrintQuotationId(null)} />

      {/* Hold Cart Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>تعليق الفاتورة</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              <p className="text-xs text-app-label-secondary">
                حفظ هذه الفاتورة لاستئنافها لاحقاً وتفريغ الشاشة لمعاملة أخرى.
              </p>
              {holdCartError && (
                <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{holdCartError}</span>
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="held-cart-label-input" className="block text-xs font-semibold text-app-label-primary">
                  تسمية الفاتورة (اختياري)
                </label>
                <input
                  id="held-cart-label-input"
                  type="text"
                  value={holdCartLabel}
                  onChange={(e) => setHoldCartLabel(e.target.value)}
                  placeholder="مثال: زبون المعرض — أريكة زرقاء"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleHoldCart();
                    }
                  }}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsHoldDialogOpen(false)}
              disabled={holdCart.isPending}
              className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleHoldCart}
              disabled={holdCart.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {holdCart.isPending ? "جارٍ الحفظ…" : "تعليق"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Held Carts Listing Dialog */}
      <Dialog open={isHeldCartsDialogOpen} onOpenChange={setIsHeldCartsDialogOpen}>
        <DialogContent size="2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-app-accent" />
              <DialogTitle>الفواتير المعلقة</DialogTitle>
              <span className="rounded-full bg-app-accent/15 px-2 py-0.5 text-xs font-mono font-bold text-app-accent">
                {heldCarts.length}
              </span>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="p-0">
            {heldCarts.length === 0 ? (
              <div className="py-12 text-center text-xs text-app-label-secondary space-y-1">
                <Clock className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
                <p className="font-semibold text-app-label-primary">لا توجد فواتير معلقة</p>
                <p className="text-[11px]">يمكنك تعليق أي فاتورة مفتوحة للرجوع إليها لاحقاً.</p>
              </div>
            ) : (
              <div className="divide-y divide-app-separator max-h-[60vh] overflow-y-auto">
                {heldCarts.map((hc) => {
                  const parsed = parseHeldCartPayload(hc.payload);
                  const isValid = parsed !== null;
                  const labelText = hc.label?.trim() ? hc.label : "بدون اسم";
                  const clientName =
                    hc.client?.name ??
                    (parsed?.buyer_mode === "internal"
                      ? "تحويل داخلي"
                      : parsed?.walkInName?.trim() || "زبون عام");
                  const timeAgo = formatTimeAgo(hc.created_at);

                  return (
                    <div
                      key={hc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-app-fill-f1/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-app-label-primary truncate">{labelText}</span>
                          {!isValid && (
                            <span className="rounded-md bg-app-status-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-app-status-danger">
                              تعذر استئناف هذه الفاتورة
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-app-label-secondary">
                          <span>{clientName}</span>
                          <span>·</span>
                          <span>
                            {hc.line_count} {hc.line_count === 1 ? "بند" : "بنود"}
                          </span>
                          <span>·</span>
                          <span className="font-mono font-bold text-app-label-primary">
                            {formatNumber(hc.total)} د.ل
                          </span>
                          <span>·</span>
                          <span>عُلّقت بواسطة: {hc.user?.name || "—"}</span>
                          <span>·</span>
                          <span className="text-app-label-tertiary">{timeAgo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResumeClick(hc)}
                          disabled={deleteHeldCart.isPending}
                          className="flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>استئناف</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCartId(hc.id)}
                          disabled={deleteHeldCart.isPending}
                          className="p-1.5 rounded-xl border border-app-separator text-app-label-secondary hover:text-app-status-danger hover:bg-app-status-danger/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsHeldCartsDialogOpen(false)}
              className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Resume Dialog */}
      <ConfirmDialog
        isOpen={resumeConfirmCart !== null}
        onClose={() => setResumeConfirmCart(null)}
        onConfirm={() => {
          if (resumeConfirmCart) {
            const parsed = parseHeldCartPayload(resumeConfirmCart.payload);
            if (parsed) {
              executeResume(resumeConfirmCart, parsed);
            }
          }
        }}
        title="استئناف الفاتورة المعلقة"
        message="سيتم استبدال الفاتورة الحالية."
        confirmText="استئناف واستبدال"
        cancelText="إلغاء"
        variant="warning"
        isLoading={deleteHeldCart.isPending}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deletingCartId !== null}
        onClose={() => setDeletingCartId(null)}
        onConfirm={handleDeleteHeldCart}
        title="حذف الفاتورة المعلقة"
        message="هل أنت متأكد من حذف هذه الفاتورة المعلقة؟"
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        isLoading={deleteHeldCart.isPending}
      />
    </div>
  );
};
