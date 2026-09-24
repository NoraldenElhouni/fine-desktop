import React from "react";
import { Activity, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogClose } from "../ui/Dialog";
import { useAccount } from "../../hooks/useAccounting";
import { ACCOUNT_TYPE_LABEL, type AccountType } from "../../api/endpoints/accounting";
import { AccountDetailsContent } from "./AccountDetailsContent";

const TYPE_STYLE: Record<AccountType, string> = {
  asset: "bg-app-accent-subtle text-app-accent border-app-accent/20",
  liability: "bg-app-status-yellow/15 text-app-status-yellow border-app-status-yellow/30",
  equity: "bg-app-fill-f1 text-app-label-secondary border-app-separator",
  revenue: "bg-app-status-positive/10 text-app-status-positive border-app-status-positive/30",
  expense: "bg-app-status-danger/10 text-app-status-danger border-app-status-danger/30",
};

interface AccountDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  accountId: string | null;
}

export const AccountDetailsDialog: React.FC<AccountDetailsDialogProps> = ({
  open,
  onClose,
  accountId,
}) => {
  const navigate = useNavigate();
  const { data: account } = useAccount(open && accountId ? accountId : undefined);

  if (!open || !accountId) {
    return null;
  }

  const currency = account?.currency ?? "LYD";

  const handleOpenAsPage = () => {
    onClose();
    navigate(`/accounting/accounts/${accountId}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="full" className="max-w-5xl">
        <DialogHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent/10 text-app-accent">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {account ? `${account.account_code} - ${account.name}` : "تفاصيل الحساب والحركة"}
                </DialogTitle>
                {account && (
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      TYPE_STYLE[account.type]
                    }`}
                  >
                    {ACCOUNT_TYPE_LABEL[account.type]}
                  </span>
                )}
                {account && (
                  <span className="rounded-md bg-app-fill-f1 px-2 py-0.5 font-mono text-xs font-semibold text-app-label-secondary">
                    {currency}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-app-label-secondary">
                كشف حركة الحساب المفصل وجميع القيود اليومية المرتبطة به
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenAsPage}
              className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-accent"
              title="فتح في صفحة مستقلة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              فتح كصفحة
            </button>
            <DialogClose />
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 p-5">
          <AccountDetailsContent accountId={accountId} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
