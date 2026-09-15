import React, { useState } from "react";
import { useStockAdjustments, useApproveAdjustment } from "../../hooks/useInventory";
import { StockAdjustmentRequest } from "../../api/endpoints/inventory";
import { ShieldCheck, Check } from "lucide-react";

export const StockAdjustmentsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: adjustments, isLoading } = useStockAdjustments({ status: statusFilter || undefined });
  const approveMutation = useApproveAdjustment();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-app-accent" />
            قائمة اعتماد تسويات المخزون
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            مسار اعتماد مدير الوحدة لتسويات الجرد اليدوي وفقدان الانسكاب وتسويات التلف.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              statusFilter === "pending"
                ? "bg-app-accent text-white shadow-sm"
                : "bg-app-bg-secondary border border-app-separator text-app-label-secondary hover:bg-app-fill-f1"
            }`}
          >
            بانتظار الاعتماد
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              statusFilter === "approved"
                ? "bg-app-accent text-white shadow-sm"
                : "bg-app-bg-secondary border border-app-separator text-app-label-secondary hover:bg-app-fill-f1"
            }`}
          >
            سجل الاعتمادات
          </button>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            جاري تحميل طلبات التسوية…
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">رقم الدفعة</th>
                <th className="px-4 py-3 text-start">رمز السبب</th>
                <th className="px-4 py-3 text-start">فرق الكمية</th>
                <th className="px-4 py-3 text-start">مقدَّم من</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-end">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {adjustments?.map((adj: StockAdjustmentRequest) => (
                <tr key={adj.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-label-primary">
                    {adj.stock_lot?.lot_number || adj.stock_lot_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
                      {adj.reason_code}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-mono font-bold ${adj.quantity_delta < 0 ? "text-app-status-danger" : "text-app-status-positive"}`}>
                    {adj.quantity_delta > 0 ? `+${adj.quantity_delta}` : adj.quantity_delta}
                  </td>
                  <td className="px-4 py-3 font-medium text-app-label-secondary">
                    {adj.requested_by?.name || "مستخدم"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        adj.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : adj.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {adj.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    {adj.status === "pending" ? (
                      <button
                        onClick={() => handleApprove(adj.id)}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-app-accent text-white font-bold text-xs rounded-xl hover:opacity-90 transition shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> اعتماد وترحيل
                      </button>
                    ) : (
                      <span className="text-xs text-app-label-tertiary">تمت التسوية</span>
                    )}
                  </td>
                </tr>
              ))}
              {adjustments?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-app-label-tertiary">
                    لا توجد طلبات تسوية مخزون.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
