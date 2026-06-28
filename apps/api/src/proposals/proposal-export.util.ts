import axios from 'axios';
import type { StorageService } from '../files/storage.service';
import { DEFAULT_API_BASE_URL } from '../config/defaults';
import { imageDataUri } from '@repo/utils';

export async function fetchProposalImage(
  storage: StorageService,
  imageUrl: string,
): Promise<Buffer | null> {
  try {
    let url = await storage.resolveUrl(imageUrl);
    if (url.startsWith('/')) {
      const base = process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
      url = `${base}${url}`;
    }
    const res = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

export function toImageDataUri(buffer: Buffer, imageUrl: string): string {
  return imageDataUri(buffer, imageUrl);
}
