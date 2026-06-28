import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { filesApi } from "@/lib/api/files.api";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@repo/types";

export function useProjectFiles(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.files.byProject(projectId, params),
    queryFn: () => filesApi.getByProject(projectId, params),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
}

export function useRequestUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: filesApi.requestUpload,
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.files.all }),
  });
}
