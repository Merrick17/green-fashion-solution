import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import {
  REVISION_MODE_PARAM,
  type Project,
  type CreateProjectDto,
  type UpdateProjectDto,
  type PaginatedResponse,
  type PaginationParams,
  type AgentContext,
} from "@repo/types";

export const projectsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Project>>("/projects", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),

  getAgentContext: (id: string, revisionMode = false) =>
    apiClient
      .get<AgentContext>(`/projects/${id}/agent-context`, {
        params: revisionMode ? { [REVISION_MODE_PARAM]: "true" } : undefined,
      })
      .then((r) => r.data),

  create: (dto: CreateProjectDto) =>
    apiClient.post<Project>("/projects", dto).then((r) => r.data),

  update: (id: string, dto: UpdateProjectDto) =>
    apiClient.patch<Project>(`/projects/${id}`, dto).then((r) => r.data),

  submit: (id: string) =>
    apiClient.patch<Project>(`/projects/${id}/submit`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/projects/${id}`).then((r) => r.data),
};
