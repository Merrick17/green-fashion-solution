import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";
import {
  isAuthRequestUrl,
  refreshSession,
} from "@/lib/auth/refresh-session";

/** Axios client for Next.js BFF routes (`/api/*`). */
export const bffClient = axios.create({
  withCredentials: true,
});

bffClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

bffClient.interceptors.response.use(
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
      return bffClient(originalRequest);
    }

    return Promise.reject(error);
  },
);
