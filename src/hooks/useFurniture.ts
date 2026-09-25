import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { furnitureApi } from "../api/endpoints/furniture";

export function useProducts(search?: string) {
  return useQuery({
    queryKey: ["furnitureProducts", search],
    queryFn: async () => (await furnitureApi.getProducts({ search: search || undefined })).data,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: furnitureApi.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["furnitureProducts"] }),
  });
}
