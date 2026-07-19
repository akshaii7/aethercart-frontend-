import axios from "axios";
import { BASE_URL } from "../config";

const api = axios.create({
  baseURL: `${BASE_URL}/api/`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const clearAuth = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Don't retry on auth endpoints to avoid infinite loops
    const isAuthEndpoint =
      originalRequest?.url?.includes("token/") ||
      originalRequest?.url?.includes("register/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${BASE_URL}/api/accounts/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        localStorage.setItem("access", response.data.access);

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;