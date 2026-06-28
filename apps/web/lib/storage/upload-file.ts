import { filesApi } from "@/lib/api/files.api";
import { performStorageUpload, type UploadProgressHandler } from "@/lib/storage/perform-upload";
import { toAbsoluteStorageUrl } from "@/lib/storage/storage-url";
import type { FileType } from "@repo/types";

export async function uploadMoodboardFile(moodboardId: string, file: File): Promise<string> {
  const target = await filesApi.requestMoodboardUpload({
    moodboardId,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
  });
  await performStorageUpload(target, file, file.type || "application/octet-stream", file.name);
  return target.key;
}

export async function uploadProjectFile(
  projectId: string,
  file: File,
  type: FileType,
): Promise<string> {
  const target = await filesApi.requestUpload({
    projectId,
    filename: file.name,
    type,
    contentType: file.type || "application/octet-stream",
  });
  await performStorageUpload(target, file, file.type || "application/octet-stream", file.name);
  return target.key;
}

export async function uploadAssetFile(file: File, onProgress?: UploadProgressHandler): Promise<string> {
  const target = await filesApi.requestAssetUpload({
    filename: file.name,
    contentType: file.type || "application/octet-stream",
  });
  await performStorageUpload(target, file, file.type || "application/octet-stream", file.name, onProgress);
  return target.key;
}

export async function resolveStorageKey(key: string): Promise<string> {
  const { url } = await filesApi.resolveKey(key);
  return toAbsoluteStorageUrl(url);
}
