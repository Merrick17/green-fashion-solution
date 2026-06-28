import type { AxiosInstance } from "axios";
import type { CreateMilestoneDto, Milestone, UpdateMilestoneDto } from "@repo/types";

export async function listMilestones(
  client: AxiosInstance,
  projectId: string,
): Promise<Milestone[]> {
  const res = await client.get<Milestone[]>(`/milestones/project/${projectId}`);
  return res.data;
}

export async function createMilestone(
  client: AxiosInstance,
  dto: CreateMilestoneDto,
): Promise<Milestone> {
  const res = await client.post<Milestone>("/milestones", dto);
  return res.data;
}

export async function updateMilestone(
  client: AxiosInstance,
  milestoneId: string,
  dto: UpdateMilestoneDto,
): Promise<Milestone> {
  const res = await client.patch<Milestone>(`/milestones/${milestoneId}`, dto);
  return res.data;
}
