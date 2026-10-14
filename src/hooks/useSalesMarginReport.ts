import { useQuery } from "@tanstack/react-query";
import {
  salesMarginApi,
  type SalesMarginParams,
} from "../api/endpoints/salesMargin";
import { useIsCompanyWide } from "./useAccounting";

export function useSalesMarginReport(params: SalesMarginParams | null) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["salesMarginReport", params, companyWide],
    queryFn: async () => {
      if (!params) throw new Error("Params are required");
      return (
        await salesMarginApi.get({
          ...params,
          company_wide: companyWide || undefined,
        })
      ).data;
    },
    enabled: params !== null,
  });
}
