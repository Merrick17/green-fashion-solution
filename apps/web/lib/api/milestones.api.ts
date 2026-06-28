import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type { Milestone, CreateMilestoneDto, UpdateMilestoneDto, PaginatedResponse, PaginationParams } from "@repo/types";

export const milestonesApi = {
  create: (dto: CreateMilestoneDto) =>
    apiClient.post<Milestone>("/milestones", dto).then((r) => r.data),

  getByProject: (projectId: string, params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Milestone>>(`/milestones/project/${projectId}`, {
        params: toPaginationQuery(params),
      })
      .then((r) => r.data),

  update: (id: string, dto: UpdateMilestoneDto) =>
    apiClient.patch<Milestone>(`/milestones/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/milestones/${id}`).then((r) => r.data),
};
