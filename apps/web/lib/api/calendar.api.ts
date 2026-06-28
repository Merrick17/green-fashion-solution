import { apiClient } from "./client";
import type { CalendarResponse } from "@repo/types";

export const calendarApi = {
  getEvents: (start: string, end: string) =>
    apiClient
      .get<CalendarResponse>("/calendar", { params: { start, end } })
      .then((r) => r.data),
};
