import React, { useMemo, useState } from "react";
import { ListTree, X } from "lucide-react";
import { useAccounts, useAccountLedger } from "../../hooks/useAccounting";
import { ACCOUNT_TYPE_LABEL, type Account } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useChartOfAccountsLedgerColumns } from "../../components/table-columns/chartOfAccountsColumns";

const TYPE_STYLE: Record<Account["type"], string> = {
  asset: "bg-app-accent-subtle text-app-accent",
  liability: "bg-app-status-yellow/15 text-app-status-yellow",
  equity: "bg-app-fill-f1 text-app-label-secondary",
  revenue: "bg-app-status-positive/10 text-app-status-positive",
  expense: "bg-app-status-danger/10 text-app-status-danger",
};

interface TreeNode {
  account: Account;
  children: TreeNode[];
}

const buildTree = (accounts: Account[]): TreeNode[] => {
  const byParent = new Map<string | null, Account[]>();
  for (const account of accounts) {
    const key = account.parent_account_id;
    byParent.set(key, [...(byParent.get(key) ?? []), account]);
  }
  const attach = (parentId: string | null): TreeNode[] =>
    (byParent.get(parentId) ?? []).map((account) => ({
      account,
      children: attach(account.id),
    }));
  return attach(null);
};

export const ChartOfAccountsPage: React.FC = () => {
  const { data: accounts, isLoading } = useAccounts();
  const [selected, setSelected] = useState<Account | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);

  const { data: ledger, isLoading: ledgerLoading } = useAccountLedger(selected?.id, ledgerPage);

  const tree = useMemo(() => buildTree(accounts ?? []), [accounts]);

  const ledgerColumns = useChartOfAccountsLedgerColumns();
  const ledgerData = useMemo(() => ledger?.data ?? [], [ledger]);
  const ledgerTable = useDataTable({
    columns: ledgerColumns,
    data: ledgerData,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (l) => l.id,
  });

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => (
    <React.Fragment key={node.account.id}>
      <button
        onClick={() => { setSelected(node.account); setLedgerPage(1); }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-app-fill-f1 ${selected?.id === node.account.id ? "bg-app-accent-subtle" : ""}`}
        style={{ paddingInlineStart: `${16 + depth * 24}px` }}
      >
        <span className="font-mono font-bold text-app-accent text-xs">{node.account.account_code}</span>
        <span className={`text-xs ${node.children.length > 0 ? "font-bold" : ""} text-app-label-primary`}>
          {node.account.name}
        </span>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${TYPE_STYLE[node.account.type]}`}>
          {ACCOUNT_TYPE_LABEL[node.account.type]}
        </span>
        <span className="ms-auto font-mono text-xs text-app-label-primary">{formatNumber(node.account.balance)}</span>
      </button>
      {node.children.map((child) => renderNode(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <ListTree className="w-7 h-7 text-app-accent" />
          شجرة الحسابات (Chart of Accounts)
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          الأرصدة بإشارتها الطبيعية لكل نوع. اختر حسابًا لعرض كشف حركته.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
          ) : (
            <div className="divide-y divide-app-separator">{tree.map((node) => renderNode(node, 0))}</div>
          )}
        </div>

        {selected && (
          <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
            <div className="flex items-center gap-2 border-b border-app-separator p-4">
              <span className="font-mono font-bold text-app-accent text-sm">{selected.account_code}</span>
              <span className="text-sm font-bold text-app-label-primary">{selected.name}</span>
              <span className="ms-auto font-mono text-xs text-app-label-secondary">
                مدين {formatNumber(selected.total_debit)} / دائن {formatNumber(selected.total_credit)}
              </span>
              <button onClick={() => setSelected(null)} className="p-1 text-app-label-tertiary hover:text-app-status-danger">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ledgerLoading ? (
              <div className="flex h-32 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
            ) : (
              <>
                <DataTable table={ledgerTable} className="rounded-none border-0 shadow-none">
                  <DataTable.Content emptyMessage="لا توجد حركة على هذا الحساب." />
                </DataTable>

                {ledger && ledger.last_page > 1 && (
                  <div className="flex items-center justify-center gap-3 p-3 text-xs border-t border-app-separator">
                    <button
                      disabled={ledgerPage <= 1}
                      onClick={() => setLedgerPage(ledgerPage - 1)}
                      className="rounded-xl border border-app-separator px-3 py-1.5 font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                    >
                      السابق
                    </button>
                    <span className="font-mono text-app-label-secondary">{ledgerPage} / {ledger.last_page}</span>
                    <button
                      disabled={ledgerPage >= ledger.last_page}
                      onClick={() => setLedgerPage(ledgerPage + 1)}
                      className="rounded-xl border border-app-separator px-3 py-1.5 font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
