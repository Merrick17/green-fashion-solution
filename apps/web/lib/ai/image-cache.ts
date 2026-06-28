import { createHash } from "crypto";

/**
 * Opt-in in-memory cache for generated fashion images, keyed by prompt hash.
 *
 * OFF by default: when `AI_IMAGE_CACHE !== "true"`, every accessor is a no-op
 * and `generateFashionImage` behaves byte-for-byte as before (including the
 * placehold.co fallback). When enabled, successful generations are cached so a
 * repeat prompt reuses the prior result instead of regenerating. Failures are
 * never cached. Bounded by max entries + TTL (LRU-ish via Map insertion order).
 */
const enabled = (): boolean => process.env.AI_IMAGE_CACHE === "true";

const MAX_ENTRIES = Number(process.env.AI_IMAGE_CACHE_MAX ?? 100);
const TTL_MS = Number(process.env.AI_IMAGE_CACHE_TTL_MS ?? 24 * 60 * 60 * 1000);

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}

export function getCachedImage(prompt: string): string | undefined {
  if (!enabled()) return undefined;
  const key = hashPrompt(prompt);
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  if (entry.value.startsWith("data:")) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setCachedImage(prompt: string, value: string): void {
  if (!enabled()) return;
  if (value.startsWith("data:")) return;
  const key = hashPrompt(prompt);
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

export function clearImageCache(): void {
  cache.clear();
}