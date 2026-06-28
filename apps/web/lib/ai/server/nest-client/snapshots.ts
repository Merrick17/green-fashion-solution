import type { AxiosInstance } from "axios";
import type {
  CreateMoodboardSnapshotDto,
  MoodboardSnapshot,
} from "@repo/types";
import { formatAiStreamError } from "../stream-error";

export async function createMoodboardSnapshot(
  client: AxiosInstance,
  moodboardId: string,
  dto: CreateMoodboardSnapshotDto,
): Promise<MoodboardSnapshot> {
  try {
    const res = await client.post<MoodboardSnapshot>(
      `/moodboards/${moodboardId}/snapshots`,
      dto,
    );
    return res.data;
  } catch (error) {
    throw new Error(formatAiStreamError(error));
  }
}

export async function listMoodboardSnapshots(
  client: AxiosInstance,
  moodboardId: string,
): Promise<MoodboardSnapshot[]> {
  const res = await client.get<MoodboardSnapshot[]>(
    `/moodboards/${moodboardId}/snapshots`,
  );
  return res.data;
}
