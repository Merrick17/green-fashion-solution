import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiSessionsApi } from "@/lib/api/ai-sessions.api";
import { queryKeys } from "@/lib/query-keys";
import type { UpsertAiSessionDto } from "@repo/types";

export function useAiSession(moodboardId: string) {
  return useQuery({
    queryKey: queryKeys.aiSessions.byMoodboard(moodboardId),
    queryFn: () => aiSessionsApi.getByMoodboard(moodboardId),
    enabled: !!moodboardId,
  });
}

export function useUpsertAiSession(moodboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertAiSessionDto) => aiSessionsApi.upsert(moodboardId, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.aiSessions.byMoodboard(moodboardId) }),
  });
}
