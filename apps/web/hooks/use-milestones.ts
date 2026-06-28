import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { milestonesApi } from "@/lib/api/milestones.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMilestoneDto, UpdateMilestoneDto, PaginationParams } from "@repo/types";

export function useMilestones(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.milestones.byProject(projectId, params),
    queryFn: () => milestonesApi.getByProject(projectId, params),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMilestoneDto) => milestonesApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.milestones.all }),
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMilestoneDto; projectId: string }) =>
      milestonesApi.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.milestones.all }),
  });
}
