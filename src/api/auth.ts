import { z } from "zod";
import apiClient from "./client";
import { User } from "../stores/authStore";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiMessageResponse {
  message: string;
}

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
