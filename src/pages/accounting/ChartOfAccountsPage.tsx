import React, { useMemo, useState } from "react";
import { ListTree, Plus, X } from "lucide-react";
import { isAxiosError } from "axios";
import { useAccounts, useAccountLedger, useCreateAccount } from "../../hooks/useAccounting";
import { usePermissions } from "../../hooks/usePermissions";
import { ACCOUNT_TYPE_LABEL, type Account, type AccountType } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useChartOfAccountsLedgerColumns } from "../../components/table-columns/chartOfAccountsColumns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../../components/ui/Dialog";
import { toast } from "../../stores/toastStore";

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

interface CreateAccountDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
}

const CreateAccountDialog: React.FC<CreateAccountDialogProps> = ({
  open,
  onClose,
  accounts,
}) => {
  const [accountCode, setAccountCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("asset");
  const [parentAccountId, setParentAccountId] = useState("");
  const [currency, setCurrency] = useState("LYD");
  const [error, setError] = useState<string | null>(null);

  const createAccountMutation = useCreateAccount();

  const handleParentChange = (parentId: string) => {
    setParentAccountId(parentId);
    if (parentId) {
      const parent = accounts.find((a) => a.id === parentId);
      if (parent) {
        setType(parent.type);
      }
    }
  };

  const selectedParent = useMemo(
    () => accounts.find((a) => a.id === parentAccountId),
    [accounts, parentAccountId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = accountCode.trim();
    const accountName = name.trim();

    if (!code) {
      setError("كود الحساب مطلوب.");
      return;
    }
    if (!accountName) {
      setError("اسم الحساب مطلوب.");
      return;
    }

    try {
      await createAccountMutation.mutateAsync({
        account_code: code,
        name: accountName,
        type,
        parent_account_id: parentAccountId ? parentAccountId : null,
        currency: currency.trim() || undefined,
      });
      toast.success("تم إنشاء الحساب بنجاح");
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === "object") {
          const firstKey = Object.keys(errors)[0];
          const firstMsg = errors[firstKey]?.[0];
          if (firstMsg) {
            setError(String(firstMsg));
            return;
          }
        }
        setError(err.response?.data?.message ?? "فشل إنشاء الحساب");
      } else {
        setError("فشل إنشاء الحساب");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>حساب جديد في شجرة الحسابات</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {error && (
              <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-2.5 text-xs text-app-status-danger">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                الحساب الأب (اختياري)
              </label>
              <select
                value={parentAccountId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              >
                <option value="">بدون حساب أب (حساب رئيسي)</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_code} - {a.name} ({ACCOUNT_TYPE_LABEL[a.type]})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                  كود الحساب <span className="text-app-status-danger">*</span>
                </label>
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="مثال: 5410"
                  className="w-full font-mono rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  required
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                  نوع الحساب {selectedParent && <span className="text-[10px] text-app-accent">(مقيد بالأب)</span>}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  disabled={Boolean(selectedParent)}
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none disabled:opacity-60"
                >
                  {(Object.keys(ACCOUNT_TYPE_LABEL) as AccountType[]).map((t) => (
                    <option key={t} value={t}>
                      {ACCOUNT_TYPE_LABEL[t]} ({t})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                اسم الحساب <span className="text-app-status-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مصروفات تسويق ودعاية"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                العملة
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
                className="w-full font-mono rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                dir="ltr"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={createAccountMutation.isPending}
              className="rounded-xl border border-app-separator px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {createAccountMutation.isPending ? "جارٍ الحفظ…" : "إنشاء الحساب"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ChartOfAccountsPage: React.FC = () => {
  const { data: accounts, isLoading } = useAccounts();
  const [selected, setSelected] = useState<Account | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { hasRole } = usePermissions();
  const canCreate = hasRole(["owner", "admin", "accounting-manager"]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ListTree className="w-7 h-7 text-app-accent" />
            شجرة الحسابات (Chart of Accounts)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            الأرصدة بإشارتها الطبيعية لكل نوع. اختر حسابًا لعرض كشف حركته.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 active:opacity-100"
          >
            <Plus className="w-4 h-4" />
            حساب جديد
          </button>
        )}
      </div>

      <CreateAccountDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        accounts={accounts ?? []}
      />

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
