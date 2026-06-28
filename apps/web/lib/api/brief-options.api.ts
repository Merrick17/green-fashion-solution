import { apiClient } from "./client";
import type {
  BriefOption,
  BriefOptionType,
  CreateBriefOptionDto,
  ListBriefOptionsParams,
  UpdateBriefOptionDto,
} from "@repo/types";

export const briefOptionsApi = {
  list: (params?: ListBriefOptionsParams) =>
    apiClient
      .get<BriefOption[]>("/brief-options", { params })
      .then((r) => r.data),

  listSeasons: () =>
    briefOptionsApi.list({ type: "SEASON" as BriefOptionType }),

  listCategories: () =>
    briefOptionsApi.list({ type: "CATEGORY" as BriefOptionType }),

  listAll: (params?: ListBriefOptionsParams) =>
    apiClient
      .get<BriefOption[]>("/brief-options", {
        params: { ...params, includeInactive: true },
      })
      .then((r) => r.data),

  create: (dto: CreateBriefOptionDto) =>
    apiClient.post<BriefOption>("/brief-options", dto).then((r) => r.data),

  update: (id: string, dto: UpdateBriefOptionDto) =>
    apiClient.patch<BriefOption>(`/brief-options/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/brief-options/${id}`).then((r) => r.data),
};
