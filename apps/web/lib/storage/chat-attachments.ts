"use client";

import type { FileUIPart } from "ai";
import { uploadMoodboardFile, resolveStorageKey } from "@/lib/storage/upload-file";

export interface PendingAttachment {
  id: string;
  file: File;
  previewUrl: string;
}

export function createPendingAttachment(file: File): PendingAttachment {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function revokeAttachmentPreview(attachment: PendingAttachment): void {
  URL.revokeObjectURL(attachment.previewUrl);
}

export async function uploadAttachmentsAsFileParts(
  moodboardId: string,
  attachments: PendingAttachment[],
): Promise<FileUIPart[]> {
  const parts: FileUIPart[] = [];
  for (const attachment of attachments) {
    const key = await uploadMoodboardFile(moodboardId, attachment.file);
    const url = await resolveStorageKey(key);
    parts.push({
      type: "file",
      mediaType: attachment.file.type || "image/jpeg",
      url,
      filename: attachment.file.name,
    });
  }
  return parts;
}
