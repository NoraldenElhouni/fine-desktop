import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  AlertTriangle,
  X,
  KeyRound,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useUsers,
  useRoleCatalog,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAssignRole,
  useRemoveRole,
} from "../../hooks/useUsers";
import { AppUser } from "../../api/endpoints/users";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { OperatingUnit } from "../../types/entities";
import { apiErrorPayload } from "../../api/endpoints/production";
import { toast } from "../../stores/toastStore";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useAuthStore } from "../../stores/authStore";

const UsersPage: React.FC = () => {
  const { data: users, isLoading, isError, error, refetch } = useUsers();
  const { data: roles } = useRoleCatalog();
  const { data: units } = useQuery<OperatingUnit[]>({
    queryKey: ["operatingUnits"],
    queryFn: getOperatingUnits,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const currentUserId = useAuthStore((s) => s.user?.id);

  const [showCreate, setShowCreate] = useState(false);
  const [rolesFor, setRolesFor] = useState<AppUser | null>(null);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [unitId, setUnitId] = useState("");

  const unitName = (id: string | null) =>
    id === null
      ? "على مستوى الشركة"
      : units?.find((u) => u.id === id)?.name ?? "وحدة محذوفة";

  // The list refetches after every mutation; keep the modal's user fresh.
  const rolesForUser = rolesFor ? users?.find((u) => u.id === rolesFor.id) ?? rolesFor : null;

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createUser.mutate(
      { name, email, password },
      {
        onSuccess: () => {
          setShowCreate(false);
          setName("");
          setEmail("");
          setPassword("");
          toast.success("تم إنشاء المستخدم — سيُطلب منه تغيير كلمة المرور عند أول دخول");
        },
        onError: (err: unknown) =>
          setFormError(apiErrorPayload(err)?.message ?? "تعذر إنشاء المستخدم."),
      },
    );
  };

  const submitAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolesForUser || !roleId) {
      return;
    }
    setFormError(null);
    assignRole.mutate(
      { userId: rolesForUser.id, roleId, operatingUnitId: unitId || null },
      {
        onSuccess: () => {
          setRoleId("");
          setUnitId("");
          toast.success("تم إسناد الدور");
        },
        onError: (err: unknown) =>
          setFormError(apiErrorPayload(err)?.message ?? "تعذر إسناد الدور."),
      },
    );
  };

  const toggleActive = (u: AppUser) => {
    updateUser.mutate(
      { id: u.id, is_active: !u.is_active, record_version: u.record_version },
      {
        onSuccess: () => toast.success(u.is_active ? "تم تعطيل الحساب" : "تم تفعيل الحساب"),
        onError: (err: unknown) =>
          toast.error(apiErrorPayload(err)?.message ?? "تعذر تحديث الحساب."),
      },
    );
  };

  const openEdit = (u: AppUser) => {
    setEditing(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setFormError(null);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (editPassword && editPassword.length < 8) {
      setFormError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    setFormError(null);
    const payload: {
      id: string;
      name: string;
      email: string;
      password?: string;
      record_version: number;
    } = {
      id: editing.id,
      name: editName.trim(),
      email: editEmail.trim(),
      record_version: editing.record_version,
    };
    if (editPassword) {
      payload.password = editPassword;
    }
    updateUser.mutate(payload, {
      onSuccess: () => {
        setEditing(null);
        toast.success("تم تحديث المستخدم");
      },
      onError: (err: unknown) =>
        setFormError(apiErrorPayload(err)?.message ?? "تعذر تحديث المستخدم."),
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteUser.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        toast.success("تم حذف المستخدم");
      },
      onError: (err: unknown) =>
        setFormError(apiErrorPayload(err)?.message ?? "تعذر حذف المستخدم."),
    });
  };

  if (isError) {
    const payload = apiErrorPayload(error);
    return (
      <div className="p-6">
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {payload?.message ?? "غير مصرح لك بإدارة المستخدمين — هذه الصفحة للمالك ومديري النظام."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-app-accent" />
            المستخدمون والصلاحيات
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            حسابات الدخول وأدوارها — الدور بلا وحدة يسري على مستوى الشركة كاملة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
          <button
            onClick={() => {
              setShowCreate(true);
              setFormError(null);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> إضافة مستخدم
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            جاري تحميل المستخدمين...
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">المستخدم</th>
                <th className="px-4 py-3 text-start">الأدوار</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-app-label-secondary font-mono" dir="ltr">
                      {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles?.length ? (
                        u.roles.map((r, i) => (
                          <span
                            key={`${r.id}-${r.pivot?.operating_unit_id ?? "company"}-${i}`}
                            className="inline-flex items-center gap-1 rounded-full bg-app-accent-subtle px-2.5 py-1 text-[11px] font-semibold text-app-accent"
                          >
                            {r.name}
                            <span className="text-app-label-tertiary">
                              · {unitName(r.pivot?.operating_unit_id ?? null)}
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-app-label-tertiary">بدون أدوار</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        u.is_active
                          ? "bg-app-status-positive/15 text-app-status-positive"
                          : "bg-app-status-danger/15 text-app-status-danger"
                      }`}
                    >
                      {u.is_active ? "مفعل" : "معطل"}
                    </span>
                    {u.must_change_password && (
                      <span className="ms-2 inline-flex items-center gap-1 text-[10px] text-app-label-tertiary">
                        <KeyRound className="w-3 h-3" /> بانتظار تغيير كلمة المرور
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRolesFor(u);
                          setFormError(null);
                          setRoleId("");
                          setUnitId("");
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-app-fill-f1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> الأدوار
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-app-fill-f1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> تعديل
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => setDeleting(u)}
                          disabled={deleteUser.isPending}
                          className="inline-flex items-center gap-1 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 px-2.5 py-1 text-xs font-semibold text-app-status-danger hover:bg-app-status-danger/15 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={updateUser.isPending}
                        className="inline-flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-app-fill-f1 disabled:opacity-50"
                      >
                        {u.is_active ? (
                          <>
                            <UserX className="w-3.5 h-3.5" /> تعطيل
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> تفعيل
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-app-label-tertiary">
                    لا يوجد مستخدمون.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-app-label-primary">إضافة مستخدم جديد</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={submitCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  كلمة المرور المؤقتة (8 أحرف على الأقل)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
                <p className="text-[10px] text-app-label-tertiary mt-1">
                  سيُجبر المستخدم على تغييرها عند أول تسجيل دخول.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {createUser.isPending ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role management modal */}
      {rolesForUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-app-label-primary">أدوار {rolesForUser.name}</h3>
                <p className="text-xs text-app-label-secondary">
                  اترك الوحدة فارغة ليكون الدور على مستوى الشركة كاملة.
                </p>
              </div>
              <button
                onClick={() => setRolesFor(null)}
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2">
              {rolesForUser.roles?.length ? (
                rolesForUser.roles.map((r, i) => (
                  <div
                    key={`${r.id}-${r.pivot?.operating_unit_id ?? "company"}-${i}`}
                    className="flex items-center justify-between rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2"
                  >
                    <div className="text-xs">
                      <span className="font-bold text-app-label-primary">{r.name}</span>
                      <span className="text-app-label-secondary ms-2">
                        {unitName(r.pivot?.operating_unit_id ?? null)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        removeRole.mutate(
                          {
                            userId: rolesForUser.id,
                            roleId: r.id,
                            operatingUnitId: r.pivot?.operating_unit_id ?? null,
                          },
                          { onSuccess: () => toast.success("تمت إزالة الدور") },
                        )
                      }
                      disabled={removeRole.isPending}
                      className="text-xs font-semibold text-app-status-danger hover:underline disabled:opacity-50"
                    >
                      إزالة
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-app-label-tertiary py-2">لا توجد أدوار مسندة.</div>
              )}
            </div>

            <form onSubmit={submitAssign} className="flex items-end gap-2 pt-3 border-t border-app-separator">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الدور</label>
                <SearchableSelect<{ id: string; name: string }>
                  options={roles ?? []}
                  value={
                    roles?.find((r) => r.id === roleId) ?? null
                  }
                  onChange={(r) => setRoleId(r ? r.id : "")}
                  getOptionId={(r) => r.id}
                  getOptionLabel={(r) => r.name}
                  placeholder="اختر دوراً..."
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الوحدة التشغيلية</label>
                <SearchableSelect<{ id: string; name: string }>
                  options={units ?? []}
                  value={
                    units?.find((u) => u.id === unitId) ?? null
                  }
                  onChange={(u) => setUnitId(u ? u.id : "")}
                  getOptionId={(u) => u.id}
                  getOptionLabel={(u) => u.name}
                  placeholder="على مستوى الشركة"
                />
              </div>
              <button
                type="submit"
                disabled={assignRole.isPending || !roleId}
                className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
              >
                إسناد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-app-label-primary flex items-center gap-2">
                <Pencil className="w-4 h-4 text-app-accent" />
                تعديل المستخدم
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  إعادة تعيين كلمة المرور (اختياري)
                </label>
                <input
                  type="password"
                  minLength={8}
                  dir="ltr"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="اتركها فارغة لعدم التغيير"
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
                <p className="text-[10px] text-app-label-tertiary mt-1">
                  عند التعبئة، سيُجبر المستخدم على تغييرها عند أول تسجيل دخول.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updateUser.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {updateUser.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => {
          setDeleting(null);
          setFormError(null);
        }}
        onConfirm={confirmDelete}
        title="حذف المستخدم"
        message={`سيتم حذف "${deleting?.name ?? ""}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
};

export default UsersPage;
