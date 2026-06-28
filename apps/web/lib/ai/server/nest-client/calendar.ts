import type { AxiosInstance } from "axios";
import type { BriefOption, CalendarResponse } from "@repo/types";

export async function listBriefOptions(
  client: AxiosInstance,
): Promise<BriefOption[]> {
  const res = await client.get<BriefOption[]>("/brief-options");
  return res.data;
}

export async function getCalendarEvents(
  client: AxiosInstance,
  start: string,
  end: string,
): Promise<CalendarResponse> {
  const res = await client.get<CalendarResponse>("/calendar", {
    params: { start, end },
  });
  return res.data;
}
