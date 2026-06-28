export interface AiSession {
  id: string;
  moodboardId: string;
  userId: string;
  messages: unknown[];
  modelId?: string | null;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAiSessionDto {
  messages: unknown[];
  modelId?: string;
  settings?: Record<string, unknown>;
}
