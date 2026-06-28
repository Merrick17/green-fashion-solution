import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type { Moodboard, CreateMoodboardDto, UpdateMoodboardDto, PaginatedResponse, PaginationParams } from "@repo/types";

export const moodboardsApi = {
  create: (dto: CreateMoodboardDto) =>
    apiClient.post<Moodboard>("/moodboards", dto).then((r) => r.data),

  getByProject: (projectId: string, params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Moodboard>>(`/moodboards/project/${projectId}`, {
        params: toPaginationQuery(params),
      })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Moodboard>(`/moodboards/${id}`).then((r) => r.data),

  getFull: (id: string) =>
    apiClient.get<Moodboard>(`/moodboards/${id}/full`).then((r) => r.data),

  update: (id: string, dto: UpdateMoodboardDto) =>
    apiClient.patch<Moodboard>(`/moodboards/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/moodboards/${id}`).then((r) => r.data),

  reset: (id: string) =>
    apiClient.post(`/moodboards/${id}/reset`).then((r) => r.data),
};