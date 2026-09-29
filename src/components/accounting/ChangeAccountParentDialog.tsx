import React, { useEffect, useMemo, useState } from "react";
import { GitMerge, Loader2, X } from "lucide-react";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "../ui/Dialog";
import { SearchableSelect } from "../ui/SearchableSelect";
import { useAccounts, useReparentAccount } from "../../hooks/useAccounting";
import { ACCOUNT_TYPE_LABEL, type Account } from "../../api/endpoints/accounting";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";

interface ChangeAccountParentDialogProps {
  account: Account | null;
  open: boolean;
  onClose: () => void;
}

export const ChangeAccountParentDialog: React.FC<ChangeAccountParentDialogProps> = ({
  account,
  open,
  onClose,
}) => {
  const { data: accounts = [], isLoading } = useAccounts();
  const reparent = useReparentAccount();

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Reset the selection when the dialog opens (or the account changes).
  useEffect(() => {
    if (open) {
      setSelectedParentId(null);
    }
  }, [open, account?.id]);

  /**
   * Same-type candidates, excluding the account itself and any of its
   * descendants (pre-filter for UX — the server still enforces with
   * PARENT_CYCLE). Descendant set is computed in-memory from the global
   * account list, which is small enough to walk in O(n) for typical charts.
   */
  const candidates = useMemo(() => {
    if (!account) return [] as Account[];

    const byParent = new Map<string | null, Account[]>();
    for (const a of accounts) {
      const key = a.parent_account_id;
      byParent.set(key, [...(byParent.get(key) ?? []), a]);
    }
    const forbidden = new Set<string>([account.id]);
    const walk = (parentId: string): void => {
      for (const child of byParent.get(parentId) ?? []) {
        if (forbidden.has(child.id)) continue;
        forbidden.add(child.id);
        walk(child.id);
      }
    };
    walk(account.id);

    return accounts.filter(
      (a) =>
        a.id !== account.id &&
        !forbidden.has(a.id) &&
        a.type === account.type &&
        a.parent_account_id !== null,
    );
  }, [account, accounts]);

  const currentParent = useMemo(() => {
    if (!account) return null;
    return accounts.find((a) => a.id === account.parent_account_id) ?? null;
  }, [account, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !selectedParentId) return;

    try {
      await reparent.mutateAsync({ id: account.id, parentAccountId: selectedParentId });
      toast.success("تم تغيير الحساب الأب بنجاح");
      onClose();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "فشل تغيير الحساب الأب"));
    }
  };

  if (!account) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent/10 text-app-accent">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>تغيير الحساب الأب</DialogTitle>
              <p className="mt-0.5 text-xs text-app-label-secondary">
                {account.account_code} - {account.name} ({ACCOUNT_TYPE_LABEL[account.type]})
              </p>
            </div>
          </div>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3">
              <p className="text-[11px] font-semibold text-app-label-secondary">
                الحساب الأب الحالي
              </p>
              {currentParent ? (
                <p className="mt-1 text-sm font-bold text-app-label-primary">
                  {currentParent.account_code} - {currentParent.name}
                </p>
              ) : (
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-app-status-danger">
                  <X className="h-3.5 w-3.5" /> حساب رئيسي — لا يمكن تغيير الأب
                </p>
              )}
            </div>

            {currentParent && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                  الحساب الأب الجديد <span className="text-app-status-danger">*</span>
                </label>
                <SearchableSelect<Account>
                  options={candidates}
                  value={candidates.find((a) => a.id === selectedParentId) ?? null}
                  onChange={(a) => setSelectedParentId(a ? a.id : null)}
                  getOptionId={(a) => a.id}
                  getOptionLabel={(a) => `${a.account_code} - ${a.name}`}
                  getOptionSearchText={(a) => `${a.account_code} ${a.name}`}
                  placeholder={isLoading ? "جاري التحميل..." : "-- اختر الحساب الأب الجديد --"}
                  required
                />
                <p className="mt-1 text-[10px] text-app-label-tertiary leading-relaxed">
                  الحساب الأب الجديد يجب أن يكون من نفس نوع الحساب ({ACCOUNT_TYPE_LABEL[account.type]}).
                  سيتم نقل جميع الفروع الفرعية للحساب معه تلقائياً.
                </p>
              </div>
            )}
          </DialogBody>
          {currentParent && (
            <DialogFooter>
              <button
                type="button"
                onClick={onClose}
                disabled={reparent.isPending}
                className="rounded-xl border border-app-separator px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!selectedParentId || reparent.isPending}
                className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {reparent.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {reparent.isPending ? "جارٍ الحفظ..." : "حفظ التغيير"}
              </button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Pull a human-readable Arabic message out of an axios error. Backend tags
 * the failure with a CODE_PREFIX in the message text; we surface the
 * raw message so the operator can see exactly what went wrong.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = apiErrorPayload(err);
    if (data?.message) return data.message;
    const fallbackMsg = (err.response?.data as { message?: string } | undefined)?.message;
    if (fallbackMsg) return fallbackMsg;
  }
  return fallback;
}
