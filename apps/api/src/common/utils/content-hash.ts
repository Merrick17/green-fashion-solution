import { createHash } from 'crypto';

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function isDataUrl(value: string): boolean {
  return value.startsWith('data:');
}

export function isStorageKey(value: string): boolean {
  return (
    !value.startsWith('http://') &&
    !value.startsWith('https://') &&
    !value.startsWith('data:') &&
    !value.startsWith('/')
  );
}
