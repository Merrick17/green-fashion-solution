import type { AxiosInstance } from "axios";
import { REVISION_MODE_PARAM, type AgentContext, type Project, type UpdateProjectDto } from "@repo/types";

export async function fetchAgentContext(
  client: AxiosInstance,
  projectId: string,
  revisionMode = false,
): Promise<AgentContext> {
  const res = await client.get<AgentContext>(`/projects/${projectId}/agent-context`, {
    params: revisionMode ? { [REVISION_MODE_PARAM]: "true" } : undefined,
  });
  return res.data;
}

export async function fetchProject(
  client: AxiosInstance,
  projectId: string,
): Promise<Project> {
  const res = await client.get<Project>(`/projects/${projectId}`);
  return res.data;
}

export async function updateProject(
  client: AxiosInstance,
  projectId: string,
  dto: UpdateProjectDto,
): Promise<Project> {
  const res = await client.patch<Project>(`/projects/${projectId}`, dto);
  return res.data;
}

export async function submitProject(
  client: AxiosInstance,
  projectId: string,
): Promise<Project> {
  const res = await client.patch<Project>(`/projects/${projectId}/submit`);
  return res.data;
}
