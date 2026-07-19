import axios from "axios";

const api = axios.create({
  baseURL: "https://aethercart-backend.onrender.com/api/"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "token_not_valid" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "https://aethercart-backend.onrender.com/api/accounts/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        localStorage.setItem("access", response.data.access);

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;