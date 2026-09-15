import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Scissors,
  Plus,
  RefreshCw,
  AlertTriangle,
  Building2,
  Home,
  Package,
} from "lucide-react";
import {
  useCutterOrders,
  useCreateCutterOrder,
  useAvailableFoamBlocks,
} from "../../hooks/useCutter";
import { getClients } from "../../api/endpoints/clients";
import {
  AvailableFoamBlock,
  CUTTER_STATUS_ORDER,
  CUTTER_STATUS_LABEL,
  CutterWorkOrderStatus,
} from "../../api/endpoints/cutter";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

export const CutterWorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [internalOnly, setInternalOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [stockLotId, setStockLotId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => getClients() });
  const { data: foamBlocksPage } = useAvailableFoamBlocks();
  const foamBlocks: AvailableFoamBlock[] = foamBlocksPage?.data ?? [];
  const selectedBlock = foamBlocks.find((b) => b.id === stockLotId);

  const { data, isLoading, refetch } = useCutterOrders({
    status: statusFilter || undefined,
    internal_only: internalOnly || undefined,
  });
  const createMutation = useCreateCutterOrder();

  const orders = data?.data ?? [];

  const resetCreateForm = () => {
    setOrderNumber("");
    setClientId("");
    setNotes("");
    setStockLotId("");
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        order_number: orderNumber,
        client_id: clientId || undefined,
        notes: notes || undefined,
        stock_lot_id: stockLotId || undefined,
      },
      {
        onSuccess: (res) => {
          setShowForm(false);
          resetCreateForm();
          navigate(`/cutter/orders/${res.data.id}`);
        },
        onError: (err: unknown) =>
          setError(
            apiErrorPayload(err)?.errors?.order_number?.[0] ??
              apiErrorPayload(err)?.message ??
              "Could not create the work order.",
          ),
      },
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Scissors className="w-7 h-7 text-app-accent" />
            Cutter Work Orders
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Foam blocks cut to template shapes. Offcuts are weighed before an order can pass quality
            check.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Work Order
          </button>
        </div>
      </div>

      {error && !showForm && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pipeline filter — the lifecycle doubles as the filter row */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-3 shadow-sm">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            statusFilter === ""
              ? "bg-app-accent text-white"
              : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
          }`}
        >
          All
        </button>
        {CUTTER_STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "bg-app-accent text-white"
                : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            {CUTTER_STATUS_LABEL[s]}
          </button>
        ))}

        <label className="ms-auto flex items-center gap-2 text-xs text-app-label-secondary">
          <input
            type="checkbox"
            checked={internalOnly}
            onChange={(e) => setInternalOnly(e.target.checked)}
            className="accent-current"
          />
          Internal only
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            Loading work orders...
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">Order</th>
                <th className="px-4 py-3 text-start">Source</th>
                <th className="px-4 py-3 text-start">Block</th>
                <th className="px-4 py-3 text-start">Lines</th>
                <th className="px-4 py-3 text-start">Material in Order</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">{o.order_number}</td>
                  <td className="px-4 py-3">
                    {o.client_id ? (
                      <span className="inline-flex items-center gap-1 text-app-label-primary">
                        <Building2 className="w-3.5 h-3.5" /> Client
                      </span>
                    ) : (
                      // Internal orders skip the credit check entirely.
                      <span className="inline-flex items-center gap-1 text-app-label-secondary">
                        <Home className="w-3.5 h-3.5" /> Internal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {o.stock_lot ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 font-mono text-app-accent">
                          <Package className="h-3 w-3" /> {o.stock_lot.lot_number}
                        </span>
                        <span className="text-[10px] text-app-label-tertiary">
                          {formatNumber(Number(o.stock_lot.unit_cost))} locked
                        </span>
                      </div>
                    ) : (
                      <span className="text-app-label-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold">{o.lines_count ?? o.lines?.length ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {formatNumber(o.wip_cost)} LYD
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
                      {CUTTER_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={() => navigate(`/cutter/orders/${o.id}`)}
                      className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
                    >
                      <Scissors className="w-3.5 h-3.5" /> Open
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-tertiary">
                    No cutter work orders{statusFilter ? ` at ${CUTTER_STATUS_LABEL[statusFilter as CutterWorkOrderStatus]}` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={showForm}
        onOpenChange={(next) => {
          setShowForm(next);
          if (!next) resetCreateForm();
        }}
      >
        <DialogContent size="2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle>New Cutter Work Order</DialogTitle>
                <DialogDescription>
                  Leave the client unset for an internal order. Pick a precut block to commit its measurements + price to the order at creation.
                </DialogDescription>
              </div>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form id="cutter-work-order-form" onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="CWO-1042"
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  Client
                </label>
                <SearchableSelect<{ id: string; entity?: { name?: string } }>
                  options={clients ?? []}
                  value={
                    clients?.find((c) => c.id === clientId) ?? null
                  }
                  onChange={(c) => setClientId(c ? c.id : "")}
                  getOptionId={(c) => c.id}
                  getOptionLabel={(c) => c.entity?.name ?? c.id}
                  placeholder="Internal (from another unit)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  Precut Block (optional)
                </label>
                <SearchableSelect<AvailableFoamBlock>
                  options={foamBlocks}
                  value={
                    foamBlocks.find((b) => b.id === stockLotId) ?? null
                  }
                  onChange={(b) => setStockLotId(b ? b.id : "")}
                  getOptionId={(b) => b.id}
                  getOptionLabel={(b) => b.lot_number}
                  getOptionSubLabel={(b) =>
                    `${b.inventory_item?.sku ?? ""} · ${formatNumber(Number(b.unit_cost))} ${
                      b.warehouse?.name ?? ""
                    }`
                  }
                  getOptionSearchText={(b) =>
                    `${b.lot_number} ${b.inventory_item?.sku ?? ""} ${b.inventory_item?.name ?? ""}`
                  }
                  placeholder="No block yet — pick later"
                />
                {selectedBlock && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-app-accent-subtle px-2 py-0.5 font-mono text-app-accent">
                      <Package className="h-3 w-3" />
                      {selectedBlock.lot_number}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-app-bg-secondary px-2 py-0.5 text-app-label-secondary border border-app-separator">
                      {Number(selectedBlock.length_m ?? 0).toFixed(2)} ×
                      {" "}{Number(selectedBlock.width_m ?? 0).toFixed(2)} ×
                      {" "}{Number(selectedBlock.height_m ?? 0).toFixed(2)} م
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-app-bg-secondary px-2 py-0.5 text-app-label-secondary border border-app-separator">
                      {Number(selectedBlock.volume_m3 ?? 0).toFixed(4)} م³
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-app-accent/10 px-2 py-0.5 font-bold text-app-accent">
                      {formatNumber(Number(selectedBlock.unit_cost))} سعر مثبت
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-app-label-tertiary mt-1">
                  يتم حجز البلوك فور إنشاء الأمر وقفل قياساته وسعره. لا يمكن تبديل البلوك لاحقًا.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetCreateForm();
              }}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cutter-work-order-form"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Work Order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
