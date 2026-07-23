import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    ?.VITE_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    } else if (
      error.response?.status === 403 &&
      error.response?.data?.code === "MUST_CHANGE_PASSWORD"
    ) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser && !currentUser.must_change_password) {
        useAuthStore.getState().setUser({
          ...currentUser,
          must_change_password: true,
        });
      }
    }
    return Promise.reject(error);
  },
);


export default apiClient;
