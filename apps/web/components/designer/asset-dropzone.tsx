'use client';
import { useCallback, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
];

interface AssetDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

/** Strips the extension and replaces separators with spaces for a default asset name. */
export function fileBaseName(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

export function AssetDropzone({ onFiles, disabled }: AssetDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const validate = useCallback((files: File[]): File[] => {
    const valid: File[] = [];
    for (const f of files) {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`${f.name}: unsupported type (use PNG/JPEG/WebP)`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name}: exceeds 10MB`);
        continue;
      }
      valid.push(f);
    }
    return valid;
  }, []);

  const handle = (list: FileList | null) => {
    if (!list?.length) return;
    const valid = validate(Array.from(list));
    if (valid.length) onFiles(valid);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload images — drop files here or press Enter to browse"
      aria-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        handle(e.dataTransfer.files);
      }}
      onClick={openPicker}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        dragging
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-accent/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        disabled={disabled}
        className="hidden"
        aria-hidden
        onChange={(e) => handle(e.target.files)}
      />
      <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Drop images here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPEG, WebP, AVIF or GIF · up to 10MB each · multiple files
          supported
        </p>
      </div>
    </div>
  );
}
