"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi, type ParseMoodboardSyncDto } from "@/lib/api/ai.api";
import { queryKeys } from "@/lib/query-keys";

export function useMoodboardParse(moodboardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<ParseMoodboardSyncDto, "moodboardId">) =>
      aiApi.parseMoodboardSync({ moodboardId, ...dto }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
      qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
    },
  });
}
