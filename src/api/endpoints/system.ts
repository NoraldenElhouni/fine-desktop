import apiClient from "../client";

export interface SystemVersionResponse {
  id?: string;
  desktop_version: string;
  backend_version: string;
  platform?: string | null;
  recorded_at?: string;
  min_desktop_version?: string | null;
  latest_desktop_version?: string | null;
  is_update_required?: boolean;
  update_url?: string;
  direct_download_url?: string;
}

export interface SystemStatusResponse {
  backend_version: string;
  min_desktop_version?: string | null;
  latest_desktop_version?: string | null;
  is_update_required?: boolean;
  update_url?: string;
  direct_download_url?: string;
}

export const recordSystemVersion = async (
  desktopVersion: string,
  platform?: string
): Promise<SystemVersionResponse> => {
  const response = await apiClient.post<SystemVersionResponse>("/system/version", {
    desktop_version: desktopVersion,
    platform: platform || (typeof navigator !== "undefined" ? navigator.platform : undefined),
  });
  return response.data;
};

export const getBackendVersion = async (): Promise<{ backend_version: string }> => {
  const response = await apiClient.get<{ backend_version: string }>("/system/version");
  return response.data;
};

export const checkUpdateStatus = async (): Promise<SystemStatusResponse> => {
  const response = await apiClient.get<SystemStatusResponse>("/system/version");
  return response.data;
};
