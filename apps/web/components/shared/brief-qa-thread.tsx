'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useBriefQaThread, useSendBriefQaMessage } from '@/hooks/use-messages';
import { cn } from '@/lib/utils';
import type { Message } from '@repo/types';
import { UserRole } from '@repo/types';
import { formatDateTime } from '@repo/utils';

interface BriefQaThreadProps {
  projectId: string;
  className?: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isAdmin = message.senderRole === UserRole.ADMIN;
  return (
    <div className={cn('flex flex-col gap-1', isAdmin ? 'items-start' : 'items-end')}>
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 text-sm leading-relaxed',
          isAdmin
            ? 'bg-portal-surface border border-portal-border text-portal-foreground'
            : 'bg-[--portal-accent] text-white',
        )}
      >
        {message.body}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {isAdmin ? 'Sourcing team' : 'You'} &middot;{' '}
        {formatDateTime(message.createdAt)}
      </span>
    </div>
  );
}

export function BriefQaThread({ projectId, className }: BriefQaThreadProps) {
  const { data: thread, isLoading } = useBriefQaThread(projectId);
  const sendMessage = useSendBriefQaMessage(projectId);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = body.trim();
    if (!trimmed || !thread) return;
    sendMessage.mutate({ threadId: thread.id, dto: { body: trimmed } });
    setBody('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="min-h-[160px] max-h-[320px] overflow-y-auto space-y-4 px-4 py-4 [scrollbar-width:thin]">
        {isLoading && (
          <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
        )}
        {!isLoading && messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No messages yet. Ask your sourcing team a question about your brief.
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-portal-border px-4 py-3 flex gap-2 items-end">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your brief…"
          rows={2}
          className="flex-1 resize-none text-sm"
        />
        <Button
          type="button"
          variant="brand"
          size="sm"
          onClick={handleSend}
          disabled={!body.trim() || sendMessage.isPending || !thread}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
