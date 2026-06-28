import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type { User, PaginatedResponse, PaginationParams } from "@repo/types";

export const usersApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<User>>("/users", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getMe: () => apiClient.get<User>("/users/me").then((r) => r.data),

  exportMe: () => apiClient.get<Record<string, unknown>>("/users/me/export").then((r) => r.data),

  deleteMe: () => apiClient.delete("/users/me").then((r) => r.data),

  updateEmailNotifications: (emailNotifications: boolean) =>
    apiClient
      .patch<User>("/users/me/email-notifications", { emailNotifications })
      .then((r) => r.data),
};
