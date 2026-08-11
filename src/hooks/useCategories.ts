import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, ItemCategory, InventoryAttributeDefinition } from "../api/endpoints/categories";

export function useItemCategories(params?: { search?: string }) {
  return useQuery({
    queryKey: ["itemCategories", params],
    queryFn: async () => {
      const res = await categoriesApi.getCategories(params);
      return res.data;
    },
  });
}

export function useCreateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ItemCategory>) => categoriesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
    },
  });
}

export function useAttributeLibrary() {
  return useQuery({
    queryKey: ["attributeLibrary"],
    queryFn: async () => {
      const res = await categoriesApi.getAllAttributes();
      return res.data;
    },
  });
}

export function useCreateGlobalAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InventoryAttributeDefinition>) => categoriesApi.createGlobalAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributeLibrary"] });
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
    },
  });
}

export function useCreateAttributeDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: Partial<InventoryAttributeDefinition> }) =>
      categoriesApi.createAttributeDefinition(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
      queryClient.invalidateQueries({ queryKey: ["attributeLibrary"] });
    },
  });
}

export function useDeleteAttributeDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteAttributeDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemCategories"] });
      queryClient.invalidateQueries({ queryKey: ["attributeLibrary"] });
    },
  });
}
