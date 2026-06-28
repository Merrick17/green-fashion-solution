'use client';
import { useCallback, useState } from 'react';
import { useCreateMoodItem } from '@/hooks/use-mood-items';
import { useMoodboardParse } from '@/hooks/use-moodboard-parse';
import {
  uploadMoodboardFile,
  resolveStorageKey,
} from '@/lib/storage/upload-file';
import { MoodItemType } from '@repo/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UploadDropzone } from './upload-dropzone';
import { UploadParseAction } from './upload-parse-action';

interface UploadOverlayProps {
  moodboardId: string;
  projectId?: string;
  onClose: () => void;
}

export function UploadOverlay({
  moodboardId,
  projectId,
  onClose,
}: UploadOverlayProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const createItem = useCreateMoodItem(moodboardId);
  const parseMoodboard = useMoodboardParse(moodboardId);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      try {
        const keys: string[] = [];
        let col = 0;
        for (const file of Array.from(files)) {
          const key = await uploadMoodboardFile(moodboardId, file);
          keys.push(key);
          await createItem.mutateAsync({
            moodboardId,
            type: MoodItemType.IMAGE,
            x: 40 + col * 280,
            y: 40,
            width: 250,
            height: 250,
            content: { key, alt: file.name },
          });
          col += 1;
        }
        setUploadedKeys((prev) => [...prev, ...keys]);
        toast.success(`${keys.length} image(s) uploaded`);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [createItem, moodboardId],
  );

  const handleParse = useCallback(async () => {
    if (uploadedKeys.length === 0) return;
    try {
      const imageUrls = await Promise.all(
        uploadedKeys.map((key) => resolveStorageKey(key)),
      );
      const imageParts = imageUrls.map((url) => ({
        type: 'file' as const,
        mediaType: 'image/jpeg',
        url,
      }));

      await parseMoodboard.mutateAsync({
        projectId,
        messages: [
          {
            id: `parse-${Date.now()}`,
            role: 'user',
            parts: [
              {
                type: 'text',
                text: 'Analyze this mood board and extract all visual elements as individual canvas items.',
              },
              ...imageParts,
            ],
          },
        ],
      });

      toast.success('Mood board parsed');
      onClose();
    } catch (error) {
      console.error('Parse failed:', error);
      toast.error(error instanceof Error ? error.message : 'Parse failed');
    }
  }, [uploadedKeys, projectId, parseMoodboard, onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload inspiration</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <UploadDropzone
            uploading={uploading}
            uploadedCount={uploadedKeys.length}
            onFilesSelected={handleFiles}
          />
          <UploadParseAction
            parsing={parseMoodboard.isPending}
            disabled={parseMoodboard.isPending || uploadedKeys.length === 0}
            onParse={handleParse}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
