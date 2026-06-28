export enum FileType {
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  TECHNICAL_SHEET = 'TECHNICAL_SHEET',
  REFERENCE = 'REFERENCE',
}

export interface FileRecord {
  id: string;
  projectId: string;
  uploadedById: string;
  url: string;
  type: FileType;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileDto {
  projectId: string;
  type: FileType;
  filename: string;
  contentType: string;
}

export type StorageUploadMethod = 'PUT' | 'POST';

export interface StorageUploadTarget {
  uploadUrl: string;
  key: string;
  uploadMethod: StorageUploadMethod;
  uploadFields?: Record<string, string>;
}

export interface PresignedUploadResponse extends StorageUploadTarget {
  fileId: string;
}
