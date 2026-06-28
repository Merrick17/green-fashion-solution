"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useAuthStore } from "@/lib/auth-store";
import {
  getMessageToolParts,
  getToolPartName,
  isChatLoading,
  isToolPartComplete,
} from "@/lib/ai/chat-ui";

const STORAGE_KEY = "sourcing-ai-session";

export interface SourcingAgentAction {
  toolName: string;
  payload: unknown;
}

export interface UseSourcingAiOptions {
  onAction?: (action: SourcingAgentAction) => void;
}

function loadStoredMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useSourcingAi({ onAction }: UseSourcingAiOptions = {}) {
  const token = useAuthStore((s) => s.getAccessToken());
  const handledKeys = useRef<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const storedMessages = useMemo(() => (hydrated ? loadStoredMessages() : []), [hydrated]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/v1/sourcing",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
    [token],
  );

  const chat = useChat({
    id: "sourcing-ai",
    messages: storedMessages,
    transport,
  });

  const isLoading = isChatLoading(chat.status);

  useEffect(() => {
    if (!hydrated || isLoading) return;
    if (chat.messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chat.messages));
    }
  }, [chat.messages, isLoading, hydrated]);

  useEffect(() => {
    if (!onAction) return;
    for (const msg of chat.messages as UIMessage[]) {
      for (const tool of getMessageToolParts(msg)) {
        if (!isToolPartComplete(tool.state) || !("output" in tool)) continue;
        const name = getToolPartName(tool);
        const key = `${name}:${JSON.stringify(tool.output)}`;
        if (handledKeys.current.has(key)) continue;
        handledKeys.current.add(key);
        onAction({ toolName: name, payload: tool.output });
      }
    }
  }, [chat.messages, onAction]);

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
    localStorage.removeItem(STORAGE_KEY);
    chat.setMessages([]);
  }, [chat]);

  return {
    ...chat,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    clearSession,
  };
}
