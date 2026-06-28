'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { useProposalAi } from '@/hooks/use-proposal-ai';
import { useDownloadProposalExport } from '@/hooks/use-download-proposal-pptx';
import { AiChatMessage } from '@/components/moodboard/ai-chat-message';
import { AiChatHeader } from '@/components/moodboard/ai-chat-header';
import { AiChatLoadingLine } from '@/components/moodboard/ai-chat-loading-line';
import { ProposalDeckPreviewStrip } from '@/components/ai-assistant/proposal-deck-preview-strip';
import { ProposalAgentEmptyState } from '@/components/ai-assistant/proposal-agent-empty-state';
import { ProposalAgentInputFooter } from '@/components/ai-assistant/proposal-agent-input-footer';
import { proposalAgentActionLabel } from '@/components/ai-assistant/proposal-agent-action-label';
import { getRunningToolName } from '@/lib/ai/chat-ui';
import type { ProposalDraft } from '@repo/types';

interface ProposalAgentPanelProps {
  projectId: string;
  proposalId?: string;
  revisionMode?: boolean;
  onDraft: (draft: ProposalDraft) => void;
  onSaved?: (payload: { id?: string }) => void;
  onClose: () => void;
}

export function ProposalAgentPanel({
  projectId,
  proposalId,
  revisionMode,
  onDraft,
  onSaved,
  onClose,
}: ProposalAgentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAction = useRef<string | null>(null);
  const downloadExport = useDownloadProposalExport();

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    generateDraft,
    previewSlides,
    lastExport,
    clearLastExport,
    clearSession,
  } = useProposalAi({
    projectId,
    proposalId,
    revisionMode,
    onDraft,
    onSaved,
    onAction: (action) => {
      const label = proposalAgentActionLabel(action);
      if (!label || lastAction.current === label) return;
      lastAction.current = label;
      toast.success(label);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, previewSlides]);

  const handleDownloadExport = async () => {
    if (!lastExport) return;
    try {
      await downloadExport(
        lastExport.proposalId,
        lastExport.format,
        lastExport.filename.replace(/\.[^.]+$/, ''),
      );
      toast.success(`Downloaded ${lastExport.format.toUpperCase()}`);
      clearLastExport();
    } catch {
      toast.error('Download failed');
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const statusLine = revisionMode
    ? 'Revision mode — addressing change requests'
    : 'Draft, assign, preview & export';

  return (
    <div className="flex h-full w-full flex-col bg-portal-surface">
      <AiChatHeader
        statusLine={statusLine}
        onClose={onClose}
        onClear={clearSession}
        hasMessages={messages.length > 0}
      />

      {previewSlides.length > 0 && (
        <div className="shrink-0 border-b border-portal-border px-3 py-2.5">
          <ProposalDeckPreviewStrip slides={previewSlides} />
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <ProposalAgentEmptyState
            isLoading={isLoading}
            revisionMode={revisionMode}
            onGenerateDraft={generateDraft}
          />
        )}
        {messages.map((msg, index) => (
          <AiChatMessage
            key={msg.id}
            message={msg}
            isStreaming={
              isLoading && index === messages.length - 1 && msg.role === 'assistant'
            }
          />
        ))}
        {isLoading &&
          (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
            <AiChatLoadingLine
              uploading={false}
              runningToolName={getRunningToolName(messages)}
            />
          )}
      </div>

      <ProposalAgentInputFooter
        input={input}
        isLoading={isLoading}
        lastExport={lastExport}
        onInputChange={handleInputChange}
        onKeyDown={onKeyDown}
        onSubmit={handleSubmit}
        onRefined={setInput}
        onDownloadExport={() => void handleDownloadExport()}
      />
    </div>
  );
}
