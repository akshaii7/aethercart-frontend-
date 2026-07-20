import axios from "axios";
import { BASE_URL } from "../config";

const cleanBaseUrl = (url) => {
  if (!url) return "https://aethercart-backend.onrender.com";
  const match = url.match(/\]\(([^)]+)\)/) || url.match(/\(([^)]+)\)/);
  if (match && match[1]) return match[1].replace(/\/$/, "");
  return url.replace(/[\[\]]/g, "").trim().replace(/\/$/, "");
};

const CLEANED_BASE_URL = cleanBaseUrl(BASE_URL);

const api = axios.create({
  baseURL: `${CLEANED_BASE_URL}/`
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
    const isAuthEndpoint = originalRequest?.url?.includes("token/") || originalRequest?.url?.includes("register/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      try {
        // FIXED: Added /accounts/ prefix to match your backend logs
        const response = await axios.post(`${CLEANED_BASE_URL}/api/accounts/token/refresh/`, {
          refresh: refreshToken,
        });
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