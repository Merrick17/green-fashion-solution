import { bffClient } from "./bff-client";

export type ParseMoodboardSyncDto = {
  moodboardId: string;
  projectId?: string;
  messages: unknown[];
};

export type ParseMoodboardSyncResult = {
  ok: true;
};

export const aiApi = {
  parseMoodboardSync: (dto: ParseMoodboardSyncDto) =>
    bffClient
      .post<ParseMoodboardSyncResult>("/api/ai/v1/parse-sync", {
        ...dto,
        mode: "parse" as const,
      })
      .then((r) => r.data),
};
