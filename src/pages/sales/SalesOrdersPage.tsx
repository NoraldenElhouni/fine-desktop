import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, RefreshCw, AlertTriangle, Trash2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSalesOrders, useCreateSalesOrder } from "../../hooks/useSales";
import { useInventoryItems } from "../../hooks/useInventory";
import { getClients } from "../../api/endpoints/clients";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { SALES_STATUS_ORDER, SALES_STATUS_LABEL, SalesOrderStatus } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { BlockPicker, PickedBlock } from "../../components/pos/BlockPicker";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { InventoryItem } from "../../api/endpoints/inventory";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useSalesOrdersColumns } from "../../components/table-columns/salesOrdersColumns";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface DraftLine {
  key: string;
  item: string;
  qty: string;
  price: string;
  stockLotId?: string | null;
  stockLotLabel?: string | null;
}

const newLine = (): DraftLine => ({
  key: Math.random().toString(36).slice(2),
  item: "",
  qty: "1",
  price: "",
});

export const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orderNumber, setOrderNumber] = useState("");
  const [buyerType, setBuyerType] = useState<"client" | "internal_unit">("client");
  const [clientId, setClientId] = useState("");
  const [buyerUnitId, setBuyerUnitId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    itemId: string;
    editingKey: string | null;
  }>({ isOpen: false, itemId: "", editingKey: null });

  const { data, isLoading, refetch } = useSalesOrders({ status: statusFilter || undefined });
  const { data: items } = useInventoryItems({});
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => getClients() });
  const { data: units } = useQuery({ queryKey: ["operatingUnits"], queryFn: () => getOperatingUnits() });
  const createMutation = useCreateSalesOrder();

  const orders = data?.data ?? [];
  const orderTotal = lines.reduce((s, l) => s + num(l.qty) * num(l.price), 0);

  const columns = useSalesOrdersColumns({ navigate });

  const tableData = useMemo(() => orders, [orders]);
  const ordersTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    pageSize: 10,
    getRowId: (o) => o.id,
  });

  const selectedClient = clients?.find((c) => c.id === clientId);

  const openPickerFor = (lineKey: string) => {
    const line = lines.find((l) => l.key === lineKey);
    if (!line || !line.item) return;
    setPickerState({ isOpen: true, itemId: line.item, editingKey: lineKey });
  };

  const handlePickedBlock = (block: PickedBlock) => {
    if (!pickerState.editingKey) return;
    setLines((prev) =>
      prev.map((l) =>
        l.key === pickerState.editingKey
          ? {
              ...l,
              stockLotId: block.id || null,
              stockLotLabel: block.lot_number || null,
              price: l.price || String(block.unit_cost),
              qty: "1",
            }
          : l,
      ),
    );
  };

  const canSubmit =
    orderNumber !== "" &&
    (buyerType === "client" ? clientId !== "" : buyerUnitId !== "") &&
    lines.length > 0 &&
    lines.every((l) => l.item && num(l.qty) > 0 && num(l.price) >= 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        order_number: orderNumber,
        buyer_type: buyerType,
        client_id: buyerType === "client" ? clientId : undefined,
        buyer_unit_id: buyerType === "internal_unit" ? buyerUnitId : undefined,
        lines: lines.map((l) => ({
          inventory_item_id: l.item,
          stock_lot_id: l.stockLotId ?? null,
          quantity: num(l.qty),
          unit_price: num(l.price),
        })),
      },
      {
        onSuccess: (res) => {
          setShowForm(false);
          navigate(`/sales/orders/${res.data.id}`);
        },
        onError: (err: unknown) => {
          const payload = apiErrorPayload(err);
          setError(payload?.errors?.order_number?.[0] ?? payload?.message ?? "تعذّر إنشاء الطلب.");
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-app-accent" />
            طلبات المبيعات
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            مبيعات العملاء تمر بوابة الائتمان عند الإرسال؛ أما التحويلات الداخلية فتتجاوزها وتنتقل
            بسعر التكلفة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> طلب جديد
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-3 shadow-sm">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            statusFilter === "" ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
          }`}
        >
          الكل
        </button>
        {SALES_STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              statusFilter === s ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            {SALES_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <DataTable table={ordersTable}>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage={`لا توجد طلبات مبيعات${statusFilter ? ` بحالة ${SALES_STATUS_LABEL[statusFilter as SalesOrderStatus]}` : ""}.`}
          emptyIcon={ShoppingCart}
        />
        <DataTable.Pagination />
      </DataTable>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent size="2xl">
          <DialogHeader>
            <DialogTitle>طلب مبيعات جديد</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form id="sales-order-form" onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text" required placeholder="رقم الطلب — SO-1042"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyerType("client")}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border ${
                      buyerType === "client"
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                    }`}
                  >
                    عميل خارجي
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyerType("internal_unit")}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border ${
                      buyerType === "internal_unit"
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                    }`}
                  >
                    وحدة داخلية
                  </button>
                </div>
              </div>

              {buyerType === "client" ? (
                <div>
                  <SearchableSelect<{ id: string; entity?: { name?: string } }>
                    options={clients ?? []}
                    value={
                      clients?.find((c) => c.id === clientId) ?? null
                    }
                    onChange={(c) => setClientId(c ? c.id : "")}
                    getOptionId={(c) => c.id}
                    getOptionLabel={(c) => c.entity?.name ?? c.id}
                    placeholder="اختر عميلًا…"
                    required
                  />
                  {selectedClient && (
                    <p className="text-[10px] text-app-label-tertiary mt-1 font-mono">
                      الحد الائتماني {formatNumber((selectedClient as { credit_limit?: number }).credit_limit ?? 0)}
                      {" · "}الرصيد {formatNumber((selectedClient as { current_balance?: number }).current_balance ?? 0)}
                      {" · "}هذا الطلب {formatNumber(orderTotal)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <SearchableSelect<{ id: string; name: string }>
                    options={units ?? []}
                    value={
                      units?.find((u) => u.id === buyerUnitId) ?? null
                    }
                    onChange={(u) => setBuyerUnitId(u ? u.id : "")}
                    getOptionId={(u) => u.id}
                    getOptionLabel={(u) => u.name}
                    placeholder="اختر وحدة الشراء…"
                    required
                  />
                  <p className="text-[10px] text-app-label-tertiary mt-1">
                    التحويلات الداخلية تتجاوز بوابة الائتمان وتُسوَّى بسعر التكلفة.
                  </p>
                </div>
              )}

              {/* Lines */}
              <div className="space-y-2">
                {lines.map((l) => {
                  const selectedItem = items?.data?.find((i) => i.id === l.item);
                  const isFoamBlock = selectedItem?.item_type === "foam_block";
                  return (
                    <div key={l.key} className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <SearchableSelect<InventoryItem>
                            options={items?.data ?? []}
                            value={
                              items?.data.find((i) => i.id === l.item) ?? null
                            }
                            onChange={(item) =>
                              setLines(
                                lines.map((x) =>
                                  x.key === l.key
                                    ? {
                                        ...x,
                                        item: item ? item.id : "",
                                        stockLotId: null,
                                        stockLotLabel: null,
                                      }
                                    : x
                                )
                              )
                            }
                            getOptionId={(i) => i.id}
                            getOptionLabel={(i) =>
                              `${i.name} (${i.sku})${i.item_type === "foam_block" ? " · قطعة" : ""}`
                            }
                            getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                            placeholder="الصنف…"
                            size="sm"
                          />
                        </div>
                        {isFoamBlock && l.item && (
                          <button
                            type="button"
                            onClick={() => openPickerFor(l.key)}
                            className="flex items-center gap-1 rounded-lg border border-app-accent/40 bg-app-accent/10 px-2 py-1.5 text-[11px] font-bold text-app-accent hover:bg-app-accent/15"
                          >
                            <Package className="h-3.5 w-3.5" /> اختر قطعة
                          </button>
                        )}
                        <input
                          type="number" step="0.01" min="0.01" placeholder="الكمية"
                          value={l.qty}
                          readOnly={Boolean(l.stockLotId)}
                          onChange={(e) => setLines(lines.map((x) => x.key === l.key ? { ...x, qty: e.target.value } : x))}
                          className={`w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none ${l.stockLotId ? "opacity-70 cursor-not-allowed" : ""}`}
                        />
                        <input
                          type="number" step="0.01" min="0" placeholder="السعر"
                          value={l.price}
                          onChange={(e) => setLines(lines.map((x) => x.key === l.key ? { ...x, price: e.target.value } : x))}
                          className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                        />
                        <span className="w-20 text-end text-xs font-mono text-app-label-secondary">
                          {formatNumber(num(l.qty) * num(l.price))}
                        </span>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLines(lines.filter((x) => x.key !== l.key))}
                            className="p-1 rounded-lg text-app-label-tertiary hover:text-app-status-danger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {l.stockLotId && (
                        <div className="ps-1 text-[10px] font-mono text-app-accent">
                          لوت: {l.stockLotLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setLines([...lines, newLine()])}
                    className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:opacity-80"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة بند
                  </button>
                  <span className="text-sm font-bold font-mono text-app-label-primary">
                    الإجمالي {formatNumber(orderTotal)} LYD
                  </span>
                </div>
              </div>

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="sales-order-form"
              disabled={createMutation.isPending || !canSubmit}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {createMutation.isPending ? "جاري الإنشاء…" : "إنشاء مسودة"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {pickerState.isOpen && pickerState.itemId && (
        <BlockPicker
          isOpen={pickerState.isOpen}
          onClose={() => setPickerState({ isOpen: false, itemId: "", editingKey: null })}
          onPick={handlePickedBlock}
          inventoryItemId={pickerState.itemId}
          inventoryItemName={items?.data?.find((i) => i.id === pickerState.itemId)?.name ?? ""}
          initiallySelectedLotId={
            pickerState.editingKey
              ? lines.find((l) => l.key === pickerState.editingKey)?.stockLotId ?? null
              : null
          }
        />
      )}
    </div>
  );
};
