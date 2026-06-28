"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useProposalAiSession, useUpsertProposalAiSession } from "@/hooks/use-proposal-ai-session";
import {
  getMessageToolParts,
  getToolPartName,
  isChatLoading,
  isToolPartComplete,
} from "@/lib/ai/chat-ui";
import type { ProposalDraft } from "@repo/types";
import type { ProposalSlide } from "@repo/utils";

export interface ProposalAgentAction {
  type: "draft" | "preview" | "export" | "task" | "saved";
  toolName: string;
  payload: unknown;
}

export interface UseProposalAiOptions {
  projectId: string;
  proposalId?: string;
  revisionMode?: boolean;
  onDraft?: (draft: ProposalDraft) => void;
  onSaved?: (payload: { id?: string }) => void;
  onAction?: (action: ProposalAgentAction) => void;
}

function extractFromMessages<T>(
  messages: UIMessage[],
  toolName: string,
): T | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (!msg) continue;
    for (const tool of getMessageToolParts(msg)) {
      if (
        getToolPartName(tool) === toolName &&
        isToolPartComplete(tool.state) &&
        "output" in tool
      ) {
        return tool.output as T;
      }
    }
  }
  return null;
}

export function useProposalAi({
  projectId,
  proposalId,
  revisionMode,
  onDraft,
  onSaved,
  onAction,
}: UseProposalAiOptions) {
  const token = useAuthStore((s) => s.getAccessToken());
  const { data: session, isSuccess: sessionLoaded } = useProposalAiSession(projectId);
  const upsertSession = useUpsertProposalAiSession(projectId);
  const handledKeys = useRef<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [previewSlides, setPreviewSlides] = useState<
    Array<Pick<ProposalSlide, "type" | "title" | "subtitle">>
  >([]);
  const [lastExport, setLastExport] = useState<{
    proposalId: string;
    format: "pdf" | "pptx";
    filename: string;
  } | null>(null);

  const initialMessages = useMemo(() => {
    if (!sessionLoaded || !session?.messages) return undefined;
    return session.messages as UIMessage[];
  }, [sessionLoaded, session?.messages]);

  const chatId = sessionLoaded
    ? `proposal-ai-${projectId}-loaded`
    : `proposal-ai-${projectId}-pending`;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/v1/proposal",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: () => ({ projectId, proposalId, revisionMode }),
      }),
    [token, projectId, proposalId, revisionMode],
  );

  const chat = useChat({
    id: chatId,
    messages: sessionLoaded ? (initialMessages ?? []) : [],
    transport,
  });

  const isLoading = isChatLoading(chat.status);

  const dispatchAction = useCallback(
    (type: ProposalAgentAction["type"], toolName: string, payload: unknown) => {
      const key = `${toolName}:${JSON.stringify(payload)}`;
      if (handledKeys.current.has(key)) return;
      handledKeys.current.add(key);
      onAction?.({ type, toolName, payload });
    },
    [onAction],
  );

  useEffect(() => {
    const draft =
      extractFromMessages<ProposalDraft>(chat.messages, "buildProposalSections") ??
      extractFromMessages<ProposalDraft>(chat.messages, "buildProposalDraft");
    if (draft && onDraft) {
      const key = `draft:${JSON.stringify(draft)}`;
      if (!handledKeys.current.has(key)) {
        handledKeys.current.add(key);
        onDraft(draft);
      }
    }

    const preview = extractFromMessages<{
      slideCount?: number;
      slides?: Array<Pick<ProposalSlide, "type" | "title" | "subtitle">>;
    }>(chat.messages, "previewProposalDeck");
    if (preview?.slides) setPreviewSlides(preview.slides);
    if (preview) dispatchAction("preview", "previewProposalDeck", preview);

    const exported = extractFromMessages<{
      ok?: boolean;
      proposalId?: string;
      format?: "pdf" | "pptx";
      filename?: string;
    }>(chat.messages, "exportProposalDocument");
    if (exported?.ok && exported.proposalId && exported.format) {
      setLastExport({
        proposalId: exported.proposalId,
        format: exported.format,
        filename: exported.filename ?? `proposal.${exported.format}`,
      });
    }
    if (exported) dispatchAction("export", "exportProposalDocument", exported);

    const saved = extractFromMessages<{ id?: string; saved?: boolean }>(
      chat.messages,
      "saveProposalDraft",
    );
    if (saved?.saved && saved.id) {
      onSaved?.({ id: saved.id });
      dispatchAction("saved", "saveProposalDraft", saved);
    }

    const task = extractFromMessages(chat.messages, "assignSourcingTask");
    if (task) dispatchAction("task", "assignSourcingTask", task);
  }, [chat.messages, onDraft, onSaved, dispatchAction]);

  const wasLoading = useRef(false);
  useEffect(() => {
    if (wasLoading.current && !isLoading && chat.messages.length > 0) {
      upsertSession.mutate({ messages: chat.messages as unknown[] });
    }
    wasLoading.current = isLoading;
  }, [isLoading, chat.messages, upsertSession]);

  const generateDraft = useCallback(
    (prompt?: string) => {
      const text =
        prompt ??
        "Generate a sectioned proposal draft from this project's moodboards and designer assets. Rank assets first, then call buildProposalSections.";
      void chat.sendMessage({ text });
    },
    [chat],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      if (!input.trim() || isLoading) return;
      void chat.sendMessage({ text: input.trim() });
      setInput("");
    },
    [chat, input, isLoading],
  );

  const clearSession = useCallback(() => {
    chat.setMessages([]);
  }, [chat]);

  return {
    ...chat,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    generateDraft,
    sessionLoaded,
    previewSlides,
    lastExport,
    clearLastExport: () => setLastExport(null),
    clearSession,
  };
}
