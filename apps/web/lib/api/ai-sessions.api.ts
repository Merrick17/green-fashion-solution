import { apiClient } from "./client";
import type { AiSession, UpsertAiSessionDto } from "@repo/types";

export const aiSessionsApi = {
  getByMoodboard: (moodboardId: string) =>
    apiClient
      .get<AiSession | null>(`/moodboards/${moodboardId}/ai-session`)
      .then((r) => r.data),

  upsert: (moodboardId: string, dto: UpsertAiSessionDto) =>
    apiClient
      .put<AiSession>(`/moodboards/${moodboardId}/ai-session`, dto)
      .then((r) => r.data),
};
