import { apiClient } from "./client";
import type { CreateWaitlistDto, WaitlistEntry } from "@repo/types";

export const waitlistApi = {
  join: (dto: CreateWaitlistDto) =>
    apiClient.post<WaitlistEntry>("/waitlist", dto).then((r) => r.data),
};
