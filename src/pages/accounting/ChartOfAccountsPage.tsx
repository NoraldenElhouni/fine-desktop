import React, { useMemo, useState } from "react";
import { ListTree, Plus, X, Eye, Maximize2, Search, RotateCcw, ExternalLink, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAccounts, useAccountLedger, useCreateAccount } from "../../hooks/useAccounting";
import { usePermissions } from "../../hooks/usePermissions";
import { ACCOUNT_TYPE_LABEL, type Account, type AccountType } from "../../api/endpoints/accounting";
import { formatNumber } from "../../lib/utils/format";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useChartOfAccountsLedgerColumns } from "../../components/table-columns/chartOfAccountsColumns";
import { AccountDetailsDialog } from "../../components/accounting/AccountDetailsDialog";
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

/**
 * Prunes a tree (already built by `buildTree`) down to the 5 main root
 * accounts plus any account with real movement, plus whatever zero-movement
 * ancestors are needed to connect a root to an effected descendant.
 */
const pruneToEffected = (nodes: TreeNode[]): TreeNode[] =>
  nodes
    .map((node) => {
      const children = pruneToEffected(node.children);
      const hasMovement = node.account.total_debit !== 0 || node.account.total_credit !== 0;
      const keep = node.account.is_main || hasMovement || children.length > 0;
      return keep ? { account: node.account, children } : null;
    })
    .filter((n): n is TreeNode => n !== null);

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
  const navigate = useNavigate();
  const { data: accounts, isLoading } = useAccounts();
  const [view, setView] = useState<"effected" | "full">("full");
  const [selected, setSelected] = useState<Account | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [sideSearch, setSideSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsAccountId, setDetailsAccountId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const handleViewChange = (next: "effected" | "full") => {
    setView(next);
    setSelected(null);
    setLedgerPage(1);
    setSideSearch("");
  };

  const { hasRole } = usePermissions();
  const canCreate = hasRole(["owner", "admin", "accounting-manager"]);

  const { data: ledger, isLoading: ledgerLoading } = useAccountLedger(
    selected?.id,
    {
      page: ledgerPage,
      search: sideSearch.trim() || undefined,
    }
  );

  const fullTree = useMemo(() => buildTree(accounts ?? []), [accounts]);
  const tree = useMemo(
    () => (view === "effected" ? pruneToEffected(fullTree) : fullTree),
    [view, fullTree],
  );

  const toggleAccount = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** Every account id that has children, at any depth. */
  const collectParentIds = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((n) =>
      n.children.length > 0 ? [n.account.id, ...collectParentIds(n.children)] : [],
    );

  const expandAll = () => {
    setExpandedIds(new Set(collectParentIds(tree)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

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

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.account.id);

    return (
      <React.Fragment key={node.account.id}>
        <div
          className={`w-full flex items-center gap-2 px-4 py-2 text-start hover:bg-app-fill-f1 transition-colors ${
            selected?.id === node.account.id ? "bg-app-accent-subtle" : ""
          }`}
          style={{ paddingInlineStart: `${16 + depth * 20}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleAccount(node.account.id);
              }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-app-label-tertiary hover:bg-app-bg-secondary hover:text-app-label-primary transition-colors"
              title={isExpanded ? "طي الحساب" : "توسيع الحساب"}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? "transform rotate-0" : "transform rtl:rotate-90 -rotate-90"
                }`}
              />
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}

          <button
            type="button"
            onClick={() => {
              setSelected(node.account);
              setLedgerPage(1);
              if (hasChildren && !isExpanded) {
                toggleAccount(node.account.id);
              }
            }}
            className="flex-1 flex items-center gap-3 text-start min-w-0"
          >
            <span className="font-mono font-bold text-app-accent text-xs">
              {node.account.account_code}
            </span>
            <span
              className={`text-xs truncate ${
                node.children.length > 0 ? "font-bold" : ""
              } text-app-label-primary`}
            >
              {node.account.name}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                TYPE_STYLE[node.account.type]
              }`}
            >
              {ACCOUNT_TYPE_LABEL[node.account.type]}
            </span>
            <span className="ms-auto font-mono text-xs text-app-label-primary">
              {formatNumber(node.account.balance)}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDetailsAccountId(node.account.id);
            }}
            title="عرض كشف الحركة والتفاصيل"
            className="rounded-lg p-1 text-app-label-tertiary hover:bg-app-bg-secondary hover:text-app-accent"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        {isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ListTree className="w-7 h-7 text-app-accent" />
            شجرة الحسابات (Chart of Accounts)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            الأرصدة بإشارتها الطبيعية لكل نوع. اختر حسابًا لعرض كشف حركته أو انقر على زر التفاصيل للكشف الكامل.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-app-separator bg-app-bg-secondary p-1">
            <button
              type="button"
              onClick={expandAll}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
            >
              توسيع الكل
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
            >
              طي الكل
            </button>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-app-separator bg-app-bg-secondary p-1">
            <button
              type="button"
              onClick={() => handleViewChange("effected")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                view === "effected"
                  ? "bg-app-accent text-white"
                  : "text-app-label-secondary hover:bg-app-fill-f1"
              }`}
            >
              الحسابات الفعّالة فقط
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("full")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                view === "full"
                  ? "bg-app-accent text-white"
                  : "text-app-label-secondary hover:bg-app-fill-f1"
              }`}
            >
              كل الحسابات
            </button>
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
      </div>

      <CreateAccountDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        accounts={accounts ?? []}
      />

      <AccountDetailsDialog
        open={Boolean(detailsAccountId)}
        onClose={() => setDetailsAccountId(null)}
        accountId={detailsAccountId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
              جارٍ التحميل…
            </div>
          ) : (
            <div className="divide-y divide-app-separator">
              {tree.map((node) => renderNode(node, 0))}
            </div>
          )}
        </div>

        {selected && (
          <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
            <div className="flex items-center justify-between border-b border-app-separator p-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-app-accent text-sm">
                  {selected.account_code}
                </span>
                <span className="text-sm font-bold text-app-label-primary">
                  {selected.name}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    TYPE_STYLE[selected.type]
                  }`}
                >
                  {ACCOUNT_TYPE_LABEL[selected.type]}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDetailsAccountId(selected.id)}
                  className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-accent"
                  title="عرض كشف الحركة والتفاصيل الكامل"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  عرض مفصل
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/accounting/accounts/${selected.id}`)}
                  className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-accent"
                  title="فتح صفحة تفاصيل الحساب الكاملة"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  فتح كصفحة
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-app-label-tertiary hover:bg-app-fill-f1 hover:text-app-status-danger"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-3 gap-2 border-b border-app-separator bg-app-bg-secondary/40 p-3 text-xs">
              <div className="rounded-lg border border-app-separator bg-app-bg-primary p-2">
                <div className="text-[11px] text-app-label-secondary">الرصيد</div>
                <div className="mt-0.5 font-mono font-bold text-app-label-primary">
                  {formatNumber(selected.balance)}
                </div>
              </div>
              <div className="rounded-lg border border-app-separator bg-app-bg-primary p-2">
                <div className="text-[11px] text-app-label-secondary">مدين</div>
                <div className="mt-0.5 font-mono font-semibold text-app-status-positive">
                  {formatNumber(selected.total_debit)}
                </div>
              </div>
              <div className="rounded-lg border border-app-separator bg-app-bg-primary p-2">
                <div className="text-[11px] text-app-label-secondary">دائن</div>
                <div className="mt-0.5 font-mono font-semibold text-app-status-danger">
                  {formatNumber(selected.total_credit)}
                </div>
              </div>
            </div>

            {/* Search filter */}
            <div className="flex items-center gap-2 border-b border-app-separator bg-app-bg-primary p-3">
              <div className="relative flex-1">
                <Search className="absolute start-2.5 top-2 h-3.5 w-3.5 text-app-label-tertiary" />
                <input
                  type="text"
                  value={sideSearch}
                  onChange={(e) => {
                    setSideSearch(e.target.value);
                    setLedgerPage(1);
                  }}
                  placeholder="بحث برقم القيد أو الوصف…"
                  className="w-full rounded-lg border border-app-separator bg-app-bg-secondary py-1 pe-2 ps-7 text-xs text-app-label-primary placeholder:text-app-label-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent"
                />
              </div>
              {sideSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSideSearch("");
                    setLedgerPage(1);
                  }}
                  className="rounded-lg border border-app-separator p-1.5 text-app-label-secondary hover:bg-app-fill-f1"
                  title="مسح البحث"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {ledgerLoading ? (
              <div className="flex h-32 items-center justify-center text-xs text-app-label-secondary">
                جارٍ التحميل…
              </div>
            ) : (
              <>
                <DataTable table={ledgerTable} className="rounded-none border-0 shadow-none">
                  <DataTable.Content emptyMessage="لا توجد حركة على هذا الحساب." />
                </DataTable>

                {ledger && ledger.last_page > 1 && (
                  <div className="flex items-center justify-center gap-3 border-t border-app-separator p-3 text-xs">
                    <button
                      disabled={ledgerPage <= 1}
                      onClick={() => setLedgerPage(ledgerPage - 1)}
                      className="rounded-xl border border-app-separator px-3 py-1.5 font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                    >
                      السابق
                    </button>
                    <span className="font-mono text-app-label-secondary">
                      {ledgerPage} / {ledger.last_page}
                    </span>
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
