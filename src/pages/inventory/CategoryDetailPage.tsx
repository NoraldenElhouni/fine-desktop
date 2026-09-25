import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowRight, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import {
  useItemCategory,
  useItemCategoryChildren,
  useDeleteItemCategory,
} from "../../hooks/useCategories";
import { ITEM_TYPE_LABELS, InventoryItemType, ItemCategory } from "../../api/endpoints/categories";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useItemCategoriesColumns } from "../../components/table-columns/itemCategoriesColumns";
import { CategoryFormDialog } from "../../components/inventory/CategoryFormDialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { toast } from "../../stores/toastStore";

const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: category, isLoading, isError } = useItemCategory(id);
  const { data: parent } = useItemCategory(category?.parent_id ?? undefined);
  const { data: children, isLoading: isLoadingChildren } = useItemCategoryChildren(id);

  const deleteMutation = useDeleteItemCategory();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openChild = (child: ItemCategory) => {
    navigate(`/settings/products/categories/${child.id}`);
  };

  const columns = useItemCategoriesColumns({ onOpen: openChild });
  const childrenData = useMemo(() => children ?? [], [children]);
  const childrenTable = useDataTable({
    columns,
    data: childrenData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (c) => c.id,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جارٍ تحميل بيانات الفئة…
      </div>
    );
  }

  if (isError || !category || !id) {
    return (
      <div className="space-y-4 p-6" dir="rtl">
        <button
          type="button"
          onClick={() => navigate("/settings/products/categories")}
          className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لفئات الأصناف
        </button>
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-6 text-center text-app-status-danger text-sm">
          تعذر العثور على بيانات الفئة.
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success("تم حذف الفئة بنجاح");
      setIsDeleteOpen(false);
      navigate(category.parent_id ? `/settings/products/categories/${category.parent_id}` : "/settings/products/categories");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? "فشل حذف الفئة");
      } else {
        toast.error("فشل حذف الفئة");
      }
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center gap-2 text-xs text-app-label-secondary">
        <Link
          to="/settings/products/categories"
          className="flex items-center gap-1 font-semibold text-app-accent hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          فئات الأصناف
        </Link>
        {category.parent_id && (
          <>
            <span>/</span>
            <Link
              to={`/settings/products/categories/${category.parent_id}`}
              className="font-semibold text-app-accent hover:underline"
            >
              {parent?.name ?? "…"}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-app-label-primary">{category.name}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
            <Tags className="w-6 h-6 text-app-accent" />
            {category.name}
          </h1>
          <span className="rounded-md bg-app-fill-f1 px-2 py-0.5 font-mono text-xs font-semibold text-app-label-secondary">
            {category.code}
          </span>
          {category.item_type && (
            <span className="rounded-full bg-app-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-app-accent">
              {ITEM_TYPE_LABELS[category.item_type as InventoryItemType] ?? category.item_type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-accent"
          >
            <Pencil className="w-3.5 h-3.5" />
            تعديل الفئة
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-status-danger"
          >
            <Trash2 className="w-3.5 h-3.5" />
            حذف الفئة
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4">
        <h2 className="mb-3 text-xs font-bold uppercase text-app-label-secondary">معلومات الفئة</h2>
        <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-app-label-secondary">جزء الرمز (code_segment)</dt>
            <dd className="mt-0.5 font-mono font-semibold text-app-label-primary">
              {category.code_segment || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-app-label-secondary">الرمز الكامل (code)</dt>
            <dd className="mt-0.5 font-mono font-semibold text-app-label-primary">{category.code}</dd>
          </div>
          <div>
            <dt className="text-app-label-secondary">طول رمز الفروع</dt>
            <dd className="mt-0.5 font-mono font-semibold text-app-label-primary">
              {category.child_code_length ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-app-label-secondary">طول رمز المنتج</dt>
            <dd className="mt-0.5 font-mono font-semibold text-app-label-primary">
              {category.product_code_length ?? "—"}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <dt className="text-app-label-secondary">الوصف</dt>
            <dd className="mt-0.5 text-app-label-primary">{category.description || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
            الفئات الفرعية
            <span className="text-[11px] font-normal text-app-label-tertiary">
              ({childrenData.length})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setIsAddChildOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة فئة فرعية
          </button>
        </div>

        <DataTable table={childrenTable}>
          <DataTable.Header>
            <DataTable.Toolbar>
              <DataTable.SearchInput placeholder="بحث في الفئات الفرعية…" />
            </DataTable.Toolbar>
          </DataTable.Header>
          <DataTable.Content
            isLoading={isLoadingChildren}
            emptyMessage="لا توجد فئات فرعية بعد."
            emptyIcon={Tags}
            onRowClick={openChild}
          />
          <DataTable.Pagination />
        </DataTable>
      </div>

      <CategoryFormDialog open={isEditOpen} onClose={() => setIsEditOpen(false)} category={category} />

      <CategoryFormDialog
        open={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        parentId={category.id}
        parentLabel={category.name}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد حذف الفئة"
        message={`هل أنت متأكد من حذف الفئة "${category.name}"؟ لا يمكن التراجع عن هذه العملية.`}
        confirmText="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CategoryDetailPage;
