import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useReferenceLookupColumns } from "../../components/table-columns/referenceLookupColumns";
import { DummyDataNotice } from "../../components/settings/DummyDataNotice";
import {
  LookupConfig,
  LookupEntry,
  resolveLookupField,
} from "../../config/referenceLookups";
import { useReferenceDataStore } from "../../stores/referenceDataStore";
import { toast } from "../../stores/toastStore";

interface LookupForm {
  name: string;
  code: string;
  notes: string;
  isActive: boolean;
  fields: Record<string, string>;
}

const emptyForm = (config: LookupConfig): LookupForm => ({
  name: "",
  code: "",
  notes: "",
  isActive: true,
  fields: Object.fromEntries(
    config.fields.map((field) => [
      field.key,
      field.type === "select" ? (field.options?.[0]?.value ?? "") : "",
    ]),
  ),
});

const toForm = (entry: LookupEntry): LookupForm => ({
  name: entry.name,
  code: entry.code,
  notes: entry.notes ?? "",
  isActive: entry.isActive,
  fields: { ...entry.fields },
});

const inputClasses = (mono?: boolean) =>
  `w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none ${
    mono ? "font-mono" : ""
  }`;

/**
 * One screen for every reference list under Settings, driven by its
 * `LookupConfig`. Runs on the dummy `referenceDataStore` until the API lands.
 */
export const ReferenceLookupPage: React.FC<{ config: LookupConfig }> = ({
  config,
}) => {
  const entries = useReferenceDataStore((state) => state.entries[config.key]);
  const addEntry = useReferenceDataStore((state) => state.addEntry);
  const updateEntry = useReferenceDataStore((state) => state.updateEntry);
  const removeEntry = useReferenceDataStore((state) => state.removeEntry);
  const toggleActive = useReferenceDataStore((state) => state.toggleActive);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LookupEntry | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] =
    useState<LookupEntry | null>(null);
  const [form, setForm] = useState<LookupForm>(() => emptyForm(config));

  const data = useMemo(() => entries ?? [], [entries]);
  const activeCount = useMemo(
    () => data.filter((entry) => entry.isActive).length,
    [data],
  );

  const setFieldValue = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, fields: { ...prev.fields, [key]: value } }));
  };

  const openCreate = () => {
    setEditingEntry(null);
    setForm(emptyForm(config));
    setIsFormOpen(true);
  };

  const openEdit = (entry: LookupEntry) => {
    setEditingEntry(entry);
    setForm(toForm(entry));
    setIsFormOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const isDuplicateCode = data.some(
      (entry) =>
        entry.code.toUpperCase() === code && entry.id !== editingEntry?.id,
    );
    if (isDuplicateCode) {
      toast.error(`الرمز ${code} مستخدم بالفعل`);
      return;
    }

    const draft = {
      name: form.name.trim(),
      code,
      notes: form.notes.trim() || undefined,
      isActive: form.isActive,
      fields: form.fields,
    };

    if (editingEntry) {
      updateEntry(config.key, editingEntry.id, draft);
      toast.success(`تم تحديث ${config.singular} (بيانات تجريبية)`);
    } else {
      addEntry(config.key, draft);
      toast.success(`تمت إضافة ${config.singular} (بيانات تجريبية)`);
    }

    setIsFormOpen(false);
    setEditingEntry(null);
    setForm(emptyForm(config));
  };

  const handleConfirmDelete = () => {
    if (!entryPendingDelete) return;
    removeEntry(config.key, entryPendingDelete.id);
    toast.success(`تم حذف "${entryPendingDelete.name}"`);
    setEntryPendingDelete(null);
  };

  const columns = useReferenceLookupColumns({
    config,
    onEdit: openEdit,
    onDelete: setEntryPendingDelete,
    onToggleActive: (entry) => toggleActive(config.key, entry.id),
  });

  const table = useDataTable({
    columns,
    data,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (entry) => entry.id,
  });

  const Icon = config.icon;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-app-label-primary">
            <Icon className="h-7 w-7 text-app-accent" />
            {config.title}
          </h1>
          <p className="mt-1 text-xs text-app-label-secondary">
            {config.description} — {activeCount} مفعّل من أصل {data.length}.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" /> إضافة {config.singular}
        </button>
      </div>

      <DummyDataNotice />

      <DataTable table={table}>
        <DataTable.Header>
          <DataTable.Toolbar>
            <DataTable.SearchInput placeholder={config.searchPlaceholder} />
          </DataTable.Toolbar>
        </DataTable.Header>
        <DataTable.Content
          emptyMessage={`لا توجد سجلات في "${config.title}" بعد.`}
          emptyIcon={config.icon}
        />
        <DataTable.Pagination />
      </DataTable>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry
                ? `تعديل ${config.singular}: ${editingEntry.name}`
                : `إضافة ${config.singular}`}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form
              id="reference-lookup-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-app-label-secondary">
                    {config.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={config.namePlaceholder}
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={inputClasses()}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-app-label-secondary">
                    {config.codeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={config.codePlaceholder}
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className={inputClasses(true)}
                  />
                </div>
              </div>

              {config.fields.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {config.fields.map((field) => {
                    const resolved = resolveLookupField(field, form.fields);

                    return (
                      <div key={field.key}>
                        <label className="mb-1 block text-xs font-semibold uppercase text-app-label-secondary">
                          {resolved.label}
                        </label>

                        {resolved.type === "select" ? (
                          <select
                            value={form.fields[field.key] ?? ""}
                            onChange={(e) =>
                              setFieldValue(field.key, e.target.value)
                            }
                            className={inputClasses()}
                          >
                            {resolved.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={
                              resolved.type === "number" ? "number" : "text"
                            }
                            step={
                              resolved.type === "number" ? "any" : undefined
                            }
                            placeholder={resolved.placeholder}
                            value={form.fields[field.key] ?? ""}
                            onChange={(e) =>
                              setFieldValue(field.key, e.target.value)
                            }
                            className={inputClasses(resolved.mono)}
                          />
                        )}

                        {resolved.hint ? (
                          <p className="mt-1 text-[11px] text-app-label-tertiary">
                            {resolved.hint}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lookupIsActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded border-app-separator text-app-accent focus:ring-app-accent"
                />
                <label
                  htmlFor="lookupIsActive"
                  className="text-xs font-medium text-app-label-primary"
                >
                  مفعّل ومتاح للاختيار في الشاشات
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-app-label-secondary">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className={inputClasses()}
                />
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="reference-lookup-form"
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
            >
              {editingEntry ? "حفظ التعديلات" : "حفظ"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(entryPendingDelete)}
        onClose={() => setEntryPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`حذف ${config.singular}`}
        message={`سيتم حذف "${entryPendingDelete?.name ?? ""}" من القائمة المؤقتة.`}
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
};
