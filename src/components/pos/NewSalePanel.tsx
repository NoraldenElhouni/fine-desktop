import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  Building2,
  Clock,
  FileText,
  Landmark,
  Lock,
  MapPin,
  Package,
  Play,
  Plus,
  Receipt,
  ScanLine,
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
import { useClientAddresses, useClients } from "../../hooks/useClients";
import { useScanQueue } from "../../hooks/useInventory";
import { useOperatingUnits } from "../../hooks/useOperatingUnits";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { useAuthStore } from "../../stores/authStore";
import {
  CartLine,
  CartLineInput,
  CheckoutInput,
  HeldCart,
  HeldCartPayload,
  PAYMENT_METHOD_LABEL,
  PaymentMethod,
  PosShift,
  PriceFloorViolationLine,
  PriceOverrideInput,
  Quotation,
  SALES_ERROR_MESSAGE,
  Sale,
  SaleErrorPayload,
  SplitPaymentPortionInput,
  formatSizeCm,
} from "../../api/endpoints/sales";
import {
  InventoryItem,
  type InventoryLookupResult,
  codeNotFoundMessage,
  inventoryApi,
  isCodeNotFound,
  suggestedCostPrice,
  suggestedMinPrice,
  suggestedPrice,
  suggestedWholesalePrice,
} from "../../api/endpoints/inventory";
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
import { kickDrawerForSale } from "../../lib/printing";
import { getPrintSettings } from "../../stores/printSettingsStore";
import { CashTenderModal } from "./CashTenderModal";
import { SplitPaymentModal } from "./SplitPaymentModal";
import { PriceOverrideDialog } from "./PriceOverrideDialog";
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

/**
 * The POS scan box stays focused: after a pointer click on anything that is
 * not a field of its own (a button, the page), focus goes back to it, unless
 * a dialog is open or the user is typing in another input or an open picker.
 * Keyboard focus moves (Tab to a button) are left alone; focus comes back on
 * its own only when it falls to nowhere (a removed row, a closed menu).
 */
const keepsFocusElsewhere = (el: Element | null): boolean =>
  Boolean(
    el &&
      el !== document.body &&
      (el.matches('input, textarea, select, [contenteditable="true"]') ||
        el.closest('[role="listbox"]') ||
        el.getAttribute("aria-expanded") === "true"),
  );

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

/** A checkout or quotation conversion as it was sent, kept so a manager price override can resend it unchanged. */
type PendingSaleRequest =
  | { kind: "checkout"; input: CheckoutInput }
  | { kind: "convert"; input: { id: string } & Omit<CheckoutInput, "client_id" | "buyer_unit_id"> };

interface NewSalePanelProps {
  /** A quotation the client came back with — its lines load into the cart. */
  loadedQuotation: Quotation | null;
  onQuotationDone: () => void;
  /**
   * FR-SLREP-008: on a unit running cashier shifts, cash goes through the open
   * shift's drawer only; with no open shift, cash checkout asks to open one.
   */
  shiftLock?: { enabled: boolean; shift: PosShift | null; isOwn?: boolean; isLoading?: boolean; onOpenShift: () => void };
}

export const NewSalePanel: React.FC<NewSalePanelProps> = ({ loadedQuotation, onQuotationDone, shiftLock }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUnitId = useServerConfigStore((s) => s.operatingUnitId);
  const authUser = useAuthStore((s) => s.user);

  const [buyerMode, setBuyerMode] = useState<BuyerMode>("client");
  const [clientId, setClientId] = useState<string | null>(null);
  const [buyerUnitId, setBuyerUnitId] = useState<string | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  /** W5-05: the delivery address picked for this client; it counts only while that client stays selected. */
  const [deliveryPick, setDeliveryPick] = useState<{ clientId: string; addressId: string } | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashAccountId, setCashAccountId] = useState<string | null>(null);
  const [priceTier, setPriceTier] = useState<"retail" | "wholesale">("retail");
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
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [priceFloorViolations, setPriceFloorViolations] = useState<PriceFloorViolationLine[] | null>(null);
  const [pendingSale, setPendingSale] = useState<PendingSaleRequest | null>(null);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [blockPicker, setBlockPicker] = useState<{ item: InventoryItem; editingKey: string | null } | null>(null);
  const [scanCode, setScanCode] = useState("");
  const scanRef = useRef<HTMLInputElement | null>(null);
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
  // A quotation conversion takes no delivery address (the convert endpoint does not accept one).
  const canPickDeliveryAddress = buyerMode === "client" && Boolean(clientId) && !loadedQuotation;
  const {
    data: clientAddresses = [],
    isLoading: clientAddressesLoading,
    isError: clientAddressesError,
  } = useClientAddresses(
    clientId,
    canPickDeliveryAddress,
  );
  const deliveryAddressId =
    canPickDeliveryAddress &&
    deliveryPick?.clientId === clientId &&
    clientAddresses.some((a) => a.id === deliveryPick.addressId)
      ? deliveryPick.addressId
      : null;
  const otherUnits = units.filter((u) => u.id !== currentUnitId);
  const isInternal = buyerMode === "internal";
  const isWalkIn = buyerMode === "walk_in";
  const treasuries = paymentAccounts.filter((a) => a.kind === method);
  const linkedTreasuries = treasuries.filter((a) => a.account_id);
  const shiftDrawerId = shiftLock?.enabled && shiftLock.shift ? shiftLock.shift.cash_account_id : null;
  const shiftDrawerName =
    shiftLock?.shift?.cash_account?.name ?? paymentAccounts.find((a) => a.id === shiftDrawerId)?.name ?? "—";
  /** The open shifts are still loading: cash checkout waits, without asking to open a shift. */
  const isShiftLoading = Boolean(shiftLock?.enabled && shiftLock.isLoading) && method === "cash" && !isInternal;
  const needsShift =
    Boolean(shiftLock?.enabled) && !shiftLock?.isLoading && !shiftLock?.shift && method === "cash" && !isInternal;

  // A quotation the client came back with fills the cart.
  useEffect(() => {
    if (!loadedQuotation) return;
    setBuyerMode("client");
    setClientId(loadedQuotation.client_id);
    setWalkInName("");
    setWalkInPhone("");
    setNotes(loadedQuotation.notes ?? null);
    setPriceTier(loadedQuotation.price_tier ?? "retail");
    const qInvDiscount = Number(loadedQuotation.invoice_discount ?? 0);
    setInvoiceDiscount(qInvDiscount > 0 ? String(qInvDiscount) : "");
    const lines: CartLine[] = (loadedQuotation.lines ?? []).map((l) => {
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
        priceEdited: true,
        size: l.length_m && l.width_m && l.height_m
          ? { length_m: Number(l.length_m), width_m: Number(l.width_m), height_m: Number(l.height_m) }
          : null,
      };
    });
    setCart(lines);
    setRequestId(newRequestId());
    setError(null);

    const missingIds = Array.from(
      new Set(
        lines
          .filter((l) => l.lineType === "item" && l.itemId)
          .map((l) => l.itemId as string),
      ),
    );
    if (missingIds.length > 0) {
      Promise.all(missingIds.map((id) => inventoryApi.getItem(id).catch((): null => null))).then((responses) => {
        setCart((prev) =>
          prev.map((line) => {
            const res = responses.find((r) => r?.data?.id === line.itemId);
            return res?.data ? { ...line, item: res.data } : line;
          }),
        );
      });
    }
  }, [loadedQuotation]);

  // W4-03: the scan box takes the focus back after clicks and closed dialogs.
  const refocusScan = useCallback((onlyFromNowhere = false) => {
    setTimeout(() => {
      const input = scanRef.current;
      if (!input || document.querySelector('[role="dialog"]')) return;
      const active = document.activeElement;
      if (active === input) return;
      if (onlyFromNowhere ? active !== null && active !== document.body : keepsFocusElsewhere(active)) return;
      input.focus({ preventScroll: true });
    }, 0);
  }, []);
  useEffect(() => {
    const onPointerUp = () => refocusScan();
    const onFocusOut = () => refocusScan(true);
    refocusScan();
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [refocusScan]);
  const anyDialogOpen =
    isProductPickerOpen ||
    isBundlePickerOpen ||
    isQuickClientOpen ||
    isCashTenderOpen ||
    isSplitPaymentOpen ||
    isOverrideDialogOpen ||
    isHoldDialogOpen ||
    isHeldCartsDialogOpen ||
    Boolean(blockPicker || completedSale || printQuotationId || resumeConfirmCart || deletingCartId);
  useEffect(() => {
    if (!anyDialogOpen) {
      refocusScan();
    } else if (document.activeElement === scanRef.current) {
      // The dialog has no focus trap: a scan typed now must not land in the
      // box behind its overlay.
      scanRef.current?.blur();
    }
  }, [anyDialogOpen, refocusScan]);
  /** A dialog is open (state, or one already in the DOM): scans are not applied behind it. */
  const dialogOpenNow = (): boolean => anyDialogOpen || document.querySelector('[role="dialog"]') !== null;

  // One linked treasury of the chosen kind is picked for the cashier.
  useEffect(() => {
    if (method === "receivable" || method === "split") {
      setCashAccountId(null);
    } else if (method === "cash" && shiftDrawerId) {
      // Locked to the open shift's drawer.
      if (cashAccountId !== shiftDrawerId) setCashAccountId(shiftDrawerId);
    } else if (!linkedTreasuries.some((a) => a.id === cashAccountId)) {
      setCashAccountId(linkedTreasuries.length === 1 ? linkedTreasuries[0].id : null);
    }
  }, [method, linkedTreasuries, cashAccountId, shiftDrawerId]);

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
    setPriceTier("retail");
    setPendingSale(null);
    setPriceFloorViolations(null);
    setOverrideError(null);
    setIsOverrideDialogOpen(false);
    // Each sale starts with no delivery address; a pick never carries over to the next sale.
    setDeliveryPick(null);
    if (loadedQuotation) onQuotationDone();
  };

  const handleTierChange = (newTier: "retail" | "wholesale") => {
    if (newTier === priceTier) return;
    setPriceTier(newTier);
    setCart((prev) =>
      prev.map((l) => {
        if (l.lineType !== "item" || l.priceEdited || !l.item) return l;
        let unitPrice: number | null = null;
        if (newTier === "wholesale") {
          unitPrice = suggestedWholesalePrice(l.item, 1, l.size ?? undefined);
          if (unitPrice === null) {
            unitPrice = suggestedPrice(l.item, 1, l.size ?? undefined);
          }
        } else {
          unitPrice = suggestedPrice(l.item, 1, l.size ?? undefined);
        }
        if (unitPrice === null) return l;
        return {
          ...l,
          price: String(unitPrice),
        };
      }),
    );
  };

  const lineFloorStatuses = useMemo(() => {
    if (isInternal) return {};
    const statuses: Record<string, { isBelow: boolean; floor: number; reason: "min_price" | "cost"; netUnitPrice: number }> = {};
    for (const l of cart) {
      if (l.lineType !== "item" || !l.item) continue;
      const qty = num(l.qty);
      if (qty <= 0) continue;

      const minPrice = suggestedMinPrice(l.item, 1, l.size ?? undefined) ?? 0;
      const costPrice = suggestedCostPrice(l.item, 1, l.size ?? undefined) ?? 0;
      const floor = Math.max(minPrice, costPrice);
      if (floor <= 0) continue;

      const lineGross = qty * num(l.price);
      const lineDisc = Math.max(0, num(l.discount));
      const lineNet = lineGross - lineDisc;

      const invoiceShare =
        invDiscount > 0 && subtotal > 0 && lineNet > 0
          ? invDiscount * (lineNet / subtotal)
          : 0;

      const netUnitPrice = (lineNet - invoiceShare) / qty;

      if (netUnitPrice < floor - 0.0001) {
        statuses[l.key] = {
          isBelow: true,
          floor,
          reason: costPrice > minPrice ? "cost" : "min_price",
          netUnitPrice,
        };
      }
    }
    return statuses;
  }, [cart, isInternal, invDiscount, subtotal]);

  const updateLine = (key: string, patch: Partial<CartLine>) =>
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const addItem = (item: InventoryItem) => {
    setIsProductPickerOpen(false);
    if (item.item_type === "foam_block") {
      setBlockPicker({ item, editingKey: null });
      return;
    }
    let unitPrice: number | null = null;
    if (priceTier === "wholesale") {
      unitPrice = suggestedWholesalePrice(item, 1) ?? suggestedPrice(item, 1);
    } else {
      unitPrice = suggestedPrice(item, 1);
    }
    // Re-adding (or re-scanning, W4-03) bumps the line's quantity. The check
    // runs on the latest cart, so scans answered back to back each count.
    setCart((prev) => {
      const existing = prev.find((l) => l.lineType === "item" && l.itemId === item.id && !l.stockLotId);
      if (existing) {
        return prev.map((l) =>
          l.key === existing.key ? { ...l, qty: String(num(l.qty) + 1), item: l.item ?? item } : l,
        );
      }
      return [
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
          priceEdited: false,
          item,
        },
      ];
    });
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

  const blockUnitPrice = (
    item: InventoryItem,
    size: { length_m: number; width_m: number; height_m: number } | null,
  ): number | null => {
    if (!size) return null;
    return priceTier === "wholesale"
      ? (suggestedWholesalePrice(item, 1, size) ?? suggestedPrice(item, 1, size))
      : suggestedPrice(item, 1, size);
  };

  /** A new cart line for one specific block (picked, or scanned by its lot label). */
  const addBlockLine = (item: InventoryItem, block: PickedBlock) => {
    const size = { length_m: block.length_m, width_m: block.width_m, height_m: block.height_m };
    const unitPrice = blockUnitPrice(item, size);
    // One block is one line: a block already in the cart is never added twice.
    setCart((prev) =>
      prev.some((l) => l.stockLotId === block.id)
        ? prev
        : [
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
              priceEdited: false,
              item,
            },
          ],
    );
  };

  const pickBlock = (block: PickedBlock) => {
    if (!blockPicker) return;
    const { item, editingKey } = blockPicker;
    const size = block.id ? { length_m: block.length_m, width_m: block.width_m, height_m: block.height_m } : null;
    const unitPrice = blockUnitPrice(item, size);

    if (editingKey) {
      updateLine(editingKey, {
        stockLotId: block.id || null,
        stockLotLabel: block.lot_number || null,
        size,
        qty: "1",
        ...(unitPrice !== null ? { price: String(unitPrice), priceEdited: false } : {}),
        // The re-pick button passes a stub when the line's full item has not loaded yet; keep what the line has.
        ...(item.item_type ? { item } : {}),
      });
      return;
    }
    if (!block.id) return;
    addBlockLine(item, block);
  };

  /**
   * W4-03 scan box: a barcode reader types the code and Enter. An item
   * (barcode or code) goes through addItem — a foam block item opens the
   * block picker, anything else is added or its quantity bumped. A foam block
   * lot label adds that very block, as picking it would; another lot's label
   * adds its item. A miss says so and puts the code back, selected, for a
   * re-scan (unless the next scan is already being typed).
   */
  const applyScanResult = (res: InventoryLookupResult) => {
    if (res.type === "item" || res.item.item_type !== "foam_block") {
      addItem(res.item);
      return;
    }
    const lot = res.lot;
    if (lot.status !== "available") {
      toast.error(`القطعة ${lot.lot_number} غير متاحة للبيع.`);
      return;
    }
    if (cart.some((l) => l.stockLotId === lot.id)) {
      toast.info(`القطعة ${lot.lot_number} في السلة بالفعل.`);
      return;
    }
    addBlockLine(res.item, {
      id: lot.id,
      lot_number: lot.lot_number,
      volume_m3: Number(lot.volume_m3),
      length_m: Number(lot.length_m),
      width_m: Number(lot.width_m),
      height_m: Number(lot.height_m),
      unit_cost: Number(lot.unit_cost),
      grade: lot.grade,
    });
  };

  const scanQueue = useScanQueue({
    onResult: (code, res) => {
      // A result answered after a dialog opened (a foam item's block picker)
      // would change the cart, or swap the picker's item, out of sight.
      if (dialogOpenNow()) {
        toast.error(`لم يُضف ${code}: أغلق النافذة المفتوحة ثم امسح الرمز مجدداً.`);
        return;
      }
      applyScanResult(res);
    },
    onError: (code, err) => {
      toast.error(isCodeNotFound(err) ? codeNotFoundMessage(code) : apiErrorMessage(err, "تعذّر البحث عن الرمز."));
      const input = scanRef.current;
      if (input && input.value === "") {
        setScanCode(code);
        setTimeout(() => scanRef.current?.select(), 0);
      }
    },
    onIdle: () => refocusScan(),
  });

  /** Enter: the box is cleared at once for the next scan, and the code is queued for lookup. */
  const handleScan = () => {
    const code = scanCode.trim();
    if (!code) return;
    if (dialogOpenNow()) {
      toast.error("أغلق النافذة المفتوحة أولاً ثم امسح الرمز.");
      return;
    }
    setScanCode("");
    scanQueue.enqueue(code);
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

  const buyerPayload = (): Pick<
    CheckoutInput,
    "client_id" | "buyer_unit_id" | "walk_in_name" | "walk_in_phone" | "delivery_address_id"
  > => {
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
    return {
      client_id: clientId,
      buyer_unit_id: null,
      ...(deliveryAddressId ? { delivery_address_id: deliveryAddressId } : {}),
    };
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
    // Before the bundle branch below, which leaves the POS: every completed cash sale opens the drawer.
    void kickDrawerForSale(sale).then((result) => {
      if (result && !result.ok) toast.error(result.message);
    });
    const bundleLine = sale.lines?.find((l) => l.line_type === "bundle");
    if (bundleLine) {
      // The counter receipt lives in the "تم البيع" dialog, which a bundle sale skips: say so.
      if (getPrintSettings().autoPrintReceipt) {
        toast.info("لا يُطبع إيصال تلقائي لبيع يحتوي على حزم.");
      }
      navigate(`/sales/${sale.id}/bundles/${bundleLine.id}`);
      return;
    }
    // The checkout response carries no sold_by; the logged-in user is the seller (receipt "الكاشير").
    setCompletedSale(
      sale.sold_by || !authUser ? sale : { ...sale, sold_by: { id: String(authUser.id), name: authUser.name } },
    );
  };

  const fail = (err: unknown) => {
    const payload = apiErrorPayload(err);
    if (payload?.code === "NO_OPEN_SHIFT") {
      // The shift was closed elsewhere: refetch so the lock falls back to "open a shift".
      queryClient.invalidateQueries({ queryKey: ["posShifts"] });
    }
    if (payload?.code === "DELIVERY_ADDRESS_INVALID") {
      // The picked address is gone or no longer this client's: drop it and reload the list so a retry can succeed.
      setDeliveryPick(null);
      queryClient.invalidateQueries({ queryKey: ["clientAddresses", clientId] });
    }
    const fieldError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    setError(
      (payload?.code && SALES_ERROR_MESSAGE[payload.code]) || fieldError || payload?.message || "تعذّر إتمام العملية.",
    );
  };

  const handleCheckoutError = (err: unknown, request: PendingSaleRequest) => {
    const payload = apiErrorPayload(err) as SaleErrorPayload | undefined;
    const violations = payload?.lines;
    if (payload?.code === "PRICE_BELOW_FLOOR" && Array.isArray(violations) && violations.length > 0) {
      setPendingSale(request);
      setPriceFloorViolations(violations);
      setOverrideError(null);
      setIsOverrideDialogOpen(true);
      return;
    }
    fail(err);
  };

  /** Sends a checkout or quotation conversion; the request is kept so a manager override can resend it verbatim. */
  const sendSale = (request: PendingSaleRequest, onSuccess: (sale: Sale) => void, onError: (err: unknown) => void) => {
    if (request.kind === "convert") {
      convert.mutate(request.input, { onSuccess, onError });
    } else {
      checkout.mutate(request.input, { onSuccess, onError });
    }
  };

  const executeCheckout = (tenderedAmount?: number) => {
    setError(null);
    const lines = cartLines();
    const request: PendingSaleRequest = loadedQuotation
      ? {
          kind: "convert",
          input: {
            id: loadedQuotation.id,
            client_request_id: requestId,
            payment_method: method,
            cash_account_id: cashAccountId,
            notes: notes ?? undefined,
            invoice_discount: invDiscount,
            price_tier: priceTier,
            lines,
            tendered_amount: tenderedAmount,
          },
        }
      : {
          kind: "checkout",
          input: {
            client_request_id: requestId,
            ...buyerPayload(),
            payment_method: isInternal ? null : method,
            cash_account_id: isInternal ? null : cashAccountId,
            notes: notes ?? undefined,
            ...(isInternal ? {} : { invoice_discount: invDiscount, price_tier: priceTier }),
            lines,
            tendered_amount: tenderedAmount,
          },
        };

    sendSale(
      request,
      (sale) => {
        setIsCashTenderOpen(false);
        onSold(sale);
      },
      (err) => {
        setIsCashTenderOpen(false);
        handleCheckoutError(err, request);
      },
    );
  };

  const executeSplitCheckout = (portions: SplitPaymentPortionInput[]) => {
    setError(null);
    const lines = cartLines();
    const request: PendingSaleRequest = loadedQuotation
      ? {
          kind: "convert",
          input: {
            id: loadedQuotation.id,
            client_request_id: requestId,
            payment_method: "split",
            notes: notes ?? undefined,
            invoice_discount: invDiscount,
            price_tier: priceTier,
            lines,
            payments: portions,
          },
        }
      : {
          kind: "checkout",
          input: {
            client_request_id: requestId,
            ...buyerPayload(),
            payment_method: "split",
            notes: notes ?? undefined,
            invoice_discount: invDiscount,
            price_tier: priceTier,
            lines,
            payments: portions,
          },
        };

    sendSale(
      request,
      (sale) => {
        setIsSplitPaymentOpen(false);
        onSold(sale);
      },
      (err) => {
        setIsSplitPaymentOpen(false);
        handleCheckoutError(err, request);
      },
    );
  };

  /** Drops the mutation state so the manager password in its variables does not outlive the attempt. */
  const clearSaleMutations = () => {
    checkout.reset();
    convert.reset();
  };

  const closePriceOverride = () => {
    setIsOverrideDialogOpen(false);
    setPriceFloorViolations(null);
    setPendingSale(null);
    setOverrideError(null);
    clearSaleMutations();
  };

  // Resends the exact request that was refused — same client_request_id, tender and split portions — plus the approval.
  const handlePriceOverrideConfirm = (override: PriceOverrideInput) => {
    if (!pendingSale) return;
    setOverrideError(null);
    const request: PendingSaleRequest =
      pendingSale.kind === "convert"
        ? { kind: "convert", input: { ...pendingSale.input, price_override: override } }
        : { kind: "checkout", input: { ...pendingSale.input, price_override: override } };

    sendSale(
      request,
      (sale) => {
        closePriceOverride();
        onSold(sale);
      },
      (err) => {
        clearSaleMutations();
        const p = apiErrorPayload(err) as SaleErrorPayload | undefined;
        const known = p?.code ? SALES_ERROR_MESSAGE[p.code] : undefined;
        if (p?.code === "PRICE_OVERRIDE_THROTTLED") {
          const retryAfter = Number(p.retry_after);
          setOverrideError(
            `${known}${Number.isFinite(retryAfter) && retryAfter > 0 ? ` (بعد ${retryAfter} ثانية)` : ""}`,
          );
          return;
        }
        const fieldError = p?.errors ? Object.values(p.errors)[0]?.[0] : undefined;
        setOverrideError(known || fieldError || p?.message || "تعذّر إتمام العملية.");
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
      { client_id: clientId, notes: notes ?? undefined, price_tier: priceTier, invoice_discount: invDiscount, lines: cartLines() },
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
      // The full item rides only in memory; it is refetched on resume to keep the payload small.
      cart: cart.map((line): CartLine => ({ ...line, item: null })),
      priceTier: isInternal ? "retail" : priceTier,
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
    const resumedLines: CartLine[] = payload.cart.map((l) => ({
      ...l,
      key: l.key || crypto.randomUUID(),
      discount: l.discount ?? "",
      // Carts held before tier pricing have no flag; treat their prices as typed so a tier switch never overwrites them.
      priceEdited: l.priceEdited ?? true,
    }));
    setCart(resumedLines);
    setPriceTier(payload.priceTier ?? "retail");
    const missingIds = Array.from(
      new Set(
        resumedLines
          .filter((l) => l.lineType === "item" && l.itemId && !l.item)
          .map((l) => l.itemId as string),
      ),
    );
    if (missingIds.length > 0) {
      Promise.all(missingIds.map((id) => inventoryApi.getItem(id).catch((): null => null))).then((responses) => {
        setCart((prev) =>
          prev.map((line) => {
            const res = responses.find((r) => r?.data?.id === line.itemId);
            return res?.data ? { ...line, item: res.data } : line;
          }),
        );
      });
    }
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
    // Held carts do not store a delivery address; the cashier picks it again after resuming.
    setDeliveryPick(null);
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
  const paymentValid =
    isInternal ||
    method === "receivable" ||
    method === "split" ||
    (Boolean(cashAccountId) && !needsShift && !isShiftLoading);
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
            {canPickDeliveryAddress && clientId && (
              <label className="flex items-center gap-2 text-[11px] font-semibold text-app-label-secondary">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-app-accent" />
                <span className="shrink-0">عنوان التوصيل</span>
                <select
                  value={deliveryAddressId ?? ""}
                  onChange={(e) =>
                    setDeliveryPick(e.target.value ? { clientId, addressId: e.target.value } : null)
                  }
                  disabled={clientAddressesLoading || clientAddressesError || clientAddresses.length === 0}
                  className="min-w-0 flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-normal text-app-label-primary focus:border-app-accent focus:outline-none disabled:opacity-60"
                >
                  <option value="">
                    {clientAddressesLoading
                      ? "جارٍ تحميل العناوين…"
                      : clientAddressesError
                        ? "تعذر تحميل العناوين"
                        : clientAddresses.length === 0
                          ? "لا توجد عناوين مسجلة لهذا العميل"
                          : "بدون توصيل"}
                  </option>
                  {clientAddresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.is_default ? `${a.snapshot} (الافتراضي)` : a.snapshot}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {!isInternal && (
          <div className="flex items-center justify-between gap-3 border-t border-app-separator pt-3">
            <span className="text-[11px] font-semibold text-app-label-secondary">التسعير</span>
            <div className="inline-flex rounded-xl border border-app-separator p-0.5 bg-app-bg-secondary">
              {([
                { value: "retail", label: "تجزئة" },
                { value: "wholesale", label: "جملة" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTierChange(opt.value)}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold ${
                    priceTier === opt.value ? "bg-app-bg-primary text-app-accent shadow-sm" : "text-app-label-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
          ) : isShiftLoading ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-app-label-secondary">الخزينة المستلمة</label>
              <div className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-secondary">
                جاري تحميل الوردية...
              </div>
            </div>
          ) : method === "cash" && shiftDrawerId ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-app-label-secondary">الخزينة المستلمة</label>
              <div className="flex items-center gap-2 w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary">
                <Lock className="h-3.5 w-3.5 text-app-label-secondary" />
                {shiftDrawerName}
              </div>
              <p className="text-[11px] text-app-label-tertiary">
                خزينة الوردية المفتوحة {shiftLock?.shift?.number}
                {shiftLock?.isOwn === false ? ` (الكاشير: ${shiftLock.shift?.cashier?.name ?? "—"})` : ""} — لا يمكن تغييرها
                أثناء الوردية.
              </p>
            </div>
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
              {needsShift && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-app-status-warning/40 bg-app-status-warning/10 p-2.5 text-[11px] font-semibold text-app-status-warning">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    لا توجد وردية مفتوحة — افتح وردية قبل البيع النقدي.
                  </span>
                  <button
                    type="button"
                    onClick={shiftLock?.onOpenShift}
                    className="shrink-0 rounded-lg bg-app-accent px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
                  >
                    فتح وردية
                  </button>
                </div>
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

        <div className="border-b border-app-separator px-5 py-2.5">
          <div className="relative">
            <ScanLine className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-app-label-tertiary" />
            <input
              ref={scanRef}
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleScan();
                }
              }}
              autoFocus
              placeholder="امسح الباركود أو ملصق القطعة، أو اكتب الرمز ثم Enter"
              aria-label="مسح الباركود"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary py-2 ps-9 pe-3 text-xs font-mono focus:border-app-accent focus:outline-none"
            />
            {scanQueue.pending && (
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 text-[10px] text-app-label-tertiary">
                جارٍ البحث…
              </span>
            )}
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
                const floorStatus = lineFloorStatuses[l.key];
                const noWholesalePrice =
                  !isInternal &&
                  priceTier === "wholesale" &&
                  l.lineType === "item" &&
                  !l.priceEdited &&
                  l.item != null &&
                  suggestedWholesalePrice(l.item, 1, l.size ?? undefined) === null;
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
                              item: l.item ?? ({ id: l.itemId as string, name: l.name, code: l.code ?? "" } as InventoryItem),
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
                        <>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="السعر"
                            value={l.price}
                            onChange={(e) => updateLine(l.key, { price: e.target.value, priceEdited: true })}
                            className="w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none"
                          />
                          {noWholesalePrice && (
                            <div className="mt-1 text-center text-[10px] text-app-label-tertiary">لا يوجد سعر جملة</div>
                          )}
                          {floorStatus && (
                            <div className="mt-1 rounded-md bg-app-status-warning/10 px-1.5 py-0.5 text-center text-[10px] font-semibold text-app-status-warning">
                              {floorStatus.reason === "cost" ? "أقل من التكلفة" : "أقل من الحد الأدنى"} (
                              <span className="font-mono">{formatNumber(floorStatus.floor)}</span>)
                            </div>
                          )}
                        </>
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
        cashLock={
          shiftLock?.enabled
            ? {
                drawerId: shiftDrawerId,
                drawerName: shiftDrawerName,
                isLoading: shiftLock.isLoading,
                onOpenShift: shiftLock.onOpenShift,
              }
            : undefined
        }
        onClose={() => setIsSplitPaymentOpen(false)}
        onConfirm={executeSplitCheckout}
      />
      <QuotationPrintDialog quotationId={printQuotationId} onClose={() => setPrintQuotationId(null)} />
      <PriceOverrideDialog
        open={isOverrideDialogOpen}
        lines={priceFloorViolations ?? []}
        isBusy={isBusy}
        error={overrideError}
        onClose={closePriceOverride}
        onConfirm={handlePriceOverrideConfirm}
      />

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
