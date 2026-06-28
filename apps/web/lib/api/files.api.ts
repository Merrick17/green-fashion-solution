import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type { FileRecord, PresignedUploadResponse, StorageUploadTarget, PaginatedResponse, PaginationParams } from "@repo/types";

export const filesApi = {
  requestUpload: (dto: {
    projectId: string;
    filename: string;
    type: string;
    contentType: string;
  }) =>
    apiClient.post<PresignedUploadResponse>("/files/upload-url", dto).then((r) => r.data),

  requestMoodboardUpload: (dto: {
    moodboardId: string;
    filename: string;
    contentType: string;
  }) =>
    apiClient
      .post<StorageUploadTarget>("/files/upload-url/moodboard", dto)
      .then((r) => r.data),

  requestAssetUpload: (dto: { filename: string; contentType: string }) =>
    apiClient
      .post<StorageUploadTarget>("/files/upload-url/asset", dto)
      .then((r) => r.data),

  resolveKey: (key: string) =>
    apiClient.get<{ url: string }>("/files/resolve", { params: { key } }).then((r) => r.data),

  getByProject: (projectId: string, params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<FileRecord>>(`/files/project/${projectId}`, {
        params: toPaginationQuery(params),
      })
      .then((r) => r.data),
};
