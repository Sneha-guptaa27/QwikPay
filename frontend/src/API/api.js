// api.js
import axios from "axios";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").trim();
const baseURL = API_BASE ? `${API_BASE}/api/v1` : "/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  // ❌ don't force "Content-Type": "application/json" here
});

// Add token, but **drop** JSON content-type when sending FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // If we're sending FormData, let the browser set the correct multipart headers
  if (config.data instanceof FormData) {
    // axios v1 headers can be nested; clear all possible places
    delete config.headers["Content-Type"];
    delete config.headers.common?.["Content-Type"];
    delete config.headers.post?.["Content-Type"];
  }
  return config;
});

export default api;
