import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";
import {
  isAuthRequestUrl,
  refreshSession,
} from "@/lib/auth/refresh-session";
import { apiBaseUrl } from "@/lib/api/defaults";

export const apiClient = axios.create({
  baseURL: apiBaseUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequestUrl(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const accessToken = await refreshSession();
      if (!accessToken) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);
