import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moodboardSnapshotsApi } from "@/lib/api/moodboard-snapshots.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMoodboardSnapshotDto } from "@repo/types";

export function useMoodboardSnapshots(moodboardId: string) {
  return useQuery({
    queryKey: queryKeys.moodboards.snapshots.byMoodboard(moodboardId),
    queryFn: () => moodboardSnapshotsApi.list(moodboardId),
    enabled: !!moodboardId,
  });
}

export function useMoodboardSnapshot(moodboardId: string, snapshotId: string) {
  return useQuery({
    queryKey: queryKeys.moodboards.snapshots.detail(moodboardId, snapshotId),
    queryFn: () => moodboardSnapshotsApi.getById(moodboardId, snapshotId),
    enabled: !!moodboardId && !!snapshotId,
  });
}

export function useCreateMoodboardSnapshot(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMoodboardSnapshotDto) =>
      moodboardSnapshotsApi.create(moodboardId, dto),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: queryKeys.moodboards.snapshots.byMoodboard(moodboardId),
      }),
  });
}