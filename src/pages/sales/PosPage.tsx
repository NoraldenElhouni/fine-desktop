import React, { useState } from "react";
import { FileSpreadsheet, FileText, ShieldAlert, ShoppingCart, Store } from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { useCreditApprovals, usePosDailyReport } from "../../hooks/useSales";
import { Quotation } from "../../api/endpoints/sales";
import { NewSalePanel } from "../../components/pos/NewSalePanel";
import { SalesListPage } from "./SalesListPage";
import { QuotationsPage } from "./QuotationsPage";
import { ApprovalsPage } from "./ApprovalsPage";
import { PosDailyCloseModal } from "../../components/pos/PosDailyCloseModal";
import { formatNumber } from "../../lib/utils/format";

const MANAGER_ROLES = ["owner", "admin", "store-manager", "unit_manager", "manager", "accounting-manager"];

type Tab = "new" | "sales" | "quotations" | "approvals";

/** The POS: the one place every sale happens, plus the history, quotations and manager approvals. */
export const PosPage: React.FC = () => {
  const { hasRole } = usePermissions();
  const canApprove = hasRole(MANAGER_ROLES);

  const [tab, setTab] = useState<Tab>("new");
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [loadedQuotation, setLoadedQuotation] = useState<Quotation | null>(null);

  const { data: report } = usePosDailyReport();
  const { data: pendingApprovals } = useCreditApprovals("pending", canApprove);
  const pendingCount = pendingApprovals?.total ?? 0;

  const tabs: { id: Tab; label: string; icon: typeof Store; badge?: number }[] = [
    { id: "new", label: "بيع جديد", icon: ShoppingCart },
    { id: "sales", label: "المبيعات", icon: Store },
    { id: "quotations", label: "عروض الأسعار", icon: FileText },
    ...(canApprove ? [{ id: "approvals" as const, label: "الموافقات", icon: ShieldAlert, badge: pendingCount || undefined }] : []),
  ];

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Store className="w-7 h-7 text-app-accent" />
            المبيعات ونقطة البيع
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            بيع الأصناف والحزم لعميل مسجّل أو تحويلها لوحدة تشغيلية أخرى.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {report && (
            <div className="flex items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs shadow-sm">
              <span className="text-app-label-secondary">اليوم:</span>
              <span className="font-mono font-bold text-app-label-primary">
                {report.sales_count} عملية · {formatNumber(report.total)} د.ل
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsDailyCloseOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-secondary px-3.5 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-app-accent" />
            تقرير الصندوق (Z-Report)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-2 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              tab === t.id ? "bg-app-accent text-white" : "text-app-label-secondary hover:bg-app-fill-f1"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {Boolean(t.badge) && (
              <span className="rounded-full bg-app-status-danger px-1.5 py-0.5 text-[10px] text-white">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "new" && <NewSalePanel loadedQuotation={loadedQuotation} onQuotationDone={() => setLoadedQuotation(null)} />}
      {tab === "sales" && <SalesListPage />}
      {tab === "quotations" && (
        <QuotationsPage onOpenInPos={(q) => { setLoadedQuotation(q); setTab("new"); }} />
      )}
      {tab === "approvals" && canApprove && <ApprovalsPage />}

      <PosDailyCloseModal
        isOpen={isDailyCloseOpen}
        report={report ?? null}
        onClose={() => setIsDailyCloseOpen(false)}
      />
    </div>
  );
};
