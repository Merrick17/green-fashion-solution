import type { AxiosInstance } from "axios";
import type { CreateInspirationSelectionDto, CuratedAsset } from "@repo/types";

export async function listInspirationAssets(
  client: AxiosInstance,
  projectId: string,
): Promise<CuratedAsset[]> {
  const res = await client.get<CuratedAsset[]>(`/inspiration/project/${projectId}`);
  return res.data;
}

export async function selectInspirationAsset(
  client: AxiosInstance,
  dto: CreateInspirationSelectionDto,
): Promise<unknown> {
  const res = await client.post("/inspiration/select", dto);
  return res.data;
}
