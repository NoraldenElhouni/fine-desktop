import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  Users,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Wallet,
} from "lucide-react";
import {
  useIncomeStatement,
  useBalanceSheet,
  useUnitProfitability,
} from "../../hooks/useAccounting";
import { usePartnerBalances } from "../../hooks/usePartnerReports";
import type { ReportRow } from "../../api/endpoints/accounting";
import type { PartnerBalanceRow } from "../../api/endpoints/partnerReports";
import { formatNumber } from "../../lib/utils/format";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useUnitProfitabilityColumns } from "../../components/table-columns/financialReportsColumns";
import { usePartnerBalancesColumns } from "../../components/table-columns/partnerBalancesColumns";
import { PartnerStatementDialog } from "../../components/accounting/PartnerStatementDialog";

type Tab = "income" | "balance" | "units" | "clients_ar" | "suppliers_ap";

const TABS: { id: Tab; label: string }[] = [
  { id: "income", label: "قائمة الدخل" },
  { id: "balance", label: "الميزانية العمومية" },
  { id: "units", label: "ربحية الوحدات" },
  { id: "clients_ar", label: "أرصدة العملاء (الذمم المدينة)" },
  { id: "suppliers_ap", label: "أرصدة الموردين (الذمم الدائنة)" },
];

const ReportSection: React.FC<{ title: string; rows: ReportRow[]; total: number }> = ({ title, rows, total }) => (
  <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
    <h3 className="px-4 py-2.5 text-xs font-bold text-app-label-primary bg-app-bg-secondary border-b border-app-separator">
      {title}
    </h3>
    <div className="divide-y divide-app-separator">
      {rows.map((row) => (
        <div key={row.account_code} className="flex items-center px-4 py-2 text-xs">
          <span className="font-mono font-bold text-app-accent me-3">{row.account_code}</span>
          <span className="text-app-label-primary">{row.name}</span>
          <span className="ms-auto font-mono">{formatNumber(row.balance)}</span>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="px-4 py-4 text-center text-xs text-app-label-tertiary">لا توجد حركة.</div>
      )}
      <div className="flex items-center px-4 py-2.5 text-xs font-bold bg-app-bg-secondary">
        <span className="text-app-label-primary">الإجمالي</span>
        <span className="ms-auto font-mono">{formatNumber(total)}</span>
      </div>
    </div>
  </div>
);

export const FinancialReportsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("income");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [asOf, setAsOf] = useState("");

  // Statement dialog state
  const [statementOpen, setStatementOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<{
    id: string;
    type: "client" | "supplier";
    name: string;
  } | null>(null);

  const period = { from: from || undefined, to: to || undefined };
  const income = useIncomeStatement(tab === "income" ? period : undefined);
  const balance = useBalanceSheet(tab === "balance" ? asOf || undefined : undefined);
  const units = useUnitProfitability(tab === "units" ? period : undefined);

  // Partner reports queries
  const partnerBalances = usePartnerBalances(
    tab === "suppliers_ap" ? "suppliers" : "clients",
    { asOf: asOf || undefined }
  );

  const handleOpenStatement = (row: PartnerBalanceRow) => {
    setSelectedParty({
      id: row.id,
      type: tab === "suppliers_ap" ? "supplier" : "client",
      name: row.name,
    });
    setStatementOpen(true);
  };

  const unitColumns = useUnitProfitabilityColumns();
  const unitsData = useMemo(() => units.data?.rows ?? [], [units.data]);
  const unitsTable = useDataTable({
    columns: unitColumns,
    data: unitsData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (r) => r.operating_unit_id ?? "unallocated",
  });

  const partnerColumns = usePartnerBalancesColumns({
    partyType: tab === "suppliers_ap" ? "suppliers" : "clients",
    onViewStatement: handleOpenStatement,
  });

  const partnerData = useMemo(
    () => (tab === "clients_ar" || tab === "suppliers_ap" ? partnerBalances.data?.rows ?? [] : []),
    [tab, partnerBalances.data]
  );

  const partnerTable = useDataTable({
    columns: partnerColumns,
    data: partnerData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 15,
    getRowId: (r) => r.id,
  });

  const isPeriodTab = tab === "income" || tab === "units";
  const isDateOnlyTab = tab === "balance" || tab === "clients_ar" || tab === "suppliers_ap";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-app-accent" />
          التقارير المالية والذمم (Financial & Partner Reports)
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          مشتقة مباشرة من سطور القيود التشغيلية وسجلات الذمم — لا أرقام مخزّنة. المالك يرى الشركة كاملة، ومدير الوحدة يرى وحدته.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-app-separator overflow-hidden flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                tab === t.id
                  ? "bg-app-accent text-white"
                  : "bg-app-bg-primary text-app-label-secondary hover:bg-app-fill-f1"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isPeriodTab && (
          <>
            <label className="flex items-center gap-2 text-xs text-app-label-secondary">
              من
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-app-label-secondary">
              إلى
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
              />
            </label>
          </>
        )}

        {isDateOnlyTab && (
          <label className="flex items-center gap-2 text-xs text-app-label-secondary">
            حتى تاريخ
            <input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            />
          </label>
        )}
      </div>

      {tab === "income" && (
        income.isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : income.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <ReportSection title="الإيرادات" rows={income.data.revenue.rows} total={income.data.revenue.total} />
              <ReportSection title="المصروفات" rows={income.data.expenses.rows} total={income.data.expenses.total} />
            </div>
            <div className={`rounded-2xl p-4 text-sm font-bold flex items-center justify-between ${income.data.net_income >= 0 ? "bg-app-status-positive/10 text-app-status-positive" : "bg-app-status-danger/10 text-app-status-danger"}`}>
              <span>صافي الدخل</span>
              <span className="font-mono">{formatNumber(income.data.net_income)}</span>
            </div>
          </div>
        )
      )}

      {tab === "balance" && (
        balance.isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : balance.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <ReportSection title="الأصول" rows={balance.data.assets.rows} total={balance.data.assets.total} />
              <ReportSection title="الالتزامات" rows={balance.data.liabilities.rows} total={balance.data.liabilities.total} />
              <div className="space-y-4">
                <ReportSection title="حقوق الملكية" rows={balance.data.equity.rows} total={balance.data.equity.total} />
                <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 text-xs flex items-center justify-between">
                  <span className="text-app-label-secondary">أرباح الفترة غير المرحّلة</span>
                  <span className="font-mono font-bold">{formatNumber(balance.data.equity.retained_current_period)}</span>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl p-4 text-sm font-bold flex items-center gap-2 ${balance.data.balanced ? "bg-app-status-positive/10 text-app-status-positive" : "bg-app-status-danger/10 text-app-status-danger"}`}>
              {balance.data.balanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>
                {balance.data.balanced
                  ? "الميزانية متوازنة: الأصول = الالتزامات + حقوق الملكية"
                  : "الميزانية غير متوازنة — راجع القيود"}
              </span>
              <span className="ms-auto font-mono">{formatNumber(balance.data.assets.total)}</span>
            </div>
          </div>
        )
      )}

      {tab === "units" && (
        units.isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : units.data && (
          <DataTable table={unitsTable}>
            <DataTable.Header>
              <DataTable.Toolbar>
                <DataTable.SearchInput placeholder="بحث بالوحدة التشغيلية..." />
              </DataTable.Toolbar>
            </DataTable.Header>
            <DataTable.Content emptyMessage="لا توجد حركة في هذه الفترة." emptyIcon={Landmark} />
            {units.data.rows.length > 0 && (
              <div className="flex items-center justify-between gap-4 border-t-2 border-app-separator bg-app-bg-secondary px-4 py-2.5 text-xs font-bold">
                <span className="text-app-label-primary">صافي الشركة</span>
                <span
                  className={`font-mono ${units.data.total_net < 0 ? "text-app-status-danger" : "text-app-status-positive"}`}
                >
                  {formatNumber(units.data.total_net)}
                </span>
              </div>
            )}
            <DataTable.Pagination />
          </DataTable>
        )
      )}

      {(tab === "clients_ar" || tab === "suppliers_ap") && (
        <div className="space-y-4">
          {/* KPI Metric Cards */}
          {partnerBalances.data?.summary && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-app-label-secondary">
                    {tab === "clients_ar" ? "إجمالي الذمم المدينة (المستحقة)" : "إجمالي الذمم الدائنة (المطلوبة)"}
                  </span>
                  {tab === "clients_ar" ? (
                    <Users className="h-4 w-4 text-app-accent" />
                  ) : (
                    <Truck className="h-4 w-4 text-app-accent" />
                  )}
                </div>
                <p className="mt-2 text-xl font-bold font-mono text-app-label-primary">
                  {formatNumber(
                    tab === "clients_ar"
                      ? partnerBalances.data.summary.total_receivables ?? 0
                      : partnerBalances.data.summary.total_payables ?? 0
                  )}{" "}
                  <span className="text-xs font-normal">د.ل</span>
                </p>
              </div>

              <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-app-label-secondary">
                    {tab === "clients_ar" ? "الدفعات المقدمة من العملاء" : "الدفعات المقدمة للموردين (حـ/15)"}
                  </span>
                  <ArrowDownLeft className="h-4 w-4 text-app-status-positive" />
                </div>
                <p className="mt-2 text-xl font-bold font-mono text-app-status-positive">
                  {formatNumber(
                    tab === "clients_ar"
                      ? partnerBalances.data.summary.total_credits_or_advances ?? 0
                      : partnerBalances.data.summary.total_advances ?? 0
                  )}{" "}
                  <span className="text-xs font-normal">د.ل</span>
                </p>
              </div>

              <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-app-label-secondary">
                    صافي الالتزام المالي
                  </span>
                  <Wallet className="h-4 w-4 text-app-accent" />
                </div>
                <p className="mt-2 text-xl font-bold font-mono text-app-accent">
                  {formatNumber(partnerBalances.data.summary.net_exposure ?? 0)}{" "}
                  <span className="text-xs font-normal">د.ل</span>
                </p>
              </div>

              <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-app-label-secondary">
                    المبالغ المتأخرة (+30 يوم)
                  </span>
                  <AlertCircle className="h-4 w-4 text-app-status-danger" />
                </div>
                <p className="mt-2 text-xl font-bold font-mono text-app-status-danger">
                  {formatNumber(partnerBalances.data.summary.overdue_total ?? 0)}{" "}
                  <span className="text-xs font-normal">د.ل</span>
                </p>
              </div>
            </div>
          )}

          {/* Aging DataTable */}
          <DataTable table={partnerTable}>
            <DataTable.Header>
              <DataTable.Toolbar>
                <DataTable.SearchInput
                  placeholder={
                    tab === "clients_ar" ? "بحث باسم العميل، الهاتف، المدينة..." : "بحث باسم المورد..."
                  }
                />
              </DataTable.Toolbar>
            </DataTable.Header>
            <DataTable.Content
              emptyMessage={
                partnerBalances.isLoading
                  ? "جارٍ تحميل بيانات الأرصدة..."
                  : "لا توجد أطراف مسجلة مطابقة للشروط."
              }
              emptyIcon={tab === "clients_ar" ? Users : Truck}
            />
            <DataTable.Pagination />
          </DataTable>
        </div>
      )}

      {/* Statement of Account Modal */}
      {selectedParty && (
        <PartnerStatementDialog
          open={statementOpen}
          onOpenChange={setStatementOpen}
          partyType={selectedParty.type}
          partyId={selectedParty.id}
          partyName={selectedParty.name}
        />
      )}
    </div>
  );
};
