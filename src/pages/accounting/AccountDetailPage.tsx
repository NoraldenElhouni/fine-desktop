import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useAccount, useUpdateAccount, useDeleteAccount } from "../../hooks/useAccounting";
import { usePermissions } from "../../hooks/usePermissions";
import { ACCOUNT_TYPE_LABEL, type Account } from "../../api/endpoints/accounting";
import { apiErrorPayload } from "../../api/endpoints/production";
import { AccountDetailsContent } from "../../components/accounting/AccountDetailsContent";
import { AccountEditDialog } from "../../components/accounting/AccountEditDialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { toast } from "../../stores/toastStore";

const TYPE_STYLE: Record<Account["type"], string> = {
  asset: "bg-app-accent-subtle text-app-accent border-app-accent/20",
  liability: "bg-app-status-yellow/15 text-app-status-yellow border-app-status-yellow/30",
  equity: "bg-app-fill-f1 text-app-label-secondary border-app-separator",
  revenue: "bg-app-status-positive/10 text-app-status-positive border-app-status-positive/30",
  expense: "bg-app-status-danger/10 text-app-status-danger border-app-status-danger/30",
};

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: account, isLoading, isError, error } = useAccount(id);

  const { hasRole } = usePermissions();
  const canEdit = hasRole(["owner", "admin", "accounting-manager"]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جارٍ تحميل بيانات الحساب…
      </div>
    );
  }

  if (isError || !account || !id) {
    return (
      <div className="space-y-4 p-6">
        <button
          type="button"
          onClick={() => navigate("/accounting/accounts")}
          className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لشجرة الحسابات
        </button>
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-6 text-center text-app-status-danger text-sm">
          {apiErrorPayload(error)?.message ?? "تعذر العثور على بيانات الحساب."}
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteAccountMutation.mutateAsync(account.id);
      toast.success("تم حذف الحساب بنجاح");
      setIsDeleteOpen(false);
      navigate("/accounting/accounts");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? "فشل حذف الحساب");
      } else {
        toast.error("فشل حذف الحساب");
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 text-xs text-app-label-secondary">
        <Link
          to="/accounting/accounts"
          className="flex items-center gap-1 font-semibold text-app-accent hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          شجرة الحسابات
        </Link>
        <span>/</span>
        <span className="font-semibold text-app-label-primary">
          {account.account_code} - {account.name}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-app-label-primary">
            {account.account_code} - {account.name}
          </h1>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLE[account.type]}`}
          >
            {ACCOUNT_TYPE_LABEL[account.type]}
          </span>
          <span className="rounded-md bg-app-fill-f1 px-2 py-0.5 font-mono text-xs font-semibold text-app-label-secondary">
            {account.currency}
          </span>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-accent"
            >
              <Pencil className="w-3.5 h-3.5" />
              تعديل الحساب
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              disabled={account.is_main}
              title={account.is_main ? "الحسابات الرئيسية غير قابلة للحذف" : "حذف الحساب"}
              className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-status-danger disabled:opacity-40 disabled:hover:bg-app-bg-secondary disabled:hover:text-app-label-secondary disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف الحساب
            </button>
          </div>
        )}
      </div>

      <AccountDetailsContent key={id} accountId={id} />

      <AccountEditDialog
        open={isEditOpen}
        account={account}
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (payload) => {
          try {
            await updateAccountMutation.mutateAsync({ id: account.id, payload });
            toast.success("تم تحديث الحساب بنجاح");
            setIsEditOpen(false);
          } catch (err: unknown) {
            if (isAxiosError(err)) {
              toast.error(err.response?.data?.message ?? "فشل تحديث الحساب");
            } else {
              toast.error("فشل تحديث الحساب");
            }
          }
        }}
        isPending={updateAccountMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد حذف الحساب"
        message={`هل أنت متأكد من حذف الحساب "${account.account_code} - ${account.name}"؟ لا يمكن التراجع عن هذه العملية.`}
        confirmText="حذف"
        variant="danger"
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
};

export default AccountDetailPage;
