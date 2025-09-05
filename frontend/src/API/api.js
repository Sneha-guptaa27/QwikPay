import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true // send refresh cookie
});

// Add token to every request
api.interceptors.request.use(config => {
<<<<<<< Updated upstream
  const token = localStorage.getItem("accessToken");
=======
  const token = localStorage.getItem("token");
>>>>>>> Stashed changes
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh if 401 from expired access token
api.interceptors.response.use(
  res => {
    const newAccessToken = res.headers["x-new-access-token"];
    if (newAccessToken) {
<<<<<<< Updated upstream
      localStorage.setItem("accessToken", newAccessToken);
=======
      localStorage.setItem("token", newAccessToken);
>>>>>>> Stashed changes
    }
    return res;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          "http://localhost:3000/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );
        console.log(refreshRes);
        const newToken = refreshRes.data.access;
<<<<<<< Updated upstream
        localStorage.setItem("accessToken", newToken);
=======
        localStorage.setItem("token", newToken);
>>>>>>> Stashed changes
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // retry
      } catch (refreshErr) {
        console.error("Refresh failed", refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;