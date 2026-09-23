import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useServerConfigStore, normalizeServerUrl } from "../stores/serverConfigStore";
import { useConflictStore } from "../stores/conflictStore";
import { useUpdateStore } from "../stores/updateStore";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Dynamically resolve base URL and avoid Axios root-relative URL stripping
    const rawServerUrl = useServerConfigStore.getState().serverUrl;
    if (rawServerUrl) {
      const cleanBase = normalizeServerUrl(rawServerUrl);
      if (config.url && !config.url.startsWith("http://") && !config.url.startsWith("https://")) {
        const relativeUrl = config.url.replace(/^\/+/, "");
        config.url = `${cleanBase}/${relativeUrl}`;
        delete config.baseURL;
      } else {
        config.baseURL = cleanBase;
      }
    }

    // Attach Auth Token
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach Operating Unit Scoping Header. Company-wide roles (owner,
    // admin, accounting manager) intentionally leave this unpinned so they
    // can see every unit at once; a pinned id is only sent when the user
    // (or the navbar switcher) has explicitly chosen one.
    const user = useAuthStore.getState().user as any;
    const operatingUnitId =
      useServerConfigStore.getState().operatingUnitId ||
      user?.operating_unit_id ||
      user?.operating_units?.[0]?.id ||
      user?.unit_id;

    if (operatingUnitId && config.headers) {
      config.headers["X-Operating-Unit-ID"] = operatingUnitId;
    }

    if (config.headers) {
      config.headers["X-Desktop-Version"] =
        typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.24";
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

    // A stored unit id from a different (or reseeded) database makes every
    // request fail identically. Drop it so the next attempt goes through
    // unscoped — company-wide roles recover immediately, and unit-scoped users
    // get a clear "pick a unit" prompt instead of an endless retry loop.
    if (
      error.response?.status === 400 &&
      error.response?.data?.code === "INVALID_OPERATING_UNIT"
    ) {
      const { operatingUnitId, setOperatingUnitId } = useServerConfigStore.getState();
      if (operatingUnitId) {
        console.warn(
          `[api] Clearing stale operating unit ${operatingUnitId} — the server does not recognise it.`,
        );
        setOperatingUnitId(null);
      }
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
    } else if (
      error.response?.status === 426 ||
      error.response?.data?.code === "FORCE_UPDATE_REQUIRED"
    ) {
      const data = error.response?.data || {};
      useUpdateStore.getState().setForceUpdate(true, {
        currentVersion:
          data.current_version ||
          (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.24"),
        requiredVersion: data.required_version || "",
        latestVersion: data.latest_version || data.required_version || "",
        updateUrl: data.update_url,
        directDownloadUrl: data.direct_download_url,
      });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
