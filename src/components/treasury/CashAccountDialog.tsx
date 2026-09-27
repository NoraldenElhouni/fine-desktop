import React, { useEffect, useState } from "react";
import { Banknote, Landmark } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { SearchableSelect } from "../ui/SearchableSelect";
import { useAccounts } from "../../hooks/useAccounting";
import { useCreateCashAccount, useUpdateCashAccount } from "../../hooks/useTreasury";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { Account } from "../../api/endpoints/accounting";
import type { CashAccount, CashAccountKind } from "../../types/procurement";
import { toast } from "../../stores/toastStore";

/** Treasuries and banks live under 121 الأموال الجاهزة والنقدية. */
const TREASURY_PARENT_PREFIX = "121";

interface CashAccountDialogProps {
  open: boolean;
  onClose: () => void;
  /** Editing an existing treasury; null creates a new one in the current unit. */
  cashAccount: CashAccount | null;
}

export const CashAccountDialog: React.FC<CashAccountDialogProps> = ({ open, onClose, cashAccount }) => {
  const operatingUnitId = useServerConfigStore((s) => s.operatingUnitId);
  const { data: accounts = [] } = useAccounts();
  const createMutation = useCreateCashAccount();
  const updateMutation = useUpdateCashAccount();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<CashAccountKind>("cash");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(cashAccount?.name ?? "");
    setKind(cashAccount?.kind ?? "cash");
    setAccountId(cashAccount?.account_id ?? null);
    setError(null);
  }, [open, cashAccount]);

  const treasuryAccounts = accounts.filter(
    (a) => a.account_code.startsWith(TREASURY_PARENT_PREFIX) && a.account_code !== TREASURY_PARENT_PREFIX,
  );
  const selectedAccount = treasuryAccounts.find((a) => a.id === accountId) ?? null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const onError = (err: unknown) => setError(apiErrorPayload(err)?.message ?? "تعذّر حفظ الخزينة.");
    const onSuccess = () => {
      toast.success(cashAccount ? "تم حفظ الخزينة" : "تمت إضافة الخزينة");
      onClose();
    };

    if (cashAccount) {
      updateMutation.mutate(
        { id: cashAccount.id, payload: { name: name.trim(), kind, account_id: accountId } },
        { onSuccess, onError },
      );
      return;
    }

    if (!operatingUnitId) {
      setError("اختر الوحدة التشغيلية أولاً.");
      return;
    }

    createMutation.mutate(
      { operating_unit_id: operatingUnitId, name: name.trim(), kind, account_id: accountId },
      { onSuccess, onError },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <div>
            <DialogTitle>{cashAccount ? "تعديل الخزينة" : "خزينة أو حساب مصرفي جديد"}</DialogTitle>
            <DialogDescription>
              المبيعات النقدية والمصرفية تُقيَّد على الحساب المحاسبي المربوط بهذه الخزينة.
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <form id="cash-account-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">الاسم</label>
              <input
                type="text"
                required
                placeholder="مثال: خزينة الصالة"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">النوع</label>
              <div className="flex gap-2">
                {([
                  { value: "cash", label: "خزينة نقدية", icon: Banknote },
                  { value: "bank", label: "حساب مصرفي", icon: Landmark },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKind(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                      kind === opt.value
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                    }`}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">الحساب المحاسبي</label>
              <SearchableSelect<Account>
                options={treasuryAccounts}
                value={selectedAccount}
                onChange={(a) => setAccountId(a ? a.id : null)}
                getOptionId={(a) => a.id}
                getOptionLabel={(a) => `${a.account_code} — ${a.name}`}
                getOptionSearchText={(a) => `${a.account_code} ${a.name}`}
                placeholder="اختر حساب الخزينة أو المصرف…"
              />
              <p className="text-[11px] text-app-label-tertiary mt-1">
                من حسابات «الأموال الجاهزة والنقدية» (121). بدون ربط لا يمكن استلام مبيعات عليها.
              </p>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="cash-account-form"
            disabled={isPending || !name.trim()}
            className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            {isPending ? "جارٍ الحفظ…" : "حفظ"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
