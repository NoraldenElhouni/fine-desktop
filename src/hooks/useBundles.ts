import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bundlesApi, Bundle, BundleItemInput } from "../api/endpoints/bundles";
import { useIsCompanyWide } from "./useAccounting";

export function useBundles(params?: { search?: string }) {
  return useQuery({
    queryKey: ["bundles", params],
    queryFn: async () => {
      const res = await bundlesApi.getBundles(params);
      return res.data;
    },
  });
}

export function useBundle(id?: string) {
  return useQuery({
    queryKey: ["bundle", id],
    queryFn: async () => {
      const res = await bundlesApi.getBundle(id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string | null; items: BundleItemInput[] }) =>
      bundlesApi.createBundle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
  });
}

export function useUpdateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string | null; items: BundleItemInput[] } }) =>
      bundlesApi.updateBundle(id, data),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      queryClient.invalidateQueries({ queryKey: ["bundle", vars.id] });
    },
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bundlesApi.deleteBundle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
  });
}

export function useBundleSalesReport(params?: { from?: string; to?: string }) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["bundleSalesReport", params, companyWide],
    queryFn: async () =>
      (await bundlesApi.getSalesReport({ ...params, company_wide: companyWide || undefined })).data,
  });
}

export type { Bundle };
