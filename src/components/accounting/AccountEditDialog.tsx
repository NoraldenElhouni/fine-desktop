import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../ui/Dialog";
import type { Account, UpdateAccountPayload } from "../../api/endpoints/accounting";

export interface AccountEditDialogProps {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSubmit: (payload: UpdateAccountPayload) => Promise<void> | void;
  isPending?: boolean;
}

export const AccountEditDialog: React.FC<AccountEditDialogProps> = ({
  open,
  account,
  onClose,
  onSubmit,
  isPending = false,
}) => {
  const [name, setName] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [currency, setCurrency] = useState("LYD");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setAccountCode(account.account_code);
      setCurrency(account.currency);
      setError(null);
    }
  }, [account?.id, account?.name, account?.account_code, account?.currency, account]);

  if (!account) {
    return null;
  }

  const isMain = account.is_main;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("اسم الحساب مطلوب.");
      return;
    }

    const payload: UpdateAccountPayload = {
      name: trimmedName,
      currency: currency.trim().toUpperCase() || account.currency,
    };
    if (!isMain && accountCode.trim() && accountCode.trim() !== account.account_code) {
      payload.account_code = accountCode.trim();
    }

    try {
      await onSubmit(payload);
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
        setError(err.response?.data?.message ?? "فشل تحديث الحساب");
      } else {
        setError("فشل تحديث الحساب");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>تعديل الحساب</DialogTitle>
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
                كود الحساب
                {isMain ? (
                  <span className="text-app-label-tertiary text-[10px] ms-1">
                    (الحساب الرئيسي — ثابت)
                  </span>
                ) : null}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  disabled={isMain}
                  dir="ltr"
                  className={`w-full font-mono rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none ${
                    isMain ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
                {isMain ? (
                  <Lock className="absolute end-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-app-label-tertiary" />
                ) : null}
              </div>
              {isMain ? (
                <p className="mt-1 text-[10px] text-app-label-tertiary">
                  لا يمكن تغيير كود الحسابات الرئيسية. أضف حسابًا فرعيًا تحت هذا الحساب بدلًا من ذلك.
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                اسم الحساب <span className="text-app-status-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-app-label-secondary">
                العملة <span className="text-app-status-danger">*</span>
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
                dir="ltr"
                className="w-full font-mono uppercase rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "جارٍ الحفظ…" : "حفظ التعديلات"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
