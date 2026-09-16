import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hammer, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { useProductionOrders, useCreateProductionOrder, useProducts } from "../../hooks/useFurniture";
import {
  ORDER_STATUS_ORDER, ORDER_STATUS_LABEL, ProductionOrderStatus, ProductionOrder, Product,
} from "../../api/endpoints/furniture";
import { apiErrorPayload } from "../../api/endpoints/production";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useProductionOrdersColumns } from "../../components/table-columns/productionOrdersColumns";

export const ProductionOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_number: "", product_id: "", quantity: "1" });
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useProductionOrders({ status: statusFilter || undefined });
  const { data: products } = useProducts();
  const createMutation = useCreateProductionOrder();

  const orders = data?.data ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        order_number: form.order_number,
        product_id: form.product_id,
        quantity: Number(form.quantity) || 1,
      },
      {
        onSuccess: (res) => {
          setShowForm(false);
          navigate(`/furniture/orders/${res.data.id}`);
        },
        onError: (err: unknown) => {
          const payload = apiErrorPayload(err);
          setError(
            payload?.code === "NO_ACTIVE_BOM"
              ? "لا توجد قائمة مواد (BOM) نشطة لهذا المنتج — أنشئ واحدة من صفحة المنتجات أولاً."
              : payload?.errors?.order_number?.[0] ?? payload?.message ?? "تعذّر إنشاء الطلب.",
          );
        },
      },
    );
  };

  const openOrder = (order: ProductionOrder) => navigate(`/furniture/orders/${order.id}`);

  const columns = useProductionOrdersColumns({ onOpenOrder: openOrder });

  const tableData = useMemo(() => orders, [orders]);
  const ordersTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    pageSize: 10,
    getRowId: (o) => o.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Hammer className="w-7 h-7 text-app-accent" />
            أوامر إنتاج الأثاث
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            تجميع يعتمد على قائمة المواد (BOM). التأكيد يحجز مخزون المكونات؛ ويتم تحميل تكلفة الاستهلاك
            على الطلب من اللوتات الفعلية المستخدمة.
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

      {error && !showForm && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-3 shadow-sm">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            statusFilter === "" ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
          }`}
        >
          الكل
        </button>
        {ORDER_STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              statusFilter === s ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            {ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <DataTable table={ordersTable}>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage={`لا توجد أوامر إنتاج${statusFilter ? ` بحالة ${ORDER_STATUS_LABEL[statusFilter as ProductionOrderStatus]}` : ""}.`}
          emptyIcon={Hammer}
        />
        <DataTable.Pagination />
      </DataTable>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent size="md">
          <DialogHeader>
            <div>
              <DialogTitle>أمر إنتاج جديد</DialogTitle>
              <DialogDescription>
                يستخدم قائمة المواد (BOM) النشطة للمنتج. لقطعة مخصصة، استنسخ وعدّل قائمة مواد من صفحة
                المنتجات أولاً.
              </DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form id="production-order-form" onSubmit={submit} className="space-y-3">
              <input
                type="text" required placeholder="رقم الطلب — PO-1042"
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
              <SearchableSelect<Product>
                options={products?.data ?? []}
                value={
                  products?.data.find((p) => p.id === form.product_id) ?? null
                }
                onChange={(p) =>
                  setForm({ ...form, product_id: p ? p.id : "" })
                }
                getOptionId={(p) => p.id}
                getOptionLabel={(p) => p.name}
                getOptionSubLabel={(p) =>
                  p.active_bom
                    ? `BOM v${p.active_bom.version}`
                    : "لا توجد قائمة مواد نشطة"
                }
                getOptionSearchText={(p) =>
                  `${p.name} ${p.sku ?? ""}`
                }
                placeholder="اختر منتجًا…"
                required
              />
              <input
                type="number" min="1" placeholder="الكمية"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
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
              form="production-order-form"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {createMutation.isPending ? "جاري الإنشاء…" : "إنشاء الطلب"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
