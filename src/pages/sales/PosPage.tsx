import React, { useState } from "react";
import { FileSpreadsheet, FileText, History, ShieldAlert, ShoppingCart, Store, Undo2 } from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import { useActivePosShift, useCreditApprovals, usePosDailyReport, usePosShifts } from "../../hooks/useSales";
import { PosShift, Quotation } from "../../api/endpoints/sales";
import { NewSalePanel } from "../../components/pos/NewSalePanel";
import { SalesListPage } from "./SalesListPage";
import { QuotationsPage } from "./QuotationsPage";
import { ApprovalsPage } from "./ApprovalsPage";
import { SalesReturnsListPage } from "./SalesReturnsListPage";
import { PosDailyCloseModal } from "../../components/pos/PosDailyCloseModal";
import { formatNumber } from "../../lib/utils/format";
import { PosSettingsMenu, PosShiftChip } from "../../components/pos/PosShiftControls";
import { PosOpenShiftDialog } from "../../components/pos/PosOpenShiftDialog";
import { PosCloseShiftDialog } from "../../components/pos/PosCloseShiftDialog";
import { PosShiftReportModal } from "../../components/pos/PosShiftReportModal";
import { PosShiftsHistory } from "../../components/pos/PosShiftsHistory";

const MANAGER_ROLES = ["owner", "admin", "store-manager", "unit_manager", "manager", "accounting-manager"];

interface RoleWithPivot {
  slug?: string;
  pivot?: { operating_unit_id: string | null };
}

type Tab = "new" | "sales" | "returns" | "quotations" | "approvals" | "shifts";

/** The POS: the one place every sale happens, plus the history, returns, quotations and manager approvals. */
export const PosPage: React.FC = () => {
  const { user, hasRole, roleSlugs, permissions } = usePermissions();
  const canApprove = hasRole(MANAGER_ROLES);

  const [tab, setTab] = useState<Tab>("new");
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [loadedQuotation, setLoadedQuotation] = useState<Quotation | null>(null);
  const [isOpenShiftOpen, setIsOpenShiftOpen] = useState(false);
  const [closeShiftId, setCloseShiftId] = useState<string | null>(null);
  const [shiftReport, setShiftReport] = useState<{ id: string; mode: "x" | "z" } | null>(null);
  /** A colleague's open shift this cashier chose to work under (shared drawer); never implicit. */
  const [joinedShiftId, setJoinedShiftId] = useState<string | null>(null);

  const {
    unit,
    enabled: shiftsEnabled,
    ownShift,
    extraOwnShifts,
    otherShifts,
    isLoading: isShiftLoading,
    isUnitLoading,
  } = useActivePosShift();
  const activeShift = ownShift ?? otherShifts.find((s) => s.id === joinedShiftId) ?? null;
  const isOwnShift = Boolean(ownShift);

  // A unit that ran shifts before keeps its shift history (and Z-reports) reachable after switching them off.
  const { data: shiftProbe, isLoading: isProbeLoading } = usePosShifts({ per_page: 1 }, Boolean(unit) && !shiftsEnabled);
  /** undefined while the unit or the history check is still loading (the daily close waits on it). */
  const shiftHistory: boolean | undefined = shiftsEnabled
    ? true
    : isUnitLoading || (Boolean(unit) && isProbeLoading)
      ? undefined
      : (shiftProbe?.total ?? shiftProbe?.data.length ?? 0) > 0;
  const hasShiftHistory = Boolean(shiftHistory);
  const activeTab: Tab = tab === "shifts" && !hasShiftHistory ? "new" : tab;

  // Mirrors the route and updateSettings together: the route admits owner/admin or a manager role
  // (store-manager, unit_manager, manager); updateSettings then wants that role here or company-wide.
  const settingsRoles = ((user as { roles?: RoleWithPivot[] } | null)?.roles ?? []).map((r) => ({
    slug: (r.slug ?? "").toLowerCase().replace(/_/g, "-"),
    unitId: r.pivot?.operating_unit_id ?? null,
  }));
  const canManageShifts =
    Boolean(unit) &&
    settingsRoles.some(
      (r) =>
        r.slug === "owner" ||
        r.slug === "admin" ||
        (["store-manager", "unit-manager", "manager"].includes(r.slug) &&
          (r.unitId === null || String(r.unitId) === String(unit?.id))),
    );

  // Mirrors PosShiftService::managesShift: the owner role, or approve-credit held through a role in the
  // shift's unit or company-wide. The payload carries permission slugs only flat (not per role), so the
  // unit scope is approximated by requiring some role held here or company-wide; the server still checks.
  const userRoles = (user as { roles?: RoleWithPivot[] } | null)?.roles ?? [];
  const holdsRoleHere =
    userRoles.length === 0 ||
    userRoles.some(
      (r) => !r.pivot || r.pivot.operating_unit_id === null || String(r.pivot.operating_unit_id) === String(unit?.id),
    );
  const canCloseOthersShifts =
    roleSlugs.includes("owner") || permissions.includes("*") || (permissions.includes("approve-credit") && holdsRoleHere);

  const { data: report } = usePosDailyReport();
  const { data: pendingApprovals } = useCreditApprovals("pending", canApprove);
  const pendingCount = pendingApprovals?.total ?? 0;

  const tabs: { id: Tab; label: string; icon: typeof Store; badge?: number }[] = [
    { id: "new", label: "بيع جديد", icon: ShoppingCart },
    { id: "sales", label: "المبيعات", icon: Store },
    { id: "returns", label: "المرتجعات", icon: Undo2 },
    { id: "quotations", label: "عروض الأسعار", icon: FileText },
    ...(canApprove ? [{ id: "approvals" as const, label: "الموافقات", icon: ShieldAlert, badge: pendingCount || undefined }] : []),
    ...(hasShiftHistory ? [{ id: "shifts" as const, label: "الورديات", icon: History }] : []),
  ];

  const openShiftReport = (s: PosShift) => setShiftReport({ id: s.id, mode: s.status === "open" ? "x" : "z" });

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
        <div className="flex flex-wrap items-center gap-3">
          {shiftsEnabled && (
            <PosShiftChip
              shift={activeShift}
              isOwn={isOwnShift}
              otherShifts={otherShifts}
              extraOwnShifts={extraOwnShifts}
              canCloseOthers={canCloseOthersShifts}
              isLoading={isShiftLoading}
              onOpenShift={() => setIsOpenShiftOpen(true)}
              onXReport={() => activeShift && setShiftReport({ id: activeShift.id, mode: "x" })}
              onCloseShift={() => activeShift && setCloseShiftId(activeShift.id)}
              onCloseShiftById={setCloseShiftId}
              onJoinShift={setJoinedShiftId}
            />
          )}
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
          {canManageShifts && unit && <PosSettingsMenu unitId={unit.id} shiftsEnabled={shiftsEnabled} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-2 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === t.id ? "bg-app-accent text-white" : "text-app-label-secondary hover:bg-app-fill-f1"
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

      {activeTab === "new" && (
        <NewSalePanel
          loadedQuotation={loadedQuotation}
          onQuotationDone={() => setLoadedQuotation(null)}
          shiftLock={{
            enabled: shiftsEnabled,
            shift: activeShift,
            isOwn: isOwnShift,
            isLoading: isShiftLoading,
            onOpenShift: () => setIsOpenShiftOpen(true),
          }}
        />
      )}
      {activeTab === "sales" && <SalesListPage />}
      {activeTab === "returns" && <SalesReturnsListPage />}
      {activeTab === "quotations" && (
        <QuotationsPage onOpenInPos={(q) => { setLoadedQuotation(q); setTab("new"); }} />
      )}
      {activeTab === "approvals" && canApprove && <ApprovalsPage />}
      {activeTab === "shifts" && hasShiftHistory && <PosShiftsHistory onOpenReport={openShiftReport} />}

      <PosDailyCloseModal
        isOpen={isDailyCloseOpen}
        report={report ?? null}
        shiftsEnabled={shiftsEnabled}
        hasShiftHistory={hasShiftHistory}
        isShiftHistoryLoading={shiftHistory === undefined}
        onClose={() => setIsDailyCloseOpen(false)}
      />

      <PosOpenShiftDialog isOpen={isOpenShiftOpen} onClose={() => setIsOpenShiftOpen(false)} />
      <PosCloseShiftDialog
        shiftId={closeShiftId}
        onClose={() => setCloseShiftId(null)}
        onClosed={(closed) => {
          setCloseShiftId(null);
          setShiftReport({ id: closed.id, mode: "z" });
        }}
      />
      <PosShiftReportModal
        shiftId={shiftReport?.id ?? null}
        mode={shiftReport?.mode ?? "x"}
        onClose={() => setShiftReport(null)}
      />
    </div>
  );
};
