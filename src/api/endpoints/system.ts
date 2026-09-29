import apiClient from "../client";

export interface SystemVersionResponse {
  id?: string;
  desktop_version: string;
  backend_version: string;
  platform?: string | null;
  recorded_at?: string;
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
