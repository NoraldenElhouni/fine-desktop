import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fixedAssetsApi, type CreateAssetPayload } from "../api/endpoints/fixedAssets";
import { useIsCompanyWide } from "./useAccounting";

function useAssetMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixedAssets"] });
      qc.invalidateQueries({ queryKey: ["fixedAssetSchedule"] });
      qc.invalidateQueries({ queryKey: ["journalEntries"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useFixedAssets(params?: { status?: string; page?: number }) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["fixedAssets", params, companyWide],
    queryFn: async () =>
      (await fixedAssetsApi.list({ ...params, company_wide: companyWide || undefined })).data,
  });
}

export function useFixedAssetSchedule(id?: string) {
  return useQuery({
    queryKey: ["fixedAssetSchedule", id],
    queryFn: async () => (await fixedAssetsApi.schedule(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useCreateFixedAsset() {
  return useAssetMutation((payload: CreateAssetPayload) => fixedAssetsApi.create(payload));
}

export function useDepreciateAsset() {
  return useAssetMutation(({ id, period }: { id: string; period?: string }) =>
    fixedAssetsApi.depreciate(id, period),
  );
}

export function useDisposeAsset() {
  return useAssetMutation(({ id, proceeds }: { id: string; proceeds: number }) =>
    fixedAssetsApi.dispose(id, proceeds),
  );
}

export function useTransitionAsset() {
  return useAssetMutation(({ id, status }: { id: string; status: "active" | "under_maintenance" }) =>
    fixedAssetsApi.transition(id, status),
  );
}
