import { useMemo } from "react";
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

export type LeafItemCategory = ItemCategory & {
  /** Full ancestry, e.g. "مواد خام / كيماويات / كحول". */
  path: string;
};

/**
 * Pickable categories for item forms: only the last level of the tree (no
 * children), each labelled with its ancestry. `alsoInclude` keeps a
 * non-leaf category selectable when editing an item already filed under one.
 */
export function useLeafItemCategories(alsoInclude?: string) {
  const query = useItemCategories();
  const all = query.data;

  const leaves = useMemo<LeafItemCategory[]>(() => {
    if (!all) return [];
    const byId = new Map(all.map((c) => [c.id, c]));
    const parentIds = new Set(all.map((c) => c.parent_id).filter(Boolean));

    const pathOf = (c: ItemCategory): string => {
      const names = [c.name];
      const seen = new Set([c.id]);
      let parent = c.parent_id ? byId.get(c.parent_id) : undefined;
      while (parent && !seen.has(parent.id)) {
        names.unshift(parent.name);
        seen.add(parent.id);
        parent = parent.parent_id ? byId.get(parent.parent_id) : undefined;
      }
      return names.join(" / ");
    };

    return all
      .filter((c) => !parentIds.has(c.id) || c.id === alsoInclude)
      .map((c) => ({ ...c, path: pathOf(c) }))
      .sort((a, b) => a.path.localeCompare(b.path, "ar"));
  }, [all, alsoInclude]);

  return { ...query, data: leaves, all };
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
