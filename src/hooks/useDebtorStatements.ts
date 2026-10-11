import { useQuery } from "@tanstack/react-query";
import {
  debtorStatementsApi,
  type DebtorStatementParams,
} from "../api/endpoints/debtorStatements";
import { useIsCompanyWide } from "./useAccounting";

export function useDebtorStatements(params: DebtorStatementParams | null) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["debtorStatements", params, companyWide],
    queryFn: async () => {
      if (!params) throw new Error("Params are required");
      return (
        await debtorStatementsApi.get({
          ...params,
          company_wide: companyWide || undefined,
        })
      ).data;
    },
    enabled: params !== null,
  });
}
