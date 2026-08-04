import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useServerConfigStore } from "../stores/serverConfigStore";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Dynamically set baseURL from store
    const serverUrl = useServerConfigStore.getState().serverUrl;
    if (serverUrl) {
      config.baseURL = serverUrl;
    }

    // Attach Auth Token
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach Operating Unit Scoping Header
    const operatingUnitId = useServerConfigStore.getState().operatingUnitId;
    if (operatingUnitId && config.headers) {
      config.headers["X-Operating-Unit-ID"] = operatingUnitId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    // If request succeeded, mark server as connected
    useServerConfigStore.getState().setServerConnected(true, null);
    return response;
  },
  (error) => {
    // Handle server connection / network errors
    if (!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED" || error.response?.status >= 502) {
      const errMsg = error.message || "Network error / Server unreachable";
      useServerConfigStore.getState().setServerConnected(false, errMsg);
    }

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
