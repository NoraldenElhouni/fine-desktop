import { useQuery } from "@tanstack/react-query";
import { stagnantStockApi, StagnantStockFilters } from "../api/endpoints/stagnantStock";

export function useStagnantStock(filters?: StagnantStockFilters, enabled = true) {
  return useQuery({
    queryKey: ["stagnantStock", filters],
    queryFn: async () => {
      const res = await stagnantStockApi.report(filters);
      return res.data;
    },
    enabled,
  });
}
