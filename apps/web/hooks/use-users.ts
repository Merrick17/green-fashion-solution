import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users.api";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@repo/types";

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users.lists(params),
    queryFn: () => usersApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: usersApi.getMe,
  });
}
