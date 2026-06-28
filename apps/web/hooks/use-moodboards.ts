import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { moodboardsApi } from "@/lib/api/moodboards.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMoodboardDto, UpdateMoodboardDto, PaginationParams } from "@repo/types";

export function useMoodboards(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.moodboards.byProject(projectId, params),
    queryFn: () => moodboardsApi.getByProject(projectId, params),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
}

export function useMoodboard(id: string) {
  return useQuery({
    queryKey: queryKeys.moodboards.detail(id),
    queryFn: () => moodboardsApi.getById(id),
    enabled: !!id,
  });
}

export function useMoodboardFull(id: string) {
  return useQuery({
    queryKey: queryKeys.moodboards.full(id),
    queryFn: () => moodboardsApi.getFull(id),
    enabled: !!id,
  });
}

export function useCreateMoodboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMoodboardDto) => moodboardsApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.all }),
  });
}

export function useUpdateMoodboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMoodboardDto }) =>
      moodboardsApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(id) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.all });
    },
  });
}

export function useDeleteMoodboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moodboardsApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.all }),
  });
}

export function useResetMoodboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moodboardsApi.reset(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(id) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.all });
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(id) });
    },
  });
}