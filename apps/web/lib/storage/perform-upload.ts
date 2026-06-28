import axios from "axios";
import type { StorageUploadTarget } from "@repo/types";

export type UploadProgressHandler = (loaded: number, total: number) => void;

/**
 * Uploads a file to the presigned target via axios (supports upload progress).
 */
export async function performStorageUpload(
  target: StorageUploadTarget,
  body: Blob | File | Buffer,
  contentType: string,
  filename?: string,
  onProgress?: UploadProgressHandler,
): Promise<void> {
  const isPostForm = target.uploadMethod === "POST" && target.uploadFields;

  let payload: Blob | File | Buffer | FormData;
  let method: "POST" | "PUT";
  let headers: Record<string, string> | undefined;

  if (isPostForm) {
    method = "POST";
    const form = new FormData();
    for (const [key, value] of Object.entries(target.uploadFields!)) {
      form.append(key, value);
    }
    const fileBlob =
      body instanceof Blob ? body : new Blob([body], { type: contentType });
    form.append("file", fileBlob, filename ?? "upload");
    payload = form;
  } else {
    method = "PUT";
    payload = body;
    headers = { "Content-Type": contentType };
  }

  try {
    await axios.request({
      url: target.uploadUrl,
      method,
      data: payload,
      headers,
      onUploadProgress: onProgress
        ? (event) => {
            if (event.total) onProgress(event.loaded, event.total);
          }
        : undefined,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? "network error";
      const detail =
        typeof error.response?.data === "string" ? error.response.data : "";
      throw new Error(
        `Upload failed (${status})${detail ? `: ${detail}` : ""}`,
      );
    }
    throw error;
  }
}
