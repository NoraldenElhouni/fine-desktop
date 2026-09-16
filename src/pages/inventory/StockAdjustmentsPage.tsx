import React, { useMemo, useState } from "react";
import { useStockAdjustments, useApproveAdjustment } from "../../hooks/useInventory";
import { ShieldCheck } from "lucide-react";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useStockAdjustmentsColumns } from "../../components/table-columns/stockAdjustmentsColumns";

export const StockAdjustmentsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: adjustments, isLoading } = useStockAdjustments({ status: statusFilter || undefined });
  const approveMutation = useApproveAdjustment();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const columns = useStockAdjustmentsColumns({ onApprove: handleApprove, isApproving: approveMutation.isPending });

  const tableData = useMemo(() => adjustments ?? [], [adjustments]);
  const adjustmentsTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (adj) => adj.id,
  });

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
      <DataTable table={adjustmentsTable}>
        <DataTable.Header>
          <DataTable.Toolbar>
            <DataTable.SearchInput placeholder="بحث برقم الدفعة أو رمز السبب أو مقدم الطلب..." />
          </DataTable.Toolbar>
        </DataTable.Header>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage="لا توجد طلبات تسوية مخزون."
          emptyIcon={ShieldCheck}
        />
        <DataTable.Pagination />
      </DataTable>
    </div>
  );
};
