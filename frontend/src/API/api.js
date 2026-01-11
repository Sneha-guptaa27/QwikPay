// api.js
import axios from "axios";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").trim();
const baseURL = API_BASE ? `${API_BASE}/api/v1` : "/api/v1";

// Main API instance
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Separate instance for refresh (no interceptors to avoid loops)
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshAccessToken = async () => {
  const res = await refreshClient.post("/auth/refresh");
  const newAccess = res.data?.access;
  if (newAccess) {
    localStorage.setItem("token", newAccess);
    return newAccess;
  }
  return null;
};

// Attach access token and handle FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers.common?.["Content-Type"];
    delete config.headers.post?.["Content-Type"];
  }
  return config;
});

// Refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !original._retry) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error("no_access_token");

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        localStorage.clear();
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
