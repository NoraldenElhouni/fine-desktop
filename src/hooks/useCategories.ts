import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, GetCategoriesParams, ItemCategory } from "../api/endpoints/categories";

export function useItemCategories(params?: GetCategoriesParams) {
  return useQuery({
    queryKey: ["itemCategories", params],
    queryFn: async () => {
      const res = await categoriesApi.getCategories(params);
      return res.data;
    },
  });
}

/** Top-level categories only — for the categories settings table. */
export function useRootItemCategories(params?: { search?: string }) {
  return useItemCategories({ ...params, root_only: true });
}

/** Direct children of a category — for its detail page. */
export function useItemCategoryChildren(parentId?: string, params?: { search?: string }) {
  return useQuery({
    queryKey: ["itemCategories", "children", parentId, params],
    queryFn: async () => {
      const res = await categoriesApi.getCategories({ ...params, parent_id: parentId });
      return res.data;
    },
    enabled: Boolean(parentId),
  });
}

export function useItemCategory(id?: string) {
  return useQuery({
    queryKey: ["itemCategory", id],
    queryFn: async () => {
      const res = await categoriesApi.getCategory(id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ItemCategory>) => categoriesApi.createCategory(data),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
      if (vars.parent_id) {
        queryClient.invalidateQueries({ queryKey: ["itemCategory", vars.parent_id] });
      }
    },
  });
}

export function useUpdateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemCategory> }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
      queryClient.invalidateQueries({ queryKey: ["itemCategory", vars.id] });
    },
  });
}

export function useDeleteItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
    },
  });
}
