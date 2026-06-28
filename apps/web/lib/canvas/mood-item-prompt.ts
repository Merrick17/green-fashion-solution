import type { MoodItem } from '@repo/types';

/** Pure helpers shared by canvas store and tldraw context menu. */

export function moodItemsToLookup(items: MoodItem[]): Record<string, MoodItem> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export function extractItemPrompt(item: MoodItem): string | null {
  if (item.type !== 'IMAGE' && item.type !== 'AI_GENERATED') return null;
  const content = item.content as { prompt?: string; alt?: string };
  return content.prompt?.trim() || content.alt?.trim() || null;
}
