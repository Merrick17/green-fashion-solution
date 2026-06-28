import { apiClient } from "./client";
import type { CreateLeadDto, Lead } from "@repo/types";

export const leadsApi = {
  create: (dto: CreateLeadDto) =>
    apiClient.post<Lead>("/leads", dto).then((r) => r.data),
};
