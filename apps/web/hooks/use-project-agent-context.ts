import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects.api";
import { queryKeys } from "@/lib/query-keys";

export function useProjectAgentContext(
  projectId: string,
  revisionMode = false,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.projects.agentContext(projectId, revisionMode),
    queryFn: () => projectsApi.getAgentContext(projectId, revisionMode),
    enabled: !!projectId && enabled,
  });
}
