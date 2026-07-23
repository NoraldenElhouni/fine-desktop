import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginApi, fetchMeApi, logoutApi, changePasswordApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import {
  ApiMessageResponse,
  AuthResponse,
  ChangePasswordResponse,
  User,
} from "../types/auth/types";
import {
  AUTH_QUERY_KEY,
  AUTH_STALE_TIME_MS,
} from "../constants/auth/constants";
import { ChangePasswordCredentials, LoginCredentials } from "../types/auth/schemas";


export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<
    AuthResponse,
    AxiosError<{ message?: string }>,
    LoginCredentials
  >({
    mutationFn: (credentials) => loginApi(credentials),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });
};

export const useUserQuery = () => {
  const { token, setUser, logout } = useAuthStore();

  return useQuery<User, AxiosError>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const user = await fetchMeApi();
        setUser(user);
        return user;
      } catch (err) {
        logout();
        throw err;
      }
    },
    enabled: Boolean(token),
    staleTime: AUTH_STALE_TIME_MS,
    retry: false,
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation<ApiMessageResponse, AxiosError>({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    ChangePasswordResponse,
    AxiosError<{ message?: string }>,
    ChangePasswordCredentials
  >({
    mutationFn: (credentials) => changePasswordApi(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });
};

