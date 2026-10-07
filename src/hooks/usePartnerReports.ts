import { useQuery } from "@tanstack/react-query";
import { partnerReportsApi } from "../api/endpoints/partnerReports";
import { useIsCompanyWide } from "./useAccounting";

export function usePartnerBalances(
  type: "clients" | "suppliers",
  params?: { asOf?: string; operatingUnitId?: string }
) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["partnerBalances", type, params, companyWide],
    queryFn: async () =>
      (
        await partnerReportsApi.getBalances(type, {
          as_of: params?.asOf,
          operating_unit_id: params?.operatingUnitId,
          company_wide: companyWide || undefined,
        })
      ).data,
  });
}

export function usePartnerStatement(
  partyType: "client" | "supplier",
  partyId: string | null | undefined,
  params?: { from?: string; to?: string; operatingUnitId?: string },
  enabled = true
) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["partnerStatement", partyType, partyId, params, companyWide],
    queryFn: async () => {
      if (!partyId) throw new Error("Party ID is required");
      return (
        await partnerReportsApi.getStatement(partyType, partyId, {
          from: params?.from,
          to: params?.to,
          operating_unit_id: params?.operatingUnitId,
          company_wide: companyWide || undefined,
        })
      ).data;
    },
    enabled: Boolean(partyId) && enabled,
  });
}
