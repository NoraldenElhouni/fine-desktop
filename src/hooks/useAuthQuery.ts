import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  loginApi,
  fetchMeApi,
  logoutApi,
  LoginCredentials,
  AuthResponse,
  ApiMessageResponse,
} from "../api/auth";
import { useAuthStore, User } from "../stores/authStore";

export const AUTH_QUERY_KEY = ["auth", "me"];

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError<{ message?: string }>, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
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
    staleTime: 5 * 60 * 1000,
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
