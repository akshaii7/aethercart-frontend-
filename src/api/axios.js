import axios from "axios";
import { BASE_URL } from "../config";

/**
 * Automatically cleans the BASE_URL in case it has 
 * markdown brackets or trailing slashes from Vercel's environment variables.
 */
const cleanBaseUrl = (url) => {
  if (!url) return "https://aethercart-backend.onrender.com";
  
  // Extracts the actual link if formatted like [text](link) or (link)
  const match = url.match(/\]\(([^)]+)\)/) || url.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].replace(/\/$/, ""); 
  }
  
  // Strips any left-over bracket characters and removes trailing slash
  let cleanUrl = url.replace(/[\[\]]/g, "").trim();
  return cleanUrl.replace(/\/$/, "");
};

const CLEANED_BASE_URL = cleanBaseUrl(BASE_URL);

console.log("[Axios Init] Cleaned Base URL:", CLEANED_BASE_URL);

// Create Axios Instance
const api = axios.create({
  baseURL: `${CLEANED_BASE_URL}/` 
});

// Request Interceptor to append Authorization Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Clear Auth tokens on failure
const clearAuth = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
};

// Response Interceptor to automatically handle 401 token refresh loops
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
        // ==========================================
        // 100% FIXED REFRESH TOKEN ENDPOINT
        // ==========================================
        // Changed from '/api/accounts/token/refresh/' to correct standard route
        const response = await axios.post(
          `${CLEANED_BASE_URL}/api/token/refresh/`,
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