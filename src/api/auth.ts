import { LoginCredentials } from "../types/auth/schemas";
import { ApiMessageResponse, AuthResponse, User } from "../types/auth/types";
import apiClient from "./client";

export const loginApi = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials,
  );
  return response.data;
};

export const fetchMeApi = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};

export const logoutApi = async (): Promise<ApiMessageResponse> => {
  const response = await apiClient.post<ApiMessageResponse>("/auth/logout");
  return response.data;
};
