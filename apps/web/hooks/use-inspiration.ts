import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { inspirationApi } from "@/lib/api/inspiration.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateInspirationSelectionDto, PaginationParams } from "@repo/types";

export function useInspiration(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.inspiration.byProject(projectId, params),
    queryFn: () => inspirationApi.getByProject(projectId, params),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
}

export function useToggleInspiration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInspirationSelectionDto) => inspirationApi.toggle(dto),
    onSuccess: (_data, dto) =>
      qc.invalidateQueries({ queryKey: queryKeys.inspiration.all }),
  });
}
