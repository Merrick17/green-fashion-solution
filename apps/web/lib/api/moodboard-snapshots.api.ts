import { apiClient } from "./client";
import type { MoodboardSnapshot, CreateMoodboardSnapshotDto } from "@repo/types";

export const moodboardSnapshotsApi = {
  create: (moodboardId: string, dto: CreateMoodboardSnapshotDto) =>
    apiClient
      .post<MoodboardSnapshot>(`/moodboards/${moodboardId}/snapshots`, dto)
      .then((r) => r.data),

  list: (moodboardId: string) =>
    apiClient
      .get<MoodboardSnapshot[]>(`/moodboards/${moodboardId}/snapshots`)
      .then((r) => r.data),

  getById: (moodboardId: string, id: string) =>
    apiClient
      .get<MoodboardSnapshot>(`/moodboards/${moodboardId}/snapshots/${id}`)
      .then((r) => r.data),
};