import type { AxiosInstance } from "axios";
import type { CreateMoodItemDto, MoodItem, UpdateMoodItemDto } from "@repo/types";
import { formatAiStreamError } from "../stream-error";

const MIN_MOOD_ITEM_SIZE = 50;

export type CreateMoodItemBody = Omit<CreateMoodItemDto, "moodboardId">;

function sanitizeMoodItemDto(dto: CreateMoodItemBody): CreateMoodItemBody {
  return {
    ...dto,
    x: Math.max(0, dto.x ?? 0),
    y: Math.max(0, dto.y ?? 0),
    width: Math.max(MIN_MOOD_ITEM_SIZE, dto.width ?? 200),
    height: Math.max(MIN_MOOD_ITEM_SIZE, dto.height ?? 200),
  };
}

function formatNestError(error: unknown): string {
  return formatAiStreamError(error);
}

export async function fetchMoodItems(
  client: AxiosInstance,
  moodboardId: string,
): Promise<MoodItem[]> {
  const res = await client.get<MoodItem[]>(`/moodboards/${moodboardId}/items`);
  return res.data;
}

export async function createMoodItem(
  client: AxiosInstance,
  moodboardId: string,
  dto: CreateMoodItemBody,
): Promise<MoodItem> {
  try {
    const res = await client.post<MoodItem>(
      `/moodboards/${moodboardId}/items`,
      sanitizeMoodItemDto(dto),
    );
    return res.data;
  } catch (error) {
    throw new Error(formatNestError(error));
  }
}

export async function updateMoodItem(
  client: AxiosInstance,
  moodboardId: string,
  id: string,
  dto: UpdateMoodItemDto,
): Promise<MoodItem> {
  const res = await client.patch<MoodItem>(`/moodboards/${moodboardId}/items/${id}`, dto);
  return res.data;
}

export async function deleteMoodItem(
  client: AxiosInstance,
  moodboardId: string,
  id: string,
): Promise<void> {
  await client.delete(`/moodboards/${moodboardId}/items/${id}`);
}

export async function batchUpdateMoodItems(
  client: AxiosInstance,
  moodboardId: string,
  updates: Array<{ id: string; x?: number; y?: number; width?: number; height?: number }>,
): Promise<MoodItem[]> {
  const res = await client.patch<MoodItem[]>(`/moodboards/${moodboardId}/items`, { updates });
  return res.data;
}

export async function updateMoodboard(
  client: AxiosInstance,
  moodboardId: string,
  dto: Record<string, unknown>,
): Promise<unknown> {
  const res = await client.patch(`/moodboards/${moodboardId}`, dto);
  return res.data;
}

/** Persist a generated image buffer to Cloudinary (or local dev storage). */
export async function uploadMoodboardBuffer(
  client: AxiosInstance,
  moodboardId: string,
  buffer: Buffer,
  contentType: string,
  filename: string,
): Promise<string> {
  const params = new URLSearchParams({
    moodboardId,
    filename,
    contentType,
  });
  const { data } = await client.post<{ key: string; url: string }>(
    `/files/upload-buffer/moodboard?${params.toString()}`,
    buffer,
    { headers: { "Content-Type": contentType } },
  );
  return data.key;
}

export async function uploadAssetBuffer(
  client: AxiosInstance,
  buffer: Buffer,
  contentType: string,
  filename: string,
): Promise<string> {
  const params = new URLSearchParams({ filename, contentType });
  const { data } = await client.post<{ key: string; url: string }>(
    `/files/upload-buffer/asset?${params.toString()}`,
    buffer,
    { headers: { "Content-Type": contentType } },
  );
  return data.key;
}
