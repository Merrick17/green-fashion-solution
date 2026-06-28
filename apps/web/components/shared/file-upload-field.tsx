'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
interface FileUploadFieldProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  previewUrl?: string | null;
  disabled?: boolean;
}
export function FileUploadField({
  label,
  accept = 'image/*',
  onFileSelect,
  previewUrl,
  disabled,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const displayUrl = previewUrl ?? localPreview;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setLocalPreview(URL.createObjectURL(file));
            onFileSelect(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" /> Choose file
        </Button>
        {displayUrl && (
          <div className="relative h-12 w-12 overflow-hidden rounded border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              className="absolute right-0 top-0 bg-background/80 p-0.5"
              onClick={() => {
                setLocalPreview(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
