import React, { useState, useMemo } from "react";
import {
  Building2,
  UserCheck,
  UserPlus,
  Search,
  UserX,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { isAxiosError } from "axios";
import { Entity, CreateEntityPayload } from "../../types/entities";
import { useEntities, useCreateEntity, useProvisionUserAccount } from "../../hooks/usePartners";
import { EntityFormModal } from "../../components/entities/EntityFormModal";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";

export const EntitiesListPage: React.FC = () => {
  // TanStack Query Hooks
  const {
    data: entities = [],
    isLoading,
    error: queryError,
    refetch,
  } = useEntities();
  const createEntityMutation = useCreateEntity();
  const provisionUserMutation = useProvisionUserAccount();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Provisioning Modal State
  const [provisioningEntity, setProvisioningEntity] = useState<Entity | null>(null);
  const [provisionEmail, setProvisionEmail] = useState("");
  const [provisionPassword, setProvisionPassword] = useState("");
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);

  const handleCreateEntity = async (payload: CreateEntityPayload) => {
    try {
      await createEntityMutation.mutateAsync(payload);
      toast.success("تم إنشاء الكيان بنجاح");
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const payloadErr = apiErrorPayload(err);
      const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
      toast.error(message || "خطأ أثناء إنشاء الكيان");
      throw err;
    }
  };

  const handleProvisionUser = async () => {
    if (!provisioningEntity) return;
    try {
      const res = await provisionUserMutation.mutateAsync({
        id: provisioningEntity.id,
        email: provisionEmail.trim() || undefined,
        password: provisionPassword.trim() || undefined,
      });
      toast.success(`تم إنشاء وتزويد حساب النظام بنجاح للكيان ${res.data.name}`);
      setProvisionSuccessMsg(`تم إنشاء وتزويد حساب النظام بنجاح للكيان ${res.data.name}`);
      setTimeout(() => {
        setProvisionSuccessMsg(null);
        setProvisioningEntity(null);
        setProvisionEmail("");
        setProvisionPassword("");
      }, 2000);
    } catch (err: unknown) {
      const payloadErr = apiErrorPayload(err);
      const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
      toast.error(message || "خطأ أثناء تزويد حساب النظام");
    }
  };

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      // Type filter
      if (selectedType !== "all" && entity.entity_type !== selectedType) {
        return false;
      }
      // Role filter
      if (selectedRole !== "all") {
        const hasRole = entity.roles?.some((r) => r.role_type === selectedRole);
        if (!hasRole) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = entity.name.toLowerCase().includes(q);
        const matchesTax = entity.tax_number?.toLowerCase().includes(q);
        const matchesEmail = entity.primary_contact?.email?.toLowerCase().includes(q);
        const matchesPhone = entity.primary_contact?.phone?.includes(q);
        if (!matchesName && !matchesTax && !matchesEmail && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [entities, selectedType, selectedRole, searchQuery]);

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل قائمة الكيانات"
    : null;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">دليل الكيانات والشركاء</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            إدارة الأشخاص والشركات والجهات المشغلة المستقلة عن حسابات المستخدمين
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            إضافة كيان جديد
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-app-separator bg-app-bg-primary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-app-label-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم، الرقم الضريبي، البريد، أو الهاتف..."
            className="w-full rounded-xl border border-app-separator bg-app-bg-secondary pr-9 pl-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary focus:outline-none"
          >
            <option value="all">كل الأدوار</option>
            <option value="client">عملاء (Clients)</option>
            <option value="employee">موظفون (Employees)</option>
            <option value="external_employer">جهات مشغلة (Employers)</option>
            <option value="vendor">موردون (Vendors)</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary focus:outline-none"
          >
            <option value="all">كل الأنواع</option>
            <option value="organization">شركات (Organization)</option>
            <option value="individual">أفراد (Individual)</option>
          </select>
        </div>
      </div>

      {/* Entity Grid / Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <UserX className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا توجد نتائج مطابقة</p>
          <p className="text-xs text-app-label-secondary mt-1">
            جرب تعديل خيارات البحث أو تصفية الأدوار
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">الاسم / الكيان</th>
                <th className="px-4 py-3 text-start font-bold">النوع</th>
                <th className="px-4 py-3 text-start font-bold">الأدوار المكتسبة</th>
                <th className="px-4 py-3 text-start font-bold">بيانات الاتصال</th>
                <th className="px-4 py-3 text-start font-bold">حساب النظام</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {filteredEntities.map((entity) => {
                const hasUser = Boolean(entity.user_id);
                return (
                  <tr key={entity.id} className="hover:bg-app-bg-secondary/50">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-bg-secondary text-app-accent">
                          {entity.entity_type === "organization" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-app-label-primary">{entity.name}</div>
                          {entity.tax_number && (
                            <div className="text-[10px] text-app-label-secondary font-mono">
                              ضريبي: {entity.tax_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-app-bg-secondary px-2 py-1 text-[11px] font-medium text-app-label-secondary">
                        {entity.entity_type === "organization" ? "شركة / مؤسسة" : "فرد"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {entity.roles && entity.roles.length > 0 ? (
                          entity.roles.map((r) => (
                            <span
                              key={r.id || r.role_type}
                              className="rounded-full bg-app-accent/10 px-2 py-0.5 text-[10px] font-bold text-app-accent"
                            >
                              {r.role_type === "client"
                                ? "عميل"
                                : r.role_type === "employee"
                                ? "موظف"
                                : r.role_type === "external_employer"
                                ? "جهة تشغيل"
                                : r.role_type === "vendor"
                                ? "مورد"
                                : r.role_type}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-app-label-secondary italic">
                            بدون دور نشط
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-app-label-secondary">
                      <div className="space-y-0.5">
                        {entity.primary_contact?.email && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Mail className="h-3 w-3" />
                            <span>{entity.primary_contact.email}</span>
                          </div>
                        )}
                        {entity.primary_contact?.phone && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Phone className="h-3 w-3" />
                            <span>{entity.primary_contact.phone}</span>
                          </div>
                        )}
                        {!entity.primary_contact?.email && !entity.primary_contact?.phone && (
                          <span className="text-[10px] text-app-label-secondary/60">غير متوفر</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {hasUser ? (
                        <div className="flex items-center gap-1.5 text-app-status-positive font-semibold text-[11px]">
                          <ShieldCheck className="h-4 w-4" />
                          <span>مرتبط بحساب</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-app-label-secondary">كيان خارجي فقط</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      {!hasUser && (
                        <button
                          type="button"
                          onClick={() => setProvisioningEntity(entity)}
                          className="inline-flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-semibold text-app-label-primary hover:bg-app-fill-f1"
                        >
                          <ShieldCheck className="h-3 w-3 text-app-accent" />
                          <span>تزويد حساب دخول</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Entity Creation Form Modal */}
      <EntityFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEntity}
        isLoading={createEntityMutation.isPending}
      />

      {/* Provision User Account Modal */}
      {provisioningEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-base font-bold text-app-label-primary mb-2">
              تزويد حساب مستخدم للكيان: {provisioningEntity.name}
            </h3>
            <p className="text-xs text-app-label-secondary mb-4">
              سيتم إنشاء حساب نظام جديد لتمكين هذا الشخص أو الشركة من تسجيل الدخول للنظام
            </p>

            {provisionSuccessMsg && (
              <div className="mb-4 rounded-xl border border-app-status-positive/30 bg-app-status-positive/10 p-3 text-xs text-app-status-positive">
                {provisionSuccessMsg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  البريد الإلكتروني للدخول (اختياري، يولد تلقائياً إن ترك فارغاً)
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
                  كلمة المرور الابتدائية (اختياري، كلمة افتراضية مؤقتة)
                </label>
                <input
                  type="password"
                  value={provisionPassword}
                  onChange={(e) => setProvisionPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProvisioningEntity(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={provisionUserMutation.isPending}
                onClick={handleProvisionUser}
                className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {provisionUserMutation.isPending ? "جاري التزويد..." : "تأكيد التزويد"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntitiesListPage;
