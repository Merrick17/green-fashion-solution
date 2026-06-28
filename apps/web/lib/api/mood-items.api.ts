import { apiClient } from "./client";
import type {
  MoodItem,
  CreateMoodItemDto,
  UpdateMoodItemDto,
  BatchUpdateMoodItemsDto,
  ReorderMoodItemsDto,
} from "@repo/types";

export const moodItemsApi = {
  create: (moodboardId: string, dto: CreateMoodItemDto) =>
    apiClient
      .post<MoodItem>(`/moodboards/${moodboardId}/items`, dto)
      .then((r) => r.data),

  list: (moodboardId: string) =>
    apiClient
      .get<MoodItem[]>(`/moodboards/${moodboardId}/items`)
      .then((r) => r.data),

  getById: (moodboardId: string, id: string) =>
    apiClient
      .get<MoodItem>(`/moodboards/${moodboardId}/items/${id}`)
      .then((r) => r.data),

  update: (moodboardId: string, id: string, dto: UpdateMoodItemDto) =>
    apiClient
      .patch<MoodItem>(`/moodboards/${moodboardId}/items/${id}`, dto)
      .then((r) => r.data),

  remove: (moodboardId: string, id: string) =>
    apiClient
      .delete(`/moodboards/${moodboardId}/items/${id}`)
      .then((r) => r.data),

  batchUpdate: (moodboardId: string, dto: BatchUpdateMoodItemsDto) =>
    apiClient
      .patch<MoodItem[]>(`/moodboards/${moodboardId}/items`, dto)
      .then((r) => r.data),

  reorder: (moodboardId: string, dto: ReorderMoodItemsDto) =>
    apiClient
      .post<MoodItem[]>(`/moodboards/${moodboardId}/items/reorder`, dto)
      .then((r) => r.data),
};