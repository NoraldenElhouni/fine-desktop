import apiClient from "../client";

/** ACC-11: months lock after they end; only the owner reopens one. */
export type FiscalPeriodStatus = "open" | "locked";
export type FiscalYearStatus = "open" | "closed";

export interface FiscalPeriod {
  id: string;
  fiscal_year_id: string;
  period_number: number;
  calendar_year: number;
  calendar_month: number;
  start_date: string;
  end_date: string;
  status: FiscalPeriodStatus;
  label: string;
  entry_count: number;
  locked_at: string | null;
  locked_by?: { id: string; name: string } | null;
  reopened_at: string | null;
  reopened_by?: { id: string; name: string } | null;
  reopen_reason: string | null;
}

export interface FiscalYear {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  status: FiscalYearStatus;
  closed_at: string | null;
  closing_entry_id: string | null;
  periods: FiscalPeriod[];
}

export interface FiscalCalendar {
  fiscal_year_start_month: number;
  data: FiscalYear[];
}

export const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export const fiscalApi = {
  getCalendar: () => apiClient.get<FiscalCalendar>("/fiscal-years"),

  createYear: (startYear: number) => apiClient.post<FiscalYear>("/fiscal-years", { start_year: startYear }),

  lockPeriod: (id: string, includeEarlier = false) =>
    apiClient.post<{ locked: string[] }>(`/fiscal-periods/${id}/lock`, { include_earlier: includeEarlier }),

  reopenPeriod: (id: string, reason: string) => apiClient.post<FiscalPeriod>(`/fiscal-periods/${id}/reopen`, { reason }),

  updateSettings: (fiscalYearStartMonth: number) =>
    apiClient.put<{ fiscal_year_start_month: number }>("/fiscal-settings", { fiscal_year_start_month: fiscalYearStartMonth }),
};
