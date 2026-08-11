import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

export interface Warehouse {
  id: string;
  operating_unit_id: string;
  name: string;
  is_internal_unit?: boolean;
}

/** Warehouses for the current operating unit — scoped server-side. */
export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await apiClient.get<Warehouse[]>("/warehouses");
      return res.data;
    },
  });
}
