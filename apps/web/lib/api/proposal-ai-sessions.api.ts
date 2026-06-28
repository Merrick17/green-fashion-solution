import { apiClient } from "./client";
import type { UpsertProposalAiSessionDto, ProposalAiSession } from "@repo/types";

export const proposalAiSessionsApi = {
  getByProject: (projectId: string) =>
    apiClient
      .get<ProposalAiSession | null>(`/projects/${projectId}/proposal-ai-session`)
      .then((r) => r.data),

  upsert: (projectId: string, dto: UpsertProposalAiSessionDto) =>
    apiClient
      .put<ProposalAiSession>(`/projects/${projectId}/proposal-ai-session`, dto)
      .then((r) => r.data),
};
