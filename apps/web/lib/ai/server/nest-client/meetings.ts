import type { AxiosInstance } from "axios";
import type { CreateMeetingDto, Meeting, UpdateMeetingDto } from "@repo/types";

export async function listMeetings(
  client: AxiosInstance,
): Promise<import("@repo/types").Meeting[]> {
  const res = await client.get<{ data: import("@repo/types").Meeting[] } | import("@repo/types").Meeting[]>("/meetings");
  const payload = res.data;
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}

export async function updateMeeting(
  client: AxiosInstance,
  meetingId: string,
  dto: UpdateMeetingDto,
): Promise<Meeting> {
  const res = await client.patch<Meeting>(`/meetings/${meetingId}`, dto);
  return res.data;
}

export async function createMeeting(
  client: AxiosInstance,
  dto: CreateMeetingDto,
): Promise<Meeting> {
  const res = await client.post<Meeting>("/meetings", dto);
  return res.data;
}
