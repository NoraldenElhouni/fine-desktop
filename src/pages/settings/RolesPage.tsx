import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  Plus,
  AlertTriangle,
  Check,
  Trash2,
  Lock,
  Undo2,
} from "lucide-react";
import {
  useRoles,
  useRolePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRestoreRole,
} from "../../hooks/useRoles";
import { PermissionEntry, RoleEntry } from "../../api/endpoints/roles";
import { apiErrorPayload } from "../../api/endpoints/production";
import { toast } from "../../stores/toastStore";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";
import { usePermissions } from "../../hooks/usePermissions";

const PROTECTED_SLUGS = ["owner", "admin"];

const slugify = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface RoleFormState {
  name: string;
  slug: string;
  description: string;
  permissionIds: string[];
}

const emptyForm: RoleFormState = {
  name: "",
  slug: "",
  description: "",
  permissionIds: [],
};

export const RolesPage: React.FC = () => {
  const { isOwner } = usePermissions();
  const [tab, setTab] = useState<"active" | "deleted">("active");
  const { data: roles, isLoading } = useRoles({ withTrashed: tab === "deleted" });
  const { data: permissions } = useRolePermissions();

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const restoreRole = useRestoreRole();

  const [editing, setEditing] = useState<RoleEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<RoleEntry | null>(null);
  const [restoring, setRestoring] = useState<RoleEntry | null>(null);
  const [form, setForm] = useState<RoleFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionEntry[]> = {};
    (permissions ?? []).forEach((p) => {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    });
    return groups;
  }, [permissions]);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const openEdit = (role: RoleEntry) => {
    setCreating(false);
    setEditing(role);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description ?? "",
      permissionIds: role.permission_ids ?? [],
    });
    setFormError(null);
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
    setFormError(null);
  };

  const togglePermission = (id: string) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((p) => p !== id)
        : [...prev.permissionIds, id],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (creating) {
      const slug = slugify(form.slug || form.name);
      if (!slug) {
        setFormError("الـ slug مطلوب (أو أدخل اسمًا صالحًا).");
        return;
      }
      createRole.mutate(
        {
          name: form.name.trim(),
          slug,
          description: form.description.trim() || null,
          permission_ids: form.permissionIds,
        },
        {
          onSuccess: () => {
            toast.success("تم إنشاء الدور");
            closeForm();
          },
          onError: (err: unknown) =>
            setFormError(apiErrorPayload(err)?.message ?? "تعذر إنشاء الدور."),
        },
      );
      return;
    }

    if (!editing) return;
    updateRole.mutate(
      {
        id: editing.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        permission_ids: form.permissionIds,
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث الدور");
          closeForm();
        },
        onError: (err: unknown) =>
          setFormError(apiErrorPayload(err)?.message ?? "تعذر تحديث الدور."),
      },
    );
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteRole.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("تم حذف الدور");
        setDeleting(null);
      },
      onError: (err: unknown) =>
        toast.error(apiErrorPayload(err)?.message ?? "تعذر حذف الدور."),
    });
  };

  if (!isOwner) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-app-accent" />
            الأدوار والصلاحيات
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            إدارة أدوار النظام والصلاحيات المرتبطة بها.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            هذه الصفحة متاحة للمالك فقط. يجب أن يكون دورك "owner" على مستوى
            الشركة لإدارة الأدوار.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-app-accent" />
            الأدوار والصلاحيات
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كل دور يحدد ما يمكن للمستخدمين فعله. دور "owner" يحصل على جميع
            الصلاحيات تلقائيًا.
          </p>
        </div>

        <div className="flex gap-2 border-b border-app-separator self-end">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={cn(
              "px-4 py-2 text-xs font-bold transition-colors",
              tab === "active"
                ? "border-b-2 border-app-accent text-app-accent"
                : "text-app-label-secondary hover:text-app-label-primary",
            )}
          >
            نشطة ({roles?.filter((r) => !r.deleted_at).length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setTab("deleted")}
            className={cn(
              "px-4 py-2 text-xs font-bold transition-colors",
              tab === "deleted"
                ? "border-b-2 border-app-accent text-app-accent"
                : "text-app-label-secondary hover:text-app-label-primary",
            )}
          >
            محذوفة ({roles?.filter((r) => r.deleted_at).length ?? 0})
          </button>
        </div>

        {!creating && !editing && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> إنشاء دور جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog */}
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="border-b border-app-separator px-4 py-3">
            <h2 className="text-sm font-bold text-app-label-primary">الأدوار المسجلة</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-xs text-app-label-secondary">
              جاري التحميل...
            </div>
          ) : (
            <div className="divide-y divide-app-separator max-h-[60vh] overflow-y-auto">
              {roles?.map((r) => {
                const isProtected = PROTECTED_SLUGS.includes(r.slug);
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "px-4 py-3 transition-colors",
                      editing?.id === r.id && "bg-app-accent-tint",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-app-label-primary truncate">
                            {r.name}
                          </div>
                          {isProtected && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-app-fill-f2 px-2 py-0.5 text-[10px] font-bold text-app-label-secondary"
                              title="دور محمي"
                            >
                              <Lock className="h-3 w-3" /> محمي
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-app-label-tertiary">
                          {r.slug}
                        </div>
                        {r.description && (
                          <div className="text-[11px] text-app-label-secondary mt-0.5 line-clamp-2">
                            {r.description}
                          </div>
                        )}
                        <div className="text-[10px] text-app-label-tertiary mt-1">
                          {r.permission_ids === null
                            ? "جميع الصلاحيات"
                            : `${r.permission_ids?.length ?? 0} صلاحية`}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {r.deleted_at ? (
                          <button
                            onClick={() => setRestoring(r)}
                            disabled={restoreRole.isPending}
                            className="rounded-lg p-1 text-app-accent hover:bg-app-accent/10 disabled:opacity-50"
                            title="استعادة"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary"
                              title="تعديل"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            {!isProtected && (
                              <button
                                onClick={() => setDeleting(r)}
                                disabled={deleteRole.isPending}
                                className="rounded-lg p-1 text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-50"
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {roles?.length === 0 && (
                <div className="p-8 text-center text-xs text-app-label-tertiary">
                  لا توجد أدوار مسجلة.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {(editing || creating) ? (
            <form
              onSubmit={submit}
              className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm"
            >
              <div className="border-b border-app-separator px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-app-label-primary">
                  {creating ? "إنشاء دور جديد" : `تعديل: ${editing?.name ?? ""}`}
                </h3>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
                >
                  إلغاء
                </button>
              </div>

              <div className="space-y-4 p-4">
                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={cn(
                        tokens.typography.webUI.b2Emphasized,
                        "block mb-1.5 text-app-label-primary",
                      )}
                    >
                      الاسم
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="مثال: HR Supervisor"
                      className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      className={cn(
                        tokens.typography.webUI.b2Emphasized,
                        "block mb-1.5 text-app-label-primary",
                      )}
                    >
                      الـ Slug
                      {editing && (
                        <span className="text-[10px] text-app-label-tertiary ms-2">
                          (غير قابل للتعديل — مفتاح نظام)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={!!editing}
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="مثال: hr-supervisor"
                      dir="ltr"
                      className={cn(
                        "w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono",
                        editing && "opacity-60 cursor-not-allowed",
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={cn(
                      tokens.typography.webUI.b2Emphasized,
                      "block mb-1.5 text-app-label-primary",
                    )}
                  >
                    الوصف (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="ماذا يفعل هذا الدور؟"
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={cn(
                        tokens.typography.webUI.b2Emphasized,
                        "text-app-label-primary",
                      )}
                    >
                      الصلاحيات
                    </label>
                    <span className="text-[10px] text-app-label-tertiary">
                      {form.permissionIds.length} محددة
                    </span>
                  </div>

                  {editing && PROTECTED_SLUGS.includes(editing.slug) && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-app-accent/30 bg-app-accent-tint p-3 text-xs text-app-accent">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        هذا الدور يحصل على <strong>جميع الصلاحيات</strong>{" "}
                        تلقائيًا — تحديد الصلاحيات هنا لا يؤثر عليه. يُمنع
                        حذفه أيضًا.
                      </span>
                    </div>
                  )}

                  <div className="max-h-72 overflow-y-auto rounded-xl border border-app-separator divide-y divide-app-separator">
                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                      <div key={module} className="p-3 bg-app-bg-secondary">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-app-label-tertiary mb-2">
                          {module}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((p) => {
                            const isChecked =
                              form.permissionIds.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className="flex items-center gap-2 cursor-pointer rounded-lg bg-app-bg-primary px-2 py-1.5 text-xs hover:bg-app-fill-f1"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(p.id)}
                                  className="h-3.5 w-3.5 rounded border-app-separator text-app-accent focus:ring-app-accent"
                                />
                                <span className="flex-1 truncate text-app-label-primary">
                                  {p.name}
                                </span>
                                <span className="text-[9px] font-mono text-app-label-tertiary uppercase">
                                  {p.action}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {Object.keys(groupedPermissions).length === 0 && (
                      <div className="p-8 text-center text-xs text-app-label-tertiary">
                        جاري تحميل الصلاحيات...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-app-separator p-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={
                    createRole.isPending ||
                    updateRole.isPending ||
                    (!!editing && PROTECTED_SLUGS.includes(editing.slug))
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {creating
                    ? createRole.isPending
                      ? "جاري الإنشاء..."
                      : "إنشاء الدور"
                    : updateRole.isPending
                      ? "جاري الحفظ..."
                      : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-12 text-center text-xs text-app-label-tertiary">
              اختر دورًا من القائمة لتعديله، أو أنشئ دورًا جديدًا.
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="حذف الدور"
        message={`سيتم حذف الدور "${deleting?.name ?? ""}" ناعماً وإزالته من جميع المستخدمين المسندة لهم. يمكن استعادته من تبويب "محذوفة".`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        isLoading={deleteRole.isPending}
      />

      <ConfirmDialog
        isOpen={!!restoring}
        onClose={() => setRestoring(null)}
        onConfirm={async () => {
          if (!restoring) return;
          try {
            await restoreRole.mutateAsync(restoring.id);
            toast.success("تمت استعادة الدور.");
            setRestoring(null);
            setTab("active");
          } catch (err) {
            toast.error(apiErrorPayload(err)?.message ?? "فشل الاستعادة.");
          }
        }}
        title="استعادة دور"
        message={`سيتم استعادة الدور "${restoring?.name ?? ""}".`}
        confirmText="استعادة"
        isLoading={restoreRole.isPending}
      />
    </div>
  );
};
