import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moodItemsApi } from "@/lib/api/mood-items.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMoodItemDto, UpdateMoodItemDto, BatchUpdateMoodItemsDto, ReorderMoodItemsDto } from "@repo/types";

export function useCreateMoodItem(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMoodItemDto) => moodItemsApi.create(moodboardId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
    },
  });
}

export function useUpdateMoodItem(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMoodItemDto }) =>
      moodItemsApi.update(moodboardId, id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
    },
  });
}

export function useDeleteMoodItem(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moodItemsApi.remove(moodboardId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
    },
  });
}

export function useBatchUpdateMoodItems(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BatchUpdateMoodItemsDto) =>
      moodItemsApi.batchUpdate(moodboardId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
    },
  });
}

export function useReorderMoodItems(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ReorderMoodItemsDto) =>
      moodItemsApi.reorder(moodboardId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
    },
  });
}