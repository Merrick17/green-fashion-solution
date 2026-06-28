import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import type { StorageUploadTarget } from '@repo/types';
import { isDataUrl, isStorageKey } from '../common/utils/content-hash';

@Injectable()
export class StorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (this.isConfigured()) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    );
  }

  provider(): 'cloudinary' | 'local' {
    return this.isConfigured() ? 'cloudinary' : 'local';
  }

  generateUploadKey(projectId: string, filename: string): string {
    const id = crypto.randomUUID();
    const safe = this.sanitizeFilename(filename);
    return this.toPublicId(`projects/${projectId}/${id}/${safe}`);
  }

  generateMoodboardKey(moodboardId: string, filename: string): string {
    const id = crypto.randomUUID();
    const safe = this.sanitizeFilename(filename);
    return this.toPublicId(`moodboards/${moodboardId}/${id}/${safe}`);
  }

  generateAssetKey(designerId: string, filename: string): string {
    const id = crypto.randomUUID();
    const safe = this.sanitizeFilename(filename);
    return this.toPublicId(`assets/${designerId}/${id}/${safe}`);
  }

  getUploadTarget(key: string, contentType: string): StorageUploadTarget {
    if (!this.isConfigured()) {
      return {
        uploadUrl: `http://localhost:3000/api/files/dev-upload?key=${encodeURIComponent(key)}`,
        key,
        uploadMethod: 'PUT',
      };
    }

    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      public_id: key,
      resource_type: 'image',
    };
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      key,
      uploadMethod: 'POST',
      uploadFields: {
        api_key: process.env.CLOUDINARY_API_KEY!,
        timestamp: String(timestamp),
        signature,
        public_id: key,
        resource_type: 'image',
      },
    };
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType = 'image/png',
  ): Promise<{ key: string; url: string }> {
    if (!buffer?.length) {
      throw new Error('Cannot upload empty file buffer');
    }

    if (!this.isConfigured()) {
      await this.writeLocalFile(key, buffer);
      return { key, url: `/uploads/${key}` };
    }

    const mime = contentType.split(';')[0]?.trim() || 'image/png';
    const result = await cloudinary.uploader.upload(
      `data:${mime};base64,${buffer.toString('base64')}`,
      {
        public_id: key,
        resource_type: 'image',
        overwrite: true,
      },
    );

    return { key, url: result.secure_url };
  }

  async writeDevUpload(key: string, buffer: Buffer): Promise<void> {
    await this.writeLocalFile(key, buffer);
  }

  async getSignedGetUrl(key: string): Promise<string> {
    if (!key) return key;
    if (key.startsWith('http')) return key;

    if (!this.isConfigured()) {
      return `/uploads/${key}`;
    }

    return cloudinary.url(key, {
      secure: true,
      resource_type: 'image',
    });
  }

  async resolveUrl(value: string): Promise<string> {
    if (!value || isDataUrl(value) || value.startsWith('http')) return value;
    if (isStorageKey(value)) return this.getSignedGetUrl(value);
    return value;
  }

  buildPublicKeyUrl(key: string): string {
    if (this.isConfigured()) {
      return cloudinary.url(key, { secure: true, resource_type: 'image' });
    }
    return `/uploads/${key}`;
  }

  rejectDataUrl(value: string, field: string): void {
    if (isDataUrl(value)) {
      throw new Error(`${field} must be a storage key or URL, not inline base64`);
    }
  }

  private toPublicId(key: string): string {
    return key.replace(/\.[^/.]+$/, '');
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private async writeLocalFile(key: string, buffer: Buffer): Promise<void> {
    const filePath = path.join(this.uploadsDir, key);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);
  }
}
