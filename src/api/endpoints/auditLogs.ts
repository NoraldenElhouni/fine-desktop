import apiClient from "../client";
import { AuditAction, AuditLogEntry, AuditLogFilters } from "../../types/entities";

export interface AuditLogQuery extends AuditLogFilters {
  table: string;
  recordId: string;
}

export const getAuditLogs = async ({
  table,
  recordId,
  action,
  from,
  to,
}: AuditLogQuery): Promise<AuditLogEntry[]> => {
  const params: Record<string, string> = {};
  if (action) params.action = action;
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await apiClient.get<{ data: AuditLogEntry[] } | AuditLogEntry[]>(
    `/audit-logs/${table}/${recordId}`,
    { params },
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data ?? [];
};

export type { AuditAction, AuditLogEntry, AuditLogFilters };
