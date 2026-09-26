import React, { useEffect, useMemo } from "react";
import { BookOpen, Sparkles, Link2, PlusCircle, XCircle } from "lucide-react";
import { useAccounts } from "../../hooks/useAccounting";
import { Account } from "../../api/endpoints/accounting";
import { CoaAction, NewCoaAccountPayload } from "../../types/entities";
import { SearchableSelect } from "../ui/SearchableSelect";

export interface CoaAccountSelectorProps {
  entityTypeLabel: string; // e.g. "العميل" or "المورد"
  defaultEntityName?: string;
  currency?: string;
  action: CoaAction;
  onActionChange: (action: CoaAction) => void;
  selectedAccountId: string | null;
  onSelectedAccountIdChange: (id: string | null) => void;
  newAccount: NewCoaAccountPayload;
  onNewAccountChange: (payload: NewCoaAccountPayload) => void;
  preferredParentCode?: string;
}

export const CoaAccountSelector: React.FC<CoaAccountSelectorProps> = ({
  entityTypeLabel,
  defaultEntityName = "",
  currency = "LYD",
  action,
  onActionChange,
  selectedAccountId,
  onSelectedAccountIdChange,
  newAccount,
  onNewAccountChange,
  preferredParentCode,
}) => {
  const { data: accounts = [], isLoading } = useAccounts();

  // Helper to suggest next sequential code under chosen parent
  const suggestNextCode = (parent: Account): string => {
    const parentCode = parent.account_code;
    const siblingCodes = accounts
      .filter(
        (a) =>
          a.parent_account_id === parent.id ||
          (a.account_code.startsWith(parentCode) && a.account_code !== parentCode)
      )
      .map((a) => a.account_code);

    let maxNum = 0;
    const padLength = 3;

    for (const code of siblingCodes) {
      const suffix = code.slice(parentCode.length);
      const parsed = parseInt(suffix, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }

    const nextNum = maxNum + 1;
    return `${parentCode}${String(nextNum).padStart(padLength, "0")}`;
  };

  // Auto-prefill preferred parent if create_new is selected and parent is empty
  useEffect(() => {
    if (action === "create_new" && !newAccount.parent_account_id && accounts.length > 0) {
      let candidate: Account | undefined;
      if (preferredParentCode) {
        candidate = accounts.find((a) => a.account_code === preferredParentCode);
      }
      if (!candidate) {
        candidate = accounts.find((a) => a.is_main) || accounts[0];
      }
      if (candidate) {
        const suggestedCode = suggestNextCode(candidate);
        onNewAccountChange({
          ...newAccount,
          parent_account_id: candidate.id,
          account_code: newAccount.account_code || suggestedCode,
          name: newAccount.name || (defaultEntityName ? `حساب ${entityTypeLabel} - ${defaultEntityName}` : ""),
          currency: newAccount.currency || currency,
        });
      }
    }
  }, [action, accounts, preferredParentCode]);

  // Keep name synced if user enters entity name and account name is empty
  useEffect(() => {
    if (action === "create_new" && defaultEntityName && !newAccount.name) {
      onNewAccountChange({
        ...newAccount,
        name: `حساب ${entityTypeLabel} - ${defaultEntityName}`,
      });
    }
  }, [defaultEntityName, action]);

  const selectedParentAccount = useMemo(() => {
    return accounts.find((a) => a.id === newAccount.parent_account_id) || null;
  }, [accounts, newAccount.parent_account_id]);

  const selectedExistingAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  const handleParentSelect = (parent: Account | null) => {
    if (!parent) {
      onNewAccountChange({
        ...newAccount,
        parent_account_id: "",
      });
      return;
    }

    const suggested = suggestNextCode(parent);
    onNewAccountChange({
      ...newAccount,
      parent_account_id: parent.id,
      account_code: suggested,
      currency: parent.currency || currency,
    });
  };

  const handleManualSuggestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedParentAccount) {
      const suggested = suggestNextCode(selectedParentAccount);
      onNewAccountChange({
        ...newAccount,
        account_code: suggested,
      });
    }
  };

  return (
    <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3.5 space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-app-accent" />
          <span className="text-xs font-bold text-app-label-primary">
            ربط دليل الحسابات (COA Account)
          </span>
        </div>
        <span className="text-[11px] text-app-label-secondary">
          توجيه الحركات المالية لحساب الأستاذ
        </span>
      </div>

      {/* Action Mode Toggle */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-app-bg-primary rounded-lg border border-app-separator text-xs">
        <button
          type="button"
          onClick={() => onActionChange("none")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-colors ${
            action === "none"
              ? "bg-app-fill-f2 text-app-label-primary shadow-sm font-bold"
              : "text-app-label-secondary hover:text-app-label-primary"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>بدون ربط</span>
        </button>

        <button
          type="button"
          onClick={() => onActionChange("create_new")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-colors ${
            action === "create_new"
              ? "bg-app-accent text-white shadow-sm font-bold"
              : "text-app-label-secondary hover:text-app-label-primary"
          }`}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>حساب جديد</span>
        </button>

        <button
          type="button"
          onClick={() => onActionChange("link_existing")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-colors ${
            action === "link_existing"
              ? "bg-app-fill-f2 text-app-label-primary shadow-sm font-bold"
              : "text-app-label-secondary hover:text-app-label-primary"
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>حساب حالي</span>
        </button>
      </div>

      {/* None Mode Content */}
      {action === "none" && (
        <p className="text-[11px] text-app-label-secondary bg-app-bg-primary/50 p-2.5 rounded-lg border border-dashed border-app-separator leading-relaxed">
          لن يتم تخصيص حساب فرعي خاص بهذا {entityTypeLabel}. ستُسجّل أي فواتير أو دفعات مستقبلية على الحسابات العامة التلقائية للنظام.
        </p>
      )}

      {/* Link Existing Mode Content */}
      {action === "link_existing" && (
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-semibold text-app-label-secondary">
            اختر الحساب من دليل الحسابات <span className="text-app-status-danger">*</span>
          </label>
          <SearchableSelect<Account>
            options={accounts}
            value={selectedExistingAccount}
            onChange={(acc) => onSelectedAccountIdChange(acc ? acc.id : null)}
            getOptionId={(acc) => acc.id}
            getOptionLabel={(acc) => `${acc.account_code} - ${acc.name} (${acc.type})`}
            placeholder={isLoading ? "جاري تحميل الحسابات..." : "-- اختر الحساب المالي --"}
            required
          />
          {selectedExistingAccount && (
            <p className="text-[10px] text-app-label-secondary">
              النوع: {selectedExistingAccount.type} | العملة: {selectedExistingAccount.currency} | الرصيد الحالي: {selectedExistingAccount.balance}
            </p>
          )}
        </div>
      )}

      {/* Create New Sub-Account Mode Content */}
      {action === "create_new" && (
        <div className="space-y-2.5 pt-1">
          {/* Parent Account Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
              الحساب الأب (Parent Account) <span className="text-app-status-danger">*</span>
            </label>
            <SearchableSelect<Account>
              options={accounts}
              value={selectedParentAccount}
              onChange={handleParentSelect}
              getOptionId={(acc) => acc.id}
              getOptionLabel={(acc) => `${acc.account_code} - ${acc.name} (${acc.type})`}
              placeholder={isLoading ? "جاري تحميل الحسابات..." : "-- اختر الحساب الأب لتفريغ الحساب تحته --"}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Account Code with Suggestion Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-app-label-secondary">
                  رمز الحساب (Account Code) <span className="text-app-status-danger">*</span>
                </label>
                {selectedParentAccount && (
                  <button
                    type="button"
                    onClick={handleManualSuggestClick}
                    className="flex items-center gap-1 text-[10px] text-app-accent hover:underline font-medium"
                    title="توليد الرمز التسلسلي التالي تلقائياً"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>اقتراح كود</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={newAccount.account_code}
                onChange={(e) =>
                  onNewAccountChange({
                    ...newAccount,
                    account_code: e.target.value.trim(),
                  })
                }
                placeholder="مثال: 130001"
                className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                اسم الحساب المالي <span className="text-app-status-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={newAccount.name}
                onChange={(e) =>
                  onNewAccountChange({
                    ...newAccount,
                    name: e.target.value,
                  })
                }
                placeholder={`مثال: حساب ${entityTypeLabel} - اسم الشركة`}
                className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
