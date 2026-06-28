import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  Meeting,
  CreateMeetingDto,
  UpdateMeetingDto,
  PaginatedResponse,
  PaginationParams,
} from "@repo/types";

export const meetingsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Meeting>>("/meetings", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Meeting>(`/meetings/${id}`).then((r) => r.data),

  create: (dto: CreateMeetingDto) =>
    apiClient.post<Meeting>("/meetings", dto).then((r) => r.data),

  update: (id: string, dto: UpdateMeetingDto) =>
    apiClient.patch<Meeting>(`/meetings/${id}`, dto).then((r) => r.data),
};
