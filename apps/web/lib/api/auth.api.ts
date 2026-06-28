import type {
  AuthResponse,
  RefreshTokenResponse,
  LoginDto,
  RegisterDto,
} from "@repo/types";
import { authClient } from "./auth-client";

export const authApi = {
  login: (dto: LoginDto) =>
    authClient.post<AuthResponse>("/auth/login", dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    authClient.post<AuthResponse>("/auth/register", dto).then((r) => r.data),

  refresh: () =>
    authClient.post<RefreshTokenResponse>("/auth/refresh").then((r) => r.data),

  logout: () => authClient.post("/auth/logout").then((r) => r.data),
};
