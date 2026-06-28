import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  MessageThread,
  Message,
  CreateMessageThreadDto,
  SendMessageDto,
  PaginatedResponse,
  PaginationParams,
} from "@repo/types";

export const messagesApi = {
  getThreads: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<MessageThread>>("/messages/threads", {
        params: toPaginationQuery(params),
      })
      .then((r) => r.data),

  getThread: (id: string) =>
    apiClient.get<MessageThread>(`/messages/threads/${id}`).then((r) => r.data),

  createThread: (dto: CreateMessageThreadDto) =>
    apiClient.post<MessageThread>("/messages/threads", dto).then((r) => r.data),

  sendMessage: (threadId: string, dto: SendMessageDto) =>
    apiClient.post<Message>(`/messages/threads/${threadId}/messages`, dto).then((r) => r.data),

  getBriefQaThread: (projectId: string) =>
    apiClient.get<MessageThread>(`/messages/brief-qa/${projectId}`).then((r) => r.data),
};
