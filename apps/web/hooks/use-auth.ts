import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/auth-store";
import {
  clearWebSessionCookies,
  persistWebSession,
} from "@/lib/auth/web-session";
import type { LoginDto, RegisterDto } from "@repo/types";
import { useRouter } from "next/navigation";
import { dashboardPathForRole } from "@/lib/auth/portal-routes";

function redirectAfterAuth(role: string) {
  const target = dashboardPathForRole(role);
  // Full navigation so middleware sees cookies set by persistWebSession.
  window.location.assign(target);
}

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.refreshToken) {
        persistWebSession(data.accessToken, data.refreshToken);
      }
      redirectAfterAuth(data.role);
    },
  });
}

export function useRegister() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.refreshToken) {
        persistWebSession(data.accessToken, data.refreshToken);
      }
      redirectAfterAuth(data.role);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      clearWebSessionCookies();
      router.push("/login");
    },
  });
}
