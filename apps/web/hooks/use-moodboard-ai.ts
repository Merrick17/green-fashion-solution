"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { useCanvasStore } from "@/lib/canvas/canvas-store";
import { queryKeys } from "@/lib/query-keys";
import { buildCanvasContextPayload } from "@/lib/ai/context/moodboard-context";
import {
  getMessageToolParts,
  getToolPartName,
  isChatLoading,
  isToolPartComplete,
} from "@/lib/ai/chat-ui";
import { useAiSession } from "@/hooks/use-ai-session";
import {
  createPendingAttachment,
  revokeAttachmentPreview,
  uploadAttachmentsAsFileParts,
  type PendingAttachment,
} from "@/lib/storage/chat-attachments";
import type { CanvasViewport, MoodItem, Moodboard } from "@repo/types";

const INTAKE_TOOL_TOASTS: Record<string, (out: unknown) => string | null> = {
  updateProjectBrief: () => "Brief updated",
  submitProjectForReview: () => "Project submitted for review",
  selectInspirationAsset: () => "Inspiration saved to project",
  registerUploadedFile: () => "File registered to project",
  requestMeeting: () => "Meeting request sent",
};

export interface UseMoodboardAiOptions {
  moodboard?: Pick<Moodboard, "styleDirection" | "colorPalette" | "fabricSuggestions" | "mood">;
  projectId?: string;
  viewport?: CanvasViewport;
  selectedItemIds?: string[];
}

export function useMoodboardAi(
  moodboardId: string,
  items: MoodItem[],
  options: UseMoodboardAiOptions = {},
) {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.getAccessToken());
  const bumpAiTurn = useCanvasStore((s) => s.bumpAiTurn);
  const { data: session, isSuccess: sessionLoaded } = useAiSession(moodboardId);
  const toolResultsRef = useRef(0);
  const intakeHandled = useRef<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const canvasContext = useMemo(
    () =>
      buildCanvasContextPayload({
        items,
        viewport: options.viewport,
        moodboard: options.moodboard,
        selectedItemIds: options.selectedItemIds,
        projectId: options.projectId,
      }),
    [items, options.viewport, options.moodboard, options.selectedItemIds, options.projectId],
  );

  // Keep a ref so the transport body closure always reads the latest value
  // without recreating the transport (useChat only recreates Chat when `id` changes)
  const canvasContextRef = useRef(canvasContext);
  canvasContextRef.current = canvasContext;

  const invalidateCanvas = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.moodboards.full(moodboardId) });
    qc.invalidateQueries({ queryKey: queryKeys.moodItems.byMoodboard(moodboardId) });
    if (options.projectId) {
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(options.projectId) });
    }
  }, [qc, moodboardId, options.projectId]);

  const initialMessages = useMemo(() => {
    if (!sessionLoaded || !session?.messages) return undefined;
    return session.messages as UIMessage[];
  }, [sessionLoaded, session?.messages]);

  const chatId = sessionLoaded
    ? `moodboard-ai-${moodboardId}-loaded`
    : `moodboard-ai-${moodboardId}-pending`;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/v1/chat",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: () => ({
          moodboardId,
          projectId: options.projectId,
          canvasContext: canvasContextRef.current,
        }),
      }),
    // canvasContext intentionally excluded — read via ref so the closure is always fresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, moodboardId, options.projectId],
  );

  const chat = useChat({
    id: chatId,
    messages: sessionLoaded ? (initialMessages ?? []) : [],
    transport,
    onError: (error) => {
      console.error("[moodboard-ai]", error);
      toast.error(error.message || "AI request failed");
    },
    onFinish: () => {
      invalidateCanvas();
      void qc.refetchQueries({
        queryKey: queryKeys.moodboards.full(moodboardId),
      });
      bumpAiTurn();
    },
  });

  const isLoading = isChatLoading(chat.status) || uploading;

  useEffect(() => {
    const completedTools = chat.messages.reduce((count, msg) => {
      const tools = getMessageToolParts(msg);
      return count + tools.filter((t) => isToolPartComplete(t.state)).length;
    }, 0);

    if (completedTools > toolResultsRef.current) {
      toolResultsRef.current = completedTools;
      invalidateCanvas();
    }
  }, [chat.messages, invalidateCanvas]);

  useEffect(() => {
    if (!options.projectId) return;
    for (const msg of chat.messages as UIMessage[]) {
      for (const tool of getMessageToolParts(msg)) {
        if (!isToolPartComplete(tool.state) || !("output" in tool)) continue;
        const name = getToolPartName(tool);
        const formatter = INTAKE_TOOL_TOASTS[name];
        if (!formatter) continue;
        const key = `${name}:${JSON.stringify(tool.output)}`;
        if (intakeHandled.current.has(key)) continue;
        intakeHandled.current.add(key);
        const label = formatter(tool.output);
        if (label) toast.success(label);
      }
    }
  }, [chat.messages, options.projectId]);

  const clearAttachments = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach(revokeAttachmentPreview);
      return [];
    });
  }, []);

  const sendWithContent = useCallback(
    async (text: string, pendingAttachments: PendingAttachment[]) => {
      const trimmed = text.trim();
      if (!trimmed && pendingAttachments.length === 0) return;

      const hasAttachments = pendingAttachments.length > 0;
      if (hasAttachments) setUploading(true);
      try {
        const files = hasAttachments
          ? await uploadAttachmentsAsFileParts(moodboardId, pendingAttachments)
          : undefined;

        const fallbackText =
          pendingAttachments.length > 0
            ? "Analyze these reference images and update the moodboard accordingly."
            : "";

        await chat.sendMessage({
          text: trimmed || fallbackText,
          files,
        });

        pendingAttachments.forEach(revokeAttachmentPreview);
        setAttachments([]);
        setInput("");
      } finally {
        if (hasAttachments) setUploading(false);
      }
    },
    [chat, moodboardId],
  );

  const sendPrompt = useCallback(
    (text: string) => {
      void sendWithContent(text, []);
    },
    [sendWithContent],
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
      if (isLoading) return;
      void sendWithContent(input, attachments);
    },
    [attachments, input, isLoading, sendWithContent],
  );

  const addAttachments = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setAttachments((prev) => [...prev, ...imageFiles.map(createPendingAttachment)]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) revokeAttachmentPreview(target);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clearSession = useCallback(() => {
    chat.setMessages([]);
  }, [chat]);

  return {
    ...chat,
    input,
    setInput,
    attachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    handleInputChange,
    handleSubmit,
    isLoading,
    uploading,
    sendPrompt,
    canvasContext,
    invalidateCanvas,
    sessionLoaded,
    clearSession,
  };
}

export type MoodboardAiMessage = UIMessage;
