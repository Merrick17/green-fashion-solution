'use client';
import { useRef, type KeyboardEvent } from 'react';
import { ArrowUp, ImagePlus, Loader2, Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSpeechInput } from '@/hooks/use-speech-input';
import { PromptEnhancer } from '@/components/ai-assistant/prompt-enhancer';
import type { PendingAttachment } from '@/lib/storage/chat-attachments';

interface AiChatComposerProps {
  input: string;
  attachments: PendingAttachment[];
  isLoading: boolean;
  uploading: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event?: { preventDefault?: () => void }) => void;
  onAddAttachments: (files: FileList | File[]) => void;
  onRemoveAttachment: (id: string) => void;
  onTranscript: (text: string) => void;
  setInput?: (text: string) => void;
}

export function AiChatComposer({
  input,
  attachments,
  isLoading,
  uploading,
  onInputChange,
  onSubmit,
  onAddAttachments,
  onRemoveAttachment,
  onTranscript,
  setInput,
}: AiChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { listening, supported, toggle: toggleVoice } = useSpeechInput(onTranscript);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  const canSend = !isLoading && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="group relative h-14 w-14 overflow-hidden border border-portal-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.previewUrl}
                alt={attachment.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveAttachment(attachment.id)}
                className="absolute right-0 top-0 bg-background/90 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative border border-portal-border bg-portal-surface transition-colors focus-within:border-portal-border-strong">
        <Textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder={listening ? 'Listening…' : 'Describe your vision…'}
          rows={3}
          disabled={isLoading}
          className="min-h-[4rem] w-full resize-none border-0 bg-transparent pb-9 pl-3 pr-3 pt-3 text-[12px] leading-relaxed text-foreground placeholder:text-portal-muted shadow-none focus-visible:ring-0"
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-portal-border px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onAddAttachments(e.target.files);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-portal-muted hover:text-foreground"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload image"
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </Button>
            {supported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${listening ? 'text-destructive' : 'text-portal-muted hover:text-foreground'}`}
                disabled={isLoading}
                onClick={toggleVoice}
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
              >
                {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
            )}
            {setInput && (
              <PromptEnhancer
                input={input}
                onRefined={setInput}
                context="moodboard"
                disabled={isLoading}
              />
            )}
          </div>

          <Button
            type="button"
            size="icon"
            className="h-6 w-6"
            disabled={!canSend}
            onClick={() => onSubmit()}
            aria-label="Send message"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      <p className="text-center text-[9px] uppercase tracking-[0.14em] text-portal-muted">
        ↵ Send · Shift+↵ New line
      </p>
    </div>
  );
}
