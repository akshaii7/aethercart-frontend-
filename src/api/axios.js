import axios from "axios";
import { BASE_URL } from "../config";

// BASE_URL comes from config.js:
//   import.meta.env.VITE_API_URL || "https://aethercart-backend.onrender.com"
//
// IMPORTANT: Make sure VITE_API_URL in Vercel's Environment Variables is a
// PLAIN url only, e.g.  https://aethercart-backend.onrender.com
// NOT a markdown link like [https://...](https://...) - that was likely
// pasted in by mistake from a chat response and caused the routing bug.

const CLEANED_BASE_URL = (BASE_URL || "https://aethercart-backend.onrender.com")
  .trim()
  .replace(/\/$/, "");

const api = axios.create({
  baseURL: `${CLEANED_BASE_URL}/api/`,
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
    const isAuthEndpoint =
      originalRequest?.url?.includes("token/") ||
      originalRequest?.url?.includes("register/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }
      try {
        const response = await axios.post(
          `${CLEANED_BASE_URL}/api/accounts/token/refresh/`,
          { refresh: refreshToken }
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