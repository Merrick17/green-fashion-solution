'use client';
import { useState } from 'react';
import { formatDateTime } from '@repo/utils';
import { UserRole } from '@repo/types';
import type { Message } from '@repo/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSendMessage } from '@/hooks/use-messages';
import { MessageSquare } from 'lucide-react';

interface MessageThreadViewProps {
  threadId: string;
  messages: Message[];
  viewerRole: UserRole;
}

export function MessageThreadView({
  threadId,
  messages,
  viewerRole,
}: MessageThreadViewProps) {
  const [body, setBody] = useState('');
  const send = useSendMessage();
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    send.mutate(
      { threadId, dto: { body: body.trim() } },
      { onSuccess: () => setBody('') },
    );
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col pb-20 md:pb-0">
      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-1"
        role="log"
        aria-live="polite"
        aria-label="Message thread"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
            <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Send the first message to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine =
              (viewerRole === UserRole.ADMIN &&
                m.senderRole === UserRole.ADMIN) ||
              (viewerRole === UserRole.CUSTOMER &&
                m.senderRole === UserRole.CUSTOMER);
            return (
              <div
                key={m.id}
                className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] px-3 py-2 text-sm',
                    isMine
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card',
                  )}
                >
                  <p>{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={handleSend} className="mt-3 flex shrink-0 gap-2 border-t pt-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message…"
          rows={2}
          className="resize-none"
          aria-label="Message"
        />
        <Button type="submit" disabled={!body.trim() || send.isPending}>
          Send
        </Button>
      </form>
    </div>
  );
}
