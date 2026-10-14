import { useQuery } from "@tanstack/react-query";
import {
  stockMovementCardApi,
  type StockMovementCardParams,
} from "../api/endpoints/stockMovementCard";
import { useIsCompanyWide } from "./useAccounting";

export function useStockMovementCard(
  itemId: string | undefined,
  params: StockMovementCardParams | null,
) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["stockMovementCard", itemId, params, companyWide],
    queryFn: async () => {
      if (!itemId) throw new Error("Item ID is required");
      if (!params) throw new Error("Params are required");
      return (
        await stockMovementCardApi.get(itemId, {
          ...params,
          company_wide: companyWide || undefined,
        })
      ).data;
    },
    enabled: Boolean(itemId) && params !== null,
  });
}
