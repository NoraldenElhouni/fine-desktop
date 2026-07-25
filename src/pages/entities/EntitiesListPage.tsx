import React, { useEffect, useState, useMemo } from "react";
import {
  Building2,
  UserCheck,
  UserPlus,
  Search,
  Plus,
  UserX,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Entity, CreateEntityPayload, EntityRoleType } from "../../types/entities";
import { getEntities, createEntity, provisionUserAccount } from "../../api/endpoints/entities";
import { EntityFormModal } from "../../components/entities/EntityFormModal";

export const EntitiesListPage: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Provisioning Modal State
  const [provisioningEntity, setProvisioningEntity] = useState<Entity | null>(null);
  const [provisionEmail, setProvisionEmail] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);

  const fetchEntities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEntities();
      setEntities(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "تعذر تحميل قائمة الكيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const handleCreateEntity = async (payload: CreateEntityPayload) => {
    try {
      setIsSubmitting(true);
      const newEntity = await createEntity(payload);
      setEntities((prev) => [newEntity, ...prev]);
    } catch (err: any) {
      alert(err.response?.data?.message || "خطأ أثناء إنشاء الكيان");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProvisionUser = async () => {
    if (!provisioningEntity) return;
    try {
      setIsProvisioning(true);
      const res = await provisionUserAccount(provisioningEntity.id, provisionEmail.trim() || undefined);
      setEntities((prev) =>
        prev.map((item) => (item.id === res.data.id ? res.data : item))
      );
      setProvisionSuccessMsg(`تم إنشاء وتزويد حساب النظام بنجاح للكيان ${res.data.name}`);
      setTimeout(() => {
        setProvisionSuccessMsg(null);
        setProvisioningEntity(null);
        setProvisionEmail("");
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || "خطأ أثناء تزويد حساب النظام");
    } finally {
      setIsProvisioning(false);
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
            onClick={fetchEntities}
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
            <Plus className="h-4 w-4" />
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
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
          {error}
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <Building2 className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا توجد كيانات مطابقة</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإضافة كيان جديد أو ضبط خيارات تصفية البحث
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">الاسم والنوع</th>
                <th className="px-4 py-3 text-start font-bold">الرقم الضريبي</th>
                <th className="px-4 py-3 text-start font-bold">الأدوار في النظام</th>
                <th className="px-4 py-3 text-start font-bold">بيانات التواصل</th>
                <th className="px-4 py-3 text-start font-bold">حساب النظام</th>
                <th className="px-4 py-3 text-end font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-accent-subtle text-app-accent">
                        {entity.entity_type === "organization" ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-app-label-primary">{entity.name}</p>
                        <span className="text-[10px] text-app-label-secondary">
                          {entity.entity_type === "organization" ? "شركة / منظمة" : "فرد"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {entity.tax_number || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {entity.roles && entity.roles.length > 0 ? (
                        entity.roles.map((r, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-app-bg-secondary px-2 py-0.5 text-[10px] font-semibold text-app-accent border border-app-separator"
                          >
                            {r.role_type === "client" && "عميل"}
                            {r.role_type === "employee" && "موظف"}
                            {r.role_type === "external_employer" && "جهة مشغلة"}
                            {r.role_type === "vendor" && "مورد"}
                          </span>
                        ))
                      ) : (
                        <span className="text-app-label-secondary opacity-60">بدون دور</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 space-y-0.5">
                    {entity.primary_contact?.email ? (
                      <div className="flex items-center gap-1.5 text-app-label-secondary">
                        <Mail className="h-3 w-3 text-app-accent" />
                        <span>{entity.primary_contact.email}</span>
                      </div>
                    ) : null}
                    {entity.primary_contact?.phone ? (
                      <div className="flex items-center gap-1.5 text-app-label-secondary">
                        <Phone className="h-3 w-3 text-app-accent" />
                        <span dir="ltr">{entity.primary_contact.phone}</span>
                      </div>
                    ) : null}
                    {!entity.primary_contact?.email && !entity.primary_contact?.phone && (
                      <span className="text-app-label-secondary opacity-60">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {entity.user_id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        حساب نظام
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 border border-gray-200">
                        <UserX className="h-3.5 w-3.5 opacity-60" />
                        بدون حساب
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-end">
                    {!entity.user_id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setProvisioningEntity(entity);
                          setProvisionEmail(entity.primary_contact?.email || "");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-app-accent-subtle px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent hover:text-white transition-all"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        تزويد بحساب نظام
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-app-label-secondary">
                        مفعل
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Entity Creation Modal */}
      <EntityFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEntity}
        isLoading={isSubmitting}
      />

      {/* Provision User Account Modal */}
      {provisioningEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-2">
              تزويد حساب نظام للكيان
            </h3>
            <p className="text-xs text-app-label-secondary mb-4">
              سيتم إنشاء حساب مستخدم للنظام للكيان <strong>{provisioningEntity.name}</strong> لإتاحة الدخول التفاعلي.
            </p>

            {provisionSuccessMsg ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 text-center font-bold">
                {provisionSuccessMsg}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    البريد الإلكتروني للحساب
                  </label>
                  <input
                    type="email"
                    required
                    value={provisionEmail}
                    onChange={(e) => setProvisionEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
                  <button
                    type="button"
                    onClick={() => setProvisioningEntity(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleProvisionUser}
                    disabled={isProvisioning || !provisionEmail.trim()}
                    className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {isProvisioning ? "جاري الإنشاء..." : "إنشاء الحساب"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
