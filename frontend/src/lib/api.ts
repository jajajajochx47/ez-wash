import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      typeof window !== "undefined" &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          originalRequest._retry = true;
          const res = await api.post("/auth/refresh", { refreshToken });
          localStorage.setItem("accessToken", res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        } catch {
          // fall through to logout cleanup
        }
      }
    }

    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
