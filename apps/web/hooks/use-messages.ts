import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMessageThreadDto, SendMessageDto, PaginationParams } from "@repo/types";

export function useMessageThreads(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.messages.threads(params),
    queryFn: () => messagesApi.getThreads(params),
  });
}

export function useMessageThread(id: string) {
  return useQuery({
    queryKey: queryKeys.messages.thread(id),
    queryFn: () => messagesApi.getThread(id),
    enabled: !!id,
    refetchInterval: 10_000,
  });
}

export function useCreateMessageThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMessageThreadDto) => messagesApi.createThread(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.messages.all }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, dto }: { threadId: string; dto: SendMessageDto }) =>
      messagesApi.sendMessage(threadId, dto),
    onSuccess: (_, { threadId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.messages.thread(threadId) });
      qc.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}

export function useBriefQaThread(projectId: string) {
  return useQuery({
    queryKey: queryKeys.messages.briefQa(projectId),
    queryFn: () => messagesApi.getBriefQaThread(projectId),
    enabled: !!projectId,
    refetchInterval: 15_000,
  });
}

export function useSendBriefQaMessage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, dto }: { threadId: string; dto: SendMessageDto }) =>
      messagesApi.sendMessage(threadId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages.briefQa(projectId) });
    },
  });
}
