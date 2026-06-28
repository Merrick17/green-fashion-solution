'use client';
import { type ReactNode } from 'react';
import { BrainCircuit, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getMessageFileParts,
  getMessageReasoningParts,
  getMessageText,
  getMessageToolParts,
  getRunningToolName,
  humanizeToolName,
} from '@/lib/ai/chat-ui';
import { AiChatToolActivity } from './ai-chat-tool-activity';
import type { UIMessage } from 'ai';

function renderAgentMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n');
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={key} className="my-1.5 space-y-0.5 pl-3">
        {listItems.map((item, i) => (
          <li key={i} className="list-disc text-[12px] leading-relaxed">
            {inlineFormat(item)}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  const inlineFormat = (raw: string): ReactNode => {
    const parts = raw.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={i} className="text-portal-muted">{part.slice(1, -1)}</em>;
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const key = `line-${idx}`;
    if (line.match(/^#{1,2}\s/)) {
      flushList(`flush-${idx}`);
      const content = line.replace(/^#{1,2}\s/, '');
      nodes.push(
        <p key={key} className="mb-1 text-[12px] font-semibold tracking-tight text-foreground">
          {content}
        </p>,
      );
      return;
    }
    if (line.match(/^[-*]\s/)) {
      listItems.push(line.replace(/^[-*]\s/, ''));
      return;
    }
    flushList(`flush-${idx}`);
    if (line.match(/^---+$/)) {
      nodes.push(<hr key={key} className="my-2.5 border-portal-border" />);
      return;
    }
    if (line.trim() === '') {
      nodes.push(<div key={key} className="h-1.5" />);
      return;
    }
    nodes.push(
      <p key={key} className="text-[12px] leading-relaxed">
        {inlineFormat(line)}
      </p>,
    );
  });

  flushList('flush-end');
  return nodes;
}

export function AiChatMessage({
  message,
  isStreaming = false,
}: {
  message: UIMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);
  const tools = getMessageToolParts(message);
  const images = getMessageFileParts(message);
  const reasoning = !isUser ? getMessageReasoningParts(message) : [];
  const reasoningText = reasoning.map((r) => r.text).join('').trim();
  const runningToolName = isStreaming ? getRunningToolName([message]) : null;

  if (!text && tools.length === 0 && images.length === 0 && !reasoningText && !isStreaming) {
    return null;
  }

  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'mt-5 flex h-6 w-6 shrink-0 items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-portal-border bg-portal-surface-muted text-portal-accent',
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      </div>

      {/* Bubble column */}
      <div className={cn('flex min-w-0 max-w-[88%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-portal-muted">
          {isUser ? 'You' : 'Assistant'}
        </span>

        {/* Reasoning block */}
        {reasoningText && (
          <details className="w-full">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 border-l-2 border-portal-border pl-2 text-[10px] font-medium uppercase tracking-wide text-portal-muted transition-colors hover:border-portal-accent hover:text-foreground [&::-webkit-details-marker]:hidden">
              <BrainCircuit className="h-2.5 w-2.5 shrink-0" />
              Reasoning
            </summary>
            <p className="mt-1.5 max-h-[120px] overflow-y-auto border-l-2 border-portal-border pl-2 text-[10px] italic leading-relaxed text-portal-muted">
              {reasoningText}
            </p>
          </details>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className={cn('flex flex-wrap gap-1.5', text ? 'mb-1' : '')}>
            {images.map((part, index) => (
              <div key={`${part.url}-${index}`} className="h-16 w-16 overflow-hidden border border-portal-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={part.url} alt={part.filename ?? 'Attachment'} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            'max-w-full',
            isUser
              ? 'bg-primary px-3 py-2 text-[12px] text-primary-foreground'
              : 'border border-portal-border bg-portal-surface-muted px-3 py-2.5 text-foreground',
          )}
        >
          {!isUser && tools.length > 0 && <AiChatToolActivity tools={tools} />}

          {text ? (
            isUser ? (
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed">{text}</p>
            ) : (
              <div className="space-y-0.5">
                {renderAgentMarkdown(text)}
                {isStreaming && (
                  <span
                    className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-portal-accent align-text-bottom"
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          ) : isStreaming ? (
            <p className="text-[11px] italic text-portal-muted">
              {runningToolName ? `${humanizeToolName(runningToolName)}…` : 'Thinking…'}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
