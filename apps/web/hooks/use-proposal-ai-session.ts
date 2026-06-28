import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalAiSessionsApi } from "@/lib/api/proposal-ai-sessions.api";
import { queryKeys } from "@/lib/query-keys";
import type { UpsertProposalAiSessionDto } from "@repo/types";

export function useProposalAiSession(projectId: string) {
  return useQuery({
    queryKey: queryKeys.proposalAiSessions.byProject(projectId),
    queryFn: () => proposalAiSessionsApi.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useUpsertProposalAiSession(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertProposalAiSessionDto) =>
      proposalAiSessionsApi.upsert(projectId, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.proposalAiSessions.byProject(projectId) }),
  });
}
