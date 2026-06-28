import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type { CuratedAsset, CreateInspirationSelectionDto, PaginatedResponse, PaginationParams } from "@repo/types";

export const inspirationApi = {
  getByProject: (projectId: string, params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<CuratedAsset>>(`/inspiration/project/${projectId}`, {
        params: toPaginationQuery(params),
      })
      .then((r) => r.data),

  toggle: (dto: CreateInspirationSelectionDto) =>
    apiClient.post("/inspiration/select", dto).then((r) => r.data),
};
