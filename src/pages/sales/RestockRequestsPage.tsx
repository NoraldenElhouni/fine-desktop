import React, { useState } from "react";
import { Truck, Plus, AlertTriangle, Trash2, Check, X, PackageCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRestockRequests, useCreateRestock, useRestockAction } from "../../hooks/useSales";
import { useInventoryItems } from "../../hooks/useInventory";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { apiErrorPayload } from "../../api/endpoints/production";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { InventoryItem } from "../../api/endpoints/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const STATUS_STYLE: Record<string, string> = {
  pending_approval: "bg-app-status-yellow/15 text-app-status-yellow",
  approved: "bg-app-accent-subtle text-app-accent",
  rejected: "bg-app-status-danger/10 text-app-status-danger",
  fulfilled: "bg-app-status-positive/10 text-app-status-positive",
};

const STATUS_LABEL: Record<string, string> = {
  pending_approval: "بانتظار الموافقة",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
  fulfilled: "تم التنفيذ",
};

export const RestockRequestsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState("");
  const [sourceUnitId, setSourceUnitId] = useState("");
  const [lines, setLines] = useState([{ key: "1", item: "", qty: "1" }]);

  const { data: requests, isLoading } = useRestockRequests();
  const { data: items } = useInventoryItems({});
  const { data: units } = useQuery({ queryKey: ["operatingUnits"], queryFn: () => getOperatingUnits() });
  const createMutation = useCreateRestock();
  const actionMutation = useRestockAction();

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const ACTION_LABEL: Record<"approve" | "reject" | "fulfill", string> = {
    approve: "الموافقة",
    reject: "الرفض",
    fulfill: "التنفيذ",
  };

  const act = (id: string, action: "approve" | "reject" | "fulfill") => {
    setError(null);
    actionMutation.mutate({ id, action }, { onError: (e) => fail(e, `تعذّرت ${ACTION_LABEL[action]}.`) });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        request_number: requestNumber,
        source_unit_id: sourceUnitId,
        lines: lines.map((l) => ({ inventory_item_id: l.item, quantity: num(l.qty) })),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setRequestNumber("");
          setLines([{ key: "1", item: "", qty: "1" }]);
        },
        onError: (err) => fail(err, "تعذّر إنشاء الطلب."),
      },
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Truck className="w-7 h-7 text-app-accent" />
            التموين الداخلي
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            اطلب مخزونًا من وحدة أخرى. يوافق مدير الوحدة المصدر قبل أي تحريك؛ وتنتقل التحويلات بسعر
            التكلفة.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> طلب جديد
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جاري التحميل…</div>
        ) : (
          <div className="divide-y divide-app-separator">
            {requests?.data.map((r) => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-app-accent text-sm">{r.request_number}</span>
                  <span className="text-xs text-app-label-secondary">
                    {r.requesting_unit?.name} ← {r.source_unit?.name}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_STYLE[r.status] ?? ""}`}>
                    {STATUS_LABEL[r.status] ?? r.status.replace(/_/g, " ")}
                  </span>

                  <div className="ms-auto flex gap-2">
                    {r.status === "pending_approval" && (
                      <>
                        <button
                          onClick={() => act(r.id, "approve")}
                          disabled={actionMutation.isPending}
                          className="flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> موافقة
                        </button>
                        <button
                          onClick={() => act(r.id, "reject")}
                          disabled={actionMutation.isPending}
                          className="flex items-center gap-1 rounded-xl border border-app-status-danger/40 px-3 py-1.5 text-xs font-bold text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> رفض
                        </button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <button
                        onClick={() => act(r.id, "fulfill")}
                        disabled={actionMutation.isPending}
                        className="flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> تنفيذ التحويل
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-app-label-secondary font-mono">
                  {r.lines?.map((l) => (
                    <span key={l.id} className="me-4">
                      {l.inventory_item?.name ?? l.inventory_item?.sku} × {Number(l.quantity)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {requests?.data.length === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">لا توجد طلبات تموين.</div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>طلب مخزون</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form id="restock-request-form" onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">رقم الطلب</label>
                <input
                  type="text" required placeholder="رقم الطلب — RSR-1042"
                  value={requestNumber}
                  onChange={(e) => setRequestNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الطلب من وحدة</label>
                <SearchableSelect<{ id: string; name: string }>
                  options={units ?? []}
                  value={
                    units?.find((u) => u.id === sourceUnitId) ?? null
                  }
                  onChange={(u) => setSourceUnitId(u ? u.id : "")}
                  getOptionId={(u) => u.id}
                  getOptionLabel={(u) => u.name}
                  placeholder="الطلب من وحدة…"
                  required
                />
              </div>

              {lines.map((l) => (
                <div key={l.key} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <SearchableSelect<InventoryItem>
                      options={items?.data ?? []}
                      value={
                        items?.data.find((i) => i.id === l.item) ?? null
                      }
                      onChange={(item) =>
                        setLines(
                          lines.map((x) =>
                            x.key === l.key ? { ...x, item: item ? item.id : "" } : x
                          )
                        )
                      }
                      getOptionId={(i) => i.id}
                      getOptionLabel={(i) => i.name}
                      getOptionSubLabel={(i) => i.sku}
                      getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                      placeholder="الصنف…"
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">الكمية</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={l.qty}
                      onChange={(e) => setLines(lines.map((x) => x.key === l.key ? { ...x, qty: e.target.value } : x))}
                      className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    />
                  </div>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines(lines.filter((x) => x.key !== l.key))}
                      className="p-1 text-app-label-tertiary hover:text-app-status-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLines([...lines, { key: Math.random().toString(36).slice(2), item: "", qty: "1" }])}
                className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة بند
              </button>

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
              form="restock-request-form"
              disabled={createMutation.isPending || !sourceUnitId || lines.some((l) => !l.item)}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {createMutation.isPending ? "جاري الإرسال…" : "إرسال الطلب"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
