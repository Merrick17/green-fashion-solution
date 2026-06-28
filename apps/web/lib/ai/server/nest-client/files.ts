import type { AxiosInstance } from "axios";
import type { CreateFileDto, FileRecord } from "@repo/types";

export async function registerProjectFile(
  client: AxiosInstance,
  projectId: string,
  url: string,
  type = "IMAGE",
): Promise<unknown> {
  const res = await client.post("/files", { projectId, url, type });
  return res.data;
}

export async function listProjectFiles(
  client: AxiosInstance,
  projectId: string,
): Promise<FileRecord[]> {
  const res = await client.get<FileRecord[]>(`/files/project/${projectId}`);
  return res.data;
}

export async function registerFile(
  client: AxiosInstance,
  dto: CreateFileDto,
): Promise<FileRecord> {
  const res = await client.post<FileRecord>("/files", dto);
  return res.data;
}
