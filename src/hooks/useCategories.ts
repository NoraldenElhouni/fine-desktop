import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, ItemCategory } from "../api/endpoints/categories";

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
