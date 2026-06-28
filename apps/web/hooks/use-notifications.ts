import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications.api";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@repo/types";

export function useNotifications(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.notifications.lists(params),
    queryFn: () => notificationsApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
