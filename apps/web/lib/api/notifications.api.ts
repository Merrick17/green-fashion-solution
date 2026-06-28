import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type { Notification, PaginatedResponse, PaginationParams } from "@repo/types";

export const notificationsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Notification>>("/notifications", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch("/notifications/read-all").then((r) => r.data),
};
