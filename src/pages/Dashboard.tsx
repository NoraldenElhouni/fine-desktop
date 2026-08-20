import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Store,
  Boxes,
  Layers,
  ArrowRightLeft,
  CalendarCheck2,
  Scissors,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useServerConfigStore } from "../stores/serverConfigStore";
import { useAuthStore } from "../stores/authStore";
import { usePosDailyReport, useRestockRequests } from "../hooks/useSales";
import { useProductionBatches } from "../hooks/useProduction";
import { useStockLots } from "../hooks/useInventory";
import { getOperatingUnits } from "../api/endpoints/operatingUnits";
import { OperatingUnit } from "../types/entities";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { operatingUnitId, isServerConnected } = useServerConfigStore();

  const { data: units } = useQuery<OperatingUnit[]>({
    queryKey: ["operatingUnits"],
    queryFn: getOperatingUnits,
  });

  const { data: posReport, isLoading: isPosLoading } = usePosDailyReport();
  const { data: batchesData, isLoading: isBatchesLoading, refetch: refetchBatches } = useProductionBatches({ page: 1 });
  const { data: stockLotsData, isLoading: isStockLoading } = useStockLots({ status: "available" });
  const { data: restockData, isLoading: isRestockLoading } = useRestockRequests("pending_approval");

  const activeBatches =
    batchesData?.data?.filter(
      (b) => b.status === "running" || b.status === "curing" || b.status === "ready_for_grading" || b.status === "graded"
    ) ?? [];
  const recentBatches = batchesData?.data?.slice(0, 5) ?? [];
  const totalStockLots = stockLotsData?.data?.length ?? 0;
  const pendingRestockCount = restockData?.data?.length ?? 0;

  const currentUnit = units?.find((u: OperatingUnit) => u.id === operatingUnitId);
  const currentUnitName = currentUnit?.name || "الوحدة التشغيلية الحالية";

  return (
    <div className="space-y-8 p-6" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-app-separator bg-app-bg-primary p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-app-accent/15 text-app-accent">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-app-label-primary">
                {currentUnitName}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                isServerConnected
                  ? "bg-app-status-positive/15 text-app-status-positive border border-app-status-positive/30"
                  : "bg-app-status-danger/15 text-app-status-danger border border-app-status-danger/30"
              }`}>
                <span className={`h-2 w-2 rounded-full ${isServerConnected ? "bg-app-status-positive" : "bg-app-status-danger"}`} />
                {isServerConnected ? "متصل بالنظام المباشر" : "منقطع عن السيرفر"}
              </span>
            </div>
            <p className="text-xs text-app-label-secondary mt-1">
              لوحة العمليات المباشرة للوحدة التشغيلية — مرحباً بك، {user?.name || "المشرف"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchBatches()}
            className="flex items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-secondary px-4 py-2.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Activity className="h-4 w-4 text-app-accent" />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* Real-time KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* POS Sales Today */}
        <div
          onClick={() => navigate("/sales/pos")}
          className="group cursor-pointer rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm hover:border-app-accent/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-label-secondary">مبيعات اليوم (POS)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-status-positive/15 text-app-status-positive group-hover:scale-110 transition-transform">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-app-label-primary">
              {isPosLoading ? "..." : Number(posReport?.total || 0).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-app-label-secondary">د.ل</span>
          </div>
          <div className="mt-2 text-[11px] text-app-label-tertiary flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-app-status-positive" />
            <span>{posReport?.sales_count || 0} عملية بيع منجزة اليوم</span>
          </div>
        </div>

        {/* Active Production Batches */}
        <div
          onClick={() => navigate("/manufacturing/foam/batches")}
          className="group cursor-pointer rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm hover:border-app-accent/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-label-secondary">تشغيلات الإنتاج النشطة</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-accent/15 text-app-accent group-hover:scale-110 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-app-label-primary">
              {isBatchesLoading ? "..." : activeBatches.length}
            </span>
            <span className="text-xs font-semibold text-app-label-secondary">تشغيلة جارية</span>
          </div>
          <div className="mt-2 text-[11px] text-app-label-tertiary flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-app-accent" />
            <span>{batchesData?.data?.length || 0} إجمالي الدفعات المسجلة</span>
          </div>
        </div>

        {/* Available Stock Lots */}
        <div
          onClick={() => navigate("/inventory/lots")}
          className="group cursor-pointer rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm hover:border-app-accent/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-label-secondary">الطرود المتاحة بالمخازن</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-status-info/15 text-app-status-info group-hover:scale-110 transition-transform">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-app-label-primary">
              {isStockLoading ? "..." : totalStockLots}
            </span>
            <span className="text-xs font-semibold text-app-label-secondary">طرد / قالب</span>
          </div>
          <div className="mt-2 text-[11px] text-app-label-tertiary flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-app-status-positive" />
            <span>جاهزة للصرف والتقطيع والبيع</span>
          </div>
        </div>

        {/* Pending Restock Requests */}
        <div
          onClick={() => navigate("/sales/restock-requests")}
          className="group cursor-pointer rounded-2xl border border-app-separator bg-app-bg-primary p-5 shadow-sm hover:border-app-accent/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-label-secondary">طلبات التموين المعلقة</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-status-warning/15 text-app-status-warning group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-app-label-primary">
              {isRestockLoading ? "..." : pendingRestockCount}
            </span>
            <span className="text-xs font-semibold text-app-label-secondary">طلب معلق</span>
          </div>
          <div className="mt-2 text-[11px] text-app-label-tertiary flex items-center gap-1">
            <span>تحويلات داخلية بين الوحدات</span>
          </div>
        </div>
      </div>

      {/* Operational Action Shortcuts Hub */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-app-label-primary">
          الوصول السريع للعمليات التشغيلية (Quick Workflows)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => navigate("/sales/pos")}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-app-separator bg-app-bg-primary hover:border-app-accent hover:bg-app-fill-f1 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-accent/15 text-app-accent group-hover:scale-110 transition-transform mb-3">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-app-label-primary">نقطة البيع (POS)</span>
            <span className="text-[10px] text-app-label-secondary mt-1">مبيعات نقدية فورية</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/manufacturing/foam/batches")}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-app-separator bg-app-bg-primary hover:border-app-accent hover:bg-app-fill-f1 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-status-info/15 text-app-status-info group-hover:scale-110 transition-transform mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-app-label-primary">تشغيلات الإسفنج</span>
            <span className="text-[10px] text-app-label-secondary mt-1">صب وقوالب وبلوكات</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/cutter/work-orders")}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-app-separator bg-app-bg-primary hover:border-app-accent hover:bg-app-fill-f1 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-status-warning/15 text-app-status-warning group-hover:scale-110 transition-transform mb-3">
              <Scissors className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-app-label-primary">أوامر التقطيع</span>
            <span className="text-[10px] text-app-label-secondary mt-1">قص البلوكات والتشكيل</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/inventory/movements")}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-app-separator bg-app-bg-primary hover:border-app-accent hover:bg-app-fill-f1 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-status-positive/15 text-app-status-positive group-hover:scale-110 transition-transform mb-3">
              <Boxes className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-app-label-primary">حركات المخزون</span>
            <span className="text-[10px] text-app-label-secondary mt-1">سجل القيود INV-06</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/hr/attendance")}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-app-separator bg-app-bg-primary hover:border-app-accent hover:bg-app-fill-f1 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-accent/15 text-app-accent group-hover:scale-110 transition-transform mb-3">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-app-label-primary">الحضور والانصراف</span>
            <span className="text-[10px] text-app-label-secondary mt-1">كشف الدوام اليومي</span>
          </button>
        </div>
      </div>

      {/* Recent Production Activity Feed */}
      <div className="rounded-3xl border border-app-separator bg-app-bg-primary p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app-separator pb-4">
          <div>
            <h2 className="text-sm font-bold text-app-label-primary">
              أحدث تشغيلات الإنتاج بالوحدة (Recent Production Batches)
            </h2>
            <p className="text-[11px] text-app-label-secondary mt-0.5">
              متابعة حالة صب القوالب والتقييم والإغلاق الحسابي
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/manufacturing/foam/batches")}
            className="flex items-center gap-1 text-xs font-bold text-app-accent hover:underline"
          >
            <span>عرض كافة التشغيلات</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="divide-y divide-app-separator overflow-x-auto">
          {recentBatches.length > 0 ? (
            recentBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => navigate(`/manufacturing/foam/batches/${batch.id}`)}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-app-fill-f1 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-bg-secondary text-app-label-secondary font-mono text-xs font-bold">
                    #{batch.operation_number}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-app-label-primary">
                      تشغيلة إنتاج إسفنج #{batch.operation_number}
                    </div>
                    <div className="text-[10px] text-app-label-secondary mt-0.5 font-mono">
                      التاريخ: {new Date(batch.created_at).toLocaleDateString("ar-LY")} • الكثافة: {batch.formula_params?.density_band || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    batch.status === "closed"
                      ? "bg-app-status-positive/15 text-app-status-positive"
                      : batch.status === "running" || batch.status === "graded"
                      ? "bg-app-status-warning/15 text-app-status-warning"
                      : "bg-app-bg-secondary text-app-label-secondary"
                  }`}>
                    {batch.status === "closed"
                      ? "مغلقة ومرحلة"
                      : batch.status === "graded"
                      ? "تم التقييم"
                      : batch.status === "running"
                      ? "قيد الصب"
                      : batch.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-app-label-primary">
                    {batch.blocks_count || 0} قالب
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-app-label-secondary">
              لا توجد تشغيلات إنتاج مسجلة حالياً لهذه الوحدة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
