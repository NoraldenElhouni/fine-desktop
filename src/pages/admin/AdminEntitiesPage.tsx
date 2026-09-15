import React, { useState } from "react";
import { RefreshCw, UserPlus, KeyRound } from "lucide-react";
import { isAxiosError } from "axios";
import { Entity } from "../../types/entities";
import { useEntities, useProvisionUserAccount } from "../../hooks/usePartners";
import { useUsers } from "../../hooks/useUsers";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

export const AdminEntitiesPage: React.FC = () => {
  const { data: entities = [], isLoading, error: queryError, refetch } = useEntities();
  const { data: users } = useUsers();
  const provisionUserMutation = useProvisionUserAccount();

  const [provisioningEntity, setProvisioningEntity] = useState<Entity | null>(null);
  const [provisionEmail, setProvisionEmail] = useState("");
  const [provisionPassword, setProvisionPassword] = useState("");

  const handleProvisionUser = async () => {
    if (!provisioningEntity) return;
    try {
      const res = await provisionUserMutation.mutateAsync({
        id: provisioningEntity.id,
        email: provisionEmail.trim() || undefined,
        password: provisionPassword.trim() || undefined,
      });
      toast.success(`تم تزويد حساب النظام للكيان ${res.data.name}`);
      setProvisioningEntity(null);
      setProvisionEmail("");
      setProvisionPassword("");
    } catch (err: unknown) {
      const payloadErr = apiErrorPayload(err);
      const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
      toast.error(message || "خطأ أثناء تزويد حساب النظام");
    }
  };

  const userByEntity = new Map(
    (users ?? [])
      .filter((u) => Boolean(u.id))
      .map((u) => [u.id, u] as const)
  );
  void userByEntity;

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل قائمة الكيانات"
    : null;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">إدارة الكيانات (للمشرفين)</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            عرض الكيانات المسجلة وتزويدها بحسابات دخول للنظام
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : entities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <UserPlus className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا توجد كيانات</p>
          <p className="text-xs text-app-label-secondary mt-1">
            تظهر الكيانات تلقائياً عند إضافة موظف أو عميل أو مورد
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم الكيان</th>
                <th className="px-4 py-3 text-start font-bold">النوع</th>
                <th className="px-4 py-3 text-start font-bold">الرقم الضريبي</th>
                <th className="px-4 py-3 text-start font-bold">حساب النظام</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {entities.map((entity) => (
                <tr key={entity.id} className="hover:bg-app-bg-secondary/50">
                  <td className="px-4 py-3 font-semibold">{entity.name}</td>
                  <td className="px-4 py-3 text-app-label-secondary">
                    {entity.entity_type === "organization" ? "شركة" : "فرد"}
                  </td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {entity.tax_number || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {entity.user_id ? (
                      <span className="rounded-full bg-app-status-positive/15 px-2 py-0.5 text-[10px] font-bold text-app-status-positive">
                        مربوط
                      </span>
                    ) : (
                      <span className="rounded-full bg-app-status-warning/15 px-2 py-0.5 text-[10px] font-bold text-app-status-warning">
                        بدون حساب
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {!entity.user_id && (
                      <button
                        type="button"
                        onClick={() => {
                          setProvisioningEntity(entity);
                          setProvisionEmail(entity.primary_contact?.email ?? "");
                          setProvisionPassword("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-semibold text-app-label-primary hover:bg-app-fill-f1"
                      >
                        <KeyRound className="h-3 w-3 text-app-accent" />
                        <span>تزويد حساب</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={Boolean(provisioningEntity)}
        onOpenChange={(next) => {
          if (!next) {
            setProvisioningEntity(null);
            setProvisionEmail("");
            setProvisionPassword("");
          }
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>تزويد حساب نظام</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-xs text-app-label-secondary">
              سيتم إنشاء حساب دخول للنظام للكيان: {provisioningEntity?.name}
            </p>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={provisionEmail}
                onChange={(e) => setProvisionEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                كلمة المرور المؤقتة (اتركها فارغة لتوليد كلمة عشوائية)
              </label>
              <input
                type="text"
                value={provisionPassword}
                onChange={(e) => setProvisionPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setProvisioningEntity(null);
                setProvisionEmail("");
                setProvisionPassword("");
              }}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={provisionUserMutation.isPending}
              onClick={handleProvisionUser}
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {provisionUserMutation.isPending ? "جاري التزويد..." : "تزويد"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEntitiesPage;
